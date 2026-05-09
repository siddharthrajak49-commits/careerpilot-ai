# gemini_service.py

import os
import json
import html

from dotenv import load_dotenv
import google.generativeai as genai

# ==========================================
# LOAD ENV
# ==========================================

load_dotenv()

# ==========================================
# GEMINI CONFIG
# ==========================================

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

genai.configure(
    api_key=GEMINI_API_KEY
)

# ==========================================
# OPTIONAL OPENAI FALLBACK
# ==========================================

USE_GPT = False

if USE_GPT:

    from openai import OpenAI

    client = OpenAI(
        api_key=os.getenv("OPENAI_API_KEY")
    )

# ==========================================
# HELPERS
# ==========================================

def clean_ai_text(text):

    if not text:
        return ""

    return text.strip()


def safe_string(text):

    if not text:
        return ""

    return html.escape(text)


def safe_array(arr):

    return arr if isinstance(arr, list) else []


def parse_json(text, fallback):

    try:
        return json.loads(text)

    except Exception:
        return fallback


# ==========================================
# SMART AI MODEL SYSTEM
# ==========================================

MODELS = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-pro-latest"
]

# ==========================================
# ASK AI
# ==========================================

def ask_ai(prompt):

    for model_name in MODELS:

        try:

            print(f"\nUsing Model: {model_name}")

            model = genai.GenerativeModel(
                model_name
            )

            response = model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "max_output_tokens": 8192,
                }
            )

            # =========================
            # SAFE RESPONSE
            # =========================

            if not response:
                continue

            if not hasattr(response, "text"):
                continue

            text = response.text

            if not text:
                continue

            return clean_ai_text(text)

        except Exception as e:

            print(
                f"{model_name} failed:",
                str(e)
            )

            continue

    # ======================================
    # OPTIONAL GPT FALLBACK
    # ======================================

    if USE_GPT:

        try:

            res = client.chat.completions.create(
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

    return "AI service temporarily unavailable."


# ==========================================
# FULL AI RESUME ANALYSIS
# ==========================================

def full_resume_analysis(resume_text):

    prompt = f"""
You are an Elite AI Resume Reviewer,
ATS Optimization Expert,
Senior Technical Recruiter,
and Hiring Manager.

Analyze this resume deeply.

Provide:

1. Executive Summary

2. Resume Scorecard
- ATS Compatibility
- Technical Depth
- Project Quality
- Recruiter Impression
- AI/ML Readiness
- Interview Potential

3. Recruiter First Impression

4. Technical & Project Analysis

5. ATS Optimization Suggestions

6. Weaknesses & Red Flags

7. Best Role Matching

8. Missing Skills

9. Resume Improvement Strategy

10. Rewrite Weak Resume Bullets

11. Final Verdict

Return BEAUTIFUL MARKDOWN.

Resume:
{resume_text}
"""

    response = ask_ai(prompt)

    return {
        "analysis": response
    }


# ==========================================
# IMPROVE RESUME AI
# ==========================================

def improve_resume_ai(resume_text):

    prompt = f"""
You are an elite Resume Writer
and ATS Expert.

Rewrite and improve this resume professionally.

Improve:
- grammar
- ATS optimization
- project descriptions
- keyword optimization
- formatting
- technical presentation

Make it:
- modern
- recruiter friendly
- concise
- achievement-oriented

Return FULL improved resume
in BEAUTIFUL MARKDOWN.

Resume:
{resume_text}
"""

    response = ask_ai(prompt)

    return {
        "improved_resume": response
    }


# ==========================================
# JOB RECOMMENDATION AI
# ==========================================

def job_recommendation_ai(skills):

    prompt = f"""
Suggest 5 best tech jobs
for these skills:

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

User Message:
{user_message}

Give concise,
helpful,
professional answer.
"""

    response = ask_ai(prompt)

    return safe_string(response)


# ==========================================
# INTERVIEW QUESTIONS AI
# ==========================================

def interview_questions_ai(role):

    prompt = f"""
Generate 5 interview questions
and answers for:

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