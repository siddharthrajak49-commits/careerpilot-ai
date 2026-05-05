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
  ResponsiveContainer
} from "recharts";

import { ThreeDots } from "react-loader-spinner";

import Navbar from "./Navbar";
import "./App.css";

function Dashboard() {

  /* ========================= STATE ========================= */

  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [history, setHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [animatedATS, setAnimatedATS] = useState(0);
  const [animatedSalary, setAnimatedSalary] = useState(0);

  const [totalReports, setTotalReports] = useState(0);
  const [avgATS, setAvgATS] = useState(0);

  const [backendReports, setBackendReports] = useState([]);

  const [premiumPlan, setPremiumPlan] = useState("Free");
  const [joinedDate, setJoinedDate] = useState("");

  /* ========================= USER ========================= */

  const token = localStorage.getItem("token") || "";

  const userName = localStorage.getItem("user") || "User";
  const userPhoto =
    localStorage.getItem("photo") ||
    localStorage.getItem("avatar") ||
    "";

  /* ========================= COLORS ========================= */

  const chartColors = ["#7cd67f", "#8fdcff"];

  /* ========================= SAFE HELPERS ========================= */

  const safeParse = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  };

  /* ========================= PDF DOWNLOAD (FIX ADDED) ========================= */

  const downloadPDF = () => {
    const input = document.getElementById("report");
    if (!input) return;

    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");

      const width = 190;
      const height = (canvas.height * width) / canvas.width;

      pdf.addImage(imgData, "PNG", 10, 10, width, height);
      pdf.save("CareerPilot_Report.pdf");
    });
  };

  /* ========================= API CALLS ========================= */

  const fetchUser = async () => {
    try {
      const res = await api("/me", "GET", null, token);

      if (!res) return;

      localStorage.setItem("user", res.name || "User");
      localStorage.setItem("email", res.email || "");
      localStorage.setItem("avatar", res.photo || "");
      localStorage.setItem("plan", res.plan || "Free");

      setPremiumPlan(res.plan || "Free");

    } catch (err) {
      console.log("User fetch failed", err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api("/dashboard/stats", "GET", null, token);
      setTotalReports(res?.reports || history.length);
    } catch {
      setTotalReports(history.length);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api("/notifications", "GET", null, token);

      if (res?.notifications) {
        setNotifications(res.notifications);
      } else {
        throw new Error();
      }

    } catch {
      setNotifications(safeParse("careerpilot_notify"));
    }
  };

  const fetchBackendReports = async () => {
    try {
      const res = await api("/my-reports", "GET", null, token);
      setBackendReports(res?.reports || []);
    } catch {
      setBackendReports([]);
    }
  };

  /* ========================= INIT LOAD ========================= */

  useEffect(() => {

    const loadAll = async () => {
      try {
        await Promise.all([
          fetchUser(),
          fetchStats(),
          fetchNotifications(),
          fetchBackendReports()
        ]);
      } catch (err) {
        console.log("Dashboard load error", err);
      }
    };

    loadAll();

  }, []);

  /* ========================= LOCAL DATA ========================= */

  useEffect(() => {

    const savedHistory = safeParse("careerpilot_history");

    setHistory(savedHistory);

    updateAvgATS(savedHistory);

    setJoinedDate(
      localStorage.getItem("joinedDate") ||
      new Date().toLocaleDateString()
    );

  }, []);

  /* ========================= AVG ATS ========================= */

  const updateAvgATS = (data) => {

    const avg =
      data.length > 0
        ? Math.round(
            data.reduce((sum, item) => sum + Number(item.ats || 0), 0) /
            data.length
          )
        : 0;

    setAvgATS(avg);

  };

  /* ========================= NOTIFICATIONS ========================= */

  const addNotification = (text) => {

    const updated = [
      {
        text,
        time: new Date().toLocaleTimeString()
      },
      ...notifications
    ].slice(0, 10);

    setNotifications(updated);

    localStorage.setItem(
      "careerpilot_notify",
      JSON.stringify(updated)
    );
  };

  /* ========================= SAVE HISTORY ========================= */

  const saveToHistory = (data) => {

    const item = {
      date: new Date().toLocaleDateString(),
      ats: data.ats_score,
      role: data.recommended_role,
      salary: data.predicted_salary_lpa
    };

    const updated = [item, ...history].slice(0, 8);

    setHistory(updated);

    localStorage.setItem(
      "careerpilot_history",
      JSON.stringify(updated)
    );

    updateAvgATS(updated);
    fetchStats();
  };

  /* ========================= FILE ========================= */

  const handleFileChange = (e) => {

    const selected = e.target.files[0];
    if (!selected) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (!allowedTypes.includes(selected.type)) {
      Swal.fire({
        icon: "error",
        title: "Invalid File",
        text: "Only PDF/DOC/DOCX allowed"
      });
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "File Too Large",
        text: "Max 5MB allowed"
      });
      return;
    }

    setFile(selected);
  };

  /* ========================= ATS ANIMATION ========================= */

  useEffect(() => {

    if (!result) return;

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

    }, 25);

    setTimeout(() => clearInterval(timer), 2200);

    return () => clearInterval(timer);

  }, [result]);
    /* ========================= ANALYZE RESUME ========================= */

  const uploadResume = async () => {

    if (!file) {
      Swal.fire({
        icon: "warning",
        title: "No File Selected",
        text: "Please upload resume first."
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

      if (data.ats_score < 50) {
        addNotification("🚨 Very Low ATS score detected");
      } else if (data.ats_score < 70) {
        addNotification("⚠️ Improve your ATS score");
      } else {
        addNotification("✅ Strong ATS score generated");
      }

      Swal.fire({
        icon: "success",
        title: "Analysis Complete 🚀",
        text: "Your AI report is ready",
        timer: 1600,
        showConfirmButton: false
      });

    } catch (err) {

      Swal.fire({
        icon: "error",
        title: "Analysis Failed",
        text: err.message || "Try again later"
      });

    } finally {
      setLoading(false);
    }
  };

  /* ========================= IMPROVE RESUME ========================= */

  const improveResume = async () => {

    if (!file) {
      Swal.fire({
        icon: "warning",
        title: "Upload Resume First"
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

      Swal.fire({
        icon: "success",
        title: "AI Resume Improved",
        html: `
          <div style="text-align:left">
            <pre style="white-space:pre-wrap;font-family:inherit">
${res.result}
            </pre>
          </div>
        `,
        width: 700
      });

      addNotification("✨ Resume improved using AI");

    } catch (err) {

      Swal.fire({
        icon: "error",
        title: "Improve Failed",
        text: err.message || "Try again"
      });

    } finally {
      setLoading(false);
    }
  };

  /* ========================= EXPORT CSV ========================= */

  const exportCSV = () => {

    if (!result) return;

    const rows = [
      ["Role", result.recommended_role],
      ["ATS Score", result.ats_score],
      ["Salary", result.predicted_salary_lpa],
      ["Skills", result.skills_found?.length || 0]
    ];

    const csv = rows.map(r => r.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "CareerPilot_Report.csv";
    a.click();
  };

  /* ========================= SHARE ========================= */

  const shareReport = async () => {

    if (!result) return;

    const text =
      `My ATS Score is ${result.ats_score}/100 on CareerPilot 🚀`;

    try {

      if (navigator.share) {

        await navigator.share({
          title: "CareerPilot Report",
          text
        });

      } else {

        await navigator.clipboard.writeText(text);

        Swal.fire({
          icon: "success",
          title: "Copied",
          text: "Share text copied."
        });

      }

    } catch {
      console.log("Share failed");
    }
  };

  /* ========================= PREVIOUS ATS ========================= */

  const getLastATS = () => {
    if (history.length < 2) return null;
    return history[1]?.ats || null;
  };

  const previousATS = getLastATS();

  /* ========================= GREETING ========================= */

  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Good Morning"
      : hour < 18
      ? "Good Afternoon"
      : "Good Evening";

  /* ========================= UI START ========================= */

  return (
    <div className="mainAppTheme">

      {loading && (
        <div className="loaderOverlay">
          <div className="loaderBox">

            <ThreeDots
              height="70"
              width="70"
              color="#69c96d"
            />

            <h2>Analyzing Resume...</h2>

            <p>
              Scanning Skills • Matching Role • Building Report
            </p>

          </div>
        </div>
      )}

      <div className="container dashboardWrap">

        <div style={{ width: "100%", maxWidth: "1180px" }}>

          <Navbar />

          {/* HERO */}

          <div className="result heroBanner">

            <div className="heroLeft">

              <span className="heroTag">
                🚀 {greeting}
              </span>

              <h2 className="heroTitle">
                Hi {userName} 👋
              </h2>

              <p className="heroText">
                Ready to analyze your resume and unlock better career opportunities today?
              </p>

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
                      marginBottom: "8px"
                    }}
                  />
                ) : (
                  <span style={{ fontSize: "30px" }}>⭐</span>
                )}

                <h3>{premiumPlan}</h3>
                <p>Career Growth AI</p>

              </div>

            </div>

          </div>

          {/* MAIN CARD */}

          <div className="card">

            <h1>🚀 CareerPilot Dashboard</h1>

            <p className="subtitle">
              Upload your resume and get AI-powered insights.
            </p>

            {/* STATS */}

            <div className="statsGrid">

              <div className="statCard">
                <span>📄</span>
                <h3>{totalReports}</h3>
                <p>Total Reports</p>
              </div>

              <div className="statCard">
                <span>🎯</span>
                <h3>{avgATS}</h3>
                <p>Avg ATS</p>
              </div>

              <div className="statCard">
                <span>📅</span>
                <h3>{joinedDate}</h3>
                <p>Joined</p>
              </div>

              <div className="statCard">
                <span>⭐</span>
                <h3>{premiumPlan}</h3>
                <p>Membership</p>
              </div>

            </div>

            {/* UPLOAD */}

            <div className="uploadBox">

              <div className="uploadIcon">📄</div>

              <h3 className="uploadTitle">
                Upload Your Resume
              </h3>

              <p className="uploadText">
                PDF / DOC / DOCX supported (Max 5MB)
              </p>

              <input type="file" onChange={handleFileChange} />

              {file && (
                <p className="fileName">
                  Selected: {file.name}
                </p>
              )}

              <button onClick={uploadResume}>
                Analyze Resume
              </button>

            </div>

            {/* PREVIEW */}

            {file && (

              <div className="result">

                <h2>📎 Resume Preview</h2>

                <p><b>Name:</b> {file.name}</p>
                <p><b>Size:</b> {(file.size / 1024).toFixed(1)} KB</p>
                <p><b>Type:</b> {file.type}</p>

              </div>

            )}

            {/* EMPTY */}

            {!result && (

              <div className="emptyState">

                <div className="emptyIcon">🚀</div>

                <h2>Ready to Analyze?</h2>

                <p>
                  Upload resume and get ATS score, skills gap, salary prediction and AI insights.
                </p>

              </div>

            )}

            {/* RESULT */}

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
                    <h3>{result.skills_found?.length}</h3>
                    <p>Skills Found</p>
                  </div>

                </div>

                {previousATS && (

                  <div className="result">

                    <h2>📈 ATS Comparison</h2>

                    <p>Previous: {previousATS}</p>
                    <p>Current: {result.ats_score}</p>
                    <p>
                      Difference: {result.ats_score - previousATS}
                    </p>

                  </div>

                )}

                <div className="result" id="report">

                  <h2>📌 Detailed Report</h2>

                  <h3>Missing Skills</h3>
                  <ul>
                    {result.missing_skills?.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>

                  <div className="btnRow">

                    <button onClick={downloadPDF}>
                      Download PDF
                    </button>

                    <button onClick={exportCSV}>
                      Export CSV
                    </button>

                    <button onClick={shareReport}>
                      Share Report
                    </button>

                    <button onClick={improveResume}>
                      Improve Resume
                    </button>

                  </div>

                </div>

                {/* ✅ FIXED — ALL BELOW INSIDE RESULT */}

                <div className="chartsGrid">

                  <div className="result">

                    <h2>📊 ATS Overview</h2>

                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={[
                            {
                              name: "ATS",
                              value: result?.ats_score || 0
                            },
                            {
                              name: "Remaining",
                              value: 100 - (result?.ats_score || 0)
                            }
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

                    <h2>📈 ATS Growth Trend</h2>

                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="ats"
                          stroke="#7cd67f"
                          strokeWidth={3}
                        />
                      </LineChart>
                    </ResponsiveContainer>

                  </div>

                </div>

                <div className="result">

                  <h2>🔔 Notifications</h2>

                  {notifications.length === 0 ? (
                    <p>No alerts yet.</p>
                  ) : (
                    <ul>
                      {notifications.map((item, index) => (
                        <li key={index}>
                          {item.text || item.message} -{" "}
                          {item.time || item.created_at || "Now"}
                        </li>
                      ))}
                    </ul>
                  )}

                </div>

                <div className="result">

                  <h2>🕒 Previous Reports</h2>

                  {history.length === 0 ? (
                    <p>No reports found.</p>
                  ) : (
                    <ul>
                      {history.map((item, index) => (
                        <li key={index}>
                          {item.date} | {item.role} | ATS {item.ats}
                        </li>
                      ))}
                    </ul>
                  )}

                </div>

                <div className="result">

                  <h2>☁️ Backend Reports</h2>

                  {backendReports.length === 0 ? (
                    <p>No backend reports yet.</p>
                  ) : (
                    <ul>
                      {backendReports.map((item, index) => (
                        <li key={index}>
                          {item.role} | ₹{item.salary} LPA | ATS {item.ats}
                        </li>
                      ))}
                    </ul>
                  )}

                </div>

              </>
            )}

            {/* FOOTER */}

            <p
              style={{
                textAlign: "center",
                marginTop: "18px",
                color: "#94a398",
                fontSize: "13px"
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