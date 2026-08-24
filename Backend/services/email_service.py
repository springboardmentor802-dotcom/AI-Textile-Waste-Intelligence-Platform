"""
Email delivery service.

This module adds EMAIL as a second delivery channel for the existing,
already-working Alert & Notification System. It does not replace or
duplicate anything in services/notification_service.py - it only knows
how to turn (recipient, notification_type, title, message, severity)
into an outgoing SMTP email.

Design rules (see services/notification_service.py for how this is
wired in):
    - This module is imported ONLY from the backend. Nothing here is
      ever reachable from React - there is no route that exposes SMTP
      configuration or triggers an arbitrary email.
    - SMTP credentials are read exclusively from environment variables
      (optionally via a local .env file, see the dotenv note below).
      They are never hard-coded, never logged, and never returned in
      any API response.
    - `send_notification_email_safe()` is the function every caller in
      this codebase should use. It NEVER raises - any SMTP/network
      failure is caught and logged so that a broken mail server can
      never break inventory creation, AI prediction, or any other
      business operation that happens to also create a notification.
"""

import html
import logging
import os
import smtplib
import ssl
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

logger = logging.getLogger(__name__)

# --- Optional .env support -------------------------------------------------
#
# This project has no existing .env / settings module (config.py only
# handles password hashing + JWT, both out of scope for this change).
# python-dotenv is optional: if it isn't installed, real environment
# variables (e.g. set by the OS, a process manager, or a hosting
# platform) still work exactly the same - this just also lets a
# developer keep SMTP_* values in a local Backend/.env file instead of
# exporting them by hand. See Backend/.env.example.
try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:  # pragma: no cover - dotenv is an optional convenience
    pass


APP_NAME = "AI Textile Waste Intelligence Platform"

# Notification types (from models.Notification.notification_type) that
# should also trigger an email. Deliberately excludes
# "sustainability_milestone" - that notification type is not generated
# by any backend event yet, so there is nothing to send email for.
EMAIL_ENABLED_NOTIFICATION_TYPES = frozenset(
    {
        "waste_collection",
        "ai_prediction",
        "recycling_opportunity",
        "inventory_warning",
        "platform_announcement",
    }
)

# A couple of notification types want an email subject that differs
# slightly from the in-app notification title. Everything else just
# reuses the notification's own title as the subject line (it already
# matches, e.g. inventory.py's "Waste Collection Recorded" /
# "Inventory Warning" and predict.py's "AI Prediction Completed").
_SUBJECT_OVERRIDES = {
    "recycling_opportunity": "Recycling Opportunity Detected",
}

_SEVERITY_LABELS = {
    "info": "Info",
    "success": "Success",
    "warning": "Warning",
    "critical": "Critical",
}


def _get_smtp_settings() -> dict:
    """Read SMTP configuration from environment variables.

    Re-read on every call (rather than cached at import time) so that
    a missing/invalid configuration is picked up the moment it's fixed,
    without requiring an app restart - useful for local development.
    """
    host = os.environ.get("SMTP_HOST", "").strip()
    username = os.environ.get("SMTP_USERNAME", "").strip()
    password = os.environ.get("SMTP_PASSWORD", "")
    from_addr = os.environ.get("SMTP_FROM", "").strip() or username

    raw_port = os.environ.get("SMTP_PORT", "587").strip()
    try:
        port = int(raw_port) if raw_port else 587
    except ValueError:
        logger.warning("Invalid SMTP_PORT value %r; falling back to 587.", raw_port)
        port = 587

    use_tls = os.environ.get("SMTP_USE_TLS", "true").strip().lower() not in (
        "false",
        "0",
        "no",
    )

    return {
        "host": host,
        "port": port,
        "username": username,
        "password": password,
        "from_addr": from_addr,
        "use_tls": use_tls,
    }


def is_email_configured(settings: Optional[dict] = None) -> bool:
    """Whether enough SMTP configuration exists to attempt sending email."""
    settings = settings or _get_smtp_settings()
    return bool(
        settings["host"]
        and settings["username"]
        and settings["password"]
        and settings["from_addr"]
    )


def _build_subject(notification_type: str, title: str) -> str:
    if notification_type in _SUBJECT_OVERRIDES:
        return _SUBJECT_OVERRIDES[notification_type]
    if notification_type == "platform_announcement":
        # Platform announcements have an admin-supplied title (not a
        # fixed string), so prefix it with the category instead of
        # replacing it, e.g. "Platform Announcement: Scheduled Maintenance".
        return f"Platform Announcement: {title}" if title else "Platform Announcement"
    return title or APP_NAME


