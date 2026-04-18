def recommend_role(skills):

    if "machine learning" in skills and "python" in skills:
        return "AI / ML Engineer"

    elif "sql" in skills and "excel" in skills:
        return "Data Analyst"

    elif "react" in skills:
        return "Frontend Developer"

    return "Software Engineer"