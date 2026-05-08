// src/Dashboard.js

import React, { useState, useEffect } from "react";

import { api } from "./api";
import ReactMarkdown from "react-markdown";

import Swal from "sweetalert2";
import { TypeAnimation } from "react-type-animation";
import remarkGfm from "remark-gfm";
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
  const [improvedResume, setImprovedResume] = useState("");

  const [loading, setLoading] = useState(false);
  const [reportHistory, setReportHistory] = useState([]);
  const [avgATS, setAvgATS] = useState(0);

  const [totalReports, setTotalReports] = useState(0);

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
    const input = document.getElementById("improvedResume");

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

      setPremiumPlan(res.plan && res.plan !== "Free" ? res.plan : "CareerPilot AI");
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

      setTotalReports(res?.reports || reportHistory.length);
    } catch {
      setTotalReports(reportHistory.length);
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

    const updated = [item, ...reportHistory].slice(0, 8);

    setReportHistory(updated);

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

      setImprovedResume(res.improved_resume);

      Swal.fire({
        icon: "success",
        title: "Resume Improved 🚀",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

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
              <div className="badge pulse">Enterprise AI Resume Engine</div>
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

                <p>
                  Get premium AI recruiter feedback, ATS analysis, career insights, and AI-powered
                  resume improvement.
                </p>
              </div>
            )}

            {result?.analysis && (
              <div className="result aiResponseBox">
                <div className="aiHeader">
                  <TypeAnimation
                    sequence={[
                      "🤖 CareerPilot AI Analysis",
                      1000,
                      "🚀 Recruiter-Level AI Analysis",
                      1000,
                      "🧠 ATS + Hiring Manager Review",
                      1000,
                    ]}
                    wrapper="span"
                    speed={40}
                    repeat={Infinity}
                  />
                </div>

                <ReactMarkdown remarkPlugins={[remarkGfm]}>{result?.analysis || ""}</ReactMarkdown>

                <div className="btnRow">
                  <button onClick={improveResume}>Improve Resume</button>
                </div>
              </div>
            )}

            {improvedResume && (
              <div className="result aiResponseBox" id="improvedResume">
                <div className="aiHeader">✨ AI Improved Resume</div>

                <ReactMarkdown remarkPlugins={[remarkGfm]}>{improvedResume || ""}</ReactMarkdown>

                <div className="btnRow">
                  <button onClick={downloadPDF}>Download PDF</button>
                </div>
              </div>
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
