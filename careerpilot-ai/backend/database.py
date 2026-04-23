# database.py (CareerPilot v2)

from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    DateTime,
    Text,
    Boolean
)

from sqlalchemy.orm import (
    declarative_base,
    sessionmaker
)

from datetime import datetime


# ==========================
# DATABASE URL
# ==========================

DATABASE_URL = "sqlite:///careerpilot_new.db"


# ==========================
# ENGINE
# ==========================

engine = create_engine(
    DATABASE_URL,
    connect_args={
        "check_same_thread": False
    }
)


# ==========================
# SESSION
# ==========================

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# ==========================
# BASE
# ==========================

Base = declarative_base()


# ==========================
# USERS TABLE
# ==========================

class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    email = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    password = Column(
        String,
        nullable=False
    )

    phone = Column(
        String,
        default=""
    )

    city = Column(
        String,
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
        String,
        default="Free"
    )

    is_admin = Column(
        Boolean,
        default=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ==========================
# REPORTS TABLE
# ==========================

class Report(Base):

    __tablename__ = "reports"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    email = Column(
        String,
        default=""
    )

    role = Column(
        String,
        default=""
    )

    salary = Column(
        String,
        default=""
    )

    ats = Column(
        String,
        default=""
    )

    skills = Column(
        Text,
        default=""
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ==========================
# NOTIFICATIONS TABLE
# ==========================

class Notification(Base):

    __tablename__ = "notifications"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    email = Column(
        String,
        default=""
    )

    text = Column(
        Text,
        nullable=False
    )

    is_read = Column(
        Boolean,
        default=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ==========================
# SUPPORT TICKETS TABLE
# ==========================

class SupportTicket(Base):

    __tablename__ = "support_tickets"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    email = Column(
        String,
        default=""
    )

    subject = Column(
        String,
        default=""
    )

    message = Column(
        Text,
        default=""
    )

    status = Column(
        String,
        default="Open"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ==========================
# SUBSCRIPTIONS TABLE
# ==========================

class Subscription(Base):

    __tablename__ = "subscriptions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    email = Column(
        String,
        default=""
    )

    plan = Column(
        String,
        default="Free"
    )

    amount = Column(
        String,
        default="0"
    )

    status = Column(
        String,
        default="Active"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ==========================
# CREATE TABLES
# ==========================

Base.metadata.create_all(
    bind=engine
)