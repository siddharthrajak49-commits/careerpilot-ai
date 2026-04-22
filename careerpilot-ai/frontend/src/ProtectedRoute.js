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

function ProtectedRoute({
  children
}) {

  /* =========================
     STATE
  ========================= */

  const [checking, setChecking] =
    useState(true);

  const [isValid, setIsValid] =
    useState(false);

  const location =
    useLocation();

  /* =========================
     TOKEN HELPERS
  ========================= */

  const getToken = () => {
    return localStorage.getItem(
      "token"
    );
  };

  const clearSession = () => {
    localStorage.removeItem(
      "token"
    );
    localStorage.removeItem(
      "user"
    );
  };

  /* =========================
     SIMPLE TOKEN VALIDATION
     (future JWT ready)
  ========================= */

  const validateToken = (
    token
  ) => {

    if (!token) return false;

    if (
      token === "null" ||
      token === "undefined"
    ) {
      return false;
    }

    if (
      token.length < 10
    ) {
      return false;
    }

    return true;
  };

  /* =========================
     CHECK AUTH
  ========================= */

  useEffect(() => {

    const verifyAuth =
      async () => {

        const token =
          getToken();

        /* no token */

        if (!token) {
          setIsValid(false);
          setChecking(false);
          return;
        }

        /* fake token */

        if (
          !validateToken(
            token
          )
        ) {

          clearSession();

          Swal.fire({
            icon: "warning",
            title:
              "Session Invalid",
            text:
              "Please login again."
          });

          setIsValid(false);
          setChecking(false);
          return;
        }

        /* =====================
           FUTURE API VERIFY
           You can enable later
        ===================== */

        /*
        try {
          await axios.get(
            "/verify-token",
            {
              headers:{
                Authorization:
                `Bearer ${token}`
              }
            }
          );
        } catch {
          clearSession();
          setIsValid(false);
          setChecking(false);
          return;
        }
        */

        setIsValid(true);
        setChecking(false);

      };

    verifyAuth();

  }, []);

  /* =========================
     LOADING SCREEN
  ========================= */

  if (checking) {

    return (
      <div className="container">

        <div className="card authCard">

          <h1>
            🔒 Checking Access
          </h1>

          <p className="subtitle">
            Verifying your secure
            session...
          </p>

          <div
            style={{
              width: "70px",
              height: "70px",
              margin:
                "20px auto",
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
                "32px"
            }}
            className="pulse"
          >
            🚀
          </div>

        </div>

      </div>
    );
  }

  /* =========================
     BLOCK ACCESS
  ========================= */

  if (!isValid) {

    return (
      <Navigate
        to="/"
        replace
        state={{
          from:
            location.pathname
        }}
      />
    );
  }

  /* =========================
     ALLOW ACCESS
  ========================= */

  return children;
}

export default ProtectedRoute;