def _build_body(
    title: str,
    message: str,
    notification_type: str,
    severity: str,
    created_at: Optional[datetime],
) -> tuple[str, str]:
    """Return (plain_text_body, html_body) for a notification email."""
    timestamp = (created_at or datetime.utcnow()).strftime("%Y-%m-%d %H:%M UTC")
    severity_label = _SEVERITY_LABELS.get(severity)
    show_severity = bool(severity_label) and severity in ("warning", "critical")

    # --- Plain text fallback ---
    text_lines = [APP_NAME, "", title, "", message, ""]
    if show_severity:
        text_lines += [f"Severity: {severity_label}", ""]
    text_lines += [f"Date: {timestamp}", "", "Please log in to the platform to view full details."]
    text_body = "\n".join(text_lines)

    # --- Simple HTML version ---
    safe_title = html.escape(title)
    safe_message = html.escape(message)
    severity_html = (
        f'<p style="margin:0 0 12px 0;color:#b45309;font-weight:600;">Severity: {severity_label}</p>'
        if show_severity
        else ""
    )

    html_body = f"""\
<html>
  <body style="margin:0;padding:24px;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
      <tr>
        <td style="background:#0f766e;color:#ffffff;padding:16px 24px;font-size:14px;font-weight:600;">
          {APP_NAME}
        </td>
      </tr>
      <tr>
        <td style="padding:24px;">
          <h2 style="margin:0 0 12px 0;font-size:18px;color:#111827;">{safe_title}</h2>
          <p style="margin:0 0 16px 0;color:#374151;line-height:1.5;">{safe_message}</p>
          {severity_html}
          <p style="margin:0;color:#6b7280;font-size:13px;">Date: {timestamp}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 24px;background:#f9fafb;color:#6b7280;font-size:12px;">
          Please log in to the platform to view full details.
        </td>
      </tr>
    </table>
  </body>
</html>
"""

    return text_body, html_body


def send_notification_email(
    to_email: str,
    notification_type: str,
    title: str,
    message: str,
    severity: str = "info",
    created_at: Optional[datetime] = None,
) -> bool:
    """Send one notification email over SMTP.

    Returns False (without raising) when email simply isn't configured
    or there is no recipient address - this is an expected, silent
    no-op case, not a failure. Actual SMTP/connection errors ARE
    allowed to raise here; callers that must never fail because of
    email (i.e. every real call site in this project) should use
    send_notification_email_safe() below instead of calling this
    directly.
    """
    if not to_email:
        logger.warning(
            "Skipped '%s' notification email: recipient has no email on file.",
            notification_type,
        )
        return False

    settings = _get_smtp_settings()

    if not is_email_configured(settings):
        logger.info(
            "Email notifications are not configured "
            "(SMTP_HOST/SMTP_USERNAME/SMTP_PASSWORD/SMTP_FROM). "
            "Skipping email for notification_type=%s.",
            notification_type,
        )
        return False

    subject = _build_subject(notification_type, title)
    text_body, html_body = _build_body(title, message, notification_type, severity, created_at)

    email_message = MIMEMultipart("alternative")
    email_message["Subject"] = subject
    email_message["From"] = settings["from_addr"]
    email_message["To"] = to_email
    email_message.attach(MIMEText(text_body, "plain"))
    email_message.attach(MIMEText(html_body, "html"))

    with smtplib.SMTP(settings["host"], settings["port"], timeout=10) as server:
        server.ehlo()
        if settings["use_tls"]:
            server.starttls(context=ssl.create_default_context())
            server.ehlo()
        server.login(settings["username"], settings["password"])
        server.sendmail(settings["from_addr"], [to_email], email_message.as_string())

    return True


def send_notification_email_safe(
    to_email: str,
    notification_type: str,
    title: str,
    message: str,
    severity: str = "info",
    created_at: Optional[datetime] = None,
) -> bool:
    """Same as send_notification_email(), but NEVER raises.

    This is the function services/notification_service.py actually
    calls (directly, or scheduled via FastAPI BackgroundTasks). Any
    exception - bad credentials, DNS failure, timeout, refused
    connection, etc. - is caught and logged here so it can never break
    the in-app notification (already committed to PostgreSQL before
    this runs) or the API response for the original business action
    (inventory creation, AI prediction, announcement).
    """
    try:
        return send_notification_email(
            to_email=to_email,
            notification_type=notification_type,
            title=title,
            message=message,
            severity=severity,
            created_at=created_at,
        )
    except Exception:
        # Deliberately broad. Logged without SMTP_USERNAME/SMTP_PASSWORD -
        # only the destination address and notification type are included,
        # so this can never leak credentials into server logs.
        logger.exception(
            "Failed to send '%s' notification email to %s.",
            notification_type,
            to_email,
        )
        return False
