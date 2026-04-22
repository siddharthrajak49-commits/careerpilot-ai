// src/Dashboard.js


import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
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

    /* ================= STATE ================= */

    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const [history, setHistory] = useState([]);

    const [notifications, setNotifications] =
        useState([]);

    const [animatedATS, setAnimatedATS] =
        useState(0);

    const [animatedSalary, setAnimatedSalary] =
        useState(0);

    /* ================= USER ================= */

    const userName =
        localStorage.getItem("user") ||
        "User";

    /* ================= COLORS ================= */

    const chartColors = [
        "#7cd67f",
        "#8fdcff"
    ];

    /* ================= LOAD HISTORY ================= */

    useEffect(() => {

        const savedHistory =
            JSON.parse(
                localStorage.getItem(
                    "careerpilot_history"
                )
            ) || [];

        const savedNotify =
            JSON.parse(
                localStorage.getItem(
                    "careerpilot_notify"
                )
            ) || [];

        setHistory(savedHistory);
        setNotifications(savedNotify);

    }, []);

    /* ================= ANIMATE ================= */

    useEffect(() => {

        if (!result) return;

        let ats = 0;
        let sal = 0;

        const timer =
            setInterval(() => {

                ats += 2;
                sal += 1;

                if (
                    ats <= result.ats_score
                ) {
                    setAnimatedATS(ats);
                }

                if (
                    sal <=
                    result.predicted_salary_lpa
                ) {
                    setAnimatedSalary(sal);
                }

            }, 25);

        setTimeout(() => {
            clearInterval(timer);
        }, 2000);

        return () =>
            clearInterval(timer);

    }, [result]);

    /* ================= FILE ================= */

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    /* ================= SAVE HISTORY ================= */

    const saveToHistory = (data) => {

        const item = {
            date:
                new Date().toLocaleDateString(),
            ats: data.ats_score,
            role:
                data.recommended_role,
            salary:
                data.predicted_salary_lpa
        };

        const updated = [
            item,
            ...history
        ].slice(0, 5);

        setHistory(updated);

        localStorage.setItem(
            "careerpilot_history",
            JSON.stringify(updated)
        );
    };

    /* ================= NOTIFY ================= */

    const addNotification = (
        text
    ) => {

        const updated = [
            {
                text,
                time:
                    new Date().toLocaleTimeString()
            },
            ...notifications
        ].slice(0, 6);

        setNotifications(updated);

        localStorage.setItem(
            "careerpilot_notify",
            JSON.stringify(updated)
        );
    };

    /* ================= ANALYZE ================= */

    const uploadResume = async () => {

        if (!file) {
            Swal.fire({
                icon: "warning",
                title:
                    "No File Selected",
                text:
                    "Please upload resume first."
            });
            return;
        }

        const formData =
            new FormData();

        formData.append(
            "file",
            file
        );

        try {

            setLoading(true);

            const response =
                await axios.post(
                    "https://careerpilot-backend-rvv1.onrender.com/analyze",
                    formData
                );

            const data =
                response.data;

            setResult(data);

            saveToHistory(data);

            addNotification(
                "Resume analyzed successfully"
            );

            if (
                data.ats_score < 60
            ) {
                addNotification(
                    "Low ATS score detected"
                );
            }

            Swal.fire({
                icon: "success",
                title:
                    "Analysis Complete",
                text:
                    "Your AI report is ready.",
                timer: 1500,
                showConfirmButton: false
            });

        } catch {

            Swal.fire({
                icon: "error",
                title:
                    "Analysis Failed",
                text:
                    "Please try later."
            });

        } finally {

            setLoading(false);

        }
    };


    /* ================= PDF ================= */

    const downloadPDF = () => {

        const input =
            document.getElementById(
                "report"
            );

        html2canvas(input).then(
            (canvas) => {

                const imgData =
                    canvas.toDataURL(
                        "image/png"
                    );

                const pdf =
                    new jsPDF(
                        "p",
                        "mm",
                        "a4"
                    );

                const width = 190;

                const height =
                    (canvas.height *
                        width) /
                    canvas.width;

                pdf.addImage(
                    imgData,
                    "PNG",
                    10,
                    10,
                    width,
                    height
                );

                pdf.save(
                    "CareerPilot_Report.pdf"
                );
            }
        );
    };

    /* ================= CSV ================= */

    const exportCSV = () => {

        if (!result) return;

        const rows = [
            ["Role", result.recommended_role],
            ["ATS", result.ats_score],
            ["Salary", result.predicted_salary_lpa],
            ["Skills", result.skills_found.length]
        ];

        const csv =
            rows
                .map((row) =>
                    row.join(",")
                )
                .join("\n");

        const blob =
            new Blob([csv], {
                type: "text/csv"
            });

        const url =
            URL.createObjectURL(blob);

        const a =
            document.createElement("a");

        a.href = url;
        a.download =
            "CareerPilot_Report.csv";
        a.click();
    };

    /* ================= SHARE ================= */

    const shareReport = async () => {

        if (!result) return;

        const text =
            `My ATS Score is ${result.ats_score} on CareerPilot 🚀`;

        if (navigator.share) {

            await navigator.share({
                title:
                    "CareerPilot Report",
                text
            });

        } else {

            navigator.clipboard.writeText(
                text
            );

            Swal.fire({
                icon: "success",
                title:
                    "Copied",
                text:
                    "Share text copied."
            });
        }
    };

    /* ================= IMPROVE RESUME ================= */

    const improveResume = () => {

        Swal.fire({
            icon: "success",
            title:
                "AI Resume Rewrite Ready",
            html:
                `
        <div style="text-align:left">
        <p>• Added action verbs</p>
        <p>• Improved bullet points</p>
        <p>• ATS keywords inserted</p>
        <p>• Stronger summary generated</p>
        </div>
        `
        });
    };

    /* ================= COMPARE ATS ================= */

    const getLastATS = () => {

        if (
            history.length < 2
        ) return null;

        return (
            history[1].ats
        );
    };

    const previousATS =
        getLastATS();

    /* ================= UI START ================= */

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

                        <h2>
                            Analyzing Resume...
                        </h2>

                        <p>
                            Scanning Skills •
                            Matching Role •
                            Building Report
                        </p>

                    </div>

                </div>
            )}

            <div className="container dashboardWrap">

                <div
                    style={{
                        width: "100%",
                        maxWidth: "1180px"
                    }}
                >

                    <Navbar />

                    {/* HERO */}

                    <div className="result heroBanner">

                        <div className="heroLeft">

                            <span className="heroTag">
                                🚀 Welcome Back
                            </span>

                            <h2 className="heroTitle">
                                Hi {userName} 👋
                            </h2>

                            <p className="heroText">
                                Ready to analyze your
                                resume and unlock better
                                opportunities?
                            </p>

                        </div>

                        <div className="heroRight">

                            <div className="statCard">

                                <span>⭐</span>

                                <h3>
                                    Premium Member
                                </h3>

                                <p>
                                    Career Growth AI
                                </p>

                            </div>

                        </div>

                    </div>



                    <div className="card">

                        <h1>
                            🚀 CareerPilot Dashboard
                        </h1>

                        <p className="subtitle">
                            Upload your resume and get
                            AI-powered career insights.
                        </p>

                        {/* Upload */}

                        <div className="uploadBox">

                            <div className="uploadIcon">
                                📄
                            </div>

                            <h3 className="uploadTitle">
                                Upload Your Resume
                            </h3>

                            <p className="uploadText">
                                PDF / DOC / DOCX supported
                            </p>

                            <input
                                type="file"
                                onChange={
                                    handleFileChange
                                }
                            />

                            {file && (
                                <p className="fileName">
                                    Selected: {file.name}
                                </p>
                            )}

                            <button
                                onClick={
                                    uploadResume
                                }
                            >
                                Analyze Resume
                            </button>

                        </div>

                        {/* Resume Preview */}

                        {file && (
                            <div className="result">

                                <h2>
                                    📎 Resume Preview
                                </h2>

                                <p>
                                    File Name:
                                    {" "}
                                    {file.name}
                                </p>

                                <p>
                                    Size:
                                    {" "}
                                    {(
                                        file.size / 1024
                                    ).toFixed(1)}
                                    {" "}KB
                                </p>

                                <p>
                                    Type:
                                    {" "}
                                    {file.type}
                                </p>

                            </div>
                        )}

                        {!result && (
                            <div className="emptyState">

                                <div className="emptyIcon">
                                    🚀
                                </div>

                                <h2>
                                    Ready to Analyze?
                                </h2>

                                <p>
                                    Upload resume and get
                                    ATS score, skills gap,
                                    salary prediction and tips.
                                </p>

                            </div>
                        )}

                        {result && (
                            <>

                                {/* Stats */}

                                <div className="statsGrid">

                                    <div className="statCard">
                                        <span>🎯</span>
                                        <h3>
                                            {
                                                result.recommended_role
                                            }
                                        </h3>
                                        <p>Role</p>
                                    </div>

                                    <div className="statCard">
                                        <span>📄</span>
                                        <h3>
                                            {
                                                animatedATS
                                            }/100
                                        </h3>
                                        <p>ATS</p>
                                    </div>

                                    <div className="statCard">
                                        <span>💰</span>
                                        <h3>
                                            ₹
                                            {
                                                animatedSalary
                                            }{" "}
                                            LPA
                                        </h3>
                                        <p>Salary</p>
                                    </div>

                                    <div className="statCard">
                                        <span>🧠</span>
                                        <h3>
                                            {
                                                result.skills_found
                                                    .length
                                            }
                                        </h3>
                                        <p>Skills</p>
                                    </div>

                                </div>

                                {/* ATS Compare */}

                                {previousATS && (
                                    <div className="result">

                                        <h2>
                                            📈 ATS Comparison
                                        </h2>

                                        <p>
                                            Previous ATS:
                                            {" "}
                                            {previousATS}
                                        </p>

                                        <p>
                                            Current ATS:
                                            {" "}
                                            {
                                                result.ats_score
                                            }
                                        </p>

                                        <p>
                                            Difference:
                                            {" "}
                                            {
                                                result.ats_score -
                                                previousATS
                                            }
                                        </p>

                                    </div>
                                )}

                                {/* Suggestions */}

                                <div className="result">

                                    <h2>
                                        🤖 AI Suggestions
                                    </h2>

                                    <ul>
                                        <li>Add projects</li>
                                        <li>Add React keywords</li>
                                        <li>Use action verbs</li>
                                        <li>Quantify achievements</li>
                                    </ul>

                                </div>

                                {/* Job Match */}

                                <div className="result">

                                    <h2>
                                        💼 Job Matches
                                    </h2>

                                    <ul>
                                        <li>Frontend Intern</li>
                                        <li>React Fresher</li>
                                        <li>Web Developer</li>
                                        <li>Software Trainee</li>
                                    </ul>

                                </div>


                                {/* REPORT */}

                                <div
                                    className="result"
                                    id="report"
                                >

                                    <h2>
                                        📌 Detailed Report
                                    </h2>

                                    <h2>
                                        🤖 Missing Skills
                                    </h2>

                                    <ul>
                                        {result.missing_skills.map(
                                            (
                                                item,
                                                index
                                            ) => (
                                                <li
                                                    key={index}
                                                >
                                                    {item}
                                                </li>
                                            )
                                        )}
                                    </ul>

                                    <h2>
                                        📈 Resume Tips
                                    </h2>

                                    <ul>
                                        {result.tips.map(
                                            (
                                                item,
                                                index
                                            ) => (
                                                <li
                                                    key={index}
                                                >
                                                    {item}
                                                </li>
                                            )
                                        )}
                                    </ul>

                                    <h2>
                                        🎯 Interview Questions
                                    </h2>

                                    <ul>
                                        {result.interview_questions.map(
                                            (
                                                item,
                                                index
                                            ) => (
                                                <li
                                                    key={index}
                                                >
                                                    {item}
                                                </li>
                                            )
                                        )}
                                    </ul>

                                    <button
                                        onClick={
                                            downloadPDF
                                        }
                                    >
                                        Download PDF
                                    </button>

                                    <button
                                        onClick={
                                            exportCSV
                                        }
                                    >
                                        Export CSV
                                    </button>

                                    <button
                                        onClick={
                                            shareReport
                                        }
                                    >
                                        Share Report
                                    </button>

                                    <button
                                        onClick={
                                            improveResume
                                        }
                                    >
                                        Improve Resume
                                    </button>

                                </div>

                                {/* CHARTS */}

                                <div className="chartsGrid">

                                    <div className="result">

                                        <h2>
                                            ATS Overview
                                        </h2>

                                        <ResponsiveContainer
                                            width="100%"
                                            height={260}
                                        >

                                            <PieChart>

                                                <Pie
                                                    data={[
                                                        {
                                                            name:
                                                                "ATS",
                                                            value:
                                                                result.ats_score
                                                        },
                                                        {
                                                            name:
                                                                "Remaining",
                                                            value:
                                                                100 -
                                                                result.ats_score
                                                        }
                                                    ]}
                                                    dataKey="value"
                                                    outerRadius={85}
                                                >

                                                    {chartColors.map(
                                                        (
                                                            color,
                                                            index
                                                        ) => (
                                                            <Cell
                                                                key={index}
                                                                fill={
                                                                    color
                                                                }
                                                            />
                                                        )
                                                    )}

                                                </Pie>

                                                <Tooltip />

                                            </PieChart>

                                        </ResponsiveContainer>

                                    </div>

                                    <div className="result">

                                        <h2>
                                            ATS Growth Trend
                                        </h2>

                                        <ResponsiveContainer
                                            width="100%"
                                            height={260}
                                        >

                                            <LineChart
                                                data={history}
                                            >

                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                />

                                                <XAxis
                                                    dataKey="date"
                                                />

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

                                {/* NOTIFICATIONS */}

                                <div className="result">

                                    <h2>
                                        🔔 Notifications
                                    </h2>

                                    <ul>
                                        {notifications.map(
                                            (
                                                item,
                                                index
                                            ) => (
                                                <li
                                                    key={index}
                                                >
                                                    {item.text}
                                                    {" - "}
                                                    {item.time}
                                                </li>
                                            )
                                        )}
                                    </ul>

                                </div>

                                {/* HISTORY */}

                                <div className="result">

                                    <h2>
                                        🕒 Previous Reports
                                    </h2>

                                    <ul>
                                        {history.map(
                                            (
                                                item,
                                                index
                                            ) => (
                                                <li
                                                    key={index}
                                                >
                                                    {item.date}
                                                    {" | "}
                                                    {item.role}
                                                    {" | ATS "}
                                                    {item.ats}
                                                </li>
                                            )
                                        )}
                                    </ul>

                                </div>

                            </>
                        )}

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Dashboard;