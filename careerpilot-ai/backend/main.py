from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from resume_parser import extract_resume_text
from skill_matcher import detect_skills
from recommender import recommend_role
from salary_model import predict_salary

from database import SessionLocal, Report, User
from auth import hash_password, verify_password, create_token

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Home
@app.get("/")
def home():
    return {"message": "CareerPilot AI Backend Running"}


# -------------------------
# SIGNUP
# -------------------------
@app.post("/signup")
def signup(data: dict):

    db = SessionLocal()

    existing = db.query(User).filter(
        User.email == data["email"]
    ).first()

    if existing:
        db.close()
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    new_user = User(
        name=data["name"],
        email=data["email"],
        password=hash_password(data["password"])
    )

    db.add(new_user)
    db.commit()
    db.close()

    return {"message": "Signup Successful"}


# -------------------------
# LOGIN
# -------------------------
@app.post("/login")
def login(data: dict):

    db = SessionLocal()

    user = db.query(User).filter(
        User.email == data["email"]
    ).first()

    db.close()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    if not verify_password(
        data["password"],
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
        "user": user.email
    }


# -------------------------
# RESUME ANALYSIS
# -------------------------
@app.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...)
):

    text = await extract_resume_text(file)

    skills = detect_skills(text)

    role = recommend_role(skills)

    salary = predict_salary(skills)

    ats_score = len(skills) * 10

    tips = [
        "Add measurable achievements",
        "Use action words",
        "Keep resume one page",
        "Add GitHub & LinkedIn",
        "Use ATS friendly format"
    ]

    missing_skills = [
        "AWS",
        "Docker",
        "DSA",
        "System Design"
    ]

    questions = [
        "Explain your project",
        "What is Machine Learning?",
        "Difference SQL vs NoSQL?",
        "Tell us about yourself",
        "Why should we hire you?"
    ]

    # Save report
    db = SessionLocal()

    new_report = Report(
        role=role,
        salary=str(salary),
        ats=str(ats_score)
    )

    db.add(new_report)
    db.commit()
    db.close()

    return {
        "skills_found": skills,
        "recommended_role": role,
        "predicted_salary_lpa": salary,
        "ats_score": ats_score,
        "tips": tips,
        "missing_skills": missing_skills,
        "interview_questions": questions
    }