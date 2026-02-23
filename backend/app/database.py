import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# =====================================================
# LOAD ENV
# =====================================================
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# fallback to SQLite
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./test.db"


# =====================================================
# ENGINE CONFIG
# =====================================================
# SQLite needs special threading config
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        pool_pre_ping=True
    )
else:
    # PostgreSQL / MySQL / Production
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20
    )


# =====================================================
# SESSION CONFIG
# =====================================================
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# =====================================================
# BASE CLASS
# =====================================================
Base = declarative_base()


# =====================================================
# DEPENDENCY
# =====================================================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()