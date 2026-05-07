from dotenv import load_dotenv
load_dotenv()

import os
import smtplib
import random
import csv
import io
import requests
import cloudinary
import cloudinary.uploader

from database import OTP
from datetime import timedelta
from datetime import datetime
from email.mime.text import MIMEText
otp_storage = {}

from fastapi import (
    FastAPI,
    UploadFile,
    File,
    HTTPException,
    Header,
    Response,
    Form
)

from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from sqlalchemy import func, Float, extract

# ==========================================================
# LOCAL MODULES
# ==========================================================

from resume_parser import extract_resume_text

from database import (
    SessionLocal,
    User,
    Report,
    Notification,
    SupportTicket,
    Subscription,
    Analytics
)

from auth import (
    hash_password,
    verify_password,
    create_token,
    get_current_user
)

from gemini_service import (
    full_resume_analysis,
    improve_resume_ai,
    interview_questions_ai,
    career_chat_ai,
    job_recommendation_ai
)

# ==========================================================
# ENV VARIABLES
# ==========================================================

EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")

ADZUNA_APP_ID = os.getenv("ADZUNA_APP_ID")
ADZUNA_APP_KEY = os.getenv("ADZUNA_APP_KEY")

CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

# ==========================================================
# CLOUDINARY CONFIG
# ==========================================================

cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
    secure=True
)

# ==========================================================
# APP
# ==========================================================

app = FastAPI(
    title="CareerPilot AI API",
    version="7.0.0"
)


# ==========================================================
# CORS
# ==========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================================
# MODELS
# ==========================================================

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


class ChangePasswordData(BaseModel):
    old_password: str
    new_password: str


class ProfileData(BaseModel):
    name: str
    phone: str = ""
    city: str = ""
    bio: str = ""


class BroadcastData(BaseModel):
    message: str


class TicketData(BaseModel):
    subject: str
    message: str


class UpgradePlanData(BaseModel):
    plan: str
    amount: str

class TrackPageData(BaseModel):
    page: str
    duration: float = 0
# ==========================================================
# HELPERS
# ==========================================================

def send_email(receiver_email, subject, body):

    msg = MIMEText(body)

    msg["Subject"] = subject
    msg["From"] = EMAIL_USER
    msg["To"] = receiver_email

    server = smtplib.SMTP(
        "smtp.gmail.com",
        587
    )

    server.starttls()
    server.login(
        EMAIL_USER,
        EMAIL_PASS
    )

    server.sendmail(
        EMAIL_USER,
        receiver_email,
        msg.as_string()
    )

    server.quit()


def send_otp_email(email, otp):

    body = f"""
Hello,

Your CareerPilot OTP is:

{otp}

Valid for 10 minutes.

Team CareerPilot
"""

    send_email(
        email,
        "CareerPilot OTP Verification",
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
    email = auth_email(authorization)

    db = SessionLocal()

    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user or not user.is_admin:
        db.close()
        raise HTTPException(
            status_code=403,
            detail="Admin only area"
        )

    db.close()
    return email


def db_add_notification(
    email,
    text,
    type_name="info"
):

    db = SessionLocal()

    note = Notification(
        email=email,
        text=text,
        type=type_name
    )

    db.add(note)
    db.commit()
    db.close()


def track_page_visit(
    page_name,
    user_email="guest"
):

    db = SessionLocal()

    row = Analytics(
        page=page_name,
        user_email=user_email,
        duration=0
    )

    db.add(row)
    db.commit()
    db.close()


# ==========================================================
# HOME
# ==========================================================

@app.get("/")
def home():

    return {
        "message": "CareerPilot Backend Running",
        "version": "7.0.0",
        "status": "success"
    }


# @app.get("/health")
# def health():

#     return {
#         "server": "running",
#         "time": str(datetime.utcnow())
#     }


# ==========================================================
# TRACKING
# ==========================================================

@app.get("/track/{page_name}")
def track_public(page_name: str):

    track_page_visit(page_name)

    return {
        "message": "Tracked"
    }


# ==========================================================
# CLOUDINARY UPLOAD
# ==========================================================
@app.post("/upload/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    authorization: str = Header(None)
):

    email = auth_email(
        authorization
    )

    # FILE TYPE VALIDATION

    allowed = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp"
    ]

    if file.content_type not in allowed:

        raise HTTPException(
            status_code=400,
            detail="Invalid image type"
        )

    content = await file.read()

    # SIZE LIMIT

    if len(content) > 5 * 1024 * 1024:

        raise HTTPException(
            status_code=400,
            detail="Image too large"
        )

    # CLOUDINARY

    result = cloudinary.uploader.upload(
        content,
        folder="careerpilot/avatar"
    )

    image_url = result["secure_url"]

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

    user.avatar = image_url

    db.commit()

    db.close()

    return {
        "message":
        "Avatar uploaded successfully",

        "url":
        image_url
    }
