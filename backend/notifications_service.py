import os
import smtplib
import asyncio
from email.message import EmailMessage
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from database import db, users_collection

notifications_collection = db.get_collection("notifications")

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "alerts@textileintelligence.com")

def _send_email_sync(
    subject: str,
    body: str,
    recipients: List[str],
    attachment_bytes: Optional[bytes] = None,
    attachment_filename: Optional[str] = None,
) -> None:
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = SMTP_FROM_EMAIL
    if len(recipients) == 1:
        msg["To"] = recipients[0]
    else:
        msg["To"] = SMTP_FROM_EMAIL
        msg["Bcc"] = ", ".join(recipients)
    msg.set_content(body)

    if attachment_bytes is not None:
        msg.add_attachment(
            attachment_bytes,
            maintype="application",
            subtype="pdf",
            filename=attachment_filename or "report.pdf",
        )

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)

async def dispatch_notification(
    title: str,
    message: str,
    notification_type: str,
    severity: str = "info",
    target_role: Optional[str] = None,
    target_user_email: Optional[str] = None,
    link: Optional[str] = None,
    attachment_bytes: Optional[bytes] = None,
    attachment_filename: Optional[str] = None,
) -> str:
    doc = {
        "title": title,
        "message": message,
        "type": notification_type,
        "severity": severity,
        "target_role": target_role,
        "target_user_email": target_user_email,
        "link": link,
        "read": False,
        "created_at": datetime.utcnow().isoformat(),
        "read_at": None,
    }
    
    result = await notifications_collection.insert_one(doc)
    notification_id = str(result.inserted_id)

    email_opt_in_filter = {"email_notifications": {"$ne": False}}

    recipients: List[str] = []
    if target_user_email:
        user = await users_collection.find_one({"email": target_user_email})
        if user and user.get("email_notifications", True) and user.get("email"):
            recipients.append(user["email"])
    elif target_role:
        query = {"role": target_role, **email_opt_in_filter}
        async for u in users_collection.find(query):
            if u.get("email"):
                recipients.append(u["email"])
    else:
        async for u in users_collection.find(email_opt_in_filter):
            if u.get("email"):
                recipients.append(u["email"])

    if recipients and SMTP_HOST and SMTP_USER and SMTP_PASSWORD:
        subject = f"[{severity.upper()}] {title}"
        body = f"{message}\n\nLog in to your dashboard: {link or 'http://localhost:3000/dashboard'}"
        try:
            await asyncio.to_thread(
                _send_email_sync, subject, body, recipients, attachment_bytes, attachment_filename
            )
        except Exception as exc:
            print(f"[notifications_service] warning: failed to dispatch email alert: {exc}")

    return notification_id