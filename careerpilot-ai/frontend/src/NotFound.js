// src/NotFound.js

import React from "react";

import {
  useNavigate
} from "react-router-dom";

function NotFound() {

  const navigate =
    useNavigate();

  const token =
    localStorage.getItem(
      "token"
    );

  /* =========================
     HANDLERS
  ========================= */

  const goHome = () => {

    if (token) {
      navigate(
        "/dashboard"
      );
    } else {
      navigate("/");
    }

  };

  const goBack = () => {
    navigate(-1);
  };

  /* =========================
     UI
  ========================= */

  return (
    <div className="container">

      <div className="card authCard">

        {/* Icon */}

        <div
          className="pulse"
          style={{
            width: "90px",
            height: "90px",
            margin:
              "0 auto 20px",
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
              "42px"
          }}
        >
          🚫
        </div>

        {/* Title */}

        <h1>
          404 Page Not Found
        </h1>

        <p className="subtitle">
          Oops! The page you are
          looking for does not
          exist or may have been
          moved.
        </p>

        {/* Route Tips */}

        <div
          className="result"
          style={{
            textAlign:
              "left"
          }}
        >

          <h2
            style={{
              marginTop: 0
            }}
          >
            Quick Links
          </h2>

          <p>
            ✅ Login Page
          </p>

          <p>
            ✅ Dashboard
          </p>

          <p>
            ✅ Signup Page
          </p>

          <p>
            ✅ Forgot Password
          </p>

        </div>

        {/* Buttons */}

        <button
          onClick={goHome}
        >
          {token
            ? "Go Dashboard"
            : "Go Login"}
        </button>

        <button
          onClick={goBack}
          style={{
            background:
              "#ffffff",
            border:
              "1px solid #e6efe6",
            color:
              "#173221"
          }}
        >
          ← Go Back
        </button>

        {/* Footer */}

        <p
          style={{
            marginTop:
              "16px",
            fontSize:
              "13px",
            color:
              "#94a398",
            textAlign:
              "center"
          }}
        >
          CareerPilot AI •
          Smart Career Platform
        </p>

      </div>

    </div>
  );
}

export default NotFound;
