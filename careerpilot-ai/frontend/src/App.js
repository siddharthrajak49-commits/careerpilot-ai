// src/App.js

import React from "react";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

/* =========================
   PUBLIC PAGES
========================= */

import Login from "./Login";
import Signup from "./Signup";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";

/* =========================
   PRIVATE PAGES
========================= */

import Dashboard from "./Dashboard";
import ResumeBuilder from "./ResumeBuilder";
import InterviewCoach from "./InterviewCoach";
import ContactSupport from "./ContactSupport";
import NotificationsCenter from "./NotificationsCenter";
import Profile from "./Profile";
import Settings from "./Settings";
import Analytics from "./Analytics";
import AdminDashboard from "./AdminDashboard";

/* =========================
   SECURITY
========================= */

import ProtectedRoute from "./ProtectedRoute";

/* =========================
   FALLBACK
========================= */

import NotFound from "./NotFound";

/* =========================
   APP
========================= */

function App() {

  /* =========================
     AUTH STATE (FIXED)
  ========================= */

  const isLoggedIn =
    !!localStorage.getItem("token");

  const userEmail =
    localStorage.getItem("email");

  const isAdmin =
    userEmail === "admin@careerpilot.com"; // 👉 change this email

  return (

    <Router>

      <div className="mainAppTheme">

        <Routes>

          {/* =====================
             PUBLIC ROUTES
          ===================== */}

          {/* LOGIN */}

          <Route
            path="/"
            element={
              isLoggedIn
                ? (
                  <Navigate
                    to="/dashboard"
                    replace
                  />
                )
                : (
                  <Login />
                )
            }
          />

          {/* SIGNUP */}

          <Route
            path="/signup"
            element={
              isLoggedIn
                ? (
                  <Navigate
                    to="/dashboard"
                    replace
                  />
                )
                : (
                  <Signup />
                )
            }
          />

          {/* FORGOT PASSWORD */}

          <Route
            path="/forgot-password"
            element={
              isLoggedIn
                ? (
                  <Navigate
                    to="/dashboard"
                    replace
                  />
                )
                : (
                  <ForgotPassword />
                )
            }
          />

          {/* RESET PASSWORD (FIXED) */}

          <Route
            path="/reset-password"
            element={
              <ResetPassword />
            }
          />

          {/* =====================
             PRIVATE ROUTES
          ===================== */}

          {/* DASHBOARD */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* RESUME BUILDER */}

          <Route
            path="/resume-builder"
            element={
              <ProtectedRoute>
                <ResumeBuilder />
              </ProtectedRoute>
            }
          />

          {/* INTERVIEW */}

          <Route
            path="/interview-coach"
            element={
              <ProtectedRoute>
                <InterviewCoach />
              </ProtectedRoute>
            }
          />

          {/* SUPPORT */}

          <Route
            path="/support"
            element={
              <ProtectedRoute>
                <ContactSupport />
              </ProtectedRoute>
            }
          />

          {/* NOTIFICATIONS */}

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsCenter />
              </ProtectedRoute>
            }
          />

          {/* PROFILE */}

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* SETTINGS */}

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* ANALYTICS */}

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />

          {/* ADMIN (SECURED) */}

          <Route
            path="/admin"
            element={
              isAdmin
                ? (
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                )
                : (
                  <Navigate
                    to="/dashboard"
                    replace
                  />
                )
            }
          />

          {/* =====================
             FALLBACK
          ===================== */}

          <Route
            path="*"
            element={
              isLoggedIn
                ? (
                  <NotFound />
                )
                : (
                  <Navigate
                    to="/"
                    replace
                  />
                )
            }
          />

        </Routes>

      </div>

    </Router>

  );
}

export default App;