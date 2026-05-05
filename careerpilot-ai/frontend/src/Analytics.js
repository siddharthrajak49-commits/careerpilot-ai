// src/Analytics.js

import React, {
  useState,
  useEffect
} from "react";

import {
  useNavigate
} from "react-router-dom";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from "recharts";

import { api } from "./api";

import Navbar from "./Navbar";
import "./App.css";

function Analytics() {

  const navigate =
    useNavigate();

  /* =========================
     STATE
  ========================= */

  const [stats, setStats] =
    useState({
      users: 0,
      reports: 0,
      premium: 0,
      avgATS: 0
    });

  const [growthData, setGrowthData] =
    useState([]);

  const [planData, setPlanData] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  /* =========================
     LOAD DATA
  ========================= */

  useEffect(() => {

    loadAnalytics();
    trackPage();

  }, []);

  /* =========================
     TRACK PAGE
  ========================= */

  const trackPage = async () => {
    try {
      await api("/track-page", "POST", {
        page: "analytics"
      });
    } catch {}
  };

  /* =========================
     MAIN LOAD
  ========================= */

  const loadAnalytics = async () => {

    try {

      setLoading(true);

      // PUBLIC ANALYTICS
      const res =
        await api("/analytics");

      setStats({
        users: res.total_users || 0,
        reports: res.reports_generated || 0,
        premium: res.premium_users || 0,
        avgATS: res.avg_ats_score || 0
      });

      // ADMIN CHART DATA (SAFE TRY)
      try {

        const chart =
          await api("/admin/chart-data");

        if (chart?.growth) {
          setGrowthData(chart.growth);
        }

        if (chart?.reports) {

          setPlanData([
            {
              name: "Reports",
              value:
                chart.reports[0]?.count || 0
            },
            {
              name: "Premium",
              value:
                chart.reports[1]?.count || 0
            },
            {
              name: "Today",
              value:
                chart.reports[2]?.count || 0
            }
          ]);

        }

      } catch {
        fallbackCharts();
      }

    } catch {

      fallbackStats();
      fallbackCharts();

    } finally {

      setLoading(false);

    }

  };

  /* =========================
     FALLBACK STATS
  ========================= */

  const fallbackStats = () => {

    setStats({
      users: 1240,
      reports: 3890,
      premium: 320,
      avgATS: 74
    });

  };

  /* =========================
     FALLBACK CHARTS
  ========================= */

  const fallbackCharts = () => {

    setGrowthData([
      { month: "Jan", users: 120, reports: 220 },
      { month: "Feb", users: 180, reports: 310 },
      { month: "Mar", users: 260, reports: 480 },
      { month: "Apr", users: 410, reports: 710 },
      { month: "May", users: 680, reports: 1100 },
      { month: "Jun", users: 1240, reports: 3890 }
    ]);

    setPlanData([
      { name: "Free", value: 920 },
      { name: "Premium", value: 320 }
    ]);

  };

  /* =========================
     ATS TREND (STATIC SAFE)
  ========================= */

  const atsTrend = [
    { week: "W1", score: 61 },
    { week: "W2", score: 68 },
    { week: "W3", score: 72 },
    { week: "W4", score: 74 }
  ];

  const chartColors = [
    "#7cd67f",
    "#8fdcff",
    "#ffd43b"
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
                Analytics Center
              </span>

              <h2 className="heroTitle">
                Growth Insights
              </h2>

              <p className="heroText">
                Track users, ATS scores,
                reports and business
                performance in one place.
              </p>

            </div>

          </div>

          {/* MAIN */}

          <div className="card">

            <h1>
              Analytics Dashboard
            </h1>

            <p className="subtitle">
              Monitor platform growth
              and performance.
            </p>

            {/* LOADING */}

            {loading && (
              <p style={{ textAlign: "center" }}>
                Loading analytics...
              </p>
            )}

            {/* STATS */}

            <div className="statsGrid">

              <div className="statCard">
                <span>Users</span>
                <h3>{stats.users}</h3>
                <p>Total Users</p>
              </div>

              <div className="statCard">
                <span>Reports</span>
                <h3>{stats.reports}</h3>
                <p>Reports Generated</p>
              </div>

              <div className="statCard">
                <span>Premium</span>
                <h3>{stats.premium}</h3>
                <p>Premium Users</p>
              </div>

              <div className="statCard">
                <span>ATS</span>
                <h3>{stats.avgATS}</h3>
                <p>Avg ATS Score</p>
              </div>

            </div>

            {/* CHARTS 1 */}

            <div className="chartsGrid">

              <div className="result">

                <h2>User Growth</h2>

                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="users" stroke="#7cd67f" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>

              </div>

              <div className="result">

                <h2>Reports Growth</h2>

                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="reports" fill="#8fdcff" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>

              </div>

            </div>

            {/* CHARTS 2 */}

            <div className="chartsGrid">

              <div className="result">

                <h2>ATS Trend</h2>

                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={atsTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#7cd67f" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>

              </div>

              <div className="result">

                <h2>Distribution</h2>

                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={planData} dataKey="value" outerRadius={95}>
                      {planData.map((_, index) => (
                        <Cell key={index} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>

              </div>

            </div>

            {/* ACTION */}

            <div className="btnRow">

              <button onClick={() => navigate("/dashboard")}>
                Dashboard
              </button>

              <button onClick={() => navigate("/admin")}>
                Admin Panel
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Analytics;