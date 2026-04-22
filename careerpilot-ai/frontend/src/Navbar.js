// src/Navbar.js

import React, {
  useState,
  useEffect
} from "react";

import {
  Link,
  useNavigate,
  useLocation
} from "react-router-dom";

function Navbar() {

  const navigate =
    useNavigate();

  const location =
    useLocation();

  /* =========================
     STATE
  ========================= */

  const [
    menuOpen,
    setMenuOpen
  ] = useState(false);

  const [
    scrolled,
    setScrolled
  ] = useState(false);

  /* =========================
     USER
  ========================= */

  const userName =
    localStorage.getItem("user") ||
    "User";

  const firstLetter =
    userName
      .charAt(0)
      .toUpperCase();

  /* =========================
     SCROLL EFFECT
  ========================= */

  useEffect(() => {

    const handleScroll =
      () => {

        if (
          window.scrollY > 20
        ) {
          setScrolled(true);
        } else {
          setScrolled(false);
        }

      };

    window.addEventListener(
      "scroll",
      handleScroll
    );

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );

  }, []);

  /* =========================
     LOGOUT
  ========================= */

  const logout =
    () => {

      localStorage.clear();

      navigate("/");

    };

  /* =========================
     HELPERS
  ========================= */

  const closeMenu =
    () =>
      setMenuOpen(false);

  const isActive =
    (path) =>
      location.pathname ===
      path
        ? "activeNav"
        : "";

  /* =========================
     UI
  ========================= */

  return (
    <div
      className="navbar"
      style={{
        boxShadow:
          scrolled
            ? "0 14px 30px rgba(18,55,30,.08)"
            : ""
      }}
    >

      {/* LEFT */}

      <div className="navLeft">

        <div className="logo">
          🚀 CareerPilot
        </div>

      </div>

      {/* MOBILE TOGGLE */}

      <div
        className="menuToggle"
        onClick={() =>
          setMenuOpen(
            !menuOpen
          )
        }
      >
        {menuOpen
          ? "✖"
          : "☰"}
      </div>

      {/* RIGHT */}

      <div
        className={`navLinks ${
          menuOpen
            ? "showMenu"
            : ""
        }`}
      >

        <Link
          to="/dashboard"
          className={isActive(
            "/dashboard"
          )}
          onClick={
            closeMenu
          }
        >
          Dashboard
        </Link>

        <Link
          to="/resume-builder"
          className={isActive(
            "/resume-builder"
          )}
          onClick={
            closeMenu
          }
        >
          Resume
        </Link>

        <Link
          to="/interview-coach"
          className={isActive(
            "/interview-coach"
          )}
          onClick={
            closeMenu
          }
        >
          Interview
        </Link>

        <Link
          to="/analytics"
          className={isActive(
            "/analytics"
          )}
          onClick={
            closeMenu
          }
        >
          Analytics
        </Link>

        <Link
          to="/notifications"
          className={isActive(
            "/notifications"
          )}
          onClick={
            closeMenu
          }
        >
          Alerts
        </Link>

        <Link
          to="/profile"
          className={isActive(
            "/profile"
          )}
          onClick={
            closeMenu
          }
        >
          Profile
        </Link>

        <Link
          to="/settings"
          className={isActive(
            "/settings"
          )}
          onClick={
            closeMenu
          }
        >
          Settings
        </Link>

        <Link
          to="/support"
          className={isActive(
            "/support"
          )}
          onClick={
            closeMenu
          }
        >
          Support
        </Link>

        {/* PROFILE */}

        <div className="navProfile">

          <div className="avatarCircle">
            {firstLetter}
          </div>

          <div className="profileMeta">

            <span className="profileName">
              {userName}
            </span>

            <small>
              Premium User
            </small>

          </div>

        </div>

        {/* LOGOUT */}

        <button
          className="navBtn"
          onClick={
            logout
          }
        >
          Logout
        </button>

      </div>

    </div>
  );
}

export default Navbar;