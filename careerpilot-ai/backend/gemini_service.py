# gemini_service.py

import os
import json
import google.generativeai as genai

# ==========================================
# OPTIONAL OPENAI FALLBACK
# ==========================================

USE_GPT = False

if USE_GPT:
    import openai
    openai.api_key = os.getenv("OPENAI_API_KEY")

# ==========================================
# GEMINI CONFIG
# ==========================================

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

genai.configure(
    api_key=GEMINI_API_KEY
)

model = genai.GenerativeModel(
    "gemini-1.5-flash"
)

# ==========================================
# CLEAN AI RESPONSE
# ==========================================

def clean_ai_text(text):

    if not text:
        return ""

    text = text.replace(
        "```json",
        ""
    )

    text = text.replace(
        "```",
        ""
    )

    return text.strip()

# ==========================================
# ASK AI
# ==========================================

def ask_ai(prompt):

    # ==========================
    # GEMINI
    # ==========================

    try:

        response = model.generate_content(
            prompt
        )

        text = clean_ai_text(
            response.text
        )

        if text:
            return text

    except Exception as e:

        print(
            "Gemini Error:",
            str(e)
        )

    # ==========================
    # GPT FALLBACK
    # ==========================

    if USE_GPT:

        try:

            res = openai.ChatCompletion.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )

            text = (
                res.choices[0]
                .message.content
            )

            return clean_ai_text(text)

        except Exception as e:

            print(
                "GPT Error:",
                str(e)
            )

    return ""

# ==========================================
# SAFE JSON PARSER
# ==========================================

def parse_json(text, fallback):

    try:

        return json.loads(text)

    except Exception as e:

        print(
            "JSON Parse Error:",
            str(e)
        )

        return fallback

# ==========================================
# SAFE ARRAY
# ==========================================

def safe_array(value):

    if isinstance(value, list):
        return value

    return []

# ==========================================
# SAFE STRING
# ==========================================

def safe_string(value):

    if isinstance(value, str):
        return value.strip()

    return ""

# ==========================================
# SAFE NUMBER
# ==========================================

def safe_number(value, default=0):

    try:
        return int(value)
    except:
        return default

# ===============================
# FULL AI RESUME ANALYSIS
# ===============================
def full_resume_analysis(resume_text):

    prompt = f"""
You are an elite ATS Resume Analyzer,
Senior HR Recruiter,
and AI Career Coach.

Analyze this resume deeply.

Return ONLY STRICT JSON.

{{
  "summary": "",
  "skills_found": [],
  "missing_skills": [],
  "strengths": [],
  "weaknesses": [],
  "recommended_skills": [],
  "recommended_role": "",
  "predicted_salary_lpa": 0,
  "ats_score": 0,

  "ats_breakdown": {{
    "content": 0,
    "skills": 0,
    "formatting": 0,
    "keywords": 0
  }},

  "tips": [],
  "interview_questions": []
}}

RULES:
- ATS score realistic
- salary realistic for India
- role should match resume
- strengths meaningful
- weaknesses meaningful
- skills technical
- tips actionable
- questions role-based
- output valid JSON ONLY
- no markdown
- no explanation

Resume:
{resume_text}
"""

    res = ask_ai(prompt)

    fallback = {
        "summary":
        "Resume analyzed successfully.",

        "skills_found": [],

        "missing_skills": [],

        "strengths": [
            "Good technical foundation"
        ],

        "weaknesses": [
            "Resume needs better ATS keywords"
        ],

        "recommended_skills": [
            "Communication",
            "Problem Solving"
        ],

        "recommended_role":
        "Software Developer",

        "predicted_salary_lpa": 4,

        "ats_score": 60,

        "ats_breakdown": {
            "content": 15,
            "skills": 15,
            "formatting": 15,
            "keywords": 15
        },

        "tips": [
            "Improve project descriptions"
        ],

        "interview_questions": [
            "Tell me about yourself"
        ]
    }

    data = parse_json(res, fallback)

    # =========================
    # VALIDATION
    # =========================

    if not isinstance(data, dict):
        data = fallback

    # =========================
    # SAFE DEFAULTS
    # =========================

    fields = [
        "skills_found",
        "missing_skills",
        "strengths",
        "weaknesses",
        "recommended_skills",
        "tips",
        "interview_questions"
    ]

    for field in fields:

        if not isinstance(
            data.get(field),
            list
        ):
            data[field] = []

    # =========================
    # ATS SCORE SAFE
    # =========================

    try:
        data["ats_score"] = int(
            data.get(
                "ats_score",
                60
            )
        )
    except:
        data["ats_score"] = 60

    if data["ats_score"] > 100:
        data["ats_score"] = 100

    if data["ats_score"] < 0:
        data["ats_score"] = 0

    # =========================
    # SALARY SAFE
    # =========================

    try:
        data["predicted_salary_lpa"] = float(
            data.get(
                "predicted_salary_lpa",
                4
            )
        )
    except:
        data["predicted_salary_lpa"] = 4

    # =========================
    # STRINGS SAFE
    # =========================

    text_fields = [
        "summary",
        "recommended_role"
    ]

    for field in text_fields:

        if not isinstance(
            data.get(field),
            str
        ):
            data[field] = ""

    # =========================
    # ATS BREAKDOWN SAFE
    # =========================

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

    # ==================================
    # FINAL CLEAN STRUCTURE
    # ==================================

    cleaned = {

        "summary":
            safe_string(
                data.get("summary")
            ),

        "skills_found":
            safe_array(
                data.get("skills_found")
            ),

        "missing_skills":
            safe_array(
                data.get("missing_skills")
            ),

        "strengths":
            safe_array(
                data.get("strengths")
            ),

        "weaknesses":
            safe_array(
                data.get("weaknesses")
            ),

        "recommended_skills":
            safe_array(
                data.get(
                    "recommended_skills"
                )
            ),

        "recommended_role":
            safe_string(
                data.get(
                    "recommended_role"
                )
            ) or "Software Developer",

        "predicted_salary_lpa":
            safe_number(
                data.get(
                    "predicted_salary_lpa"
                ),
                4
            ),

        "ats_score":
            safe_number(
                data.get(
                    "ats_score"
                ),
                55
            ),

        "ats_breakdown":
            data.get(
                "ats_breakdown",
                {
                    "content": 15,
                    "skills": 15,
                    "formatting": 10,
                    "keywords": 15
                }
            ),

        "tips":
            safe_array(
                data.get("tips")
            ),

        "interview_questions":
            safe_array(
                data.get(
                    "interview_questions"
                )
            )
    }

    return cleaned

