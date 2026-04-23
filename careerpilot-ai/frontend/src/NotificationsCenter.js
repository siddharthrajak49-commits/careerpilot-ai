// src/NotificationsCenter.js

import React, {
  useState,
  useEffect
} from "react";

import axios from "axios";
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

  const [
    loading,
    setLoading
  ] = useState(false);
    /* =========================
     LOAD DATA
  ========================= */

  useEffect(() => {

    loadNotifications();

  }, []);

  const loadNotifications =
    async () => {

      try {

        setLoading(true);

        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await axios.get(
            "https://careerpilot-backend-rvv1.onrender.com/notifications",
            {
              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }
          );

        if (
          res.data.items
        ) {

          const apiData =
            res.data.items.map(
              (item) => ({
                text:
                  item,
                time:
                  new Date().toLocaleTimeString(),
                type:
                  "info",
                read:
                  false
              })
            );

          setNotifications(
            apiData
          );

          localStorage.setItem(
            "careerpilot_notify",
            JSON.stringify(
              apiData
            )
          );

        }

      } catch {

        fallbackLocal();

      } finally {

        setLoading(false);

      }

    };
      /* =========================
     FALLBACK LOCAL
  ========================= */

  const fallbackLocal =
    () => {

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
              "success",
            read:
              false
          },
          {
            text:
              "Low ATS score detected",
            time:
              "11:00 AM",
            type:
              "warning",
            read:
              false
          },
          {
            text:
              "New job matches available",
            time:
              "12:15 PM",
            type:
              "info",
            read:
              true
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

    };
    
      /* =========================
     MARK READ
  ========================= */

  const markRead =
    (index) => {

      const updated =
        [...notifications];

      updated[index].read =
        true;

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
     HELPERS
  ========================= */

  const unreadCount =
    notifications.filter(
      (item) =>
        !item.read
    ).length;

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

              <div className="statCard">

                <span>🔴</span>

                <h3>
                  {unreadCount}
                </h3>

                <p>
                  Unread
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
                onClick={
                  loadNotifications
                }
              >
                Refresh
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

            <div className="result">

              <h2>
                Recent Alerts
              </h2>

              {loading ? (

                <p>
                  Loading...
                </p>

              ) : notifications.length === 0 ? (

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
                        style={{
                          opacity:
                            item.read
                              ? 0.65
                              : 1
                        }}
                      >

                        <div>

                          <div className="notifyText">

                            {getIcon(
                              item.type
                            )}{" "}
                            {item.text}

                          </div>

                          <div className="notifyTime">

                            {item.time}

                          </div>

                        </div>

                        <div
                          style={{
                            display:
                              "flex",
                            gap: "8px"
                          }}
                        >

                          {!item.read && (

                            <button
                              className="btnSm"
                              onClick={() =>
                                markRead(
                                  index
                                )
                              }
                            >
                              Read
                            </button>

                          )}

                          <button
                            className="btnSm"
                            onClick={() =>
                              removeOne(
                                index
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>

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

                <li>
                  Account security alerts
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