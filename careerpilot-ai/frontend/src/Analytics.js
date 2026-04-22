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

  /* =========================
     LOAD DATA
  ========================= */

  useEffect(() => {

    // Replace later with backend API

    setStats({
      users: 1240,
      reports: 3890,
      premium: 320,
      avgATS: 74
    });

  }, []);

  /* =========================
     CHART DATA
  ========================= */

  const growthData = [
    { month: "Jan", users: 120, reports: 220 },
    { month: "Feb", users: 180, reports: 310 },
    { month: "Mar", users: 260, reports: 480 },
    { month: "Apr", users: 410, reports: 710 },
    { month: "May", users: 680, reports: 1100 },
    { month: "Jun", users: 1240, reports: 3890 }
  ];

  const atsTrend = [
    { week: "W1", score: 61 },
    { week: "W2", score: 68 },
    { week: "W3", score: 72 },
    { week: "W4", score: 74 }
  ];

  const planData = [
    {
      name: "Free",
      value: 920
    },
    {
      name: "Premium",
      value: 320
    }
  ];

  const chartColors = [
    "#7cd67f",
    "#8fdcff"
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
                📊 Analytics Center
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

            <div className="heroRight">

              <div className="statCard">

                <span>🚀</span>

                <h3>
                  Live Data
                </h3>

                <p>
                  Smart Decisions
                </p>

              </div>

            </div>

          </div>

          {/* MAIN CARD */}

          <div className="card">

            <h1>
              📈 Analytics Dashboard
            </h1>

            <p className="subtitle">
              Monitor platform growth
              and performance.
            </p>

            {/* STATS */}

            <div className="statsGrid">

              <div className="statCard">
                <span>👥</span>
                <h3>
                  {stats.users}
                </h3>
                <p>
                  Total Users
                </p>
              </div>

              <div className="statCard">
                <span>📄</span>
                <h3>
                  {stats.reports}
                </h3>
                <p>
                  Reports Generated
                </p>
              </div>

              <div className="statCard">
                <span>⭐</span>
                <h3>
                  {stats.premium}
                </h3>
                <p>
                  Premium Users
                </p>
              </div>

              <div className="statCard">
                <span>🎯</span>
                <h3>
                  {stats.avgATS}
                </h3>
                <p>
                  Avg ATS Score
                </p>
              </div>

            </div>

            {/* CHARTS ROW 1 */}

            <div className="chartsGrid">

              {/* User Growth */}

              <div className="result">

                <h2>
                  User Growth
                </h2>

                <ResponsiveContainer
                  width="100%"
                  height={280}
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

                    <Legend />

                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#7cd67f"
                      strokeWidth={3}
                    />

                  </LineChart>

                </ResponsiveContainer>

              </div>

              {/* Reports */}

              <div className="result">

                <h2>
                  Reports Growth
                </h2>

                <ResponsiveContainer
                  width="100%"
                  height={280}
                >

                  <BarChart
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

                    <Bar
                      dataKey="reports"
                      fill="#8fdcff"
                      radius={[
                        8, 8, 0, 0
                      ]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>

            </div>

            {/* CHARTS ROW 2 */}

            <div className="chartsGrid">

              {/* ATS Trend */}

              <div className="result">

                <h2>
                  ATS Trend
                </h2>

                <ResponsiveContainer
                  width="100%"
                  height={280}
                >

                  <LineChart
                    data={atsTrend}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="week"
                    />

                    <YAxis />

                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#7cd67f"
                      strokeWidth={3}
                    />

                  </LineChart>

                </ResponsiveContainer>

              </div>

              {/* Plans */}

              <div className="result">

                <h2>
                  User Plans
                </h2>

                <ResponsiveContainer
                  width="100%"
                  height={280}
                >

                  <PieChart>

                    <Pie
                      data={planData}
                      dataKey="value"
                      outerRadius={95}
                    >

                      {chartColors.map(
                        (
                          color,
                          index
                        ) => (

                          <Cell
                            key={index}
                            fill={color}
                          />

                        )
                      )}

                    </Pie>

                    <Tooltip />
                    <Legend />

                  </PieChart>

                </ResponsiveContainer>

              </div>

            </div>

            {/* INSIGHTS */}

            <div className="result">

              <h2>
                🤖 AI Insights
              </h2>

              <ul>

                <li>
                  Premium users are
                  growing steadily.
                </li>

                <li>
                  Average ATS score
                  improved this month.
                </li>

                <li>
                  Reports generated
                  increased sharply.
                </li>

                <li>
                  June had highest
                  user signup growth.
                </li>

              </ul>

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
                onClick={() =>
                  navigate(
                    "/admin"
                  )
                }
              >
                Admin Panel
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
              CareerPilot Analytics •
              Data Driven Growth
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Analytics;