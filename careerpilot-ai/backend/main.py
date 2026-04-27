from dotenv import load_dotenv
load_dotenv()

import os
import smtplib
import random
import csv
import io
from datetime import datetime

from email.mime.text import MIMEText

from fastapi import (
    FastAPI,
    UploadFile,
    File,
    HTTPException,
    Header,
    Response
)

from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from sqlalchemy import func, Float, extract

from resume_parser import extract_resume_text
from skill_matcher import detect_skills
from recommender import recommend_role
from salary_model import predict_salary

from database import (
    SessionLocal,
    User,
    Report,
    Notification
)

from auth import (
    hash_password,
    verify_password,
    create_token,
    get_current_user
)

# ==================================
# APP
# ==================================

app = FastAPI(
    title="CareerPilot AI API",
    version="6.0.0"
)

otp_storage = {}

# ==================================
# CORS
# ==================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://careerpilot-frontend-bgde94wmr.vercel.app",
        "https://careerpilot-frontend.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================================
# MODELS
# ==================================

class SignupData(BaseModel):
    name: str
    email: str
    password: str


class LoginData(BaseModel):
    email: str
    password: str


class GoogleLoginData(BaseModel):
    name: str
    email: str
    photo: str = ""


class SendOTPData(BaseModel):
    email: str


class VerifyOTPData(BaseModel):
    name: str
    email: str
    password: str
    otp: str


class ForgotPasswordData(BaseModel):
    email: str


class ResetPasswordData(BaseModel):
    email: str
    otp: str
    password: str


class ProfileData(BaseModel):
    name: str
    phone: str = ""
    city: str = ""
    bio: str = ""


class BroadcastData(BaseModel):
    message: str


# ==================================
# HELPERS
# ==================================

def send_email(receiver_email, subject, body):

    sender_email = os.getenv("EMAIL_USER")
    sender_pass = os.getenv("EMAIL_PASS")

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = sender_email
    msg["To"] = receiver_email

    server = smtplib.SMTP(
        "smtp.gmail.com",
        587
    )

    server.starttls()
    server.login(
        sender_email,
        sender_pass
    )

    server.sendmail(
        sender_email,
        receiver_email,
        msg.as_string()
    )

    server.quit()


def send_otp_email(email, otp):

    body = f"""
Hello,

Your OTP is:

{otp}

Valid for 10 minutes.

Team CareerPilot
"""

    send_email(
        email,
        "CareerPilot OTP",
        body
    )


def auth_email(
    authorization: str = Header(None)
):

    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Token missing"
        )

    token = authorization.replace(
        "Bearer ",
        ""
    )

    email = get_current_user(token)

    if not email:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    return email


def admin_auth(
    authorization: str = Header(None)
):

    email = auth_email(
        authorization
    )

    if email != "admin@careerpilot.ai":
        raise HTTPException(
            status_code=403,
            detail="Admin only area"
        )

    return email


# ==================================
# HOME
# ==================================

@app.get("/")
def home():

    return {
        "message":
        "CareerPilot Backend Running",
        "version":
        "6.0.0"
    }# ==================================
# SIGNUP OTP
# ==================================

@app.post("/send-signup-otp")
def send_signup_otp(data: SendOTPData):

    otp = str(
        random.randint(
            100000,
            999999
        )
    )

    otp_storage[data.email] = otp

    send_otp_email(
        data.email,
        otp
    )

    return {
        "message":
        "OTP sent successfully"
    }


@app.post("/verify-signup-otp")
def verify_signup_otp(
    data: VerifyOTPData
):

    saved_otp = otp_storage.get(
        data.email
    )

    if not saved_otp:
        raise HTTPException(
            status_code=400,
            detail="OTP expired"
        )

    if saved_otp != data.otp:
        raise HTTPException(
            status_code=400,
            detail="Wrong OTP"
        )

    db = SessionLocal()

    exists = db.query(User).filter(
        User.email == data.email
    ).first()

    if exists:
        db.close()

        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    user = User(
        name=data.name,
        email=data.email,
        password=hash_password(
            data.password
        ),
        plan="Free",
        is_verified=True
    )

    db.add(user)
    db.commit()
    db.close()

    del otp_storage[data.email]

    return {
        "message":
        "Signup Successful"
    }


# ==================================
# LOGIN
# ==================================

@app.post("/login")
def login(data: LoginData):

    db = SessionLocal()

    user = db.query(User).filter(
        User.email == data.email
    ).first()

    if not user:
        db.close()

        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    if not verify_password(
        data.password,
        user.password
    ):
        db.close()

        raise HTTPException(
            status_code=401,
            detail="Wrong password"
        )

    user.login_count = (
        user.login_count or 0
    ) + 1

    db.commit()

    token = create_token({
        "sub": user.email
    })

    result = {
        "message":
        "Login Success",
        "token":
        token,
        "user":
        user.name,
        "email":
        user.email,
        "plan":
        user.plan
    }

    db.close()

    return result


# ==================================
# GOOGLE LOGIN
# ==================================

