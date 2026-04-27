// src/AdminDashboard.js

import React, {
  useState,
  useEffect
} from "react";

import axios from "axios";
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

  const BASE_URL =
    "https://careerpilot-backend-rvv1.onrender.com";

  /* =========================
     STATE
  ========================= */

  const [users, setUsers] =
    useState([]);

  const [filteredUsers,
    setFilteredUsers] =
    useState([]);

  const [recentUsers,
    setRecentUsers] =
    useState([]);

  const [notifications,
    setNotifications] =
    useState([]);

  const [search,
    setSearch] =
    useState("");

  const [loading,
    setLoading] =
    useState(true);

  const [exporting,
    setExporting] =
    useState(false);

  const [stats, setStats] =
    useState({
      totalUsers: 0,
      premiumUsers: 0,
      reports: 0,
      todayUsers: 0
    });

  const [growthData,
    setGrowthData] =
    useState([]);

  const [reportsData,
    setReportsData] =
    useState([]);

  const [announcement,
    setAnnouncement] =
    useState("");

  /* =========================
     ADMIN SECURITY
  ========================= */

  useEffect(() => {

    const token =
      localStorage.getItem(
        "token"
      );

    const email =
      localStorage.getItem(
        "email"
      );

    if (
      !token ||
      email !==
      "admin@careerpilot.ai"
    ) {

      Swal.fire({
        icon: "warning",
        title:
          "Access Denied",
        text:
          "Admin only area."
      });

      navigate("/");
      return;
    }

    loadDashboard();
    loadNotifications();

  }, [navigate]);

  /* =========================
     AUTO REFRESH
  ========================= */

  useEffect(() => {

    const interval =
      setInterval(() => {

        loadDashboard();
        loadNotifications();

      }, 15000);

    return () =>
      clearInterval(
        interval
      );

  }, []);

  /* =========================
     COMMON HEADERS
  ========================= */

  const authHeaders =
    () => {

      const token =
        localStorage.getItem(
          "token"
        );

      return {
        Authorization:
          `Bearer ${token}`
      };

    };

  /* =========================
     LOAD DASHBOARD
  ========================= */

  const loadDashboard =
    async () => {

      try {

        setLoading(true);

        const headers =
          authHeaders();

        const statsRes =
          await axios.get(
            `${BASE_URL}/admin/stats`,
            { headers }
          );

        const usersRes =
          await axios.get(
            `${BASE_URL}/admin/users`,
            { headers }
          );

        const chartRes =
          await axios.get(
            `${BASE_URL}/admin/chart-data`,
            { headers }
          );

        const recentRes =
          await axios.get(
            `${BASE_URL}/admin/recent-signups`,
            { headers }
          );

        const allUsers =
          usersRes.data.users || [];

        setStats({
          totalUsers:
            statsRes.data.users || 0,
          premiumUsers:
            statsRes.data.premium_users || 0,
          reports:
            statsRes.data.reports || 0,
          todayUsers:
            statsRes.data.today_signups || 0
        });

        setUsers(
          allUsers
        );

        setFilteredUsers(
          allUsers
        );

        setRecentUsers(
          recentRes.data.recent_users || []
        );

        setGrowthData(
          chartRes.data.growth || []
        );

        setReportsData(
          chartRes.data.reports || []
        );

      } catch (error) {

        localStorage.clear();
        navigate("/");

      } finally {

        setLoading(false);

      }

    };
    // continued...

  /* =========================
     LIVE NOTIFICATIONS
  ========================= */

  const loadNotifications =
    async () => {

      try {

        const headers =
          authHeaders();

        const res =
          await axios.get(
            `${BASE_URL}/admin/notifications`,
            { headers }
          );

        setNotifications(
          res.data.notifications || []
        );

      } catch {

        setNotifications([]);

      }

    };

  /* =========================
     FAST SEARCH
  ========================= */

  useEffect(() => {

    const keyword =
      search
        .toLowerCase()
        .trim();

    if (!keyword) {

      setFilteredUsers(
        users
      );

      return;
    }

    const result =
      users.filter(
        (item) =>
          item.name
            .toLowerCase()
            .includes(
              keyword
            ) ||
          item.email
            .toLowerCase()
            .includes(
              keyword
            ) ||
          item.plan
            .toLowerCase()
            .includes(
              keyword
            )
      );

    setFilteredUsers(
      result
    );

  }, [search, users]);

  /* =========================
     DELETE USER
  ========================= */

  const deleteUser =
    async (id) => {

      const confirm =
        await Swal.fire({
          icon: "warning",
          title:
            "Delete User?",
          text:
            "This action cannot be undone.",
          showCancelButton:
            true,
          confirmButtonText:
            "Delete"
        });

      if (
        !confirm.isConfirmed
      ) return;

      try {

        await axios.delete(
          `${BASE_URL}/admin/delete-user/${id}`,
          {
            headers:
              authHeaders()
          }
        );

        Swal.fire({
          icon: "success",
          title:
            "Deleted",
          text:
            "User removed successfully."
        });

        loadDashboard();

      } catch {

        Swal.fire({
          icon: "error",
          title:
            "Delete Failed"
        });

      }

    };

  /* =========================
     TOGGLE PLAN
  ========================= */

  const togglePlan =
    async (id) => {

      try {

        await axios.put(
          `${BASE_URL}/admin/toggle-plan/${id}`,
          {},
          {
            headers:
              authHeaders()
          }
        );

        Swal.fire({
          icon: "success",
          title:
            "Plan Updated"
        });

        loadDashboard();

      } catch {

        Swal.fire({
          icon: "error",
          title:
            "Update Failed"
        });

      }

    };

  /* =========================
     BROADCAST MESSAGE
  ========================= */

  const sendAnnouncement =
    async () => {

      if (
        !announcement.trim()
      ) {

        Swal.fire({
          icon: "warning",
          title:
            "Empty Message",
          text:
            "Please write announcement."
        });

        return;
      }

      try {

        await axios.post(
          `${BASE_URL}/admin/broadcast`,
          {
            message:
              announcement
          },
          {
            headers:
              authHeaders()
          }
        );

        Swal.fire({
          icon: "success",
          title:
            "Broadcast Sent"
        });

        setAnnouncement("");

        loadNotifications();

      } catch {

        Swal.fire({
          icon: "error",
          title:
            "Broadcast Failed"
        });

      }

    };
    // continued...

  /* =========================
     EXPORT CSV
  ========================= */

  const exportUsersCSV =
    async () => {

      try {

        setExporting(true);

        let csv =
`ID,Name,Email,Plan,Created At\n`;

        users.forEach(
          (item) => {

            csv +=
`${item.id},${item.name},${item.email},${item.plan},${item.created_at}\n`;

          }
        );

        const blob =
          new Blob(
            [csv],
            {
              type:
              "text/csv;charset=utf-8;"
            }
          );

        const url =
          window.URL
            .createObjectURL(
              blob
            );

        const link =
          document.createElement(
            "a"
          );

        link.href = url;

        link.setAttribute(
          "download",
          "careerpilot_users.csv"
        );

        document.body
          .appendChild(
            link
          );

        link.click();

        link.remove();

      } finally {

        setExporting(false);

      }

    };

  /* =========================
     LOGOUT
  ========================= */

  const logoutAdmin =
    () => {

      localStorage.clear();

      navigate("/");

    };

  /* =========================
     UI START
  ========================= */

  return (
    <div className="mainAppTheme">

      <div
        className="container dashboardWrap"
        style={{
          background:
            "linear-gradient(180deg,#08110b,#122118)",
          minHeight:
            "100vh"
        }}
      >

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
                🛡️ Premium Admin
              </span>

              <h2 className="heroTitle">
                Manage Platform
              </h2>

              <p className="heroText">
                Real users, charts,
                reports and business
                control center.
              </p>

            </div>

            <div className="heroRight">

              <div className="statCard">

                <span>🚀</span>

                <h3>
                  CareerPilot
                </h3>

                <p>
                  SaaS Control Room
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
              Full real-time analytics
              and user management.
            </p>

            {loading ? (

              <p>
                Loading Dashboard...
              </p>

            ) : (

              <>// continued...

                {/* STATS */}

                <div className="statsGrid">

                  <div className="statCard">
                    <span>👥</span>
                    <h3>{stats.totalUsers}</h3>
                    <p>Total Users</p>
                  </div>

                  <div className="statCard">
                    <span>⭐</span>
                    <h3>{stats.premiumUsers}</h3>
                    <p>Premium Users</p>
                  </div>

                  <div className="statCard">
                    <span>📄</span>
                    <h3>{stats.reports}</h3>
                    <p>Reports</p>
                  </div>

                  <div className="statCard">
                    <span>📈</span>
                    <h3>{stats.todayUsers}</h3>
                    <p>Today Users</p>
                  </div>

                </div>

                {/* TOP ACTIONS */}

                <div
                  className="btnRow"
                  style={{
                    marginTop:"16px"
                  }}
                >

                  <button
                    onClick={
                      exportUsersCSV
                    }
                    disabled={
                      exporting
                    }
                  >
                    {
                      exporting
                      ? "Exporting..."
                      : "Export CSV"
                    }
                  </button>

                  <button
                    onClick={
                      loadDashboard
                    }
                  >
                    Refresh
                  </button>

                </div>

                {/* CHARTS */}

                <div className="chartsGrid">

                  <div className="result">

                    <h2>User Growth</h2>

                    <ResponsiveContainer
                      width="100%"
                      height={260}
                    >
                      <LineChart
                        data={growthData}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
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

                    <h2>Reports Stats</h2>

                    <ResponsiveContainer
                      width="100%"
                      height={260}
                    >
                      <BarChart
                        data={reportsData}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar
                          dataKey="count"
                          fill="#8fdcff"
                          radius={[8,8,0,0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>

                  </div>

                </div>

                {/* LIVE NOTIFICATIONS */}

                <div className="result">

                  <h2>
                    🔔 Live Notifications
                  </h2>

                  {notifications.map(
                    (item) => (
                      <div
                        key={item.id}
                        className="softPanel"
                        style={{
                          marginTop:"10px"
                        }}
                      >
                        <p>{item.text}</p>
                        <small>{item.time}</small>
                      </div>
                    )
                  )}

                </div>

                {/* BROADCAST */}

                <div className="result">

                  <h2>
                    📢 Broadcast Message
                  </h2>

                  <textarea
                    rows="4"
                    placeholder="Write announcement for all users..."
                    value={announcement}
                    onChange={(e)=>
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
                    Send Broadcast
                  </button>

                </div>

                {/* RECENT SIGNUPS */}

                <div className="result">

                  <h2>
                    🆕 Recent Signups
                  </h2>

                  {recentUsers.map(
                    (user)=>(
                      <div
                        key={user.id}
                        className="softPanel"
                        style={{
                          marginTop:"10px"
                        }}
                      >
                        <p>
                          <strong>
                            {user.name}
                          </strong>
                        </p>
                        <p>{user.email}</p>
                        <small>
                          {user.created_at}
                        </small>
                      </div>
                    )
                  )}

                </div>

                {/* USER MANAGEMENT */}

                <div className="result">

                  <h2>
                    👥 User Management
                  </h2>

                  <input
                    type="text"
                    placeholder="Search user..."
                    value={search}
                    onChange={(e)=>
                      setSearch(
                        e.target.value
                      )
                    }
                  />

                  {filteredUsers.map(
                    (user)=>(
                      <div
                        key={user.id}
                        className="softPanel"
                        style={{
                          marginTop:"14px"
                        }}
                      >
                        <p>
                          <strong>
                            {user.name}
                          </strong>
                        </p>

                        <p>{user.email}</p>

                        <p>
                          Plan: {user.plan}
                        </p>

                        <div
                          style={{
                            display:"flex",
                            gap:"10px",
                            flexWrap:"wrap",
                            marginTop:"10px"
                          }}
                        >

                          <button
                            className="btnSm"
                            onClick={()=>
                              togglePlan(
                                user.id
                              )
                            }
                          >
                            Toggle Plan
                          </button>

                          <button
                            className="btnSm"
                            onClick={()=>
                              deleteUser(
                                user.id
                              )
                            }
                            style={{
                              background:"#fff2f2",
                              color:"#e03131"
                            }}
                          >
                            Delete User
                          </button>

                        </div>
                      </div>
                    )
                  )}

                </div>

                {/* FOOTER ACTIONS */}

                <div className="btnRow">

                  <button
                    onClick={()=>
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

              </>

            )}

            <p
              style={{
                textAlign:"center",
                marginTop:"18px",
                color:"#94a398",
                fontSize:"13px"
              }}
            >
              CareerPilot Admin •
              Premium Control Center
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;