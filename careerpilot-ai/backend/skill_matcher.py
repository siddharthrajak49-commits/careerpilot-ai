def detect_skills(text):

    skills_db = [
        "python",
        "sql",
        "excel",
        "power bi",
        "machine learning",
        "react",
        "java",
        "c++"
    ]

    found = []

    for skill in skills_db:
        if skill in text:
            found.append(skill)

    return found