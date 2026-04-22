// Login.js

import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginUser = async () => {
    try {
      const res = await axios.post(
        "https://careerpilot-backend-rvv1.onrender.com/login",
        {
          email,
          password
        }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", res.data.user);

      alert("Login Successful");
      navigate("/dashboard");

    } catch (error) {
      alert("Invalid Login");
    }
  };

  return (
    <div className="container">
      <div className="card">

        <h1>🚀 CareerPilot AI</h1>

        <input
          type="email"
          placeholder="Enter Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={loginUser}>
          Login Now
        </button>

        <p>
          New User?{" "}
          <Link to="/signup">
            Create Account
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;