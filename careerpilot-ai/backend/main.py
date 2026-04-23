# main.py (CareerPilot Final Full Upgraded)
from dotenv import load_dotenv
load_dotenv()
from fastapi import (
    FastAPI,
    UploadFile,
    File,
    HTTPException,
    Header
)

from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random

from resume_parser import extract_resume_text
from skill_matcher import detect_skills
from recommender import recommend_role
from salary_model import predict_salary

from database import (
    SessionLocal,
    User,
    Report
)

from auth import (
    hash_password,
    verify_password,
    create_token,
    get_current_user
)

app = FastAPI(
    title="CareerPilot AI API",
    version="3.0.0"
)


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


class ProfileData(BaseModel):
    name: str
    email: str
    phone: str = ""
    city: str = ""
    bio: str = ""


class ForgotPasswordData(BaseModel):
    email: str


class ResetPasswordData(BaseModel):
    email: str
    password: str

# ==================================
# GOOGLE LOGIN MODEL
# (Add inside MODELS section)
# ==================================

class GoogleLoginData(BaseModel):
    name: str
    email: str
    photo: str = ""


# ==================================
# HELPERS
# ==================================

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


# ==================================
# HOME
# ==================================

@app.get("/")
def home():

    return {
        "message": "CareerPilot Backend Running",
        "version": "3.0.0"
    }


# ==================================
# SIGNUP
# ==================================

@app.post("/signup")
def signup(data: SignupData):

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
        )
    )

    db.add(user)
    db.commit()
    db.close()

    return {
        "message": "Signup Successful"
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

    db.close()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    if not verify_password(
        data.password,
        user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Wrong password"
        )

    token = create_token({
        "sub": user.email
    })

    return {
        "message": "Login Success",
        "token": token,
        "user": user.name,
        "email": user.email
    }

# ==================================
# GOOGLE LOGIN
# (Add after normal /login route)
# ==================================

@app.post("/google-login")
def google_login(
    data: GoogleLoginData
):

    db = SessionLocal()

    user = db.query(User).filter(
        User.email == data.email
    ).first()

    # If new Google user
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

        # update latest name/photo
        user.name = data.name

        try:
            user.avatar = data.photo
        except:
            pass

        db.commit()

    token = create_token({
        "sub": user.email
    })

    db.close()

    return {
        "message":
            "Google Login Success",
        "token": token,
        "user": user.name,
        "email": user.email,
        "photo": data.photo,
        "plan": user.plan
    }


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
# PROFILE GET
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

    db.close()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "name": user.name,
        "email": user.email,
        "plan": user.plan,
        "phone": user.phone,
        "city": user.city,
        "bio": user.bio
    }


# ==================================
# PROFILE UPDATE
# ==================================

@app.post("/profile/update")
def update_profile(
    data: ProfileData
):

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

    user.name = data.name
    user.phone = data.phone
    user.city = data.city
    user.bio = data.bio

    db.commit()
    db.close()

    return {
        "message": "Profile Updated"
    }


# ==================================
# FORGOT PASSWORD
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

    otp = random.randint(
        100000,
        999999
    )

    return {
        "message": "OTP Generated",
        "otp": otp
    }


# ==================================
# RESET PASSWORD
# ==================================

@app.post("/reset-password")
def reset_password(
    data: ResetPasswordData
):

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

    return {
        "message": "Password Updated"
    }


# ==================================
# ANALYZE RESUME
# ==================================

@app.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...)
):

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
    email="guest_user",
    role=role,
    salary=str(salary),
    ats=str(ats_score)
    )

    db.add(report)
    db.commit()
    db.close()

    return {
        "skills_found": skills,
        "recommended_role": role,
        "predicted_salary_lpa": salary,
        "ats_score": ats_score,
        "tips": [
            "Use action verbs",
            "Add projects",
            "Keep one page"
        ],
        "missing_skills": [
            "AWS",
            "Docker",
            "System Design"
        ],
        "interview_questions": [
            "Tell us about yourself",
            "Explain your project",
            "Why hire you?"
        ]
    }


# ==================================
# IMPROVE RESUME
# ==================================

@app.post("/improve-resume")
async def improve_resume(
    file: UploadFile = File(...)
):

    text = await extract_resume_text(
        file
    )

    improved = []

    for line in text.split("\n"):

        clean = line.strip()

        if clean:
            improved.append(
                f"• Led and improved {clean}"
            )

    if len(improved) == 0:
        improved = [
            "• Built scalable systems",
            "• Improved productivity"
        ]

    return {
        "message": "Resume Improved",
        "improved_text": "\n".join(
            improved[:8]
        ),
        "keywords_added": [
            "Leadership",
            "Teamwork",
            "Python",
            "React"
        ]
    }


# ==================================
# MY REPORTS
# ==================================

@app.get("/my-reports")
def my_reports(
    authorization: str = Header(None)
):

    email = auth_email(
        authorization
    )

    db = SessionLocal()

    reports = db.query(Report).filter(
        Report.email == email
    ).all()

    db.close()

    data = []

    for item in reports:

        data.append({
            "role": item.role,
            "salary": item.salary,
            "ats": item.ats
        })

    return {
        "email": email,
        "reports": data
    }


# ==================================
# ANALYTICS
# ==================================

@app.get("/analytics")
def analytics():

    return {
        "total_users": 154,
        "reports_generated": 620,
        "avg_ats_score": 74,
        "top_role": "Frontend Developer"
    }


# ==================================
# ADMIN
# ==================================

@app.get("/admin/stats")
def admin_stats():

    return {
        "users": 154,
        "reports": 620,
        "premium_users": 39,
        "today_signups": 8
    }
