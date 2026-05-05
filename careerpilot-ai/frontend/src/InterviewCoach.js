// src/InterviewCoach.js

import React, {
  useState,
  useEffect
} from "react";

import Swal from "sweetalert2";

import {
  useNavigate
} from "react-router-dom";

import Navbar from "./Navbar";
import "./App.css";

function InterviewCoach() {

  const navigate =
    useNavigate();

  /* =========================
     STATE
  ========================= */

  const [role, setRole] =
    useState("Frontend Developer");

  const [level, setLevel] =
    useState("Beginner");

  const [current, setCurrent] =
    useState(0);

  const [answered, setAnswered] =
    useState(0);

  const [completed, setCompleted] =
    useState(false);

  const [questions, setQuestions] =
    useState([]);

  /* NEW STATES */

  const [answers, setAnswers] =
    useState([]);

  const [currentAnswer, setCurrentAnswer] =
    useState("");

  const [scores, setScores] =
    useState([]);

  const [timer, setTimer] =
    useState(60);

  /* =========================
     QUESTION BANK
  ========================= */

  const bank = {
    "Frontend Developer": [
      "What is React and why use it?",
      "Difference between state and props?",
      "What is Virtual DOM?",
      "Explain useEffect hook.",
      "How does CSS Flexbox work?"
    ],
    "Backend Developer": [
      "What is REST API?",
      "Difference between SQL and NoSQL?",
      "Explain JWT authentication.",
      "What is middleware?",
      "What is Node.js event loop?"
    ],
    "Data Analyst": [
      "What is data cleaning?",
      "Difference between mean and median?",
      "What is SQL JOIN?",
      "Explain Power BI usage.",
      "What is Excel VLOOKUP?"
    ],
    "HR Interview": [
      "Tell me about yourself.",
      "Why should we hire you?",
      "What are your strengths?",
      "Where do you see yourself in 5 years?",
      "Why do you want this job?"
    ]
  };

  /* =========================
     START SESSION
  ========================= */

  const startSession = () => {

    const selected =
      bank[role] || [];

    setQuestions(selected);

    setCurrent(0);
    setAnswered(0);
    setCompleted(false);

    setAnswers([]);
    setScores([]);
    setCurrentAnswer("");
    setTimer(60);

    Swal.fire({
      icon: "success",
      title: "Interview Started",
      text: `${role} - ${level}`
    });

  };

  /* =========================
     TIMER
  ========================= */

  useEffect(() => {

    if (questions.length === 0 || completed)
      return;

    const interval =
      setInterval(() => {

        setTimer((prev) => {

          if (prev <= 1) {
            handleNext();
            return 60;
          }

          return prev - 1;

        });

      }, 1000);

    return () =>
      clearInterval(interval);

  }, [current, questions, completed]);

  /* =========================
     NEXT QUESTION (UPGRADED)
  ========================= */

  const handleNext = () => {

    if (!currentAnswer.trim()) {

      Swal.fire({
        icon: "warning",
        title: "Answer Required"
      });

      return;

    }

    /* SIMPLE SCORING */

    const score =
      currentAnswer.length > 80 ? 20 :
      currentAnswer.length > 40 ? 15 :
      currentAnswer.length > 20 ? 10 : 5;

    const updatedAnswers =
      [...answers, currentAnswer];

    const updatedScores =
      [...scores, score];

    setAnswers(updatedAnswers);
    setScores(updatedScores);

    setCurrentAnswer("");

    const next = current + 1;

    if (next < questions.length) {

      setCurrent(next);
      setAnswered(answered + 1);
      setTimer(60);

    } else {

      setAnswered(answered + 1);
      setCompleted(true);

    }

  };

  /* =========================
     RESTART
  ========================= */

  const restart = () => {

    setQuestions([]);
    setCurrent(0);
    setAnswered(0);
    setCompleted(false);

    setAnswers([]);
    setScores([]);
    setCurrentAnswer("");
    setTimer(60);

  };

  /* =========================
     SCORE
  ========================= */

  const totalScore =
    scores.reduce((a, b) => a + b, 0);

  const finalScore =
    questions.length > 0
      ? Math.round(
          (totalScore /
            (questions.length * 20)) *
            100
        )
      : 0;

  const getFeedback = () => {

    if (finalScore > 80)
      return "Excellent performance 🚀";

    if (finalScore > 60)
      return "Good but needs improvement";

    return "Practice more for better results";

  };

  /* =========================
     SAVE SESSION
  ========================= */

  useEffect(() => {

    if (!completed) return;

    const data = {
      role,
      level,
      score: finalScore,
      date: new Date().toLocaleDateString()
    };

    const prev =
      JSON.parse(
        localStorage.getItem(
          "careerpilot_interviews"
        )
      ) || [];

    const updated =
      [data, ...prev];

    localStorage.setItem(
      "careerpilot_interviews",
      JSON.stringify(updated)
    );

  }, [completed]);

  /* =========================
     UI
  ========================= */

  return (
    <div className="mainAppTheme">

      <div className="container dashboardWrap">

        <div style={{ width: "100%", maxWidth: "1280px" }}>

          <Navbar />

          {/* HERO */}

          <div className="result heroBanner">

            <div className="heroLeft">

              <span className="heroTag">
                🎤 Interview Coach
              </span>

              <h2 className="heroTitle">
                Practice Like Pro
              </h2>

              <p className="heroText">
                Prepare HR and technical interviews
                with smart guided practice.
              </p>

            </div>

            <div className="heroRight">

              <div className="statCard">

                <span>🚀</span>

                <h3>AI Mock Prep</h3>

                <p>Job Ready Skills</p>

              </div>

            </div>

          </div>

          {/* MAIN */}

          <div className="card">

            <h1>🎤 Interview Coach</h1>

            <p className="subtitle">
              Practice role based interview questions.
            </p>

            {/* SETTINGS */}

            {questions.length === 0 && !completed && (

              <div className="result">

                <h2>Start Session</h2>

                <p>Select Role</p>

                <select
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value)
                  }
                >
                  <option>Frontend Developer</option>
                  <option>Backend Developer</option>
                  <option>Data Analyst</option>
                  <option>HR Interview</option>
                </select>

                <p style={{ marginTop: "14px" }}>
                  Difficulty
                </p>

                <select
                  value={level}
                  onChange={(e) =>
                    setLevel(e.target.value)
                  }
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>

                <button onClick={startSession}>
                  Start Interview
                </button>

              </div>
            )}

            {/* QUESTION */}

            {questions.length > 0 && !completed && (

              <div className="result">

                <h2>
                  Question {current + 1} / {questions.length}
                </h2>

                <p><strong>⏱ Time Left: {timer}s</strong></p>

                <p style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  marginTop: "12px"
                }}>
                  {questions[current]}
                </p>

                <textarea
                  value={currentAnswer}
                  onChange={(e) =>
                    setCurrentAnswer(e.target.value)
                  }
                  rows="6"
                  placeholder="Type your answer here..."
                  style={{ marginTop: "18px" }}
                />

                <div className="btnRow">

                  <button onClick={handleNext}>
                    {current === questions.length - 1
                      ? "Finish"
                      : "Next Question"}
                  </button>

                </div>

                <div className="softPanel">
                  <strong>Tip:</strong> Keep answers clear,
                  structured and concise.
                </div>

              </div>
            )}

            {/* COMPLETE */}

            {completed && (

              <div className="result">

                <h2>✅ Session Complete</h2>

                <p>Role: {role}</p>
                <p>Difficulty: {level}</p>
                <p>Questions Done: {answered}</p>

                <p>
                  Final Score: {finalScore}/100
                </p>

                <p>{getFeedback()}</p>

                <div className="statsGrid">

                  <div className="statCard">
                    <span>🎯</span>
                    <h3>{finalScore}</h3>
                    <p>Score</p>
                  </div>

                  <div className="statCard">
                    <span>🔥</span>
                    <h3>{answered}</h3>
                    <p>Answered</p>
                  </div>

                  <div className="statCard">
                    <span>🚀</span>
                    <h3>Ready</h3>
                    <p>Growth</p>
                  </div>

                </div>

                <div className="btnRow">

                  <button onClick={restart}>
                    Practice Again
                  </button>

                  <button onClick={() =>
                    navigate("/dashboard")
                  }>
                    Dashboard
                  </button>

                </div>

              </div>
            )}

            {/* FOOTER */}

            <p style={{
              textAlign: "center",
              marginTop: "18px",
              color: "#94a398",
              fontSize: "13px"
            }}>
              CareerPilot Interview Coach • Practice to Success
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default InterviewCoach;