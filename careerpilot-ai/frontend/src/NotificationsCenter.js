// src/NotificationsCenter.js

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

function NotificationsCenter() {

  const navigate =
    useNavigate();

  /* =========================
     STATE
  ========================= */

  const [
    notifications,
    setNotifications
  ] = useState([]);

  /* =========================
     LOAD DATA
  ========================= */

  useEffect(() => {

    const saved =
      JSON.parse(
        localStorage.getItem(
          "careerpilot_notify"
        )
      ) || [];

    if (
      saved.length === 0
    ) {

      const demo = [
        {
          text:
            "Resume analyzed successfully",
          time:
            "10:30 AM",
          type:
            "success"
        },
        {
          text:
            "Low ATS score detected",
          time:
            "11:00 AM",
          type:
            "warning"
        },
        {
          text:
            "New job matches available",
          time:
            "12:15 PM",
          type:
            "info"
        }
      ];

      setNotifications(
        demo
      );

      localStorage.setItem(
        "careerpilot_notify",
        JSON.stringify(
          demo
        )
      );

    } else {

      setNotifications(
        saved
      );

    }

  }, []);

  /* =========================
     CLEAR ALL
  ========================= */

  const clearAll =
    () => {

      Swal.fire({
        title:
          "Clear Notifications?",
        icon:
          "warning",
        showCancelButton: true,
        confirmButtonText:
          "Yes"
      }).then(
        (res) => {

          if (
            res.isConfirmed
          ) {

            setNotifications(
              []
            );

            localStorage.removeItem(
              "careerpilot_notify"
            );

          }

        }
      );

    };

  /* =========================
     REMOVE ONE
  ========================= */

  const removeOne =
    (index) => {

      const updated =
        notifications.filter(
          (
            _,
            i
          ) =>
            i !== index
        );

      setNotifications(
        updated
      );

      localStorage.setItem(
        "careerpilot_notify",
        JSON.stringify(
          updated
        )
      );

    };

  /* =========================
     TYPE ICON
  ========================= */

  const getIcon = (
    type
  ) => {

    if (
      type ===
      "success"
    )
      return "✅";

    if (
      type ===
      "warning"
    )
      return "⚠️";

    return "🔔";
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
                🔔 Updates
              </span>

              <h2 className="heroTitle">
                Notifications Center
              </h2>

              <p className="heroText">
                Track alerts, ATS updates,
                new jobs and account
                activity in one place.
              </p>

            </div>

            <div className="heroRight">

              <div className="statCard">

                <span>📬</span>

                <h3>
                  {
                    notifications.length
                  }
                </h3>

                <p>
                  Total Alerts
                </p>

              </div>

            </div>

          </div>

          {/* MAIN */}

          <div className="card">

            <h1>
              🔔 Notifications
            </h1>

            <p className="subtitle">
              Stay updated with your
              CareerPilot activity.
            </p>

            <div className="btnRow">

              <button
                onClick={
                  clearAll
                }
              >
                Clear All
              </button>

              <button
                onClick={() =>
                  navigate(
                    "/dashboard"
                  )
                }
              >
                Dashboard
              </button>

            </div>

            {/* LIST */}

            <div className="result">

              <h2>
                Recent Alerts
              </h2>

              {notifications.length ===
              0 ? (

                <div className="notifyEmpty">

                  No notifications found.

                </div>

              ) : (

                <ul className="notifyList">

                  {notifications.map(
                    (
                      item,
                      index
                    ) => (

                      <li
                        key={index}
                      >

                        <div>

                          <div className="notifyText">

                            {getIcon(
                              item.type
                            )}{" "}
                            {item.text}

                          </div>

                          <div className="notifyTime">

                            {
                              item.time
                            }

                          </div>

                        </div>

                        <button
                          className="btnSm"
                          onClick={() =>
                            removeOne(
                              index
                            )
                          }
                        >
                          Remove
                        </button>

                      </li>
                    )
                  )}

                </ul>
              )}

            </div>

            {/* QUICK INFO */}

            <div className="result">

              <h2>
                Smart Alerts
              </h2>

              <ul>

                <li>
                  ATS score changes
                </li>

                <li>
                  Resume analyzed
                </li>

                <li>
                  New matching jobs
                </li>

                <li>
                  Premium updates
                </li>

              </ul>

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
              CareerPilot Notifications •
              Never miss updates
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default NotificationsCenter;