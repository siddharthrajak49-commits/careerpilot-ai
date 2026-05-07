// src/Navbar.js

import React, { useState, useEffect, useRef } from "react";

import { Link, useNavigate, useLocation } from "react-router-dom";

import { api } from "./api";

function Navbar() {
  const navigate = useNavigate();

  const location = useLocation();

  const profileRef = useRef(null);

  /* =========================
     STATE
  ========================= */

  const [menuOpen, setMenuOpen] = useState(false);

  const [profileOpen, setProfileOpen] = useState(false);

  const [scrolled, setScrolled] = useState(false);

  const [userName, setUserName] = useState("User");

  const [photo, setPhoto] = useState("");

  const [plan, setPlan] = useState("");

  const [email, setEmail] = useState("");

  /* =========================
     LOAD USER
  ========================= */

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) return;

        const res = await api("/me", "GET", null, token);

        setUserName(res.name || "User");

        setPhoto(res.photo || localStorage.getItem("avatar") || "");

        setPlan(res.plan || "");

        setEmail(res.email || "");
      } catch {
        setUserName(localStorage.getItem("user") || "User");

        setPhoto(localStorage.getItem("avatar") || "");

        setEmail(localStorage.getItem("email") || "");
      }
    };

    fetchUser();
  }, []);
  /* =========================
   REALTIME LOCAL SYNC
========================= */

  useEffect(() => {
    const syncUser = () => {
      setUserName(localStorage.getItem("user") || "User");

      setPhoto(localStorage.getItem("avatar") || "");

      setPlan(localStorage.getItem("plan") || "");

      setEmail(localStorage.getItem("email") || "");
    };

    window.addEventListener("storage", syncUser);

    syncUser();

    return () => {
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  /* =========================
     USER LETTER
  ========================= */

  const firstLetter = userName?.charAt(0)?.toUpperCase() || "U";

  /* =========================
     SCROLL EFFECT
  ========================= */

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* =========================
     CLOSE MENU ON ROUTE
  ========================= */

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  /* =========================
     CLOSE PROFILE OUTSIDE
  ========================= */

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* =========================
     LOGOUT
  ========================= */

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("email");
    localStorage.removeItem("avatar");
    localStorage.removeItem("plan");

    navigate("/");
  };

  /* =========================
     HELPERS
  ========================= */

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path ? "activeNav" : "";
  };

  /* =========================
     UI
  ========================= */

  return (
    <div
      className="navbar"
      style={{
        boxShadow: scrolled ? "0 14px 30px rgba(18,55,30,.08)" : "none",
      }}
    >
      {/* LEFT */}

      <div className="navLeft">
        <div
          className="logo"
          onClick={() => navigate("/dashboard")}
          style={{
            cursor: "pointer",
          }}
        >
          🚀 CareerPilot
        </div>
      </div>

      {/* MOBILE TOGGLE */}

      <div className="menuToggle" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? "✖" : "☰"}
      </div>

      {/* NAV LINKS */}

      <div className={`navLinks ${menuOpen ? "showMenu" : ""}`}>
        <Link to="/dashboard" className={isActive("/dashboard")} onClick={closeMenu}>
          Dashboard
        </Link>

        <Link to="/resume-builder" className={isActive("/resume-builder")} onClick={closeMenu}>
          Resume
        </Link>

        <Link to="/interview-coach" className={isActive("/interview-coach")} onClick={closeMenu}>
          Interview
        </Link>

        <Link to="/profile" className={isActive("/profile")} onClick={closeMenu}>
          Profile
        </Link>

        {/* PROFILE */}

        <div
          className="navProfile"
          ref={profileRef}
          onClick={(e) => {
            e.stopPropagation();

            setProfileOpen(!profileOpen);
          }}
          style={{
            cursor: "pointer",
            position: "relative",
          }}
        >
          {photo ? (
            <img
              src={photo}
              alt="profile"
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #e7f5ea",
              }}
            />
          ) : (
            <div className="avatarCircle">{firstLetter}</div>
          )}

          <div className="profileMeta">
            <span className="profileName">{userName}</span>

            {plan === "Premium" && (
              <small
                style={{
                  color: "#f59f00",
                  fontWeight: "700",
                }}
              >
                ⭐ Premium
              </small>
            )}
          </div>

          {/* DROPDOWN */}

          {profileOpen && (
            <div
              style={{
                position: "absolute",
                top: "55px",
                right: "0",
                minWidth: "220px",
                background: "#ffffff",
                border: "1px solid #edf2ee",
                borderRadius: "14px",
                padding: "10px",
                boxShadow: "0 16px 35px rgba(0,0,0,.08)",
                zIndex: 999,
              }}
            >
              <div
                style={{
                  padding: "10px",
                  borderBottom: "1px solid #f1f3f2",
                  marginBottom: "8px",
                }}
              >
                <strong>{userName}</strong>

                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    color: "#94a398",
                  }}
                >
                  {email}
                </p>
              </div>

              <Link
                to="/profile"
                onClick={closeMenu}
                style={{
                  display: "block",
                  padding: "10px",
                }}
              >
                👤 My Profile
              </Link>

              <Link
                to="/dashboard"
                onClick={closeMenu}
                style={{
                  display: "block",
                  padding: "10px",
                }}
              >
                🚀 Dashboard
              </Link>

              <div
                onClick={logout}
                style={{
                  padding: "10px",
                  cursor: "pointer",
                  color: "#e03131",
                  fontWeight: "700",
                }}
              >
                Logout
              </div>
            </div>
          )}
        </div>

        {/* LOGOUT BUTTON */}

        <button className="navBtn" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;
