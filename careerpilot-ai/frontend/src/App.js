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

  const token =
    localStorage.getItem("token");

  return (

    <Router>

      <div className="mainAppTheme">

        <Routes>

          {/* =====================
             PUBLIC ROUTES
          ===================== */}

          {/* Login */}

          <Route
            path="/"
            element={
              token
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

          {/* Signup */}

          <Route
            path="/signup"
            element={
              token
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

          {/* Forgot Password */}

          <Route
            path="/forgot-password"
            element={
              token
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

          {/* Reset Password */}

          <Route
            path="/reset-password/:token"
            element={
              <ResetPassword />
            }
          />

          {/* =====================
             PRIVATE ROUTES
          ===================== */}

          {/* Dashboard */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Resume Builder */}

          <Route
            path="/resume-builder"
            element={
              <ProtectedRoute>
                <ResumeBuilder />
              </ProtectedRoute>
            }
          />

          {/* Interview Coach */}

          <Route
            path="/interview-coach"
            element={
              <ProtectedRoute>
                <InterviewCoach />
              </ProtectedRoute>
            }
          />

          {/* Support */}

          <Route
            path="/support"
            element={
              <ProtectedRoute>
                <ContactSupport />
              </ProtectedRoute>
            }
          />

          {/* Notifications */}

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsCenter />
              </ProtectedRoute>
            }
          />

          {/* Profile */}

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Settings */}

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Analytics */}

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />

          {/* Admin */}

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* =====================
             FALLBACK ROUTE
          ===================== */}

          <Route
            path="*"
            element={
              token
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