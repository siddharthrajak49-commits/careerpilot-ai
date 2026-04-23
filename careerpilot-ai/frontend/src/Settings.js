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

  /* NEW PREMIUM */

  const [
    soundAlerts,
    setSoundAlerts
  ] = useState(true);

  const [
    themeMode,
    setThemeMode
  ] = useState("Light");

  const [
    userName,
    setUserName
  ] = useState("User");

  const [
    email,
    setEmail
  ] = useState("");

  const [
    photo,
    setPhoto
  ] = useState("");
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

      setSoundAlerts(
        saved.soundAlerts ??
        true
      );

      setThemeMode(
        saved.themeMode ||
        "Light"
      );

    }

    /* Load User */

    setUserName(
      localStorage.getItem(
        "user"
      ) || "User"
    );

    setEmail(
      localStorage.getItem(
        "email"
      ) || ""
    );

    setPhoto(
      localStorage.getItem(
        "photo"
      ) ||
      localStorage.getItem(
        "avatar"
      ) ||
      ""
    );

  }, []);

  /* =========================
     APPLY DARK MODE
  ========================= */

  useEffect(() => {

    if (
      darkMode ||
      themeMode === "Dark"
    ) {

      document.body.style.background =
        "#0f1720";

    } else {

      document.body.style.background =
        "";

    }

  }, [
    darkMode,
    themeMode
  ]);
    /* =========================
     SAVE SETTINGS
  ========================= */

  const saveSettings = () => {

    const data = {
      darkMode,
      notifications,
      emailAlerts,
      autoLogout,
      language,
      soundAlerts,
      themeMode
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
     RESET ALL SETTINGS
  ========================= */

  const resetSettings = () => {

    localStorage.removeItem(
      "careerpilot_settings"
    );

    window.location.reload();

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
     DOWNLOAD USER DATA
  ========================= */

  const downloadData = () => {

    const data =
      JSON.stringify(
        localStorage,
        null,
        2
      );

    const blob =
      new Blob([data], {
        type:
          "application/json"
      });

    const url =
      URL.createObjectURL(
        blob
      );

    const a =
      document.createElement("a");

    a.href = url;
    a.download =
      "careerpilot-data.json";
    a.click();

  };
    /* =========================
     UI START
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

                {photo ? (

                  <img
                    src={photo}
                    alt="profile"
                    style={{
                      width: "55px",
                      height: "55px",
                      borderRadius:
                        "50%",
                      objectFit:
                        "cover"
                    }}
                  />

                ) : (

                  <span>🔒</span>

                )}

                <h3>
                  {userName}
                </h3>

                <p>
                  {email || "Secure User"}
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
                        {/* TOGGLES */}

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

              <p
                style={{
                  marginTop:
                    "16px"
                }}
              >
                Sound Alerts
              </p>

              <button
                className="btnSm"
                onClick={() =>
                  setSoundAlerts(
                    !soundAlerts
                  )
                }
              >
                {soundAlerts
                  ? "ON"
                  : "OFF"}
              </button>

            </div>
                        {/* SECURITY */}

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

              <p
                style={{
                  marginTop:
                    "18px"
                }}
              >
                Theme Mode
              </p>

              <select
                value={
                  themeMode
                }
                onChange={(e) =>
                  setThemeMode(
                    e.target.value
                  )
                }
              >
                <option>
                  Light
                </option>

                <option>
                  Dark
                </option>

                <option>
                  Auto
                </option>
              </select>

            </div>
                        {/* ACTIONS */}

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
                    downloadData
                  }
                >
                  Download Data
                </button>

                <button
                  onClick={
                    resetSettings
                  }
                >
                  Reset Settings
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

            {/* FOOTER */}

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