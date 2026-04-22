// src/ResetPassword.js

import React, {
  useState
} from "react";

import axios from "axios";
import Swal from "sweetalert2";

import {
  useNavigate,
  useParams,
  Link
} from "react-router-dom";

function ResetPassword() {

  const navigate =
    useNavigate();

  const { token } =
    useParams();

  /* =========================
     STATE
  ========================= */

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword
  ] = useState("");

  const [
    showPassword,
    setShowPassword
  ] = useState(false);

  const [
    showConfirm,
    setShowConfirm
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [strength, setStrength] =
    useState("");

  /* =========================
     PASSWORD STRENGTH
  ========================= */

  const checkStrength = (
    value
  ) => {

    if (
      value.length < 6
    ) {
      setStrength("Weak");
    } else if (
      value.length < 10
    ) {
      setStrength("Medium");
    } else {
      setStrength("Strong");
    }

  };

  /* =========================
     SUBMIT
  ========================= */

  const resetPassword =
    async () => {

      if (!password ||
          !confirmPassword) {

        Swal.fire({
          icon: "warning",
          title:
            "Missing Fields",
          text:
            "Please fill all fields."
        });

        return;
      }

      if (
        password.length < 6
      ) {

        Swal.fire({
          icon: "warning",
          title:
            "Weak Password",
          text:
            "Minimum 6 characters required."
        });

        return;
      }

      if (
        password !==
        confirmPassword
      ) {

        Swal.fire({
          icon: "error",
          title:
            "Password Mismatch",
          text:
            "Passwords do not match."
        });

        return;
      }

      try {

        setLoading(true);

        await axios.post(
          "https://careerpilot-backend-rvv1.onrender.com/reset-password",
          {
            token,
            password
          }
        );

        Swal.fire({
          icon: "success",
          title:
            "Password Updated",
          text:
            "You can login now.",
          timer: 1800,
          showConfirmButton: false
        });

        setTimeout(() => {
          navigate("/");
        }, 1800);

      } catch (error) {

        Swal.fire({
          icon: "error",
          title:
            "Reset Failed",
          text:
            "Link expired or invalid token."
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
          🔑 Reset Password
        </h1>

        <p className="subtitle">
          Create a strong new
          password for your
          CareerPilot account.
        </p>

        {/* Icon */}

        <div
          style={{
            width: "80px",
            height: "80px",
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
            fontSize:
              "36px"
          }}
          className="pulse"
        >
          🔒
        </div>

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
            placeholder="New Password"
            value={password}
            onChange={(e) => {
              setPassword(
                e.target.value
              );
              checkStrength(
                e.target.value
              );
            }}
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
              fontWeight:
                "700",
              color:
                "#2f9e44"
            }}
          >
            {showPassword
              ? "Hide"
              : "Show"}
          </span>

        </div>

        {/* Strength */}

        {password && (
          <p
            style={{
              marginTop:
                "8px",
              fontSize:
                "14px",
              color:
                strength ===
                "Strong"
                  ? "#2f9e44"
                  : strength ===
                    "Medium"
                  ? "#e0a300"
                  : "#e03131"
            }}
          >
            Password Strength:
            {" "}
            {strength}
          </p>
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
              showConfirm
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
          />

          <span
            onClick={() =>
              setShowConfirm(
                !showConfirm
              )
            }
            style={{
              position:
                "absolute",
              right: "15px",
              top: "28px",
              cursor:
                "pointer",
              fontWeight:
                "700",
              color:
                "#2f9e44"
            }}
          >
            {showConfirm
              ? "Hide"
              : "Show"}
          </span>

        </div>

        {/* Submit */}

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

        {/* Back */}

        <p className="switchText">

          Remember Password?{" "}

          <Link to="/">
            Login Now
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
          Secure Recovery •
          CareerPilot AI
        </p>

      </div>

    </div>
  );
}

export default ResetPassword;