@app.post("/upload/resume")
async def upload_resume(
    file: UploadFile = File(...)
):

    content = await file.read()

    result = cloudinary.uploader.upload(
        content,
        resource_type="raw",
        folder="careerpilot/resume"
    )

    return {
        "message": "Resume uploaded",
        "url": result["secure_url"]
    }


# ==========================================================
# JOBS API (ADZUNA)
# ==========================================================

@app.get("/jobs/search")
def search_jobs(
    q: str,
    location: str = "india"
):

    url = f"https://api.adzuna.com/v1/api/jobs/in/search/1"

    params = {
        "app_id": ADZUNA_APP_ID,
        "app_key": ADZUNA_APP_KEY,
        "results_per_page": 10,
        "what": q,
        "where": location,
        "content-type": "application/json"
    }

    try:

        res = requests.get(
            url,
            params=params,
            timeout=15
        )

        data = res.json()

        jobs = []

        for item in data.get("results", []):

            jobs.append({
                "title": item.get("title"),
                "company": item.get("company", {}).get("display_name"),
                "location": item.get("location", {}).get("display_name"),
                "salary_min": item.get("salary_min"),
                "salary_max": item.get("salary_max"),
                "redirect_url": item.get("redirect_url")
            })

        return {
            "jobs": jobs
        }

    except Exception:

        return {
            "jobs": []
        }



# ==========================================================
# SIGNUP OTP
# ==========================================================

@app.post("/send-signup-otp")
def send_signup_otp(data: SendOTPData):

    otp = str(
        random.randint(100000, 999999)
    )

    otp_storage[data.email] = {
        "otp": otp,
        "time": datetime.utcnow()
        }

    send_otp_email(
        data.email,
        otp
    )

    return {
        "message": "OTP sent successfully"
    }


@app.post("/verify-signup-otp")
def verify_signup_otp(
    data: VerifyOTPData
):

    record = otp_storage.get(data.email)

    if not record:
        raise HTTPException(
            status_code=400,
            detail="OTP expired"
        )
    # ⏳ EXPIRY CHECK (10 min)
    if datetime.utcnow() - record["time"] > timedelta(minutes=10):
        del otp_storage[data.email]
        raise HTTPException(
            status_code=400,
            detail="OTP expired"
        )

     # ❌ WRONG OTP
    if record["otp"] != data.otp:
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
        plan="CareerPilot AI",
        is_verified=True
    )

    db.add(user)
    db.commit()
    db.close()

    del otp_storage[data.email]

    return {
        "message": "Signup Successful"
    }


# ==========================================================
# LOGIN
# ==========================================================

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
        "message": "Login Success",
        "token": token,
        "user": user.name,
        "email": user.email,
        "plan": user.plan,
        "photo": user.avatar
    }

    db.close()

    return result


# ==========================================================
# GOOGLE LOGIN
# ==========================================================

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
            plan="CareerPilot AI"
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

    db.close()

    return {
        "message": "Google Login Success",
        "token": token,
        "user": data.name,
        "email": data.email,
        "photo": data.photo,
        "plan": user.plan
    }