# ===============================
# REAL RESUME IMPROVEMENT AI
# ===============================
def improve_resume_ai(resume_text):

    prompt = f"""
You are an expert ATS Resume Writer and Senior Technical Recruiter.

Analyze the resume deeply.

Return STRICT JSON ONLY.

{{
  "professional_summary": "",
  "improved_experience": [],
  "missing_keywords": [],
  "recommended_projects": [],
  "resume_tips": [],
  "ats_improvement_score": 0
}}

RULES:
- Give recruiter-level improvements
- Make points ATS optimized
- Add powerful action words
- Suggest modern AI/Tech keywords
- Give realistic suggestions
- No markdown
- No explanation outside JSON

Resume:
{resume_text}
"""

    res = ask_ai(prompt)

    fallback = {
        "professional_summary":
        "Strong candidate with technical and problem solving skills.",

        "improved_experience": [
            "Improved resume bullet points using action verbs"
        ],

        "missing_keywords": [
            "Leadership",
            "Communication",
            "Problem Solving"
        ],

        "recommended_projects": [
            "AI Resume Analyzer",
            "Machine Learning Dashboard"
        ],

        "resume_tips": [
            "Add measurable achievements",
            "Improve ATS keywords"
        ],

        "ats_improvement_score": 75
    }

    data = parse_json(res, fallback)

    # =========================
    # CLEANUP
    # =========================

    if not isinstance(data, dict):
        data = fallback

    data.setdefault(
        "professional_summary",
        fallback["professional_summary"]
    )

    data.setdefault(
        "improved_experience",
        []
    )

    data.setdefault(
        "missing_keywords",
        []
    )

    data.setdefault(
        "recommended_projects",
        []
    )

    data.setdefault(
        "resume_tips",
        []
    )

    data.setdefault(
        "ats_improvement_score",
        75
    )

    return data

# ==========================================
# JOB RECOMMENDATION AI
# ==========================================

def job_recommendation_ai(
    skills
):

    prompt = f"""
Suggest 5 job roles
based on these skills:

{skills}

Return STRICT JSON:

{{
  "jobs": []
}}
"""

    response = ask_ai(prompt)

    data = parse_json(
        response,
        {"jobs": []}
    )

    return safe_array(
        data.get("jobs")
    )

# ==========================================
# CAREER CHAT AI
# ==========================================

def career_chat_ai(
    user_message,
    context=""
):

    prompt = f"""
You are CareerPilot AI.

Context:
{context}

User:
{user_message}

Give concise,
helpful answer.
"""

    response = ask_ai(prompt)

    return safe_string(response)

# ==========================================
# INTERVIEW QUESTIONS AI
# ==========================================

def interview_questions_ai(
    role
):

    prompt = f"""
Generate 5 interview
questions and answers
for:

{role}

Return STRICT JSON:

{{
  "questions": []
}}
"""

    response = ask_ai(prompt)

    data = parse_json(
        response,
        {"questions": []}
    )

    return safe_array(
        data.get("questions")
    )