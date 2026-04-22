// src/Settings.js

import React, {
  useState,
  useEffect
} from "react";

import Swal from "sweetalert2";

import {
  useNavigate
} from "react-router-dom";

import Navbar from "./Navbar";
import "./App.css";

function Settings() {

  const navigate =
    useNavigate();

  /* =========================
     STATE
  ========================= */

  const [
    darkMode,
    setDarkMode
  ] = useState(false);

  const [
    notifications,
    setNotifications
  ] = useState(true);

  const [
    emailAlerts,
    setEmailAlerts
  ] = useState(true);

  const [
    autoLogout,
    setAutoLogout
  ] = useState("30");

  const [
    language,
    setLanguage
  ] = useState("English");

  /* =========================
     LOAD SETTINGS
  ========================= */

  useEffect(() => {

    const saved =
      JSON.parse(
        localStorage.getItem(
          "careerpilot_settings"
        )
      );

    if (saved) {

      setDarkMode(
        saved.darkMode
      );

      setNotifications(
        saved.notifications
      );

      setEmailAlerts(
        saved.emailAlerts
      );

      setAutoLogout(
        saved.autoLogout
      );

      setLanguage(
        saved.language
      );

    }

  }, []);

  /* =========================
     SAVE SETTINGS
  ========================= */

  const saveSettings = () => {

    const data = {
      darkMode,
      notifications,
      emailAlerts,
      autoLogout,
      language
    };

    localStorage.setItem(
      "careerpilot_settings",
      JSON.stringify(data)
    );

    Swal.fire({
      icon: "success",
      title:
        "Saved Successfully",
      text:
        "Your settings updated.",
      timer: 1400,
      showConfirmButton: false
    });

  };

  /* =========================
     CLEAR HISTORY
  ========================= */

  const clearHistory = () => {

    localStorage.removeItem(
      "careerpilot_history"
    );

    Swal.fire({
      icon: "success",
      title:
        "History Cleared",
      text:
        "All reports removed."
    });

  };

  /* =========================
     LOGOUT ALL
  ========================= */

  const logoutAll = () => {

    localStorage.clear();

    Swal.fire({
      icon: "success",
      title:
        "Logged Out",
      text:
        "All sessions cleared."
    });

    navigate("/");

  };

  /* =========================
     DELETE ACCOUNT
  ========================= */

  const deleteAccount = () => {

    Swal.fire({
      icon: "warning",
      title:
        "Delete Account?",
      text:
        "This action cannot be undone.",
      showCancelButton: true,
      confirmButtonText:
        "Delete"
    }).then((res) => {

      if (res.isConfirmed) {

        localStorage.clear();

        Swal.fire({
          icon: "success",
          title:
            "Deleted",
          text:
            "Account removed."
        });

        navigate("/");

      }

    });

  };

  /* =========================
     UI
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
                ⚙️ App Settings
              </span>

              <h2 className="heroTitle">
                Customize Experience
              </h2>

              <p className="heroText">
                Manage preferences,
                privacy and account
                controls.
              </p>

            </div>

            <div className="heroRight">

              <div className="statCard">

                <span>🔒</span>

                <h3>
                  Secure
                </h3>

                <p>
                  Privacy Controls
                </p>

              </div>

            </div>

          </div>

          {/* MAIN CARD */}

          <div className="card">

            <h1>
              ⚙️ Settings Center
            </h1>

            <p className="subtitle">
              Personalize CareerPilot
              the way you like.
            </p>

            {/* Toggles */}

            <div className="result">

              <h2>
                Preferences
              </h2>

              <p>
                Dark Mode
              </p>

              <button
                className="btnSm"
                onClick={() =>
                  setDarkMode(
                    !darkMode
                  )
                }
              >
                {darkMode
                  ? "Enabled"
                  : "Disabled"}
              </button>

              <p
                style={{
                  marginTop:
                    "16px"
                }}
              >
                Notifications
              </p>

              <button
                className="btnSm"
                onClick={() =>
                  setNotifications(
                    !notifications
                  )
                }
              >
                {notifications
                  ? "ON"
                  : "OFF"}
              </button>

              <p
                style={{
                  marginTop:
                    "16px"
                }}
              >
                Email Alerts
              </p>

              <button
                className="btnSm"
                onClick={() =>
                  setEmailAlerts(
                    !emailAlerts
                  )
                }
              >
                {emailAlerts
                  ? "ON"
                  : "OFF"}
              </button>

            </div>

            {/* Auto Logout */}

            <div className="result">

              <h2>
                Security
              </h2>

              <p>
                Auto Logout Time
              </p>

              <select
                value={
                  autoLogout
                }
                onChange={(e) =>
                  setAutoLogout(
                    e.target.value
                  )
                }
              >
                <option value="15">
                  15 Minutes
                </option>

                <option value="30">
                  30 Minutes
                </option>

                <option value="60">
                  1 Hour
                </option>
              </select>

              <p
                style={{
                  marginTop:
                    "18px"
                }}
              >
                Language
              </p>

              <select
                value={
                  language
                }
                onChange={(e) =>
                  setLanguage(
                    e.target.value
                  )
                }
              >
                <option>
                  English
                </option>

                <option>
                  Hindi
                </option>

                <option>
                  Hinglish
                </option>
              </select>

            </div>

            {/* Actions */}

            <div className="result">

              <h2>
                Quick Actions
              </h2>

              <div className="btnRow">

                <button
                  onClick={
                    saveSettings
                  }
                >
                  Save Settings
                </button>

                <button
                  onClick={
                    clearHistory
                  }
                >
                  Clear History
                </button>

                <button
                  onClick={
                    logoutAll
                  }
                >
                  Logout All
                </button>

                <button
                  onClick={
                    deleteAccount
                  }
                  style={{
                    background:
                      "#fff2f2",
                    color:
                      "#e03131"
                  }}
                >
                  Delete Account
                </button>

              </div>

            </div>

            {/* Footer */}

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
              CareerPilot AI •
              Smart Secure Settings
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Settings;