# ==========================================================
# VERIFY TOKEN
# ==========================================================

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


# ==========================================================
# PROFILE
# ==========================================================

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
        "bio": user.bio,
        "photo": user.avatar,
        "login_count": user.login_count
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

    # SAFE CLEANUP

    user.name = (
        data.name.strip()
        if data.name
        else user.name
    )

    user.phone = (
        data.phone.strip()
        if data.phone
        else ""
    )

    user.city = (
        data.city.strip()
        if data.city
        else ""
    )

    user.bio = (
        data.bio.strip()
        if data.bio
        else ""
    )

    db.commit()

    updated = {
        "name": user.name,
        "phone": user.phone,
        "city": user.city,
        "bio": user.bio,
        "photo": user.avatar,
        "plan": user.plan
    }

    db.close()

    return {
        "message":
        "Profile Updated Successfully",

        "user":
        updated
    }

# ==========================================================
# PASSWORD RESET
# ==========================================================

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

    otp_storage[data.email] = {
        "otp": otp,
        "time": datetime.utcnow()
        }

    send_otp_email(
        data.email,
        otp
    )

    return {
        "message": "OTP sent successfully"
    }


@app.post("/reset-password")
def reset_password(
    data: ResetPasswordData
):

    record = otp_storage.get(data.email)

    if not record:
        raise HTTPException(
            status_code=400,
            detail="OTP expired"
        )
    # ⏳ EXPIRY CHECK (10 min)
    if datetime.utcnow() - record["time"] > timedelta(minutes=10):
        del otp_storage[data.email]
        raise HTTPException(
            status_code=400,
            detail="OTP expired"
        )

     # ❌ WRONG OTP 
    if record["otp"] != data.otp:
        raise HTTPException(
            status_code=400,
            detail="Wrong OTP"
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
        "message": "Password Updated"
    }

    # ==========================================================
# CHANGE PASSWORD
# ==========================================================

