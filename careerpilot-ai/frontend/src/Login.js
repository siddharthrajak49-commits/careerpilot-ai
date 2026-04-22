// src/Login.js

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

function Login() {

  const navigate =
    useNavigate();

  /* =========================
     STATE
  ========================= */

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
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

    const savedEmail =
      localStorage.getItem(
        "remember_email"
      );

    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }

  }, [navigate]);

  /* =========================
     VALIDATION
  ========================= */

  const validateForm = () => {

    let newErrors = {};

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
        "Password is required";
    } else if (
      password.length < 6
    ) {
      newErrors.password =
        "Minimum 6 characters";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors)
        .length === 0
    );

  };

  /* =========================
     LOGIN API
  ========================= */

  const loginUser = async () => {

    if (!validateForm()) {

      Swal.fire({
        icon: "warning",
        title: "Invalid Form",
        text:
          "Please check your details."
      });

      return;
    }

    try {

      setLoading(true);

      const res =
        await axios.post(
          "https://careerpilot-backend-rvv1.onrender.com/login",
          {
            email,
            password
          }
        );

      /* Save Session */

      localStorage.setItem(
        "token",
        res.data.token
      );

      localStorage.setItem(
        "user",
        res.data.user
      );

      /* Remember Email */

      if (rememberMe) {

        localStorage.setItem(
          "remember_email",
          email
        );

      } else {

        localStorage.removeItem(
          "remember_email"
        );
      }

      Swal.fire({
        icon: "success",
        title:
          "Login Successful",
        text:
          "Welcome back to CareerPilot 🚀",
        timer: 1500,
        showConfirmButton: false
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);

    } catch (error) {

      if (
        error.response
      ) {

        Swal.fire({
          icon: "error",
          title:
            "Login Failed",
          text:
            error.response.data
              .detail ||
            "Invalid credentials"
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
     ENTER KEY LOGIN
  ========================= */

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      loginUser();
    }
  };

  /* =========================
     GOOGLE LOGIN UI
  ========================= */

  const googleLogin = () => {

    Swal.fire({
      icon: "info",
      title:
        "Coming Soon",
      text:
        "Google Login will be added in premium version."
    });

  };

  /* =========================
     UI
  ========================= */

  return (
    <div className="container">

      <div className="card authCard">

        {/* Logo */}

        <h1>
          🚀 CareerPilot AI
        </h1>

        <p className="subtitle">
          Smart Resume Analyzer &
          Career Growth Platform
        </p>

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
            placeholder="Enter Password"
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

        {/* Remember + Forgot */}

        <div
          style={{
            display:
              "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            marginTop:
              "14px",
            gap: "10px",
            flexWrap:
              "wrap"
          }}
        >

          <label
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap: "8px",
              fontSize:
                "14px",
              color:
                "#607264"
            }}
          >

            <input
              type="checkbox"
              checked={
                rememberMe
              }
              onChange={() =>
                setRememberMe(
                  !rememberMe
                )
              }
              style={{
                width:
                  "16px"
              }}
            />

            Remember Me

          </label>

          <Link
            to="/forgot-password"
            style={{
              fontSize:
                "14px"
            }}
          >
            Forgot Password?
          </Link>

        </div>

        {/* Login Button */}

        <button
          onClick={
            loginUser
          }
          disabled={
            loading
          }
        >
          {loading
            ? "Please Wait..."
            : "Login Now"}
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

        {/* Google Login */}

        <button
          onClick={
            googleLogin
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

        {/* Signup */}

        <p className="switchText">

          New User?{" "}

          <Link to="/signup">
            Create Account
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
          Secure Login • AI Powered
        </p>

      </div>

    </div>
  );
}

export default Login;