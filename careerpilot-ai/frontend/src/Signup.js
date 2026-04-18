import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signupUser = async () => {
    try {
      await axios.post(
        "http://127.0.0.1:8000/signup",
        {
          name,
          email,
          password
        }
      );

      alert("Signup Success");
      navigate("/");

    } catch (error) {
      alert("Email already exists");
    }
  };

  return (
    <div className="container">
      <div className="card">

        <h1>📝 Signup</h1>

        <input
          type="text"
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={signupUser}>
          Create Account
        </button>

        <p>
          Already user? <Link to="/">Login</Link>
        </p>

      </div>
    </div>
  );
}

export default Signup;