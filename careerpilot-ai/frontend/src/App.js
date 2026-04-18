import React, { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip
} from "recharts";


import "./App.css";

function App() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const downloadPDF = () => {
  const input = document.getElementById("report");

  html2canvas(input).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const width = 190;
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, "PNG", 10, 10, width, height);
    pdf.save("CareerPilot_Report.pdf");
  });
};

  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const uploadResume = async () => {

    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(
      "https://careerpilot-backend-rvv1.onrender.com/analyze",
      formData
    );

    setResult(res.data);
  };

  const colors = ["#00ff99", "#00c3ff"];

  return (
    <div className="container">
      <div className="card">

        <h1>🚀 CareerPilot AI</h1>
        <button onClick={logout}>Logout</button>

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button onClick={uploadResume}>
          Analyze Resume
        </button>

        {result && (
          <>
            <div className="result" id="report">
              <h2>📌 Result</h2>

              <p><b>Role:</b> {result.recommended_role}</p>
              <p><b>Salary:</b> ₹{result.predicted_salary_lpa} LPA</p>
              <p><b>ATS Score:</b> {result.ats_score}/100</p>
            </div>

            <h2>📊 Dashboard</h2>

            <PieChart width={300} height={250}>
              <Pie
                data={[
                  { name: "ATS", value: result.ats_score },
                  { name: "Remaining", value: 100 - result.ats_score }
                ]}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
              >
                {colors.map((color, index) => (
                  <Cell key={index} fill={color} />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>

            <BarChart
              width={320}
              height={250}
              data={[
                {
                  name: "Salary",
                  value: result.predicted_salary_lpa
                },
                {
                  name: "Skills",
                  value: result.skills_found.length
                }
              ]}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#00ff99" />
            </BarChart>

            <div className="result" id="report">
              <h2>🤖 Missing Skills</h2>

              <ul>
                {result.missing_skills.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>

              <h2>📈 Resume Tips</h2>

              <ul>
                {result.tips.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              <button onClick={downloadPDF}>
                Download PDF Report
              </button>

              <h2>🎯 Interview Questions</h2>

              <ul>
                {result.interview_questions.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

          </>
        )}

      </div>
    </div>
  );
}

export default App;