@app.post("/google-login")
def google_login(
    data: GoogleLoginData
):

    db = SessionLocal()

    user = db.query(User).filter(
        User.email == data.email
    ).first()

    if not user:

        user = User(
            name=data.name,
            email=data.email,
            password=hash_password(
                "google_auth_user"
            ),
            avatar=data.photo,
            is_verified=True,
            plan="Free"
        )

        db.add(user)
        db.commit()
        db.refresh(user)

    else:

        user.name = data.name
        user.avatar = data.photo
        user.login_count = (
            user.login_count or 0
        ) + 1

        db.commit()

    token = create_token({
        "sub": user.email
    })

    result = {
        "message":
        "Google Login Success",
        "token":
        token,
        "user":
        user.name,
        "email":
        user.email,
        "photo":
        user.avatar,
        "plan":
        user.plan
    }

    db.close()

    return result


# ==================================
# VERIFY TOKEN
# ==================================

@app.get("/verify-token")
def verify_login(
    authorization: str = Header(None)
):

    email = auth_email(
        authorization
    )

    return {
        "valid": True,
        "email": email
    }
# ==================================
# PROFILE
# ==================================

@app.get("/me")
def my_profile(
    authorization: str = Header(None)
):

    email = auth_email(
        authorization
    )

    db = SessionLocal()

    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user:
        db.close()

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    result = {
        "name": user.name,
        "email": user.email,
        "plan": user.plan,
        "phone": user.phone,
        "city": user.city,
        "bio": user.bio
    }

    db.close()

    return result


@app.post("/profile/update")
def update_profile(
    data: ProfileData,
    authorization: str = Header(None)
):

    email = auth_email(
        authorization
    )

    db = SessionLocal()

    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user:
        db.close()

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    user.name = data.name
    user.phone = data.phone
    user.city = data.city
    user.bio = data.bio

    db.commit()
    db.close()

    return {
        "message":
        "Profile Updated"
    }


# ==================================
# PASSWORD RESET
# ==================================

@app.post("/forgot-password")
def forgot_password(
    data: ForgotPasswordData
):

    db = SessionLocal()

    user = db.query(User).filter(
        User.email == data.email
    ).first()

    db.close()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Email not found"
        )

    otp = str(
        random.randint(
            100000,
            999999
        )
    )

    otp_storage[data.email] = otp

    send_otp_email(
        data.email,
        otp
    )

    return {
        "message":
        "OTP sent successfully"
    }


@app.post("/reset-password")
def reset_password(
    data: ResetPasswordData
):

    saved_otp = otp_storage.get(
        data.email
    )

    if not saved_otp:
        raise HTTPException(
            status_code=400,
            detail="OTP expired"
        )

    db = SessionLocal()

    user = db.query(User).filter(
        User.email == data.email
    ).first()

    if not user:
        db.close()

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    user.password = hash_password(
        data.password
    )

    db.commit()
    db.close()

    del otp_storage[data.email]

    return {
        "message":
        "Password Updated"
    }


# ==================================
# RESUME ANALYSIS
# ==================================

@app.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    authorization: str = Header(None)
):

    email = "guest_user"

    try:
        email = auth_email(
            authorization
        )
    except:
        pass

    text = await extract_resume_text(
        file
    )

    skills = detect_skills(text)

    role = recommend_role(skills)

    salary = predict_salary(skills)

    ats_score = min(
        len(skills) * 10,
        100
    )

    db = SessionLocal()

    report = Report(
        email=email,
        role=role,
        salary=str(salary),
        ats=str(ats_score),
        skills=", ".join(skills),
        file_name=file.filename
    )

    db.add(report)
    db.commit()
    db.close()

    return {
        "skills_found":
        skills,
        "recommended_role":
        role,
        "predicted_salary_lpa":
        salary,
        "ats_score":
        ats_score
    }
    # ==================================
# PUBLIC ANALYTICS
# ==================================

@app.get("/analytics")
def analytics():

    db = SessionLocal()

    total_users = db.query(
        User
    ).count()

    reports_generated = db.query(
        Report
    ).count()

    premium_users = db.query(
        User
    ).filter(
        User.plan == "Premium"
    ).count()

    avg_ats = db.query(
        func.avg(
            Report.ats.cast(Float)
        )
    ).scalar()

    db.close()

    return {
        "total_users":
        total_users,

        "reports_generated":
        reports_generated,

        "premium_users":
        premium_users,

        "avg_ats_score":
        round(avg_ats or 0, 2)
    }


# ==================================
# ADMIN STATS
# ==================================

@app.get("/admin/stats")
def admin_stats(
    authorization: str = Header(None)
):

    admin_auth(
        authorization
    )

    db = SessionLocal()

    total_users = db.query(
        User
    ).count()

    premium_users = db.query(
        User
    ).filter(
        User.plan == "Premium"
    ).count()

    reports = db.query(
        Report
    ).count()

    today_signups = db.query(
        User
    ).filter(
        func.date(
            User.created_at
        ) == func.current_date()
    ).count()

    db.close()

    return {
        "users":
        total_users,

        "premium_users":
        premium_users,

        "reports":
        reports,

        "today_signups":
        today_signups
    }


