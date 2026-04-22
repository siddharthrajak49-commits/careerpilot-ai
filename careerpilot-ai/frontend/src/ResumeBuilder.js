// src/ResumeBuilder.js

import React, {
  useState
} from "react";

import Swal from "sweetalert2";

import {
  useNavigate
} from "react-router-dom";

import jsPDF from "jspdf";

import Navbar from "./Navbar";
import "./App.css";

function ResumeBuilder() {

  const navigate =
    useNavigate();

  /* =========================
     STATE
  ========================= */

  const [form, setForm] =
    useState({
      fullName: "",
      email: "",
      phone: "",
      city: "",
      summary: "",
      education: "",
      skills: "",
      projects: "",
      experience: ""
    });

  /* =========================
     HANDLE CHANGE
  ========================= */

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]:
        e.target.value
    });

  };

  /* =========================
     SAMPLE DATA
  ========================= */

  const fillSample =
    () => {

      setForm({
        fullName:
          "Siddharth Kumar",
        email:
          "siddharth@email.com",
        phone:
          "9876543210",
        city:
          "Indore, MP",
        summary:
          "Motivated Computer Science student skilled in React, Python and Machine Learning with strong problem solving ability.",
        education:
          "B.Tech CSE - RGPV University",
        skills:
          "React, JavaScript, Python, ML, SQL, HTML, CSS",
        projects:
          "CareerPilot AI Resume Analyzer, Portfolio Website",
        experience:
          "Frontend Intern - 3 Months"
      });

      Swal.fire({
        icon: "success",
        title:
          "Sample Loaded",
        timer: 1200,
        showConfirmButton: false
      });

    };

  /* =========================
     CLEAR FORM
  ========================= */

  const clearForm =
    () => {

      setForm({
        fullName: "",
        email: "",
        phone: "",
        city: "",
        summary: "",
        education: "",
        skills: "",
        projects: "",
        experience: ""
      });

    };

  /* =========================
     DOWNLOAD PDF
  ========================= */

  const downloadPDF =
    () => {

      if (!form.fullName) {

        Swal.fire({
          icon: "warning",
          title:
            "Fill Resume First",
          text:
            "Please complete your resume."
        });

        return;
      }

      const pdf =
        new jsPDF(
          "p",
          "mm",
          "a4"
        );

      let y = 20;

      pdf.setFontSize(20);
      pdf.text(
        form.fullName,
        14,
        y
      );

      y += 10;

      pdf.setFontSize(11);
      pdf.text(
        `${form.email} | ${form.phone} | ${form.city}`,
        14,
        y
      );

      y += 14;

      const addSection = (
        title,
        value
      ) => {

        if (!value) return;

        pdf.setFontSize(14);
        pdf.text(
          title,
          14,
          y
        );

        y += 7;

        pdf.setFontSize(11);

        const lines =
          pdf.splitTextToSize(
            value,
            180
          );

        pdf.text(
          lines,
          14,
          y
        );

        y +=
          lines.length *
            6 +
          6;

      };

      addSection(
        "Professional Summary",
        form.summary
      );

      addSection(
        "Education",
        form.education
      );

      addSection(
        "Skills",
        form.skills
      );

      addSection(
        "Projects",
        form.projects
      );

      addSection(
        "Experience",
        form.experience
      );

      pdf.save(
        "Resume.pdf"
      );

    };

  /* =========================
     UI
  ========================= */

  return (
    <div className="mainAppTheme">

      <div className="container dashboardWrap">

        <div
          style={{
            width: "100%",
            maxWidth: "1280px"
          }}
        >

          <Navbar />

          {/* HERO */}

          <div className="result heroBanner">

            <div className="heroLeft">

              <span className="heroTag">
                📄 Resume Builder
              </span>

              <h2 className="heroTitle">
                Build ATS Ready Resume
              </h2>

              <p className="heroText">
                Create a professional
                resume with live preview
                and export to PDF.
              </p>

            </div>

            <div className="heroRight">

              <div className="statCard">

                <span>🚀</span>

                <h3>
                  Smart Builder
                </h3>

                <p>
                  Fast & Modern
                </p>

              </div>

            </div>

          </div>

          {/* MAIN */}

          <div className="card">

            <h1>
              📄 Resume Builder
            </h1>

            <p className="subtitle">
              Create job winning resume
              in minutes.
            </p>

            <div className="chartsGrid">

              {/* FORM SIDE */}

              <div className="result">

                <h2>
                  Resume Details
                </h2>

                <input
                  name="fullName"
                  placeholder="Full Name"
                  value={
                    form.fullName
                  }
                  onChange={
                    handleChange
                  }
                />

                <input
                  name="email"
                  placeholder="Email"
                  value={
                    form.email
                  }
                  onChange={
                    handleChange
                  }
                />

                <input
                  name="phone"
                  placeholder="Phone"
                  value={
                    form.phone
                  }
                  onChange={
                    handleChange
                  }
                />

                <input
                  name="city"
                  placeholder="City"
                  value={
                    form.city
                  }
                  onChange={
                    handleChange
                  }
                />

                <textarea
                  rows="3"
                  name="summary"
                  placeholder="Professional Summary"
                  value={
                    form.summary
                  }
                  onChange={
                    handleChange
                  }
                />

                <textarea
                  rows="2"
                  name="education"
                  placeholder="Education"
                  value={
                    form.education
                  }
                  onChange={
                    handleChange
                  }
                />

                <textarea
                  rows="2"
                  name="skills"
                  placeholder="Skills"
                  value={
                    form.skills
                  }
                  onChange={
                    handleChange
                  }
                />

                <textarea
                  rows="2"
                  name="projects"
                  placeholder="Projects"
                  value={
                    form.projects
                  }
                  onChange={
                    handleChange
                  }
                />

                <textarea
                  rows="2"
                  name="experience"
                  placeholder="Experience"
                  value={
                    form.experience
                  }
                  onChange={
                    handleChange
                  }
                />

                <div className="btnRow">

                  <button
                    onClick={
                      fillSample
                    }
                  >
                    Fill Sample
                  </button>

                  <button
                    onClick={
                      clearForm
                    }
                  >
                    Clear
                  </button>

                </div>

              </div>

              {/* PREVIEW SIDE */}

              <div className="result">

                <h2>
                  Live Preview
                </h2>

                <h3>
                  {form.fullName ||
                    "Your Name"}
                </h3>

                <p>
                  {form.email}
                  {" "}
                  {form.phone &&
                    `| ${form.phone}`}
                </p>

                <p>
                  {form.city}
                </p>

                <hr
                  style={{
                    margin:
                      "14px 0"
                  }}
                />

                <h4>
                  Summary
                </h4>

                <p>
                  {form.summary}
                </p>

                <h4
                  style={{
                    marginTop:
                      "14px"
                  }}
                >
                  Education
                </h4>

                <p>
                  {form.education}
                </p>

                <h4
                  style={{
                    marginTop:
                      "14px"
                  }}
                >
                  Skills
                </h4>

                <p>
                  {form.skills}
                </p>

                <h4
                  style={{
                    marginTop:
                      "14px"
                  }}
                >
                  Projects
                </h4>

                <p>
                  {form.projects}
                </p>

                <h4
                  style={{
                    marginTop:
                      "14px"
                  }}
                >
                  Experience
                </h4>

                <p>
                  {form.experience}
                </p>

                <button
                  onClick={
                    downloadPDF
                  }
                >
                  Download PDF
                </button>

              </div>

            </div>

            {/* ACTIONS */}

            <div className="btnRow">

              <button
                onClick={() =>
                  navigate(
                    "/dashboard"
                  )
                }
              >
                Dashboard
              </button>

              <button
                onClick={() =>
                  navigate(
                    "/analytics"
                  )
                }
              >
                Analytics
              </button>

            </div>

            {/* FOOTER */}

            <p
              style={{
                textAlign:
                  "center",
                marginTop:
                  "18px",
                color:
                  "#94a398",
                fontSize:
                  "13px"
              }}
            >
              CareerPilot Resume Builder •
              ATS Optimized
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ResumeBuilder;