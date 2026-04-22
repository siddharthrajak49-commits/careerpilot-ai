// src/AdminDashboard.js

import React, {
  useState,
  useEffect
} from "react";

import Swal from "sweetalert2";

import {
  useNavigate
} from "react-router-dom";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

import Navbar from "./Navbar";
import "./App.css";

function AdminDashboard() {

  const navigate =
    useNavigate();

  /* =========================
     STATE
  ========================= */

  const [users, setUsers] =
    useState([]);

  const [stats, setStats] =
    useState({
      totalUsers: 0,
      premiumUsers: 0,
      reports: 0,
      todayUsers: 0
    });

  const [announcement, setAnnouncement] =
    useState("");

  /* =========================
     LOAD MOCK DATA
  ========================= */

  useEffect(() => {

    const demoUsers = [
      {
        id: 1,
        name: "Siddharth",
        email:
          "sid@email.com",
        plan: "Premium"
      },
      {
        id: 2,
        name: "Rahul",
        email:
          "rahul@email.com",
        plan: "Free"
      },
      {
        id: 3,
        name: "Aman",
        email:
          "aman@email.com",
        plan: "Premium"
      },
      {
        id: 4,
        name: "Priya",
        email:
          "priya@email.com",
        plan: "Free"
      }
    ];

    setUsers(demoUsers);

    setStats({
      totalUsers: 124,
      premiumUsers: 48,
      reports: 680,
      todayUsers: 12
    });

  }, []);

  /* =========================
     DELETE USER
  ========================= */

  const deleteUser = (
    id
  ) => {

    Swal.fire({
      icon: "warning",
      title:
        "Delete User?",
      text:
        "This action cannot be undone.",
      showCancelButton: true,
      confirmButtonText:
        "Delete"
    }).then((res) => {

      if (res.isConfirmed) {

        const updated =
          users.filter(
            (item) =>
              item.id !== id
          );

        setUsers(updated);

        Swal.fire({
          icon: "success",
          title:
            "Deleted",
          text:
            "User removed successfully."
        });

      }

    });

  };

  /* =========================
     SEND ANNOUNCEMENT
  ========================= */

  const sendAnnouncement =
    () => {

      if (!announcement) {

        Swal.fire({
          icon: "warning",
          title:
            "Empty Message",
          text:
            "Please write announcement."
        });

        return;
      }

      Swal.fire({
        icon: "success",
        title:
          "Announcement Sent",
        text:
          announcement
      });

      setAnnouncement("");

    };

  /* =========================
     LOGOUT ADMIN
  ========================= */

  const logoutAdmin =
    () => {

      localStorage.clear();

      navigate("/");

    };

  /* =========================
     CHART DATA
  ========================= */

  const growthData = [
    {
      month: "Jan",
      users: 20
    },
    {
      month: "Feb",
      users: 35
    },
    {
      month: "Mar",
      users: 55
    },
    {
      month: "Apr",
      users: 70
    },
    {
      month: "May",
      users: 92
    },
    {
      month: "Jun",
      users: 124
    }
  ];

  const reportsData = [
    {
      name: "Reports",
      count: 680
    },
    {
      name: "Premium",
      count: 48
    },
    {
      name: "Today",
      count: 12
    }
  ];

  /* =========================
     UI
  ========================= */

  return (
    <div className="mainAppTheme">

      <div className="container dashboardWrap">

        <div
          style={{
            width: "100%",
            maxWidth: "1280px"
          }}
        >

          <Navbar />

          {/* HERO */}

          <div className="result heroBanner">

            <div className="heroLeft">

              <span className="heroTag">
                🛡️ Admin Panel
              </span>

              <h2 className="heroTitle">
                Manage Platform
              </h2>

              <p className="heroText">
                Control users,
                reports, growth and
                platform activities.
              </p>

            </div>

            <div className="heroRight">

              <div className="statCard">

                <span>🚀</span>

                <h3>
                  CareerPilot
                </h3>

                <p>
                  Startup Control
                </p>

              </div>

            </div>

          </div>

          {/* MAIN CARD */}

          <div className="card">

            <h1>
              🛡️ Admin Dashboard
            </h1>

            <p className="subtitle">
              Monitor business growth
              and manage users.
            </p>

            {/* STATS */}

            <div className="statsGrid">

              <div className="statCard">
                <span>👥</span>
                <h3>
                  {
                    stats.totalUsers
                  }
                </h3>
                <p>
                  Total Users
                </p>
              </div>

              <div className="statCard">
                <span>⭐</span>
                <h3>
                  {
                    stats.premiumUsers
                  }
                </h3>
                <p>
                  Premium Users
                </p>
              </div>

              <div className="statCard">
                <span>📄</span>
                <h3>
                  {
                    stats.reports
                  }
                </h3>
                <p>
                  Reports Generated
                </p>
              </div>

              <div className="statCard">
                <span>📈</span>
                <h3>
                  {
                    stats.todayUsers
                  }
                </h3>
                <p>
                  New Today
                </p>
              </div>

            </div>

            {/* CHARTS */}

            <div className="chartsGrid">

              <div className="result">

                <h2>
                  User Growth
                </h2>

                <ResponsiveContainer
                  width="100%"
                  height={260}
                >

                  <LineChart
                    data={
                      growthData
                    }
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="month"
                    />

                    <YAxis />

                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#7cd67f"
                      strokeWidth={3}
                    />

                  </LineChart>

                </ResponsiveContainer>

              </div>

              <div className="result">

                <h2>
                  Reports Stats
                </h2>

                <ResponsiveContainer
                  width="100%"
                  height={260}
                >

                  <BarChart
                    data={
                      reportsData
                    }
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="name"
                    />

                    <YAxis />

                    <Tooltip />

                    <Bar
                      dataKey="count"
                      fill="#8fdcff"
                      radius={[
                        8, 8, 0, 0
                      ]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>

            </div>

            {/* ANNOUNCEMENT */}

            <div className="result">

              <h2>
                📢 Broadcast Message
              </h2>

              <textarea
                rows="4"
                placeholder="Write announcement for all users..."
                value={
                  announcement
                }
                onChange={(e) =>
                  setAnnouncement(
                    e.target.value
                  )
                }
              />

              <button
                onClick={
                  sendAnnouncement
                }
              >
                Send Announcement
              </button>

            </div>

            {/* USERS */}

            <div className="result">

              <h2>
                👥 User Management
              </h2>

              {users.map(
                (user) => (

                  <div
                    key={user.id}
                    className="softPanel"
                    style={{
                      marginTop:
                        "14px"
                    }}
                  >

                    <p>
                      <strong>
                        {user.name}
                      </strong>
                    </p>

                    <p>
                      {user.email}
                    </p>

                    <p>
                      Plan:
                      {" "}
                      {user.plan}
                    </p>

                    <button
                      className="btnSm"
                      onClick={() =>
                        deleteUser(
                          user.id
                        )
                      }
                      style={{
                        marginTop:
                          "10px",
                        background:
                          "#fff2f2",
                        color:
                          "#e03131"
                      }}
                    >
                      Delete User
                    </button>

                  </div>

                )
              )}

            </div>

            {/* ACTIONS */}

            <div className="btnRow">

              <button
                onClick={() =>
                  navigate(
                    "/dashboard"
                  )
                }
              >
                User Dashboard
              </button>

              <button
                onClick={
                  logoutAdmin
                }
              >
                Logout
              </button>

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
              CareerPilot Admin •
              Full Control Center
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;