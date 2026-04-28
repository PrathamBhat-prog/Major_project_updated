import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

# =====================================================
# SMTP CONFIG
# =====================================================
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
# ✅ SMTP_EMAIL will now default to empty if not set in .env
SMTP_EMAIL = os.getenv("SMTP_EMAIL", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_EMAIL)

def send_email(to_email: str, subject: str, body: str):
    # ❌ Check for missing or placeholder credentials
    if not SMTP_EMAIL or not SMTP_PASSWORD or "your_16_digit" in SMTP_PASSWORD:
        print(f"⚠️  EMAIL LOG: To={to_email} | Subject={subject}")
        print("CRITICAL: SMTP credentials not configured correctly in .env. Email NOT sent.")
        return False

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = f"CephaloAI <{FROM_EMAIL}>"
    msg["To"] = to_email
    msg.set_content(body)

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"Email error to {to_email}: {str(e)}")
        return False

# =====================================================
# TEMPLATES
# =====================================================

def send_appointment_confirmation(to_email: str, patient_name: str, appt_date: datetime):
    subject = "Appointment Request Received - CephaloAI"
    date_str = appt_date.strftime("%B %d, %Y at %I:%M %p")
    body = f"""
Hello {patient_name},

Thank you for choosing CephaloAI. We have received your appointment request for:
📅 {date_str}

Our clinical team is reviewing your request and will provide a status update shortly.

Best regards,
CephaloAI Clinical Team
"""
    return send_email(to_email, subject, body)

def send_appointment_status_update(to_email: str, patient_name: str, status: str, suggested_date: datetime = None):
    subject = f"Appointment Update: {status.capitalize()} - CephaloAI"
    
    status_text = "confirmed" if status == "confirmed" else "updated"
    
    if status == "confirmed":
        body = f"Hello {patient_name},\n\nGreat news! Your appointment has been CONFIRMED.\n\nWe look forward to seeing you.\n\nBest regards,\nCephaloAI team"
    elif status == "cancelled":
        if suggested_date:
            date_str = suggested_date.strftime("%B %d, %Y at %I:%M %p")
            body = f"Hello {patient_name},\n\nUnfortunately, your requested time slot is not available. The doctor has suggested an alternative date:\n\n📅 {date_str}\n\nPlease visit our portal or contact us to confirm this new time.\n\nBest regards,\nCephaloAI team"
        else:
            body = f"Hello {patient_name},\n\nWe regret to inform you that your appointment request has been cancelled. Please contact our office for more details.\n\nBest regards,\nCephaloAI team"
    else:
        body = f"Hello {patient_name},\n\nYour appointment status has been updated to: {status}.\n\nBest regards,\nCephaloAI team"

    return send_email(to_email, subject, body)

def send_password_reset_email(to_email: str, reset_link: str):
    subject = "Password Reset Request - CephaloAI"
    body = f"""
Hello,

You requested a password reset for your CephaloAI account.
Click the link below to set a new password. This link will expire in 1 hour.

🔗 {reset_link}

If you did not request this, please ignore this email.
"""
    return send_email(to_email, subject, body)

def send_email_otp(to_email: str, code: str) -> bool:
    subject = "Patient Delete Verification Code"
    body = f"Your verification code is: {code}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this, please ignore this email."
    return send_email(to_email, subject, body)