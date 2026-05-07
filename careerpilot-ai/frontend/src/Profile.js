// src/Profile.js

import React, {
  useState,
  useEffect
} from "react";

import { api } from "./api";

import Swal from "sweetalert2";

import {
  useNavigate
} from "react-router-dom";

import Navbar from "./Navbar";

import "./App.css";

function Profile() {

  const navigate =
    useNavigate();

  /* =========================
     STATE
  ========================= */

  const [
    name,
    setName
  ] = useState("");

  const [
    email,
    setEmail
  ] = useState("");

  const [
    phone,
    setPhone
  ] = useState("");

  const [
    city,
    setCity
  ] = useState("");

  const [
    bio,
    setBio
  ] = useState("");

  const [
    editing,
    setEditing
  ] = useState(false);

  const [
    joinedDate,
    setJoinedDate
  ] = useState("");

  const [
    resumeCount,
    setResumeCount
  ] = useState(0);

  const [
    profileViews
  ] = useState(128);

  const [
    plan,
    setPlan
  ] = useState("Premium");

  const [
    avatar,
    setAvatar
  ] = useState("");

  const [
    loading,
    setLoading
  ] = useState(false);

  const [
    uploadLoading,
    setUploadLoading
  ] = useState(false);

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
        "avatar"
      ) ||
      localStorage.getItem(
        "photo"
      ) ||
      ""
    );

    loadProfile();

  }, []);

  /* =========================
     LOAD PROFILE
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
          await api(
            "/me",
            "GET",
            null,
            token
          );

        const data =
          res || {};

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
          "Building my dream career with CareerPilot AI."
        );

        setPlan(
          data.plan || "Premium"
        );

        setAvatar(
          data.photo || ""
        );

        localStorage.setItem(
          "user",
          data.name || "User"
        );

        localStorage.setItem(
          "email",
          data.email || ""
        );

        localStorage.setItem(
          "phone",
          data.phone || ""
        );

        localStorage.setItem(
          "city",
          data.city || ""
        );

        localStorage.setItem(
          "bio",
          data.bio || ""
        );

        localStorage.setItem(
          "avatar",
          data.photo || ""
        );

        localStorage.setItem(
          "plan",
          data.plan || "Premium"
        );

      } catch (err) {

        console.log(
          "Profile load failed",
          err
        );

        fallbackLocal();

      }

    };

  /* =========================
     LOCAL FALLBACK
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
        "Building my dream career with CareerPilot AI."
      );

      setPlan(
        localStorage.getItem(
          "plan"
        ) || "Premium"
      );

      setAvatar(
        localStorage.getItem(
          "avatar"
        ) || ""
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
          title: "Missing Fields",
          text: "Name and Email required."
        });

        return;
      }

      try {

        setLoading(true);

        const token =
          localStorage.getItem(
            "token"
          );

        const response =
          await api(
            "/profile/update",
            "POST",
            {
              name,
              phone,
              city,
              bio
            },
            token
          );

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
        window.dispatchEvent(new Event("storage"));

        Swal.fire({
          icon: "success",
          title: "Profile Updated",
          text:
            response?.message ||
            "Saved successfully.",
          timer: 1600,
          showConfirmButton: false
        });

        setEditing(false);

      } catch (err) {

        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text:
            err?.message ||
            "Backend profile update failed"
        });

      } finally {

        setLoading(false);

      }

    };

  /* =========================
     AVATAR UPLOAD
  ========================= */

  const handleAvatar =
    async (e) => {

      const file =
        e.target.files[0];

      if (!file) return;

      const allowed =
        [
          "image/png",
          "image/jpeg",
          "image/jpg"
        ];

      if (
        !allowed.includes(
          file.type
        )
      ) {

        Swal.fire({
          icon: "error",
          title: "Invalid Image",
          text: "Only PNG/JPG allowed"
        });

        return;
      }

      try {

        setUploadLoading(true);

        const token =
          localStorage.getItem(
            "token"
          );

        const formData =
          new FormData();

        formData.append(
          "file",
          file
        );

        const res =
          await api(
            "/upload/avatar",
            "POST",
            formData,
            token
          );

        const imageUrl =
          res.url ||
          res.photo ||
          "";

        setAvatar(
          imageUrl
        );

        localStorage.setItem(
          "avatar",
          imageUrl
        );
        window.dispatchEvent(
          new Event("storage")
        );

        Swal.fire({
          icon: "success",
          title: "Avatar Updated",
          timer: 1400,
          showConfirmButton: false
        });

      } catch (err) {

        Swal.fire({
          icon: "error",
          title: "Upload Failed",
          text:
            err?.message ||
            "Avatar upload failed"
        });

      } finally {

        setUploadLoading(false);

      }

    };

  /* =========================
     CHANGE PASSWORD
  ========================= */

  const changePassword =
    () => {

      navigate(
        "/forgot-password"
      );

    };

  /* =========================
     LOGOUT
  ========================= */

  const logout =
    () => {

      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "user"
      );

      localStorage.removeItem(
        "email"
      );

      localStorage.removeItem(
        "avatar"
      );

      localStorage.removeItem(
        "plan"
      );

      navigate("/");

    };

  /* =========================
     USER LETTER
  ========================= */

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
                career profile,
                AI personalization
                and growth journey.
              </p>

            </div>

            <div className="heroRight">

              <div className="statCard">

                <span>⭐</span>

                <h3>
                  {plan}
                </h3>

                <p>
                  AI Career System
                </p>

              </div>

            </div>

          </div>

          {/* MAIN CARD */}

          <div className="card">

            <h1>
              👤 My Profile
            </h1>

            <p className="subtitle">
              Smart AI Career Profile Dashboard
            </p>

            {/* AVATAR */}

            <div
              style={{
                textAlign: "center",
                marginBottom: "25px"
              }}
            >

              {avatar ? (

                <img
                  src={avatar}
                  alt="avatar"
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border:
                      "4px solid #e9f7ec"
                  }}
                />

              ) : (

                <div
                  className="pulse"
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    background: "#eef9ef",
                    color: "#2f9e44",
                    fontSize: "40px",
                    fontWeight: "900",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    margin: "0 auto"
                  }}
                >
                  {firstLetter}
                </div>

              )}

              <div
                style={{
                  marginTop: "15px"
                }}
              >

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleAvatar
                  }
                />

                {uploadLoading && (

                  <p
                    style={{
                      marginTop: "10px",
                      color: "#2f9e44",
                      fontWeight: "600"
                    }}
                  >
                    Uploading avatar...
                  </p>

                )}

              </div>

            </div>

            {/* FORM */}

            {editing ? (

              <>

                <input
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  placeholder="Full Name"
                />

                <input
                  value={email}
                  disabled
                  placeholder="Email"
                />

                <input
                  value={phone}
                  onChange={(e) =>
                    setPhone(
                      e.target.value
                    )
                  }
                  placeholder="Phone Number"
                />

                <input
                  value={city}
                  onChange={(e) =>
                    setCity(
                      e.target.value
                    )
                  }
                  placeholder="City"
                />

                <textarea
                  value={bio}
                  onChange={(e) =>
                    setBio(
                      e.target.value
                    )
                  }
                  placeholder="Write your career bio..."
                  rows={5}
                />

                <div className="btnRow">

                  <button
                    onClick={
                      saveProfile
                    }
                    disabled={
                      loading
                    }
                  >
                    {
                      loading
                        ? "Saving..."
                        : "Save Profile"
                    }
                  </button>

                  <button
                    onClick={() =>
                      setEditing(false)
                    }
                    style={{
                      background:
                        "#fff",
                      color:
                        "#173221",
                      border:
                        "1px solid #dfe9df"
                    }}
                  >
                    Cancel
                  </button>

                </div>

              </>

            ) : (

              <div className="result">

                <h2>
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
                    Phone:
                  </strong>{" "}
                  {phone || "N/A"}
                </p>

                <p>
                  <strong>
                    City:
                  </strong>{" "}
                  {city || "N/A"}
                </p>

                <p>
                  <strong>
                    Joined:
                  </strong>{" "}
                  {joinedDate}
                </p>

                <p>
                  <strong>
                    Membership:
                  </strong>{" "}
                  {plan}
                </p>

                <p>
                  <strong>
                    Bio:
                  </strong>{" "}
                  {bio}
                </p>

                <button
                  onClick={() =>
                    setEditing(true)
                  }
                >
                  Edit Profile ✏️
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
                  Reports
                </p>

              </div>

              <div className="statCard">

                <span>👀</span>

                <h3>
                  {profileViews}
                </h3>

                <p>
                  Profile Views
                </p>

              </div>

              <div className="statCard">

                <span>⭐</span>

                <h3>
                  {plan}
                </h3>

                <p>
                  Membership
                </p>

              </div>

              <div className="statCard">

                <span>🚀</span>

                <h3>
                  Active
                </h3>

                <p>
                  Status
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

            {/* FOOTER */}

            <p
              style={{
                textAlign: "center",
                marginTop: "18px",
                color: "#94a398",
                fontSize: "13px"
              }}
            >
              CareerPilot AI •
              Smart Career Growth Platform
            </p>

          </div>

        </div>

      </div>

    </div>

  );

}

export default Profile;