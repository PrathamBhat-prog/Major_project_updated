import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()

# =====================================================
# SMTP CONFIG
# =====================================================
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_EMAIL)


# =====================================================
# SEND OTP EMAIL (SIMPLE & CORRECT)
# =====================================================
def send_email_otp(to_email: str, code: str) -> bool:
    """
    Send existing OTP to email.
    OTP should already be generated and stored in DB.
    """

    if not SMTP_EMAIL or not SMTP_PASSWORD:
        raise ValueError("SMTP credentials not configured in .env")

    subject = "Patient Delete Verification Code"

    body = f"""
Your verification code is: {code}

This code will expire in 10 minutes.

If you did not request this, please ignore this email.
"""

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = FROM_EMAIL
    msg["To"] = to_email
    msg.set_content(body)

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.send_message(msg)

        print(f"OTP sent to {to_email}")
        return True

    except Exception as e:
        print("Email send error:", str(e))
        raise e