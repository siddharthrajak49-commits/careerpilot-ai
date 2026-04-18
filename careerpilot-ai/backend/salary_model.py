import pandas as pd
from sklearn.linear_model import LinearRegression

# Sample training data
data = {
    "skills_count": [1, 2, 3, 4, 5, 6, 7, 8],
    "salary": [2.5, 3.2, 4.0, 5.1, 6.0, 7.2, 8.6, 10.0]
}

df = pd.DataFrame(data)

X = df[["skills_count"]]
y = df["salary"]

model = LinearRegression()
model.fit(X, y)

def predict_salary(skills):
    count = len(skills)
    prediction = model.predict([[count]])
    return round(prediction[0], 2)