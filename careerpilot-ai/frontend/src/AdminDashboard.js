// src/AdminDashboard.js

import React, { useState, useEffect, useCallback } from "react";

import axios from "axios";
import Swal from "sweetalert2";

import { useNavigate } from "react-router-dom";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import Navbar from "./Navbar";
import "./App.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const BASE_URL = "https://careerpilot-backend-rvv1.onrender.com";

  /* =========================
     STATE
  ========================= */

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [stats, setStats] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    reports: 0,
    todayUsers: 0,
  });

  const [growthData, setGrowthData] = useState([]);
  const [reportsData, setReportsData] = useState([]);

  const [announcement, setAnnouncement] = useState("");

  /* =========================
     AUTH HEADER
  ========================= */

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  /* =========================
     LOAD DASHBOARD
  ========================= */

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);

      const headers = authHeaders();

      const statsRes = await axios.get(`${BASE_URL}/admin/stats`, { headers });

      const usersRes = await axios.get(`${BASE_URL}/admin/users`, { headers });

      const chartRes = await axios.get(`${BASE_URL}/admin/chart-data`, { headers });

      const recentRes = await axios.get(`${BASE_URL}/admin/recent-signups`, { headers });

      const allUsers = usersRes.data.users || [];

      setStats({
        totalUsers: statsRes.data.users || 0,
        premiumUsers: statsRes.data.premium_users || 0,
        reports: statsRes.data.reports || 0,
        todayUsers: statsRes.data.today_signups || 0,
      });

      setUsers(allUsers);
      setFilteredUsers(allUsers);

      setRecentUsers(recentRes.data.recent_users || []);

      setGrowthData(chartRes.data.growth || []);

      setReportsData(chartRes.data.reports || []);
    } catch {
      localStorage.clear();

      Swal.fire({
        icon: "error",
        title: "Session Expired",
      });

      navigate("/");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  /* =========================
     LOAD NOTIFICATIONS
  ========================= */

  const loadNotifications = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/admin/notifications`, { headers: authHeaders() });

      setNotifications(res.data.notifications || []);
    } catch {
      setNotifications([]);
    }
  }, []);

  /* =========================
     ADMIN SECURITY
  ========================= */

  useEffect(() => {
    const token = localStorage.getItem("token");

    const email = localStorage.getItem("email");

    if (!token || email !== "admin@careerpilot.ai") {
      Swal.fire({
        icon: "warning",
        title: "Access Denied",
        text: "Admin only area.",
      });

      navigate("/");
      return;
    }

    const verifyAdmin = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/verify-token`, { headers: authHeaders() });

        if (!res.data.valid) throw new Error();

        loadDashboard();
        loadNotifications();
      } catch {
        localStorage.clear();

        Swal.fire({
          icon: "error",
          title: "Session Expired",
        });

        navigate("/");
      }
    };

    verifyAdmin();
  }, [navigate, loadDashboard, loadNotifications]);

  /* =========================
     AUTO REFRESH
  ========================= */

  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboard();
      loadNotifications();
    }, 25000);

    return () => clearInterval(interval);
  }, [loadDashboard, loadNotifications]);

  /* =========================
     SEARCH
  ========================= */

  useEffect(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) {
      setFilteredUsers(users);
      return;
    }

    const result = users.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.email.toLowerCase().includes(keyword) ||
        item.plan.toLowerCase().includes(keyword),
    );

    setFilteredUsers(result);
  }, [search, users]);

  /* =========================
     DELETE USER
  ========================= */

  const deleteUser = async (id) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Delete User?",
      text: "This action cannot be undone.",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`${BASE_URL}/admin/delete-user/${id}`, { headers: authHeaders() });

      Swal.fire({
        icon: "success",
        title: "Deleted",
      });

      loadDashboard();
    } catch {
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
      });
    }
  };

  /* =========================
     TOGGLE PLAN
  ========================= */

  const togglePlan = async (id) => {
    try {
      await axios.put(`${BASE_URL}/admin/toggle-plan/${id}`, {}, { headers: authHeaders() });

      Swal.fire({
        icon: "success",
        title: "Plan Updated",
      });

      loadDashboard();
    } catch {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
      });
    }
  };

  /* =========================
     BROADCAST
  ========================= */

  const sendAnnouncement = async () => {
    if (!announcement.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Empty Message",
      });

      return;
    }

    try {
      await axios.post(
        `${BASE_URL}/admin/broadcast`,
        { message: announcement },
        { headers: authHeaders() },
      );

      Swal.fire({
        icon: "success",
        title: "Broadcast Sent",
      });

      setAnnouncement("");
      loadNotifications();
    } catch {
      Swal.fire({
        icon: "error",
        title: "Broadcast Failed",
      });
    }
  };

  /* =========================
     EXPORT CSV
  ========================= */

  const exportUsersCSV = async () => {
    try {
      setExporting(true);

      let csv = `ID,Name,Email,Plan,Created At\n`;

      users.forEach((u) => {
        csv += `"${u.id}","${u.name}","${u.email}","${u.plan}","${u.created_at}"\n`;
      });

      const blob = new Blob([csv], { type: "text/csv" });

      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");

      a.href = url;
      a.download = "users.csv";
      a.click();
    } finally {
      setExporting(false);
    }
  };

  /* =========================
     LOGOUT
  ========================= */

  const logoutAdmin = () => {
    localStorage.clear();
    navigate("/");
  };

  /* =========================
     UI
  ========================= */

  return (
    <div className="mainAppTheme">
      <div className="container dashboardWrap">
        <div style={{ maxWidth: "1280px", width: "100%" }}>
          <Navbar />

          <div className="card">
            <h1>Admin Dashboard</h1>

            {loading ? (
              <p>Loading...</p>
            ) : (
              <>
                <div className="statsGrid">
                  <div className="statCard">
                    <h3>{stats.totalUsers}</h3>
                    <p>Users</p>
                  </div>

                  <div className="statCard">
                    <h3>{stats.premiumUsers}</h3>
                    <p>Premium</p>
                  </div>

                  <div className="statCard">
                    <h3>{stats.reports}</h3>
                    <p>Reports</p>
                  </div>

                  <div className="statCard">
                    <h3>{stats.todayUsers}</h3>
                    <p>Today</p>
                  </div>
                </div>

                <div className="chartsGrid">
                  <div className="result">
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={growthData}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line dataKey="users" stroke="#7cd67f" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="result">
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={reportsData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8fdcff" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <input
                  placeholder="Search user"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                {filteredUsers.map((u) => (
                  <div key={u.id} className="softPanel" style={{ marginTop: "12px" }}>
                    <p>
                      <strong>{u.name}</strong>
                    </p>

                    <p>{u.email}</p>

                    <p>Plan: {u.plan}</p>

                    <div style={{ display: "flex", gap: "10px" }}>
                      <button className="btnSm" onClick={() => togglePlan(u.id)}>
                        Toggle Plan
                      </button>

                      <button
                        className="btnSm"
                        onClick={() => deleteUser(u.id)}
                        style={{
                          background: "#fff2f2",
                          color: "#e03131",
                        }}
                      >
                        Delete User
                      </button>
                    </div>
                  </div>
                ))}

                <textarea
                  rows="4"
                  placeholder="Write announcement..."
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                />

                <button onClick={sendAnnouncement} disabled={!announcement.trim()}>
                  Broadcast
                </button>

                <button onClick={exportUsersCSV} disabled={exporting}>
                  {exporting ? "Exporting..." : "Export CSV"}
                </button>

                <button onClick={logoutAdmin}>Logout</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
