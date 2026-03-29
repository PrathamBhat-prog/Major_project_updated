import sqlite3
import os

# Check for database file
DB_PATH = "test.db"

def migrate():
    if not os.path.exists(DB_PATH):
        print(f"Error: Database file not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    print("--- Starting Database Migration ---")

    # 1. Add is_approved to users
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN is_approved BOOLEAN DEFAULT 1;")
        print("Success: Added 'is_approved' column to 'users' table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("Notice: 'is_approved' column already exists.")
        else:
            print(f"Error adding column: {e}")

    # 2. Create chat_messages table
    try:
        cursor.execute("""
        CREATE TABLE chat_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id INTEGER NOT NULL,
            recipient_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(sender_id) REFERENCES users(id),
            FOREIGN KEY(recipient_id) REFERENCES users(id)
        );
        """)
        print("Success: Created 'chat_messages' table.")
    except sqlite3.OperationalError as e:
        if "already exists" in str(e).lower():
            print("Notice: 'chat_messages' table already exists.")
        else:
            print(f"Error creating table: {e}")

    conn.commit()
    conn.close()
    print("--- Migration Finished ---")

if __name__ == "__main__":
    migrate()
