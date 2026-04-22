// src/ContactSupport.js

import React, {
  useState
} from "react";

import Swal from "sweetalert2";

import {
  useNavigate
} from "react-router-dom";

import Navbar from "./Navbar";
import "./App.css";

function ContactSupport() {

  const navigate =
    useNavigate();

  /* =========================
     STATE
  ========================= */

  const [form, setForm] =
    useState({
      name:
        localStorage.getItem(
          "user"
        ) || "",
      email:
        localStorage.getItem(
          "email"
        ) || "",
      subject: "",
      category:
        "General Help",
      message: ""
    });

  const [
    loading,
    setLoading
  ] = useState(false);

  /* =========================
     HANDLE CHANGE
  ========================= */

  const handleChange = (
    e
  ) => {

    setForm({
      ...form,
      [e.target.name]:
        e.target.value
    });

  };

  /* =========================
     SUBMIT
  ========================= */

  const submitTicket =
    async () => {

      if (
        !form.name ||
        !form.email ||
        !form.subject ||
        !form.message
      ) {

        Swal.fire({
          icon: "warning",
          title:
            "Missing Fields",
          text:
            "Please fill all fields."
        });

        return;
      }

      try {

        setLoading(true);

        // Backend later
        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              1200
            )
        );

        Swal.fire({
          icon: "success",
          title:
            "Ticket Submitted",
          text:
            "Support team will contact you soon."
        });

        setForm({
          ...form,
          subject: "",
          message: ""
        });

      } catch {

        Swal.fire({
          icon: "error",
          title:
            "Failed",
          text:
            "Try again later."
        });

      } finally {

        setLoading(false);

      }
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
            maxWidth: "1180px"
          }}
        >

          <Navbar />

          {/* HERO */}

          <div className="result heroBanner">

            <div className="heroLeft">

              <span className="heroTag">
                🎧 Help Center
              </span>

              <h2 className="heroTitle">
                Contact Support
              </h2>

              <p className="heroText">
                Need help with login,
                resume reports or
                billing? We are here.
              </p>

            </div>

            <div className="heroRight">

              <div className="statCard">

                <span>⚡</span>

                <h3>
                  Fast Replies
                </h3>

                <p>
                  Priority Support
                </p>

              </div>

            </div>

          </div>

          {/* MAIN */}

          <div className="card">

            <h1>
              🎧 Support Center
            </h1>

            <p className="subtitle">
              Submit your issue and
              our team will help you.
            </p>

            <div className="chartsGrid">

              {/* FORM */}

              <div className="result">

                <h2>
                  Create Ticket
                </h2>

                <input
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={
                    handleChange
                  }
                />

                <input
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={
                    handleChange
                  }
                />

                <input
                  name="subject"
                  placeholder="Subject"
                  value={
                    form.subject
                  }
                  onChange={
                    handleChange
                  }
                />

                <select
                  name="category"
                  value={
                    form.category
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option>
                    General Help
                  </option>

                  <option>
                    Login Issue
                  </option>

                  <option>
                    Billing
                  </option>

                  <option>
                    Technical Bug
                  </option>

                  <option>
                    Feature Request
                  </option>

                </select>

                <textarea
                  rows="6"
                  name="message"
                  placeholder="Describe your issue..."
                  value={
                    form.message
                  }
                  onChange={
                    handleChange
                  }
                />

                <button
                  onClick={
                    submitTicket
                  }
                  disabled={
                    loading
                  }
                >
                  {loading
                    ? "Submitting..."
                    : "Submit Ticket"}
                </button>

              </div>

              {/* SIDE PANEL */}

              <div className="result">

                <h2>
                  Quick Help
                </h2>

                <div className="softPanel">

                  <p>
                    📧 support@careerpilot.ai
                  </p>

                  <p>
                    🕒 Mon - Sat
                  </p>

                  <p>
                    ⚡ Avg Reply: 2 Hours
                  </p>

                </div>

                <h2>
                  Popular Issues
                </h2>

                <ul>

                  <li>
                    Password reset issue
                  </li>

                  <li>
                    Resume upload failed
                  </li>

                  <li>
                    Payment not updated
                  </li>

                  <li>
                    Report not loading
                  </li>

                </ul>

                <button
                  onClick={() =>
                    navigate(
                      "/dashboard"
                    )
                  }
                >
                  Dashboard
                </button>

              </div>

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
              CareerPilot Support •
              We’re here to help
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ContactSupport;