@app.post("/change-password")
def change_password(
    data: ChangePasswordData,
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

    # CHECK OLD PASSWORD

    if not verify_password(
        data.old_password,
        user.password
    ):

        db.close()

        raise HTTPException(
            status_code=400,
            detail="Old password incorrect"
        )

    # SAME PASSWORD BLOCK

    if data.old_password == data.new_password:

        db.close()

        raise HTTPException(
            status_code=400,
            detail="New password must be different"
        )

    # UPDATE PASSWORD

    user.password = hash_password(
        data.new_password
    )

    db.commit()
    db.close()

    return {
        "message": "Password changed successfully"
    }

# ==========================================================
# SUBSCRIPTION
# ==========================================================

@app.post("/plan/upgrade")
def upgrade_plan(
    data: UpgradePlanData,
    authorization: str = Header(None)
):

    email = auth_email(
        authorization
    )

    db = SessionLocal()

    user = db.query(User).filter(
        User.email == email
    ).first()

    if user:
        user.plan = data.plan

    sub = Subscription(
        email=email,
        plan=data.plan,
        amount=data.amount,
        status="Active"
    )

    db.add(sub)
    db.commit()
    db.close()

    return {
        "message": "Plan upgraded",
        "plan": data.plan
    }

# ==========================================================
# RESUME ANALYSIS
# ==========================================================
@app.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    authorization: str = Header(None)
):

    email = "guest_user"

    try:
        email = auth_email(authorization)
    except Exception as e:
        print("Auth failed:", e)

    text = await extract_resume_text(file)

    # ===============================
    # ✅ AI CALL + SAFE FALLBACK
    # ===============================
    try:
        data = full_resume_analysis(text)
        print("RAW AI RESPONSE:")
        print(data)

        if not isinstance(data, dict):
            raise Exception("Invalid AI response")

        if "ats_breakdown" not in data or not data["ats_breakdown"]:
            score = int(data.get("ats_score", 50))

            data["ats_breakdown"] = {
                "content": int(score * 0.25),
                "skills": int(score * 0.25),
                "formatting": int(score * 0.25),
                "keywords": int(score * 0.25),
            }

    except Exception as e:
        data = {
            "skills_found": [],
            "missing_skills": [],
            "recommended_role": "Unknown",
            "predicted_salary_lpa": 3,
            "ats_score": 50,
            "tips": [],
            "interview_questions": [],
            "ats_breakdown": {
                "content": 25,
                "skills": 25,
                "formatting": 25,
                "keywords": 25
            }
        }

        # ===============================
    # CLEAN AI RESPONSE
    # ===============================

    if not isinstance(data, dict):
        data = {}

    # ATS SCORE
    # skills list fix

    if isinstance(data.get("skills_found"), str):
        data["skills_found"] = [
            s.strip()
            for s in data["skills_found"].split(",")
        ]

    try:

        data["ats_score"] = int(
            data.get("ats_score", 50)
        )

    except:

        data["ats_score"] = 50

    # SALARY

    try:

        data["predicted_salary_lpa"] = float(
            data.get(
                "predicted_salary_lpa",
                4
            )
        )

    except:

        data["predicted_salary_lpa"] = 4

    # SAFE ARRAYS

    for key in [

        "skills_found",
        "missing_skills",
        "strengths",
        "weaknesses",
        "recommended_skills",
        "tips",
        "interview_questions"

    ]:

        if not isinstance(
            data.get(key),
            list
        ):

            # STRING TO ARRAY

            if isinstance(
                data.get(key),
                str
            ):

                data[key] = [
                    x.strip()
                    for x in data[key].split(",")
                    if x.strip()
                ]

            else:

                data[key] = []

    # SAFE SUMMARY

    if not isinstance(
        data.get("summary"),
        str
    ):

        data["summary"] = ""

    # SAFE ROLE

    if not isinstance(
        data.get("recommended_role"),
        str
    ):

        data["recommended_role"] = "Software Developer"

    # SAFE ATS BREAKDOWN

    if not isinstance(
        data.get("ats_breakdown"),
        dict
    ):

        score = data["ats_score"]

        data["ats_breakdown"] = {

            "content":
                int(score * 0.25),

            "skills":
                int(score * 0.25),

            "formatting":
                int(score * 0.25),

            "keywords":
                int(score * 0.25)

        }

    # DEFAULTS
    

    data.setdefault(
        "skills_found",
        []
    )

    data.setdefault(
        "missing_skills",
        []
    )

    data.setdefault(
        "strengths",
        []
    )

    data.setdefault(
        "weaknesses",
        []
    )

    data.setdefault(
        "recommended_skills",
        []
    )

    data.setdefault(
        "tips",
        []
    )

    data.setdefault(
        "interview_questions",
        []
    )

    data.setdefault(
        "summary",
        ""
    )

    data.setdefault(
        "recommended_role",
        "Software Developer"
    )

    data.setdefault(
        "predicted_salary_lpa",
        4
    )

    data.setdefault(
        "ats_score",
        50
    )
    # ===============================
    # ✅ SAVE TO DB (OUTSIDE TRY)
    # ===============================
    db = SessionLocal()

    report = Report(
        email=email,
        role=data.get("recommended_role"),
        salary=float(data.get("predicted_salary_lpa")),
        ats=int(data.get("ats_score")),
        skills=", ".join(data.get("skills_found", [])),
        file_name=file.filename
    )

    db.add(report)
    db.commit()

    db_add_notification(email, "Resume analyzed successfully")

    if data.get("ats_score", 0) < 60:
        db_add_notification(email, "Low ATS score detected", "warning")
    else:
        db_add_notification(email, "Strong ATS score generated", "success")

    db.close()
    print("FINAL ANALYZE RESPONSE:")
    print(data)

    return data

# ==========================================================
# AI RESUME IMPROVEMENT
# ==========================================================
@app.post("/ai/resume-improve")
async def ai_resume_improve(
    file: UploadFile = File(...)
):

    try:

        text = await extract_resume_text(
            file
        )

        if not text or len(text.strip()) < 30:

            raise HTTPException(
                status_code=400,
                detail="Resume text extraction failed"
            )

        result = improve_resume_ai(text)

        if not isinstance(result, dict):
            result = {}

        return {
            "result": result
        }

    except Exception as e:

        print(str(e))

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ==========================================================
# AI INTERVIEW QUESTIONS
# ==========================================================

