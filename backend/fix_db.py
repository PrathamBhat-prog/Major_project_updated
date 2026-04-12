from app.database import SessionLocal
from app.models import User
from app.auth import MASTER_HOST_LIST

def fix_db():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        # Sort users so that approved ones come first
        users.sort(key=lambda u: u.is_approved, reverse=True)

        to_keep = {}
        to_delete = []

        for user in users:
            normalized = user.username.lower()
            if normalized in to_keep:
                # We already have a "better" version (approved or already processed)
                print(f"Duplicate found: {user.username} (normalized: {normalized}). Marking for deletion.")
                to_delete.append(user)
            else:
                to_keep[normalized] = user

        # Delete duplicates first
        for u in to_delete:
            db.delete(u)
        db.flush()

        # Update remaining users
        for normalized, user in to_keep.items():
            user.username = normalized
            if normalized in [m.lower() for m in MASTER_HOST_LIST]:
                print(f"Ensuring Master Host is Admin & Approved: {normalized}")
                user.is_approved = True
                user.role = "admin"
        
        db.commit()
        print("Database standardization complete.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_db()
