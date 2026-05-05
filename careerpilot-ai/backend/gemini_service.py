import os
import json
import google.generativeai as genai

# ===============================
# OPTIONAL GPT (HYBRID MODE)
# ===============================
USE_GPT = False  # True karna ho to enable karo

if USE_GPT:
    import openai
    openai.api_key = os.getenv("OPENAI_API_KEY")

# ===============================
# CONFIG
# ===============================

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel("gemini-1.5-flash")


# ===============================
# CORE CALL (HYBRID)
# ===============================

def ask_ai(prompt):

    # 👉 Try Gemini first
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        text = text.replace("```json", "").replace("```", "").strip()
        return text
    except:
        pass

    # 👉 fallback GPT
    if USE_GPT:
        try:
            res = openai.ChatCompletion.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}]
            )
            return res.choices[0].message.content.strip()
        except:
            pass

    return ""


# ===============================
# SAFE JSON PARSER
# ===============================

def parse_json(text, fallback):
    try:
        return json.loads(text)
    except:
        return fallback


# ===============================
# FULL AI ANALYSIS 🔥🔥🔥
# ===============================

def full_resume_analysis(resume_text):

    prompt = f"""
You are a world-class AI Career Coach like ChatGPT.

Analyze deeply and return STRICT JSON:

{{
  "skills_found": [],
  "missing_skills": [],
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
- Give realistic ATS score
- ats_breakdown total ≈ ats_score
- tips = actionable
- questions = role-based
- salary = Indian fresher realistic

Resume:
{resume_text}
"""

    res = ask_ai(prompt)

    return parse_json(res, {
        "skills_found": [],
        "missing_skills": [],
        "recommended_role": "Unknown",
        "predicted_salary_lpa": 4,
        "ats_score": 50,
        "ats_breakdown": {
            "content": 20,
            "skills": 10,
            "formatting": 10,
            "keywords": 10
        },
        "tips": ["Improve resume"],
        "interview_questions": ["Tell me about yourself"]
    })


# ===============================
# JOB RECOMMENDATION (AI)
# ===============================

def job_recommendation_ai(skills):

    prompt = f"""
Based on skills: {skills}

Give 5 job roles list JSON:

{{"jobs":[]}}
"""

    res = ask_ai(prompt)

    return parse_json(res, {"jobs": []}).get("jobs", [])


# ===============================
# AI CHAT ASSISTANT 🔥
# ===============================

def career_chat_ai(user_message, context=""):

    prompt = f"""
You are CareerPilot AI assistant like ChatGPT.

Context:
{context}

User:
{user_message}

Give helpful, short, clear answer.
"""

    return ask_ai(prompt)


# ===============================
# RESUME IMPROVEMENT
# ===============================

def improve_resume_ai(resume_text):

    prompt = f"""
Improve this resume.

Return JSON:

{{
  "summary": "",
  "improvements": [],
  "keywords": []
}}

Resume:
{resume_text}
"""

    res = ask_ai(prompt)

    return parse_json(res, {
        "summary": "",
        "improvements": [],
        "keywords": []
    })


# ===============================
# INTERVIEW QUESTIONS
# ===============================

def interview_questions_ai(role):

    prompt = f"""
Generate 5 interview Q&A for {role}

Return JSON:
{{"questions":[]}}
"""

    res = ask_ai(prompt)

    return parse_json(res, {"questions": []}).get("questions", [])