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

    /* Name */

    if (!name.trim()) {
      newErrors.name =
        "Full name is required";
    } else if (
      name.trim().length < 3
    ) {
      newErrors.name =
        "Minimum 3 characters";
    }

    /* Email */

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

    /* Password */

    if (!password.trim()) {
      newErrors.password =
        "Password required";
    } else if (
      password.length < 6
    ) {
      newErrors.password =
        "Minimum 6 characters";
    }

    /* Confirm */

    if (
      confirmPassword !==
      password
    ) {
      newErrors.confirmPassword =
        "Passwords do not match";
    }

    /* Terms */

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
     SIGNUP API
  ========================= */

  const signupUser = async () => {

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
        "https://careerpilot-backend-rvv1.onrender.com/signup",
        {
          name,
          email,
          password
        }
      );

      Swal.fire({
        icon: "success",
        title:
          "Signup Successful",
        text:
          "Your account has been created 🚀",
        timer: 1600,
        showConfirmButton: false
      });

      localStorage.setItem(
        "remember_email",
        email
      );

      setTimeout(() => {
        navigate("/");
      }, 1600);

    } catch (error) {

      if (
        error.response
      ) {

        Swal.fire({
          icon: "error",
          title:
            "Signup Failed",
          text:
            error.response.data
              .detail ||
            "Email already exists"
        });

      } else {

        Swal.fire({
          icon: "error",
          title:
            "Server Error",
          text:
            "Please try again later."
        });

      }

    } finally {

      setLoading(false);

    }
  };

  /* =========================
     ENTER KEY
  ========================= */

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      signupUser();
    }
  };

  /* =========================
     GOOGLE SIGNUP UI
  ========================= */

  const googleSignup = () => {

    Swal.fire({
      icon: "info",
      title:
        "Coming Soon",
      text:
        "Google Signup will be available soon."
    });

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

        {/* Confirm Password */}

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

        {/* Signup */}

        <button
          onClick={
            signupUser
          }
          disabled={
            loading
          }
        >
          {loading
            ? "Please Wait..."
            : "Signup Now"}
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
