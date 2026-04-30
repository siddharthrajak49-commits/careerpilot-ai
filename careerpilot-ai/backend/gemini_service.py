import os
import google.generativeai as genai

# ===============================
# CONFIG
# ===============================

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel("gemini-1.5-flash")


# ===============================
# GENERIC ASK
# ===============================

def ask_gemini(prompt):
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"Error: {str(e)}"


# ===============================
# SKILL EXTRACTION
# ===============================

def extract_skills_ai(resume_text):
    prompt = f"""
    Analyze this resume text and extract only technical + soft skills.

    Return comma separated list only.

    Resume:
    {resume_text}
    """

    return ask_gemini(prompt)


# ===============================
# ROLE RECOMMENDATION
# ===============================

def recommend_role_ai(skills):
    prompt = f"""
    Based on these skills:

    {skills}

    Suggest best job role in one line only.
    """

    return ask_gemini(prompt)


# ===============================
# SALARY PREDICTION
# ===============================

def salary_prediction_ai(skills):
    prompt = f"""
    Based on Indian fresher market.

    Skills:
    {skills}

    Predict salary in LPA only number.
    Example: 6.5
    """

    return ask_gemini(prompt)


# ===============================
# RESUME IMPROVEMENT
# ===============================

def improve_resume_ai(resume_text):
    prompt = f"""
    Improve this resume professionally.

    Give:
    1. Weak points
    2. ATS improvements
    3. Better summary
    4. Better skills section

    Resume:
    {resume_text}
    """

    return ask_gemini(prompt)


# ===============================
# INTERVIEW QUESTIONS
# ===============================

def interview_questions_ai(role):
    prompt = f"""
    Generate top 10 interview questions for {role}
    with answers.
    """

    return ask_gemini(prompt)