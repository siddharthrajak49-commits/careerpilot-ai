// src/ForgotPassword.js

import React, {
  useState,
  useEffect
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

  const [step, setStep] =
    useState(1); // 1=email 2=otp 3=reset

  const [email, setEmail] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword,
    setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [otpSent, setOtpSent] =
    useState(false);

  const [timer, setTimer] =
    useState(30);

  const [showPassword,
    setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword
  ] = useState(false);

  /* =========================
     TIMER
  ========================= */

  useEffect(() => {

    let interval;

    if (
      otpSent &&
      timer > 0
    ) {

      interval =
        setInterval(() => {

          setTimer(
            (prev) =>
              prev - 1
          );

        }, 1000);

    }

    return () =>
      clearInterval(
        interval
      );

  }, [otpSent, timer]);

  /* =========================
     VALIDATION
  ========================= */

  const validEmail =
    (value) => {

      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        value
      );

    };

  /* =========================
     SEND OTP
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

        await axios.post(
          "https://careerpilot-backend-rvv1.onrender.com/send-reset-otp",
          {
            email
          }
        );

        setOtpSent(true);
        setTimer(30);
        setStep(2);

        Swal.fire({
          icon: "success",
          title:
            "OTP Sent",
          text:
            "Verification code sent to Gmail.",
          timer: 1600,
          showConfirmButton:
            false
        });

      } catch {

        Swal.fire({
          icon: "error",
          title:
            "Failed",
          text:
            "Unable to send OTP."
        });

      } finally {

        setLoading(false);

      }

    };

  /* =========================
     VERIFY OTP
  ========================= */

  const verifyOtp =
    async () => {

      if (!otp.trim()) {

        Swal.fire({
          icon: "warning",
          title:
            "Enter OTP"
        });

        return;
      }

      try {

        setLoading(true);

        await axios.post(
          "https://careerpilot-backend-rvv1.onrender.com/verify-reset-otp",
          {
            email,
            otp
          }
        );

        Swal.fire({
          icon: "success",
          title:
            "OTP Verified",
          timer: 1200,
          showConfirmButton:
            false
        });

        setStep(3);

      } catch {

        Swal.fire({
          icon: "error",
          title:
            "Wrong OTP"
        });

      } finally {

        setLoading(false);

      }

    };

  /* =========================
     RESET PASSWORD
  ========================= */

  const resetPassword =
    async () => {

      if (
        password.length < 6
      ) {

        Swal.fire({
          icon: "warning",
          title:
            "Weak Password",
          text:
            "Minimum 6 characters."
        });

        return;
      }

      if (
        password !==
        confirmPassword
      ) {

        Swal.fire({
          icon: "warning",
          title:
            "Password Mismatch"
        });

        return;
      }

      try {

        setLoading(true);

        await axios.post(
          "https://careerpilot-backend-rvv1.onrender.com/reset-password",
          {
            email,
            password
          }
        );

        Swal.fire({
          icon: "success",
          title:
            "Password Updated",
          text:
            "Login with new password.",
          timer: 1700,
          showConfirmButton:
            false
        });

      } catch {

        Swal.fire({
          icon: "error",
          title:
            "Failed",
          text:
            "Please try again."
        });

      } finally {

        setLoading(false);

        setTimeout(() => {

          navigate("/");

        }, 1700);

      }

    };

  /* =========================
     RESEND OTP
  ========================= */

  const resendOtp =
    () => {

      if (timer > 0)
        return;

      sendResetLink();

    };

  /* =========================
     ENTER KEY
  ========================= */

  const handleEnter =
    (e) => {

      if (
        e.key === "Enter"
      ) {

        if (step === 1)
          sendResetLink();

        if (step === 2)
          verifyOtp();

        if (step === 3)
          resetPassword();

      }

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
          continue your journey.
        </p>

        {/* ICON */}

        <div
          style={{
            width: "78px",
            height: "78px",
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
          🔑
        </div>

        {/* STEP 1 */}

        {step === 1 && (
          <>

            <input
              type="email"
              placeholder="Enter Registered Email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              onKeyDown={
                handleEnter
              }
            />

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
                : "Send OTP"}
            </button>

          </>
        )}

        {/* STEP 2 */}

        {step === 2 && (
          <>

            <div
              className="result"
              style={{
                marginBottom:
                  "16px",
                textAlign:
                  "center"
              }}
            >

              <h2>
                📩 Verify OTP
              </h2>

              <p>
                Sent to:
              </p>

              <p
                style={{
                  fontWeight:
                    "800",
                  color:
                    "#2f9e44"
                }}
              >
                {email}
              </p>

            </div>

            <input
              type="text"
              placeholder="Enter 6 Digit OTP"
              value={otp}
              onChange={(e) =>
                setOtp(
                  e.target.value
                )
              }
              onKeyDown={
                handleEnter
              }
            />

            <button
              onClick={
                verifyOtp
              }
              disabled={
                loading
              }
            >
              {loading
                ? "Verifying..."
                : "Verify OTP"}
            </button>

            <button
              style={{
                marginTop:
                  "10px",
                background:
                  "#fff",
                color:
                  "#173221",
                border:
                  "1px solid #e6efe6"
              }}
              onClick={
                resendOtp
              }
              disabled={
                timer > 0
              }
            >
              {timer > 0
                ? `Resend in ${timer}s`
                : "Resend OTP"}
            </button>

          </>
        )}

        {/* STEP 3 */}

        {step === 3 && (
          <>

            <div
              style={{
                position:
                  "relative"
              }}
            >

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="New Password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                onKeyDown={
                  handleEnter
                }
              />

              <span
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                style={{
                  position:
                    "absolute",
                  right: "15px",
                  top: "28px",
                  cursor:
                    "pointer",
                  fontSize:
                    "14px",
                  color:
                    "#2f9e44",
                  fontWeight:
                    "700"
                }}
              >
                {showPassword
                  ? "Hide"
                  : "Show"}
              </span>

            </div>

            <div
              style={{
                position:
                  "relative"
              }}
            >

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="Confirm Password"
                value={
                  confirmPassword
                }
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                onKeyDown={
                  handleEnter
                }
              />

              <span
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                style={{
                  position:
                    "absolute",
                  right: "15px",
                  top: "28px",
                  cursor:
                    "pointer",
                  fontSize:
                    "14px",
                  color:
                    "#2f9e44",
                  fontWeight:
                    "700"
                }}
              >
                {showConfirmPassword
                  ? "Hide"
                  : "Show"}
              </span>

            </div>

            <button
              onClick={
                resetPassword
              }
              disabled={
                loading
              }
            >
              {loading
                ? "Updating..."
                : "Reset Password"}
            </button>

          </>
        )}

        {/* SECURITY BOX */}

        <div
          className="result"
          style={{
            marginTop:
              "18px"
          }}
        >

          <h2>
            🛡 Secure Recovery
          </h2>

          <ul>

            <li>
              OTP valid for limited time
            </li>

            <li>
              Password encrypted
            </li>

            <li>
              Login after reset
            </li>

          </ul>

        </div>

        {/* LOGIN LINK */}

        <p className="switchText">

          Remember Password?{" "}

          <Link to="/">
            Login Now
          </Link>

        </p>

        {/* BACK */}

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