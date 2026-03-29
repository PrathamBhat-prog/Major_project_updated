# e:/7th sem/major project/website/backend/init_host.py
import os
import sys

# Add the current directory to path so we can import from .app
sys.path.append(os.getcwd())

from app.database import SessionLocal
from app import models, utils
from datetime import datetime

# Expanded Master Node Emails
MASTER_HOSTS = ["guru819773@gmail.com", "gurunathagoudambiradar@gmail.com", "gurunathagouda@gmail.com"]
MASTER_PASS = "Guru@123"

def initialize_hosts():
    db = SessionLocal()
    try:
        for email in MASTER_HOSTS:
            print(f"Initializing host: {email}...")
            
            # Check if user already exists
            user = db.query(models.User).filter(models.User.username == email).first()
            
            if user:
                print(f"Updating existing node: {email}")
                user.hashed_password = utils.hash_password(MASTER_PASS)
                user.role = "admin"
                user.is_approved = True
                user.is_active = True
                user.is_profile_complete = True
            else:
                print(f"Creating NEW master node: {email}")
                user = models.User(
                    username=email,
                    email=email,
                    hashed_password=utils.hash_password(MASTER_PASS),
                    role="admin",
                    is_approved=True,
                    is_active=True,
                    created_at=datetime.utcnow(),
                    is_profile_complete=True,
                    full_name="Global Host Admin"
                )
                db.add(user)
        
        db.commit()
        print("\nSUCCESS: All 3 Master Host accounts are now operational.")
        print(f"Password reset to: {MASTER_PASS} for all.")
        
    except Exception as e:
        print(f"Error during initialization: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    initialize_hosts()
