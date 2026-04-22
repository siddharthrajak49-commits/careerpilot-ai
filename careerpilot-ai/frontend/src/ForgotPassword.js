// src/ForgotPassword.js

import React, {
  useState
} from "react";

import axios from "axios";
import Swal from "sweetalert2";

import {
  Link,
  useNavigate
} from "react-router-dom";

function ForgotPassword() {

  const navigate =
    useNavigate();

  /* =========================
     STATE
  ========================= */

  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [otpSent, setOtpSent] =
    useState(false);

  const [timer, setTimer] =
    useState(30);

  /* =========================
     EMAIL VALIDATION
  ========================= */

  const validEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      value
    );
  };

  /* =========================
     START TIMER
  ========================= */

  const startResendTimer = () => {

    let count = 30;

    setTimer(30);

    const interval =
      setInterval(() => {

        count--;

        setTimer(count);

        if (count <= 0) {
          clearInterval(interval);
        }

      }, 1000);
  };

  /* =========================
     SEND RESET LINK / OTP
  ========================= */

  const sendResetLink =
    async () => {

      if (!email.trim()) {

        Swal.fire({
          icon: "warning",
          title:
            "Missing Email",
          text:
            "Please enter your email."
        });

        return;
      }

      if (
        !validEmail(email)
      ) {

        Swal.fire({
          icon: "warning",
          title:
            "Invalid Email",
          text:
            "Please enter valid email."
        });

        return;
      }

      try {

        setLoading(true);

        /* ======================
           REAL API (Future Use)
        ====================== */

        await axios.post(
          "https://careerpilot-backend-rvv1.onrender.com/forgot-password",
          {
            email
          }
        );

        setOtpSent(true);

        startResendTimer();

        Swal.fire({
          icon: "success",
          title:
            "Reset Link Sent",
          text:
            "Please check your email inbox.",
          timer: 1800,
          showConfirmButton: false
        });

      } catch (error) {

        /* fallback success UI */

        setOtpSent(true);

        startResendTimer();

        Swal.fire({
          icon: "success",
          title:
            "Request Submitted",
          text:
            "If account exists, reset mail will arrive soon.",
          timer: 1800,
          showConfirmButton: false
        });

      } finally {

        setLoading(false);

      }
    };

  /* =========================
     RESEND
  ========================= */

  const resendLink = () => {

    if (timer > 0) return;

    sendResetLink();

  };

  /* =========================
     UI
  ========================= */

  return (
    <div className="container">

      <div className="card authCard">

        {/* HEADER */}

        <h1>
          🔐 Forgot Password
        </h1>

        <p className="subtitle">
          Recover your CareerPilot
          account securely and
          continue your career
          journey.
        </p>

        {/* ICON */}

        <div
          style={{
            width: "76px",
            height: "76px",
            margin:
              "0 auto 18px",
            borderRadius:
              "50%",
            background:
              "#eef9ef",
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            fontSize: "34px"
          }}
        >
          📩
        </div>

        {/* EMAIL */}

        <input
          type="email"
          placeholder="Enter Registered Email"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
        />

        {/* BUTTON */}

        <button
          onClick={
            sendResetLink
          }
          disabled={
            loading
          }
        >
          {loading
            ? "Please Wait..."
            : "Send Reset Link"}
        </button>

        {/* SUCCESS PANEL */}

        {otpSent && (
          <div
            className="result"
            style={{
              marginTop:
                "18px",
              textAlign:
                "center"
            }}
          >

            <h2
              style={{
                marginTop: 0
              }}
            >
              ✅ Email Sent
            </h2>

            <p>
              We have sent a
              password reset link
              to:
            </p>

            <p
              style={{
                fontWeight:
                  "800",
                color:
                  "#2f9e44",
                marginTop:
                  "8px"
              }}
            >
              {email}
            </p>

            <button
              style={{
                marginTop:
                  "14px"
              }}
              onClick={
                resendLink
              }
              disabled={
                timer > 0
              }
            >
              {timer > 0
                ? `Resend in ${timer}s`
                : "Resend Link"}
            </button>

          </div>
        )}

        {/* HELP TEXT */}

        <p
          style={{
            marginTop: "18px",
            color:
              "#607264",
            fontSize:
              "14px",
            lineHeight:
              "1.7"
          }}
        >
          Check spam/promotions
          folder if email is not
          visible.
        </p>

        {/* LOGIN LINK */}

        <p className="switchText">

          Remember Password?{" "}

          <Link to="/">
            Login Now
          </Link>

        </p>

        {/* BACK BUTTON */}

        <button
          style={{
            background:
              "#ffffff",
            border:
              "1px solid #e6efe6",
            color:
              "#173221"
          }}
          onClick={() =>
            navigate("/")
          }
        >
          ← Back to Login
        </button>

        {/* FOOTER */}

        <p
          style={{
            marginTop:
              "14px",
            fontSize:
              "13px",
            color:
              "#94a398",
            textAlign:
              "center"
          }}
        >
          Secure Recovery •
          CareerPilot AI
        </p>

      </div>

    </div>
  );
}

export default ForgotPassword;