@app.get("/ai/interview/{role}")
def ai_interview(role: str):

    result = interview_questions_ai(role)

    return {
        "result": result
    }

# ==========================================================
# PUBLIC ANALYTICS
# ==========================================================

# ==========================================================
# USER DASHBOARD STATS
# ==========================================================

@app.get("/dashboard/stats")
def dashboard_stats(
    authorization: str = Header(None)
):

    email = auth_email(
        authorization
    )

    db = SessionLocal()

    reports = db.query(
        Report
    ).filter(
        Report.email == email
    ).count()

    notes = db.query(
        Notification
    ).filter(
        Notification.email == email
    ).count()

    user = db.query(User).filter(
        User.email == email
    ).first()

    db.close()

    return {
        "reports": reports,
        "notifications": notes,
        "plan": user.plan
    }

# ==========================================================
# MY REPORTS 
# ==========================================================

@app.get("/my-reports")
def get_my_reports(
    authorization: str = Header(None)
):
    email = auth_email(authorization)

    db = SessionLocal()

    rows = db.query(Report).filter(
        Report.email == email
    ).order_by(Report.id.desc()).all()

    data = []

    for r in rows:
        data.append({
            "role": r.role,
            "salary": r.salary,
            "ats": r.ats,
            "skills": r.skills,
            "file": r.file_name,
            "created_at": str(r.created_at)
        })

    db.close()

    return {
        "reports": data
    }


# ==========================================================
# USER NOTIFICATIONS
# ==========================================================

@app.get("/notifications")
def my_notifications(
    authorization: str = Header(None)
):

    email = auth_email(
        authorization
    )

    db = SessionLocal()

    rows = db.query(
        Notification
    ).filter(
        Notification.email == email
    ).order_by(
        Notification.id.desc()
    ).limit(50).all()

    data = []

    for row in rows:
        data.append({
            "id": row.id,
            "text": row.text,
            "type": row.type,
            "is_read": row.is_read,
            "created_at": str(
                row.created_at
            )
        })

    db.close()

    return {
        "notifications": data
    }


@app.put("/notifications/read/{note_id}")
def read_notification(
    note_id: int,
    authorization: str = Header(None)
):

    email = auth_email(
        authorization
    )

    db = SessionLocal()

    row = db.query(
        Notification
    ).filter(
        Notification.id == note_id,
        Notification.email == email
    ).first()

    if not row:
        db.close()
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    row.is_read = True

    db.commit()
    db.close()

    return {
        "message": "Marked as read"
    }


# ==========================================================
# TRACK PAGE ANALYTICS
# ==========================================================

@app.post("/track-page")
def track_page(
    data: TrackPageData,
    authorization: str = Header(None)
):

    email = ""

    try:
        email = auth_email(
            authorization
        )
    except:
        pass
    
    db = SessionLocal()

    row = Analytics(
        page=data.page,
        user_email=email,
        duration=data.duration
    )

    db.add(row)
    db.commit()
    db.close()

    return {
        "message": "Tracked"
    }


# ==========================================================
# ADMIN STATS
# ==========================================================

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
        "users": total_users,
        "premium_users": premium_users,
        "reports": reports,
        "today_signups": today_signups,
        
    }


# ==========================================================
# ADMIN USERS
# ==========================================================

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
            "verified": user.is_verified,
            "login_count": user.login_count,
            "created_at": str(
                user.created_at
            )
        })

    db.close()

    return {
        "users": data
    }


# ==========================================================
# RECENT SIGNUPS
# ==========================================================

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
            "created_at": str(
                user.created_at
            )
        })

    db.close()

    return {
        "recent_users": data
    }


# ==========================================================
# CHART DATA
# ==========================================================

