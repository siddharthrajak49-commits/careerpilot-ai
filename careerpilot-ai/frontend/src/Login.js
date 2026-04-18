import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const loginUser = async () => {

    
    try {

      const res = await axios.post(
        "https://careerpilot-backend-rvv1.onrender.com/login",
        {
          email: email,
          password: password
        }
      );

      localStorage.setItem(
        "token",
        res.data.token
      );

      localStorage.setItem(
        "user",
        res.data.user
      );

      alert("Login Successful");

      navigate("/dashboard");

    } catch (error) {
      alert("Invalid Login");
    }
  };

  return (
    <div className="container">
      <div className="card">

        <h1>🔐 Login</h1>

        <input
          type="text"
          placeholder="Email"
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button onClick={loginUser}>
          Login
        </button>

        <p>
          New User?{" "}
          <Link to="/signup">
            Signup
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;