# ==================================
# ADMIN USERS
# ==================================

@app.get("/admin/users")
def admin_users(
    authorization: str = Header(None)
):

    admin_auth(
        authorization
    )

    db = SessionLocal()

    users = db.query(
        User
    ).order_by(
        User.id.desc()
    ).all()

    data = []

    for user in users:

        data.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "plan": user.plan,
            "created_at":
            str(user.created_at)
        })

    db.close()

    return {
        "users": data
    }


# ==================================
# RECENT SIGNUPS
# ==================================

@app.get("/admin/recent-signups")
def recent_signups(
    authorization: str = Header(None)
):

    admin_auth(
        authorization
    )

    db = SessionLocal()

    users = db.query(
        User
    ).order_by(
        User.created_at.desc()
    ).limit(10).all()

    data = []

    for user in users:

        data.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "plan": user.plan,
            "created_at":
            str(user.created_at)
        })

    db.close()

    return {
        "recent_users": data
    }


# ==================================
# CHART DATA
# ==================================

@app.get("/admin/chart-data")
def admin_chart_data(
    authorization: str = Header(None)
):

    admin_auth(
        authorization
    )

    db = SessionLocal()

    months = [
        "Jan","Feb","Mar","Apr",
        "May","Jun","Jul","Aug",
        "Sep","Oct","Nov","Dec"
    ]

    growth = []

    for i in range(1, 13):

        count = db.query(
            User
        ).filter(
            func.extract(
                "month",
                User.created_at
            ) == i
        ).count()

        growth.append({
            "month":
            months[i - 1],
            "users":
            count
        })

    reports = [
        {
            "name": "Reports",
            "count":
            db.query(
                Report
            ).count()
        },
        {
            "name": "Premium",
            "count":
            db.query(
                User
            ).filter(
                User.plan == "Premium"
            ).count()
        },
        {
            "name": "Today",
            "count":
            db.query(
                User
            ).filter(
                func.date(
                    User.created_at
                ) == func.current_date()
            ).count()
        }
    ]

    db.close()

    return {
        "growth": growth,
        "reports": reports
    }
    # ==================================
# ADMIN NOTIFICATIONS
# ==================================

@app.get("/admin/notifications")
def admin_notifications(
    authorization: str = Header(None)
):

    admin_auth(
        authorization
    )

    db = SessionLocal()

    items = db.query(
        Notification
    ).order_by(
        Notification.id.desc()
    ).limit(20).all()

    data = []

    for item in items:

        data.append({
            "id": item.id,
            "text": item.text,
            "type": item.type,
            "created_at":
            str(item.created_at)
        })

    db.close()

    return {
        "notifications": data
    }


# ==================================
# BROADCAST TO ALL USERS
# ==================================

@app.post("/admin/broadcast")
def admin_broadcast(
    data: BroadcastData,
    authorization: str = Header(None)
):

    admin_auth(
        authorization
    )

    db = SessionLocal()

    users = db.query(
        User
    ).all()

    for user in users:

        note = Notification(
            email=user.email,
            text=data.message,
            type="broadcast"
        )

        db.add(note)

    db.commit()
    db.close()

    return {
        "message":
        "Broadcast sent"
    }


# ==================================
# EXPORT USERS CSV
# ==================================

@app.get("/admin/export-users")
def export_users(
    authorization: str = Header(None)
):

    admin_auth(
        authorization
    )

    db = SessionLocal()

    users = db.query(
        User
    ).all()

    output = io.StringIO()

    writer = csv.writer(
        output
    )

    writer.writerow([
        "ID",
        "Name",
        "Email",
        "Plan",
        "Created At"
    ])

    for user in users:

        writer.writerow([
            user.id,
            user.name,
            user.email,
            user.plan,
            user.created_at
        ])

    db.close()

    csv_data = output.getvalue()

    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition":
            "attachment; filename=users.csv"
        }
    )


# ==================================
# TOGGLE PLAN
# ==================================

@app.put("/admin/toggle-plan/{user_id}")
def toggle_plan(
    user_id: int,
    authorization: str = Header(None)
):

    admin_auth(
        authorization
    )

    db = SessionLocal()

    user = db.query(
        User
    ).filter(
        User.id == user_id
    ).first()

    if not user:
        db.close()

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    user.plan = (
        "Premium"
        if user.plan == "Free"
        else "Free"
    )

    db.commit()

    plan = user.plan

    db.close()

    return {
        "message":
        "Plan updated",

        "plan":
        plan
    }


# ==================================
# DELETE USER
# ==================================

@app.delete("/admin/delete-user/{user_id}")
def delete_user(
    user_id: int,
    authorization: str = Header(None)
):

    admin_auth(
        authorization
    )

    db = SessionLocal()

    user = db.query(
        User
    ).filter(
        User.id == user_id
    ).first()

    if not user:
        db.close()

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    db.delete(user)
    db.commit()
    db.close()

    return {
        "message":
        "User deleted"
    }


