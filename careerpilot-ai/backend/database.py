# database.py (CareerPilot Final Upgraded PostgreSQL + SQLite Fallback)

import os
from datetime import datetime

from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    DateTime,
    Text,
    Boolean,
    Float
)

from sqlalchemy.orm import (
    declarative_base,
    sessionmaker
)

# ==================================================
# DATABASE URL
# Priority:
# 1. Render PostgreSQL ENV
# 2. Local SQLite fallback
# ==================================================

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///careerpilot_new.db"
)

# Old postgres:// compatibility
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace(
        "postgres://",
        "postgresql://",
        1
    )

# ==================================================
# ENGINE
# ==================================================

if DATABASE_URL.startswith("sqlite"):

    engine = create_engine(
        DATABASE_URL,
        connect_args={
            "check_same_thread": False
        }
    )

else:

    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,
        pool_size=5,
        max_overflow=10,
        echo=False
    )

# ==================================================
# SESSION
# ==================================================

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# ==================================================
# BASE
# ==================================================

Base = declarative_base()

# ==================================================
# USERS TABLE
# ==================================================

class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(120),
        nullable=False
    )

    email = Column(
        String(180),
        unique=True,
        index=True,
        nullable=False
    )

    password = Column(
        String(255),
        nullable=False
    )

    phone = Column(
        String(30),
        default=""
    )

    city = Column(
        String(120),
        default=""
    )

    bio = Column(
        Text,
        default=""
    )

    avatar = Column(
        Text,
        default=""
    )

    plan = Column(
        String(50),
        default="Free"
    )

    is_admin = Column(
        Boolean,
        default=False
    )

    is_verified = Column(
        Boolean,
        default=False
    )

    login_count = Column(
        Integer,
        default=0
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

# ==================================================
# REPORTS TABLE
# ==================================================

class Report(Base):

    __tablename__ = "reports"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    email = Column(
        String(180),
        index=True,
        default=""
    )

    role = Column(
        String(120),
        default=""
    )

    salary = Column(
        String(50),
        default=""
    )

    ats = Column(
        String(20),
        default=""
    )

    skills = Column(
        Text,
        default=""
    )

    file_name = Column(
        String(255),
        default=""
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

# ==================================================
# NOTIFICATIONS TABLE
# ==================================================

class Notification(Base):

    __tablename__ = "notifications"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    email = Column(
        String(180),
        index=True,
        default=""
    )

    text = Column(
        Text,
        nullable=False
    )

    type = Column(
        String(50),
        default="info"
    )

    is_read = Column(
        Boolean,
        default=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

# ==================================================
# SUPPORT TICKETS TABLE
# ==================================================

class SupportTicket(Base):

    __tablename__ = "support_tickets"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    email = Column(
        String(180),
        default=""
    )

    subject = Column(
        String(255),
        default=""
    )

    message = Column(
        Text,
        default=""
    )

    status = Column(
        String(50),
        default="Open"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

# ==================================================
# SUBSCRIPTIONS TABLE
# ==================================================

class Subscription(Base):

    __tablename__ = "subscriptions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    email = Column(
        String(180),
        index=True,
        default=""
    )

    plan = Column(
        String(50),
        default="Free"
    )

    amount = Column(
        String(50),
        default="0"
    )

    status = Column(
        String(50),
        default="Active"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

# ==================================================
# OTP TABLE
# ==================================================

class OTP(Base):

    __tablename__ = "otp_codes"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    email = Column(
        String(180),
        index=True,
        nullable=False
    )

    code = Column(
        String(10),
        nullable=False
    )

    verified = Column(
        Boolean,
        default=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

# ==================================================
# ANALYTICS TABLE
# ==================================================

class Analytics(Base):

    __tablename__ = "analytics"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    page = Column(
        String(120),
        default=""
    )

    user_email = Column(
        String(180),
        default=""
    )

    duration = Column(
        Float,
        default=0
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

# ==================================================
# HELPERS
# ==================================================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)

# ==================================================
# AUTO CREATE TABLES
# ==================================================

init_db()