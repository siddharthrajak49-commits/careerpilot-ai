// src/ProtectedRoute.js

import React, {
  useEffect,
  useState
} from "react";

import {
  Navigate,
  useLocation
} from "react-router-dom";

import Swal from "sweetalert2";
import { api } from "./api";

function ProtectedRoute({ children }) {

  const [checking, setChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);

  const location = useLocation();

  /* =========================
     HELPERS
  ========================= */

  const getToken = () =>
    localStorage.getItem("token");

  const clearSession = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("email");
    localStorage.removeItem("avatar");
    localStorage.removeItem("plan");

  };

  const validateToken = (token) => {

    if (!token) return false;

    if (
      token === "null" ||
      token === "undefined"
    ) return false;

    if (token.length < 10) return false;

    return true;

  };

  /* =========================
     AUTH CHECK
  ========================= */

  useEffect(() => {

    let alertShown = false;

    const showAlert = (title, text) => {

      if (alertShown) return;

      alertShown = true;

      Swal.fire({
        icon: "warning",
        title,
        text
      });

    };

    const verifyAuth = async () => {

      const token = getToken();

      /* ❌ NO TOKEN */

      if (!token) {
        setIsValid(false);
        setChecking(false);
        return;
      }

      /* ❌ INVALID TOKEN */

      if (!validateToken(token)) {

        clearSession();

        showAlert(
          "Session Invalid",
          "Please login again."
        );

        setIsValid(false);
        setChecking(false);
        return;
      }

      /* ✅ BACKEND VERIFY */

      try {

        const res = await api(
          "/verify-token",
          "GET",
          null,
          token
        );

        if (res?.valid) {

          setIsValid(true);

        } else {

          throw new Error();

        }

      } catch {

        clearSession();

        showAlert(
          "Session Expired",
          "Please login again."
        );

        setIsValid(false);

      } finally {

        setChecking(false);

      }

    };

    verifyAuth();

  }, []);

  /* =========================
     LOADER
  ========================= */

  if (checking) {

    return (
      <div className="container">
        <div className="card authCard">

          <h1>🔒 Checking Access</h1>

          <p className="subtitle">
            Verifying your secure session...
          </p>

          <div
            className="pulse"
            style={{
              width: "70px",
              height: "70px",
              margin: "20px auto",
              borderRadius: "50%",
              background: "#eef9ef",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px"
            }}
          >
            🚀
          </div>

        </div>
      </div>
    );
  }

  /* =========================
     BLOCK
  ========================= */

  if (!isValid) {

    return (
      <Navigate
        to="/"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  /* =========================
     ALLOW
  ========================= */

  return children;
}

export default ProtectedRoute;