@app.get("/admin/chart-data")
def admin_chart_data(
    authorization: str = Header(None)
):

    admin_auth(
        authorization
    )

    db = SessionLocal()

    months = [
        "Jan", "Feb", "Mar",
        "Apr", "May", "Jun",
        "Jul", "Aug", "Sep",
        "Oct", "Nov", "Dec"
    ]

    growth = []

    for i in range(1, 13):

        count = db.query(
            User
        ).filter(
            extract(
                "month",
                User.created_at
            ) == i
        ).count()

        growth.append({
            "month": months[i - 1],
            "users": count
        })

    reports = [
        {
            "name": "Reports",
            "count": db.query(
                Report
            ).count()
        },
        {
            "name": "Premium",
            "count": db.query(
                User
            ).filter(
                User.plan == "Premium"
            ).count()
        },
        {
            "name": "Today",
            "count": db.query(
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


# ==========================================================
# ADMIN NOTIFICATIONS
# ==========================================================

@app.get("/admin/notifications")
def admin_notifications(
    authorization: str = Header(None)
):

    admin_auth(
        authorization
    )

    db = SessionLocal()

    rows = db.query(
        Notification
    ).order_by(
        Notification.id.desc()
    ).limit(50).all()

    data = []

    for row in rows:
        data.append({
            "id": row.id,
            "email": row.email,
            "text": row.text,
            "type": row.type,
            "created_at": str(
                row.created_at
            )
        })

    db.close()

    return {
        "notifications": data
    }


# ==========================================================
# BROADCAST MESSAGE
# ==========================================================

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

        row = Notification(
            email=user.email,
            text=data.message,
            type="broadcast"
        )

        db.add(row)

    db.commit()
    db.close()

    return {
        "message": "Broadcast sent"
    }


# ==========================================================
# TOGGLE PLAN
# ==========================================================
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

    # ONLY PREMIUM LABELS

    plans = [
        "CareerPilot AI",
        "CareerPilot AI Pro",
        "CareerPilot AI Ultra"
    ]

    current = user.plan or plans[0]

    try:
        index = plans.index(current)
        next_index = (index + 1) % len(plans)
    except ValueError:
        next_index = 0

    user.plan = plans[next_index]

    db.commit()

    new_plan = user.plan

    db.close()

    return {
        "message":
        "Plan updated",
        "plan":
        new_plan
    }

# ==========================================================
# DELETE USER
# ==========================================================

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
        "message": "User deleted"
    }


# ==========================================================
# EXPORT USERS CSV
# ==========================================================

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
            str(user.created_at)
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

class ChatData(BaseModel):
    message: str


@app.post("/ai/chat")
def chat_ai(
    data: ChatData,
    authorization: str = Header(None)
):

    try:
        auth_email(authorization)
    except:
        pass

    reply = career_chat_ai(f""" 
    You are CareerPilot AI assistant.
    User: {data.message}
    Give clear, helpful answer.""")

    return {"reply": reply}
class JobData(BaseModel):
    skills: str


@app.post("/ai/jobs")
def ai_jobs(data: JobData):

    jobs = job_recommendation_ai(data.skills)

    return {"jobs": jobs}



# ==========================================================
# ROOT END
# ==========================================================

@app.get("/version")
def version():

    return {
        "version": "7.0.0"
    }

# ==========================================================
# CHANGE PASSWORD
# ==========================================================

@app.post("/change-password")
def change_password(
    data: ChangePasswordData,
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

    # OLD PASSWORD CHECK

    if not verify_password(
        data.old_password,
        user.password
    ):

        db.close()

        raise HTTPException(
            status_code=400,
            detail="Old password incorrect"
        )

    # SAME PASSWORD BLOCK

    if data.old_password == data.new_password:

        db.close()

        raise HTTPException(
            status_code=400,
            detail="New password must be different"
        )

    # UPDATE PASSWORD

    user.password = hash_password(
        data.new_password
    )

    db.commit()

    db.close()

    return {
        "message":
        "Password changed successfully"
    }