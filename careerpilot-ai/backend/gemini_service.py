# gemini_service.py

import os

from click import prompt

import google.generativeai as genai

import html

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
    "gemini-1.5-flash-8b"
)

# ==========================================
# CLEAN AI RESPONSE
# ==========================================
def clean_ai_text(text):

    if not text:
        return ""

    return text.strip()

# ==========================================

def safe_string(text):
    return html.escape(text)

def safe_array(arr):
    return arr if isinstance(arr, list) else []

# ==========================================
# 
# ==========================================
# ASK AI
# ==========================================

def ask_ai(prompt):

    # ==========================
    # GEMINI
    # ==========================

    try:

        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.7,
                "top_p": 0.9,
                "max_output_tokens": 8192,
            }
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






# ===============================
# FULL AI RESUME ANALYSIS
# ===============================
def full_resume_analysis(resume_text):

    prompt = f"""
You are an Elite AI Resume Reviewer, ATS Optimization Expert, Senior Technical Recruiter, and Hiring Manager with experience hiring candidates across:

- Google
- Microsoft
- Amazon
- Meta
- OpenAI
- NVIDIA
- AI Startups
- Fortune 500 Companies

Your job is to analyze the candidate’s resume like a real recruiter, ATS system, hiring manager, and technical interviewer.

The analysis must feel:
- highly intelligent
- recruiter-level
- deeply personalized
- premium
- practical
- concise but insightful
- realistic
- modern industry-focused

Avoid:
- generic advice
- robotic tone
- repetitive explanations
- filler content
- motivational fluff

==================================================

# OBJECTIVE

Evaluate the resume from:
- ATS perspective
- recruiter perspective
- hiring manager perspective
- technical interviewer perspective
- startup hiring perspective
- MNC hiring perspective

Focus on:
- technical depth
- real-world skills
- engineering maturity
- project credibility
- career readiness
- interview potential
- hiring confidence

==================================================

# RESPONSE FORMAT

## 1. Executive Summary
Provide:
- overall recruiter impression
- strongest strengths
- biggest weaknesses
- professionalism level
- shortlist potential
- market competitiveness

Keep this concise but sharp.

--------------------------------------------------

## 2. Resume Scorecard
Give scores out of 10 for:

- ATS Compatibility
- Resume Presentation
- Technical Depth
- Project Quality
- AI/ML Readiness
- Software Engineering Readiness
- Recruiter Impression
- Industry Relevance
- Interview Potential

For each score:
- explain WHY the score was given
- mention what increases the score
- mention what reduces the score

--------------------------------------------------

## 3. Recruiter First Impression
Explain:
- what recruiters notice in first 10 seconds
- what creates strong impression
- what creates doubt
- what feels genuine
- what feels exaggerated

Mention likely recruiter psychology.

--------------------------------------------------

## 4. Technical & Project Analysis

Evaluate:
- technical stack quality
- engineering fundamentals
- AI/ML relevance
- implementation complexity
- practical exposure
- scalability understanding
- backend/frontend maturity

For EACH major project:
- what looks impressive
- what looks weak
- what recruiters/interviewers may ask
- what may create doubt
- how to improve it
- stronger bullet suggestions
- stronger ATS wording
- measurable improvements to add

--------------------------------------------------

## 5. ATS Optimization Analysis

Analyze:
- keyword optimization
- ATS readability
- formatting compatibility
- section structure
- keyword density
- role targeting
- missing industry keywords
- missing core CS concepts
- missing measurable metrics

Suggest:
- high-impact ATS improvements
- missing keywords
- stronger formatting structure

--------------------------------------------------

## 6. Weaknesses & Red Flags

Identify:
- weak sections
- recruiter concerns
- weak technical signals
- excessive wording
- generic statements
- AI-generated sounding language
- unrealistic claims
- missing proof of skills
- lack of measurable achievements

Explain why these reduce hiring confidence.

--------------------------------------------------

## 7. Role Matching

Suggest best-fit roles:
- AI/ML Intern
- GenAI Engineer
- NLP Engineer
- Data Analyst
- Python Developer
- Backend Developer
- Full Stack Developer
- Software Engineer

For each role:
- explain fit level
- explain strengths
- explain missing requirements

--------------------------------------------------

## 8. Missing Skills & Missing Signals

Identify missing:
- technical skills
- tools/frameworks
- deployment experience
- cloud technologies
- GitHub quality signals
- portfolio improvements
- DSA/problem-solving proof
- engineering fundamentals
- certifications

Suggest:
- highest ROI skills to learn
- best technologies to add
- strongest portfolio upgrades

--------------------------------------------------

## 9. Resume Improvement Strategy

Create:
### High Impact Fixes
(biggest improvements immediately)

### Medium Impact Fixes
(improve recruiter confidence)

### Long-Term Improvements
(make profile competitive for top companies)

Focus on:
- ATS optimization
- recruiter psychology
- technical credibility
- portfolio strength
- interview conversion

--------------------------------------------------

## 10. Rewrite Weak Resume Bullets

Rewrite weak bullet points using:
- strong action verbs
- concise wording
- measurable impact
- ATS-friendly language
- recruiter-focused phrasing
- technical clarity

Make bullets sound:
- professional
- realistic
- achievement-oriented
- industry-standard

--------------------------------------------------

## 11. Final Verdict

Give:
- honest hiring potential
- startup readiness
- MNC readiness
- AI/ML career potential
- shortlist probability
- interview potential
- biggest competitive advantage
- biggest weakness

End with:
- a recruiter-style final conclusion
- and the SINGLE highest-impact improvement recommendation.

==================================================

IMPORTANT RULES

- Think like a real recruiter and hiring manager
- Prioritize insight over length
- Be analytical, not generic
- Avoid repeating advice
- Use realistic hiring logic
- Sound human and professional
- Keep formatting clean and structured
- Avoid unnecessary long paragraphs

The output should feel like:
- premium recruiter consultation
- enterprise-grade ATS analysis
- AI hiring manager feedback
- top-tier career strategy session

Return the response in BEAUTIFUL MARKDOWN FORMAT.

DO NOT RETURN JSON.

Resume Content:
{resume_text}
"""

    response = ask_ai(prompt)

    return {
        "analysis": response
    }


# ===============================
# REAL RESUME IMPROVEMENT AI
# ===============================
def improve_resume_ai(resume_text):

    prompt = f"""
You are an elite AI Resume Writer, ATS Optimization Expert, and Senior Technical Recruiter.

Rewrite and improve the candidate’s resume professionally while keeping it realistic, concise, ATS-friendly, and recruiter-focused.

Improve:
- grammar
- clarity
- formatting
- ATS optimization
- keyword relevance
- technical presentation
- project descriptions
- bullet point quality
- recruiter readability

Focus on:
- strong action verbs
- measurable impact where possible
- concise professional wording
- modern industry standards
- technical credibility
- clean structure

Avoid:
- robotic wording
- generic corporate buzzwords
- unrealistic claims
- overly long bullet points
- repetitive phrasing
- fake metrics

Maintain:
- original meaning
- realistic experience level
- accurate technical representation

Optimize the resume for:
- AI/ML roles
- Software Engineering roles
- Data Analyst roles
- ATS parsing systems
- recruiter shortlisting

Return the FULL improved resume in BEAUTIFUL MARKDOWN FORMAT.

DO NOT RETURN JSON.

Resume:
{resume_text}
"""

    response = ask_ai(prompt)

    return {
        "improved_resume": response
    }

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