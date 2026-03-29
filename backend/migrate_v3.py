import sqlite3
import os

# Set database path
db_path = "e:/7th sem/major project/website/backend/test.db"

if not os.path.exists(db_path):
    print(f"Error: Database file not found at {db_path}")
    exit(1)

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print("Adding 'is_read' column to 'chat_messages' table...")
    # Add is_read column to chat_messages
    try:
        cursor.execute("ALTER TABLE chat_messages ADD COLUMN is_read BOOLEAN DEFAULT 0;")
        print("Successfully added 'is_read' column.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("Column 'is_read' already exists. Skipping.")
        else:
            print(f"OperationalError: {e}")

    conn.commit()
    conn.close()
    print("Migration V3 completed successfully!")

except Exception as e:
    print(f"Migration failed: {e}")
