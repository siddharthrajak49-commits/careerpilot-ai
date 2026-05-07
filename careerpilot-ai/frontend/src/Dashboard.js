// src/Dashboard.js

import React, { useState, useEffect } from "react";

import { api } from "./api";

import Swal from "sweetalert2";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import { ThreeDots } from "react-loader-spinner";

import Navbar from "./Navbar";

import "./App.css";

function Dashboard() {
  /* =========================
     STATE
  ========================= */

  const [file, setFile] = useState(null);

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);

  const [history, setHistory] = useState([]);

  const [animatedATS, setAnimatedATS] = useState(0);

  const [animatedSalary, setAnimatedSalary] = useState(0);

  const [totalReports, setTotalReports] = useState(0);

  const [avgATS, setAvgATS] = useState(0);

  const [premiumPlan, setPremiumPlan] = useState("");

  const [joinedDate, setJoinedDate] = useState("");

  /* =========================
     USER
  ========================= */

  const token = localStorage.getItem("token") || "";

  const userName = localStorage.getItem("user") || "User";

  const userPhoto = localStorage.getItem("avatar") || localStorage.getItem("photo") || "";

  /* =========================
     CHART COLORS
  ========================= */

  const chartColors = ["#7cd67f", "#8fdcff"];

  /* =========================
     SAFE LOCAL STORAGE
  ========================= */

  const safeParse = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  };

  /* =========================
     PDF DOWNLOAD
  ========================= */
