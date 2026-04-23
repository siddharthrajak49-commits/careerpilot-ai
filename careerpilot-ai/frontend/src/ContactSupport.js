// src/ContactSupport.js

import React, {
  useState,
  useEffect
} from "react";

import axios from "axios";
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
      priority:
        "Normal",
      message: ""
    });

  const [
    loading,
    setLoading
  ] = useState(false);

  const [
    tickets,
    setTickets
  ] = useState([]);
    /* =========================
     LOAD OLD TICKETS
  ========================= */

  useEffect(() => {

    const saved =
      JSON.parse(
        localStorage.getItem(
          "careerpilot_tickets"
        )
      ) || [];

    setTickets(saved);

  }, []);

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
     SUBMIT TICKET
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

        const ticketId =
          "CP-" +
          Math.floor(
            100000 +
            Math.random() *
            900000
          );

        const newTicket = {
          id: ticketId,
          name:
            form.name,
          email:
            form.email,
          subject:
            form.subject,
          category:
            form.category,
          priority:
            form.priority,
          message:
            form.message,
          status:
            "Open",
          time:
            new Date().toLocaleString()
        };
                try {

          await axios.post(
            "https://careerpilot-backend-rvv1.onrender.com/support-ticket",
            newTicket
          );

        } catch {}

        const updated = [
          newTicket,
          ...tickets
        ];

        setTickets(
          updated
        );

        localStorage.setItem(
          "careerpilot_tickets",
          JSON.stringify(
            updated
          )
        );

        Swal.fire({
          icon: "success",
          title:
            "Ticket Submitted",
          html:
            `Ticket ID: <b>${ticketId}</b><br/>Support team will contact you soon.`
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
     HELPERS
  ========================= */

  const getBadge =
    (priority) => {

      if (
        priority ===
        "High"
      )
        return "🔴";

      if (
        priority ===
        "Low"
      )
        return "🟢";

      return "🟡";
    };

  const closeTicket =
    (id) => {

      const updated =
        tickets.map(
          (item) =>
            item.id === id
              ? {
                  ...item,
                  status:
                    "Closed"
                }
              : item
        );

      setTickets(
        updated
      );

      localStorage.setItem(
        "careerpilot_tickets",
        JSON.stringify(
          updated
        )
      );

    };
      /* =========================
     UI START
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
                reports or billing?
                We are here.
              </p>

            </div>

            <div className="heroRight">

              <div className="statCard">

                <span>⚡</span>
                <h3>Fast Replies</h3>
                <p>Priority Support</p>

              </div>

              <div className="statCard">

                <span>🎫</span>
                <h3>
                  {tickets.length}
                </h3>
                <p>Total Tickets</p>

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

                <select
                  name="priority"
                  value={
                    form.priority
                  }
                  onChange={
                    handleChange
                  }
                >
                  <option>
                    Low
                  </option>
                  <option>
                    Normal
                  </option>
                  <option>
                    High
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

                  <p>
                    💬 Live Chat Soon
                  </p>

                </div>
                                <h2>
                  Previous Tickets
                </h2>

                {tickets.length ===
                0 ? (

                  <p>
                    No tickets yet.
                  </p>

                ) : (

                  <ul>

                    {tickets.map(
                      (
                        item,
                        index
                      ) => (

                        <li
                          key={index}
                          style={{
                            marginBottom:
                              "12px"
                          }}
                        >

                          {getBadge(
                            item.priority
                          )}{" "}
                          <b>
                            {item.id}
                          </b>
                          {" - "}
                          {item.subject}

                          <br />

                          <small>
                            {item.status}
                            {" | "}
                            {item.time}
                          </small>

                          {item.status !==
                            "Closed" && (

                            <div
                              style={{
                                marginTop:
                                  "6px"
                              }}
                            >
                              <button
                                className="btnSm"
                                onClick={() =>
                                  closeTicket(
                                    item.id
                                  )
                                }
                              >
                                Close
                              </button>
                            </div>

                          )}

                        </li>

                      )
                    )}

                  </ul>

                )}
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