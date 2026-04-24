// src/Signup.js

import React, {
  useState,
  useEffect
} from "react";

import axios from "axios";
import Swal from "sweetalert2";

import {
  useNavigate,
  Link
} from "react-router-dom";

import {
  signInWithPopup
} from "firebase/auth";

import {
  auth,
  provider
} from "./firebase";

function Signup() {

  const navigate =
    useNavigate();

  /* =========================
     STATE
  ========================= */

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword
  ] = useState("");

  const [otp, setOtp] =
    useState("");

  const [otpSent, setOtpSent] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword
  ] = useState(false);

  const [agreeTerms, setAgreeTerms] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [errors, setErrors] =
    useState({});

  /* =========================
     AUTO REDIRECT
  ========================= */

  useEffect(() => {

    const token =
      localStorage.getItem("token");

    if (token) {
      navigate("/dashboard");
    }

  }, [navigate]);

  /* =========================
     VALIDATION
  ========================= */

  const validateForm = () => {

    let newErrors = {};

    if (!name.trim()) {
      newErrors.name =
        "Full name is required";
    } else if (
      name.trim().length < 3
    ) {
      newErrors.name =
        "Minimum 3 characters";
    }

    if (!email.trim()) {
      newErrors.email =
        "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      newErrors.email =
        "Invalid email format";
    }

    if (!password.trim()) {
      newErrors.password =
        "Password required";
    } else if (
      password.length < 6
    ) {
      newErrors.password =
        "Minimum 6 characters";
    }

    if (
      confirmPassword !==
      password
    ) {
      newErrors.confirmPassword =
        "Passwords do not match";
    }

    if (!agreeTerms) {
      newErrors.terms =
        "Please accept terms";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors)
        .length === 0
    );

  };

  /* =========================
     SEND OTP
  ========================= */

  const sendOTP = async () => {

    if (!validateForm()) {

      Swal.fire({
        icon: "warning",
        title:
          "Invalid Form",
        text:
          "Please check all fields."
      });

      return;
    }

    try {

      setLoading(true);

      await axios.post(
        "https://careerpilot-backend-rvv1.onrender.com/send-signup-otp",
        { email }
      );

      setOtpSent(true);

      Swal.fire({
        icon: "success",
        title:
          "OTP Sent",
        text:
          "Please check your Gmail inbox 🚀"
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

  const verifyOTP =
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
          "https://careerpilot-backend-rvv1.onrender.com/verify-signup-otp",
          {
            name,
            email,
            password,
            otp
          }
        );

        Swal.fire({
          icon: "success",
          title:
            "Signup Successful",
          text:
            "Your account has been created 🚀",
          timer: 1600,
          showConfirmButton:
            false
        });

        localStorage.setItem(
          "remember_email",
          email
        );

        setTimeout(() => {
          navigate("/");
        }, 1600);

      } catch (error) {

        Swal.fire({
          icon: "error",
          title:
            "Verification Failed",
          text:
            error.response?.data
              ?.detail ||
            "Wrong OTP"
        });

      } finally {

        setLoading(false);

      }

    };

  /* =========================
     ENTER KEY
  ========================= */

  const handleEnter = (e) => {

    if (e.key === "Enter") {

      if (!otpSent) {
        sendOTP();
      } else {
        verifyOTP();
      }

    }

  };

  /* =========================
     GOOGLE SIGNUP
  ========================= */

  const googleSignup =
    async () => {

      try {

        setLoading(true);

        const result =
          await signInWithPopup(
            auth,
            provider
          );

        const user =
          result.user;

        await axios.post(
          "https://careerpilot-backend-rvv1.onrender.com/google-login",
          {
            name:
              user.displayName,
            email:
              user.email,
            photo:
              user.photoURL || ""
          }
        );

        Swal.fire({
          icon: "success",
          title:
            "Google Signup Successful",
          text:
            "Login now to continue 🚀"
        });

        navigate("/");

      } catch {

        Swal.fire({
          icon: "error",
          title:
            "Google Signup Failed"
        });

      } finally {

        setLoading(false);

      }

    };

  /* =========================
     UI
  ========================= */

  return (
    <div className="container">

      <div className="card authCard">

        {/* Header */}

        <h1>
          ✨ Create Account
        </h1>

        <p className="subtitle">
          Join CareerPilot &
          Boost Your Career
          Journey
        </p>

        {/* Name */}

        <input
          type="text"
          placeholder="Enter Full Name"
          value={name}
          onChange={(e) =>
            setName(
              e.target.value
            )
          }
          onKeyDown={
            handleEnter
          }
        />

        {errors.name && (
          <small
            style={{
              color:
                "#e03131"
            }}
          >
            {errors.name}
          </small>
        )}

        {/* Email */}

        <input
          type="email"
          placeholder="Enter Email Address"
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

        {errors.email && (
          <small
            style={{
              color:
                "#e03131"
            }}
          >
            {errors.email}
          </small>
        )}

        {/* Password */}

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
            placeholder="Create Strong Password"
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

        {errors.password && (
          <small
            style={{
              color:
                "#e03131"
            }}
          >
            {errors.password}
          </small>
        )}

        {/* Confirm */}

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

        {errors.confirmPassword && (
          <small
            style={{
              color:
                "#e03131"
            }}
          >
            {
              errors.confirmPassword
            }
          </small>
        )}

        {/* Terms */}

        <label
          style={{
            display:
              "flex",
            alignItems:
              "center",
            gap: "8px",
            marginTop:
              "16px",
            color:
              "#607264",
            fontSize:
              "14px"
          }}
        >

          <input
            type="checkbox"
            checked={
              agreeTerms
            }
            onChange={() =>
              setAgreeTerms(
                !agreeTerms
              )
            }
            style={{
              width:
                "16px"
            }}
          />

          I agree to Terms &
          Privacy Policy

        </label>

        {errors.terms && (
          <small
            style={{
              color:
                "#e03131"
            }}
          >
            {errors.terms}
          </small>
        )}

        {/* OTP UI */}

        {otpSent && (

          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) =>
              setOtp(
                e.target.value
              )
            }
            onKeyDown={
              handleEnter
            }
            style={{
              marginTop:
                "14px"
            }}
          />

        )}

        {/* Signup */}

        <button
          onClick={
            otpSent
              ? verifyOTP
              : sendOTP
          }
          disabled={
            loading
          }
        >
          {loading
            ? "Please Wait..."
            : otpSent
            ? "Verify OTP"
            : "Send OTP"}
        </button>

        {/* Divider */}

        <p
          style={{
            textAlign:
              "center",
            marginTop:
              "16px",
            color:
              "#607264"
          }}
        >
          OR
        </p>

        {/* Google */}

        <button
          onClick={
            googleSignup
          }
          style={{
            background:
              "#ffffff",
            border:
              "1px solid #e6efe6",
            color:
              "#173221"
          }}
        >
          Continue with Google
        </button>

        {/* Login */}

        <p className="switchText">

          Already User?{" "}

          <Link to="/">
            Login
          </Link>

        </p>

        {/* Footer */}

        <p
          style={{
            textAlign:
              "center",
            marginTop:
              "14px",
            fontSize:
              "13px",
            color:
              "#94a398"
          }}
        >
          Secure Signup • AI Powered
        </p>

      </div>

    </div>
  );
}

export default Signup;