const downloadPDF = async () => {
  const input = document.getElementById("report");

  if (!input) {
    Swal.fire({
      icon: "error",
      title: "Report Missing",
    });

    return;
  }

  try {
    Swal.fire({
      title: "Generating PDF...",
      text: "Please wait",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const canvas = await html2canvas(input, {
      scale: 3,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      scrollY: -window.scrollY,
    });

    const imgData = canvas.toDataURL("image/png", 1.0);

    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();

    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth;

    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");

    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;

      pdf.addPage();

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");

      heightLeft -= pdfHeight;
    }

    pdf.save("CareerPilot_Report.pdf");

    Swal.close();
  } catch (err) {
    console.log(err);

    Swal.fire({
      icon: "error",
      title: "PDF Failed",
      text: "Unable to generate PDF",
    });
  }
};
  /* =========================
     FETCH USER
  ========================= */

  const fetchUser = async () => {
    try {
      const res = await api("/me", "GET", null, token);

      if (!res) return;

      localStorage.setItem("user", res.name || "User");

      localStorage.setItem("email", res.email || "");

      localStorage.setItem("avatar", res.photo || "");

      localStorage.setItem("plan", res.plan || "");

      setPremiumPlan(
        res.plan &&
        res.plan !== "Free"
          ? res.plan
          : "CareerPilot AI");
    } catch (err) {
      console.log("Fetch user error", err);
    }
  };

  /* =========================
     FETCH STATS
  ========================= */

  const fetchStats = async () => {
    try {
      const res = await api("/dashboard/stats", "GET", null, token);

      setTotalReports(res?.reports || history.length);
    } catch {
      setTotalReports(history.length);
    }
  };

  /* =========================
     INITIAL LOAD
  ========================= */

  useEffect(() => {
    const loadAll = async () => {
      try {
        await Promise.all([fetchUser(), fetchStats()]);
      } catch (err) {
        console.log("Dashboard load error", err);
      }
    };

    loadAll();
  }, []);

  /* =========================
     LOAD HISTORY
  ========================= */

  useEffect(() => {
    const savedHistory = safeParse("careerpilot_history");

    setHistory(savedHistory);

    updateAvgATS(savedHistory);

    setJoinedDate(localStorage.getItem("joinedDate") || new Date().toLocaleDateString());
  }, []);

  /* =========================
     AVG ATS
  ========================= */

  const updateAvgATS = (data) => {
    const avg =
      data.length > 0
        ? Math.round(data.reduce((sum, item) => sum + Number(item.ats || 0), 0) / data.length)
        : 0;

    setAvgATS(avg);
  };

  /* =========================
     SAVE HISTORY
  ========================= */

  const saveToHistory = (data) => {
    const item = {
      date: new Date().toLocaleDateString(),

      ats: data.ats_score,

      role: data.recommended_role,

      salary: data.predicted_salary_lpa,
    };

    const updated = [item, ...history].slice(0, 8);

    setHistory(updated);

    localStorage.setItem("careerpilot_history", JSON.stringify(updated));

    updateAvgATS(updated);

    fetchStats();
  };

  /* =========================
     FILE CHANGE
  ========================= */

  const handleFileChange = (e) => {
    const selected = e.target.files[0];

    if (!selected) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(selected.type)) {
      Swal.fire({
        icon: "error",
        title: "Invalid File",
        text: "Only PDF/DOC/DOCX allowed",
      });

      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "File Too Large",
        text: "Max 5MB allowed",
      });

      return;
    }

    setFile(selected);
  };

  /* =========================
     ATS ANIMATION
  ========================= */

  useEffect(() => {
    if (!result) return;

    setAnimatedATS(0);
    setAnimatedSalary(0);

    let ats = 0;
    let sal = 0;

    const timer = setInterval(() => {
      ats += 2;
      sal += 1;

      if (ats <= result.ats_score) {
        setAnimatedATS(ats);
      }

      if (sal <= result.predicted_salary_lpa) {
        setAnimatedSalary(sal);
      }

      if (ats >= result.ats_score && sal >= result.predicted_salary_lpa) {
        clearInterval(timer);
      }
    }, 25);

    return () => clearInterval(timer);
  }, [result]);

  /* =========================
     ANALYZE RESUME
  ========================= */

  const uploadResume = async () => {
    if (!file) {
      Swal.fire({
        icon: "warning",
        title: "No File Selected",
        text: "Please upload resume first.",
      });

      return;
    }

    const formData = new FormData();

    formData.append("file", file);

    try {
      setLoading(true);

      const data = await api("/analyze", "POST", formData, token);

      if (!data || data.detail) {
        throw new Error(data?.detail || "Analysis failed");
      }

      setResult(data);

      saveToHistory(data);

      Swal.fire({
        icon: "success",
        title: "Analysis Complete 🚀",
        text: "AI report generated",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Analysis Failed",
        text: err.message || "Try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     IMPROVE RESUME
  ========================= */

const improveResume = async () => {
  if (!file) {
    Swal.fire({
      icon: "warning",
      title: "Upload Resume First",
    });

    return;
  }

  const formData = new FormData();

  formData.append("file", file);

  try {
    setLoading(true);

    const res = await api("/ai/resume-improve", "POST", formData, token);

    if (!res || res.detail) {
      throw new Error(res?.detail || "Failed");
    }

    const data = res.result || {};

    Swal.fire({
      title: "🚀 AI Resume Improvement",

      width: 900,

      html: `

      <div style="
        text-align:left;
        max-height:70vh;
        overflow:auto;
        padding-right:10px;
      ">

        <h2 style="margin-bottom:10px;">
          Professional Summary
        </h2>

        <p style="
          line-height:1.7;
          margin-bottom:20px;
        ">
          ${data.professional_summary || "No summary available"}
        </p>

        <h2>Improved Experience</h2>

        <ul>
          ${
            Array.isArray(data.improved_experience)
              ? data.improved_experience.map((item) => `<li>${item}</li>`).join("")
              : ""
          }
        </ul>

        <h2>Missing Keywords</h2>

        <div style="
          display:flex;
          flex-wrap:wrap;
          gap:10px;
          margin-bottom:18px;
        ">
          ${
            Array.isArray(data.missing_keywords)
              ? data.missing_keywords
                  .map(
                    (item) =>
                      `
                <span style="
                  background:#eef9ef;
                  padding:8px 14px;
                  border-radius:999px;
                  font-weight:700;
                ">
                  ${item}
                </span>
                `,
                  )
                  .join("")
              : ""
          }
        </div>

        <h2>Recommended Projects</h2>

        <ul>
          ${
            Array.isArray(data.recommended_projects)
              ? data.recommended_projects.map((item) => `<li>${item}</li>`).join("")
              : ""
          }
        </ul>

        <h2>Resume Tips</h2>

        <ul>
          ${
            Array.isArray(data.resume_tips)
              ? data.resume_tips.map((item) => `<li>${item}</li>`).join("")
              : ""
          }
        </ul>

        <h2>
          ATS Improvement Potential:
          ${data.ats_improvement_score || 75}%
        </h2>

      </div>
      `,
    });
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Resume Improvement Failed",
      text: err.message || "Try again later",
    });
  } finally {
    setLoading(false);
  }
};
  /* =========================
     EXPORT CSV
  ========================= */

  const exportCSV = () => {
    if (!result) return;

    const rows = [
      ["Role", result.recommended_role],
      ["ATS Score", result.ats_score],
      ["Salary", result.predicted_salary_lpa],
      ["Skills", Array.isArray(result.skills_found) ? result.skills_found.join(" | ") : ""],
    ];

    const csv = rows.map((r) => r.join(",")).join("\n");

    const blob = new Blob([csv], {
      type: "text/csv",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "CareerPilot_Report.csv";

    a.click();
  };

  /* =========================
     PREVIOUS ATS
  ========================= */

  const getLastATS = () => {
    if (history.length < 2) return null;

    return history[1]?.ats || null;
  };

  const previousATS = getLastATS();

  /* =========================
     GREETING
  ========================= */

  const hour = new Date().getHours();

  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  /* =========================
     UI
  ========================= */

  return (
    <div className="mainAppTheme">
      {loading && (
        <div className="loaderOverlay">
          <div className="loaderBox">
            <ThreeDots height="70" width="70" color="#69c96d" />

            <h2>Analyzing Resume...</h2>

            <p>AI is building your smart career report</p>
          </div>
        </div>
      )}

      <div className="container dashboardWrap">
        <div
          style={{
            width: "100%",
            maxWidth: "1180px",
          }}
        >
          <Navbar />

          <div className="result heroBanner">
            <div className="heroLeft">
              <span className="heroTag">🚀 {greeting}</span>

              <h2 className="heroTitle">Hi {userName} 👋</h2>

              <p className="heroText">Upload your resume and unlock AI powered career insights.</p>
            </div>

            <div className="heroRight">
              <div className="statCard">
                {userPhoto ? (
                  <img
                    src={userPhoto}
                    alt="user"
                    style={{
                      width: "58px",
                      height: "58px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      marginBottom: "8px",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: "30px",
                    }}
                  >
                    ⭐
                  </span>
                )}

                <h3>{premiumPlan || "CareerPilot AI"}</h3>

                <p>CareerPilot AI</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h1>🚀 CareerPilot Dashboard</h1>

            <p className="subtitle">Smart Resume Analysis System</p>

            <div className="statsGrid">
              <div className="statCard">
                <span>📄</span>
                <h3>{totalReports}</h3>
                <p>Total Reports</p>
              </div>

              <div className="statCard">
                <span>🎯</span>
                <h3>{avgATS}</h3>
                <p>Average ATS</p>
              </div>

              <div className="statCard">
                <span>📅</span>
                <h3>{joinedDate}</h3>
                <p>Joined</p>
              </div>

              <div className="statCard">
                <span>⭐</span>
                <h3>{premiumPlan || "CareerPilot AI"}</h3>
                <p>Membership Status</p>
              </div>
            </div>

            <div className="uploadBox">
              <div className="uploadIcon">📄</div>

              <h3 className="uploadTitle">Upload Your Resume</h3>

              <p className="uploadText">PDF / DOC / DOCX supported</p>

              <input type="file" onChange={handleFileChange} />

              {file && (
                <div className="fileName">
                  <p>Selected: {file.name}</p>

                  <p>Size: {(file.size / 1024).toFixed(1)} KB</p>

                  <p>Last Modified: {new Date(file.lastModified).toLocaleString()}</p>
                </div>
              )}

              <button onClick={uploadResume}>Analyze Resume</button>
            </div>

            {!result && (
              <div className="emptyState">
                <div className="emptyIcon">🚀</div>

                <h2>Upload Resume for AI Career Analysis</h2>

                <p>Get ATS score, skill analysis, salary prediction and AI resume improvements.</p>
              </div>
            )}

            {result && (
              <>
                <div className="statsGrid">
                  <div className="statCard">
                    <span>🎯</span>

                    <h3>{result.recommended_role}</h3>

                    <p>Recommended Role</p>
                  </div>

                  <div className="statCard">
                    <span>📊</span>

                    <h3>{animatedATS}/100</h3>

                    <p>ATS Score</p>
                  </div>

                  <div className="statCard">
                    <span>💰</span>

                    <h3>₹ {animatedSalary} LPA</h3>

                    <p>Expected Salary</p>
                  </div>

                  <div className="statCard">
                    <span>🧠</span>

                    <h3>{Array.isArray(result.skills_found) ? result.skills_found.length : 0}</h3>

                    <p>Skills Found</p>
                  </div>
                </div>

                {previousATS && (
                  <div className="result">
                    <h2>📈 ATS Comparison</h2>

                    <p>Previous: {previousATS}</p>

                    <p>Current: {result.ats_score}</p>

                    <p>Difference: {result.ats_score - previousATS}</p>
                  </div>
                )}

                <div className="result pdfReport" id="report">
                  <h2>📌 Detailed AI Report</h2>

                  <h3>Resume Summary</h3>
                  <div className="softPanel">
                    <p>
                      {typeof result.summary === "string"
                        ? result.summary
                        : "AI summary unavailable"}
                    </p>
                  </div>

                  <p>
                    {typeof result.summary === "string"
                      ? result.summary
                      : "AI summary not available"}
                  </p>
                  <h3>ATS Breakdown</h3>

                  <div className="statsGrid">
                    <div className="statCard">
                      <span>📄</span>

                      <h3>{result.ats_breakdown?.content || 0}</h3>

                      <p>Content</p>
                    </div>

                    <div className="statCard">
                      <span>🧠</span>

                      <h3>{result.ats_breakdown?.skills || 0}</h3>

                      <p>Skills</p>
                    </div>

                    <div className="statCard">
                      <span>🎨</span>

                      <h3>{result.ats_breakdown?.formatting || 0}</h3>

                      <p>Formatting</p>
                    </div>

                    <div className="statCard">
                      <span>🔍</span>

                      <h3>{result.ats_breakdown?.keywords || 0}</h3>

                      <p>Keywords</p>
                    </div>
                  </div>
                  <h3>Missing Skills</h3>

                  <ul>
                    {Array.isArray(result.missing_skills) &&
                      result.missing_skills.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>

                  <h3>Strengths</h3>

                  <ul>
                    {Array.isArray(result.strengths) &&
                      result.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>

                  <h3>Weaknesses</h3>

                  <ul>
                    {Array.isArray(result.weaknesses) &&
                      result.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>

                  <h3>Recommended Skills</h3>
                  <div className="skillsWrap">
                    {Array.isArray(result.recommended_skills) &&
                      result.recommended_skills.map((skill, i) => (
                        <span key={i} className="skillTag">
                          {skill}
                        </span>
                      ))}
                  </div>

                  <ul>
                    {Array.isArray(result.recommended_skills) &&
                      result.recommended_skills.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>

                  <h3>Detected Skills</h3>

                  <div className="skillsWrap">
                    {Array.isArray(result.skills_found) &&
                      result.skills_found.map((skill, i) => (
                        <span key={i} className="skillTag">
                          {skill}
                        </span>
                      ))}
                  </div>
                  <h3>AI Career Tips</h3>

                  <ul>
                    {Array.isArray(result.tips) &&
                      result.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                  </ul>

                  <h3>Interview Questions</h3>

                  <ul>
                    {Array.isArray(result.interview_questions) &&
                      result.interview_questions.map((q, i) => <li key={i}>{q}</li>)}
                  </ul>

                  <div className="btnRow">
                    <button onClick={downloadPDF}>Download PDF</button>

                    <button onClick={exportCSV}>Export CSV</button>

                    <button onClick={improveResume}>Improve Resume</button>
                  </div>
                </div>

                <div className="chartsGrid">
                  <div className="result">
                    <h2>📊 ATS Overview</h2>

                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={[
                            {
                              name: "ATS",
                              value: result?.ats_score || 0,
                            },
                            {
                              name: "Remaining",
                              value: 100 - (result?.ats_score || 0),
                            },
                          ]}
                          dataKey="value"
                          outerRadius={85}
                        >
                          {chartColors.map((color, i) => (
                            <Cell key={i} fill={color} />
                          ))}
                        </Pie>

                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="result">
                    <h2>📈 ATS Growth</h2>

                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis dataKey="date" />

                        <YAxis />

                        <Tooltip />

                        <Line type="monotone" dataKey="ats" stroke="#7cd67f" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}

            <p
              style={{
                textAlign: "center",
                marginTop: "18px",
                color: "#94a398",
                fontSize: "13px",
              }}
            >
              CareerPilot AI • Smart Resume Growth Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
