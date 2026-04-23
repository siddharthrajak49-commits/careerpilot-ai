// src/Profile.js

import React, {
  useState,
  useEffect
} from "react";

import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

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

  const [phone, setPhone] =
    useState("");

  const [city, setCity] =
    useState("");

  const [bio, setBio] =
    useState("");

  const [editing, setEditing] =
    useState(false);

  const [joinedDate, setJoinedDate] =
    useState("");

  const [resumeCount, setResumeCount] =
    useState(0);

  const [profileViews] =
    useState(128);

  const [plan, setPlan] =
    useState("Free");

  const [avatar, setAvatar] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  /* =========================
     LOAD DATA
  ========================= */

  useEffect(() => {

    const history =
      JSON.parse(
        localStorage.getItem(
          "careerpilot_history"
        )
      ) || [];

    setResumeCount(
      history.length
    );

    setJoinedDate(
      localStorage.getItem(
        "joinedDate"
      ) ||
      new Date().toLocaleDateString()
    );

    setAvatar(
      localStorage.getItem(
        "photo"
      ) ||
      localStorage.getItem(
        "avatar"
      ) ||
      ""
    );

    loadProfile();

  }, []);

  /* =========================
     BACKEND PROFILE LOAD
  ========================= */

  const loadProfile =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {

          fallbackLocal();
          return;

        }

        const res =
          await axios.get(
            "https://careerpilot-backend-rvv1.onrender.com/me",
            {
              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }
          );

        const data =
          res.data;

        setName(
          data.name || "User"
        );

        setEmail(
          data.email || ""
        );

        setPhone(
          data.phone || ""
        );

        setCity(
          data.city || ""
        );

        setBio(
          data.bio ||
          "Building my dream career with CareerPilot."
        );

        setPlan(
          data.plan || "Free"
        );

        localStorage.setItem(
          "user",
          data.name || "User"
        );

        localStorage.setItem(
          "email",
          data.email || ""
        );

      } catch {

        fallbackLocal();

      }

    };

  /* =========================
     FALLBACK LOCAL
  ========================= */

  const fallbackLocal =
    () => {

      setName(
        localStorage.getItem(
          "user"
        ) || "User"
      );

      setEmail(
        localStorage.getItem(
          "email"
        ) || ""
      );

      setPhone(
        localStorage.getItem(
          "phone"
        ) || ""
      );

      setCity(
        localStorage.getItem(
          "city"
        ) || ""
      );

      setBio(
        localStorage.getItem(
          "bio"
        ) ||
        "Building my dream career with CareerPilot."
      );

      setPlan(
        localStorage.getItem(
          "plan"
        ) || "Free"
      );

    };

  /* =========================
     SAVE PROFILE
  ========================= */

  const saveProfile =
    async () => {

      if (!name || !email) {

        Swal.fire({
          icon: "warning",
          title:
            "Missing Fields",
          text:
            "Name and Email required."
        });

        return;

      }

      try {

        setLoading(true);

        const token =
          localStorage.getItem(
            "token"
          );

        await axios.post(
          "https://careerpilot-backend-rvv1.onrender.com/profile/update",
          {
            name,
            email,
            phone,
            city,
            bio
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      } catch {}

      localStorage.setItem(
        "user",
        name
      );

      localStorage.setItem(
        "email",
        email
      );

      localStorage.setItem(
        "phone",
        phone
      );

      localStorage.setItem(
        "city",
        city
      );

      localStorage.setItem(
        "bio",
        bio
      );

      Swal.fire({
        icon: "success",
        title:
          "Profile Updated",
        text:
          "Saved successfully.",
        timer: 1400,
        showConfirmButton: false
      });

      setEditing(false);
      setLoading(false);

    };

  /* =========================
     AVATAR
  ========================= */

  const handleAvatar =
    (e) => {

      const file =
        e.target.files[0];

      if (!file) return;

      const reader =
        new FileReader();

      reader.onloadend =
        () => {

          setAvatar(
            reader.result
          );

          localStorage.setItem(
            "avatar",
            reader.result
          );

        };

      reader.readAsDataURL(
        file
      );

    };

  /* =========================
     CHANGE PASSWORD
  ========================= */

  const changePassword =
    () => {

      Swal.fire({
        icon: "info",
        title:
          "Use Forgot Password",
        text:
          "Password reset available on login page."
      });

    };

  /* =========================
     LOGOUT
  ========================= */

  const logout =
    () => {

      localStorage.clear();
      navigate("/");

    };

  const firstLetter =
    name
      ?.charAt(0)
      ?.toUpperCase() || "U";

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
                👤 Profile Center
              </span>

              <h2 className="heroTitle">
                Welcome {name}
              </h2>

              <p className="heroText">
                Manage your account,
                membership and
                career growth.
              </p>

            </div>

            <div className="heroRight">

              <div className="statCard">

                <span>⭐</span>
                <h3>{plan}</h3>
                <p>Membership</p>

              </div>

            </div>

          </div>

          {/* MAIN */}

          <div className="card">

            <h1>
              👤 My Profile
            </h1>

            <p className="subtitle">
              Premium Profile Dashboard
            </p>

            {/* AVATAR */}

            <div
              style={{
                textAlign:
                  "center"
              }}
            >

              {avatar ? (

                <img
                  src={avatar}
                  alt="avatar"
                  style={{
                    width: "95px",
                    height: "95px",
                    borderRadius:
                      "50%",
                    objectFit:
                      "cover"
                  }}
                />

              ) : (

                <div
                  className="pulse"
                  style={{
                    width: "95px",
                    height: "95px",
                    borderRadius:
                      "50%",
                    background:
                      "#eef9ef",
                    color:
                      "#2f9e44",
                    fontSize:
                      "38px",
                    fontWeight:
                      "900",
                    display:
                      "flex",
                    justifyContent:
                      "center",
                    alignItems:
                      "center",
                    margin:
                      "0 auto"
                  }}
                >
                  {firstLetter}
                </div>

              )}

              <input
                type="file"
                onChange={
                  handleAvatar
                }
              />

            </div>

            {/* FORM */}

            {editing ? (

              <>

                <input
                  value={name}
                  onChange={(e)=>
                    setName(
                      e.target.value
                    )
                  }
                  placeholder="Full Name"
                />

                <input
                  value={email}
                  onChange={(e)=>
                    setEmail(
                      e.target.value
                    )
                  }
                  placeholder="Email"
                />

                <input
                  value={phone}
                  onChange={(e)=>
                    setPhone(
                      e.target.value
                    )
                  }
                  placeholder="Phone"
                />

                <input
                  value={city}
                  onChange={(e)=>
                    setCity(
                      e.target.value
                    )
                  }
                  placeholder="City"
                />

                <textarea
                  value={bio}
                  onChange={(e)=>
                    setBio(
                      e.target.value
                    )
                  }
                  placeholder="Bio"
                />

                <button
                  onClick={
                    saveProfile
                  }
                  disabled={
                    loading
                  }
                >
                  {loading
                    ? "Saving..."
                    : "Save Profile"}
                </button>

              </>

            ) : (

              <div className="result">

                <h2>
                  Account Details
                </h2>

                <p><strong>Name:</strong> {name}</p>
                <p><strong>Email:</strong> {email}</p>
                <p><strong>Phone:</strong> {phone || "N/A"}</p>
                <p><strong>City:</strong> {city || "N/A"}</p>
                <p><strong>Joined:</strong> {joinedDate}</p>
                <p><strong>Plan:</strong> {plan}</p>
                <p><strong>Bio:</strong> {bio}</p>

                <button
                  onClick={() =>
                    setEditing(true)
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
                <h3>{resumeCount}</h3>
                <p>Reports</p>
              </div>

              <div className="statCard">
                <span>👀</span>
                <h3>{profileViews}</h3>
                <p>Views</p>
              </div>

              <div className="statCard">
                <span>⭐</span>
                <h3>{plan}</h3>
                <p>Plan</p>
              </div>

              <div className="statCard">
                <span>🚀</span>
                <h3>Active</h3>
                <p>Status</p>
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
                onClick={
                  changePassword
                }
              >
                Change Password
              </button>

              <button
                onClick={
                  logout
                }
                style={{
                  background:
                    "#fff",
                  color:
                    "#173221",
                  border:
                    "1px solid #e6efe6"
                }}
              >
                Logout
              </button>

            </div>

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