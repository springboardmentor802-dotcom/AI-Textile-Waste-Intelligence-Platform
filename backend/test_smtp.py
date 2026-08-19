"""
Standalone SMTP test - isolates whether the problem is your SMTP config
(Brevo credentials, port, etc.) or something in the app's notification
logic, by sending one email directly with no other moving parts.

Usage:
    python test_smtp.py your-actual-email@gmail.com

Reads the same SMTP_* env vars your app uses, so run it from the same
environment (same .env loaded, e.g. `python -m dotenv run -- python test_smtp.py ...`
or just make sure the vars are exported in your shell).
"""
import os
import smtplib
import sys
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL")


def main():
    if len(sys.argv) != 2:
        sys.exit("Usage: python test_smtp.py your-actual-email@gmail.com")
    to_email = sys.argv[1]

    print("--- Config being used ---")
    print(f"SMTP_HOST     = {SMTP_HOST}")
    print(f"SMTP_PORT     = {SMTP_PORT}")
    print(f"SMTP_USER     = {SMTP_USER}")
    print(f"SMTP_PASSWORD = {'set (' + str(len(SMTP_PASSWORD)) + ' chars)' if SMTP_PASSWORD else 'MISSING'}")
    print(f"SMTP_FROM_EMAIL = {SMTP_FROM_EMAIL}")
    print("--------------------------\n")

    missing = [name for name, val in [
        ("SMTP_HOST", SMTP_HOST), ("SMTP_USER", SMTP_USER),
        ("SMTP_PASSWORD", SMTP_PASSWORD), ("SMTP_FROM_EMAIL", SMTP_FROM_EMAIL),
    ] if not val]
    if missing:
        sys.exit(f"Missing env vars: {', '.join(missing)}. Check your .env is being loaded.")

    msg = EmailMessage()
    msg["Subject"] = "Test email from your app"
    msg["From"] = SMTP_FROM_EMAIL
    msg["To"] = to_email
    msg.set_content("If you're reading this, your SMTP config works.")

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.set_debuglevel(1)  # prints the full SMTP conversation
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        print(f"\nSent successfully to {to_email}. Check inbox AND spam folder.")
    except smtplib.SMTPAuthenticationError as e:
        print(f"\nAUTH FAILED: {e}")
        print("-> SMTP_USER is probably wrong. In Brevo it must be the")
        print("   '7xxxxx@smtp-brevo.com'-style login from SMTP & API, NOT")
        print("   your normal account email. Re-copy SMTP_PASSWORD too.")
    except smtplib.SMTPSenderRefused as e:
        print(f"\nSENDER REFUSED: {e}")
        print("-> SMTP_FROM_EMAIL doesn't match a verified sender in Brevo.")
        print("   Go to Senders, Domains & Dedicated IP and confirm this")
        print("   exact address is listed and verified.")
    except Exception as e:
        print(f"\nFAILED: {type(e).__name__}: {e}")


if __name__ == "__main__":
    main()