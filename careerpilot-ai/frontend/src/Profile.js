// src/Profile.js

import React, {
  useState,
  useEffect
} from "react";

import Swal from "sweetalert2";

import {
  useNavigate,
  Link
} from "react-router-dom";

import Navbar from "./Navbar";
import "./App.css";

function Profile() {

  const navigate =
    useNavigate();

  /* =========================
     STATE
  ========================= */

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [editing, setEditing] =
    useState(false);

  const [joinedDate, setJoinedDate] =
    useState("");

  const [resumeCount, setResumeCount] =
    useState(0);

  const [plan, setPlan] =
    useState("Premium");

  /* =========================
     LOAD DATA
  ========================= */

  useEffect(() => {

    const savedName =
      localStorage.getItem(
        "user"
      ) || "User";

    const savedEmail =
      localStorage.getItem(
        "email"
      ) || "user@email.com";

    const savedDate =
      localStorage.getItem(
        "joinedDate"
      ) ||
      new Date().toLocaleDateString();

    const history =
      JSON.parse(
        localStorage.getItem(
          "careerpilot_history"
        )
      ) || [];

    setName(savedName);
    setEmail(savedEmail);
    setJoinedDate(savedDate);
    setResumeCount(
      history.length
    );

  }, []);

  /* =========================
     SAVE PROFILE
  ========================= */

  const saveProfile = () => {

    if (!name || !email) {

      Swal.fire({
        icon: "warning",
        title:
          "Missing Fields",
        text:
          "Please fill all fields."
      });

      return;
    }

    localStorage.setItem(
      "user",
      name
    );

    localStorage.setItem(
      "email",
      email
    );

    Swal.fire({
      icon: "success",
      title:
        "Profile Updated",
      text:
        "Your profile saved successfully.",
      timer: 1500,
      showConfirmButton: false
    });

    setEditing(false);

  };

  /* =========================
     LOGOUT
  ========================= */

  const logout = () => {

    localStorage.clear();

    navigate("/");

  };

  /* =========================
     USER LETTER
  ========================= */

  const firstLetter =
    name.charAt(0).toUpperCase();

  /* =========================
     UI
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
                👤 My Profile
              </span>

              <h2 className="heroTitle">
                Welcome {name}
              </h2>

              <p className="heroText">
                Manage your account,
                settings and career
                progress here.
              </p>

            </div>

            <div className="heroRight">

              <div className="statCard">

                <span>⭐</span>

                <h3>
                  {plan}
                </h3>

                <p>
                  Membership
                </p>

              </div>

            </div>

          </div>

          {/* MAIN CARD */}

          <div className="card">

            <h1>
              👤 Profile Center
            </h1>

            <p className="subtitle">
              Manage your CareerPilot
              account details.
            </p>

            {/* AVATAR */}

            <div
              style={{
                width: "90px",
                height: "90px",
                margin:
                  "0 auto 20px",
                borderRadius:
                  "50%",
                background:
                  "#eef9ef",
                color:
                  "#2f9e44",
                display: "flex",
                justifyContent:
                  "center",
                alignItems:
                  "center",
                fontSize:
                  "36px",
                fontWeight:
                  "900"
              }}
              className="pulse"
            >
              {firstLetter}
            </div>

            {/* FORM */}

            {editing ? (
              <>

                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                />

                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                />

                <button
                  onClick={
                    saveProfile
                  }
                >
                  Save Profile
                </button>

              </>
            ) : (
              <div className="result">

                <h2
                  style={{
                    marginTop: 0
                  }}
                >
                  Account Details
                </h2>

                <p>
                  <strong>
                    Name:
                  </strong>{" "}
                  {name}
                </p>

                <p>
                  <strong>
                    Email:
                  </strong>{" "}
                  {email}
                </p>

                <p>
                  <strong>
                    Joined:
                  </strong>{" "}
                  {joinedDate}
                </p>

                <p>
                  <strong>
                    Plan:
                  </strong>{" "}
                  {plan}
                </p>

                <button
                  onClick={() =>
                    setEditing(
                      true
                    )
                  }
                >
                  Edit Profile
                </button>

              </div>
            )}

            {/* STATS */}

            <div className="statsGrid">

              <div className="statCard">

                <span>📄</span>

                <h3>
                  {resumeCount}
                </h3>

                <p>
                  Reports Created
                </p>

              </div>

              <div className="statCard">

                <span>🚀</span>

                <h3>
                  Active
                </h3>

                <p>
                  Account Status
                </p>

              </div>

              <div className="statCard">

                <span>⭐</span>

                <h3>
                  Premium
                </h3>

                <p>
                  Membership
                </p>

              </div>

              <div className="statCard">

                <span>🎯</span>

                <h3>
                  Growth
                </h3>

                <p>
                  Career Journey
                </p>

              </div>

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
                Dashboard
              </button>

              <button
                onClick={logout}
                style={{
                  background:
                    "#ffffff",
                  border:
                    "1px solid #e6efe6",
                  color:
                    "#173221"
                }}
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
              CareerPilot AI •
              Smart Career Growth
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Profile;