import React, { useState } from "react";
import { loginUser } from "../firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import logo from "/assets/momentum-logo.svg";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await loginUser(email, password);
      nav("/dashboard");
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-box animate-fade">
        <img src={logo} alt="Momentum Logo" className="auth-logo" />

        <h2 className="auth-title">Sign In</h2>

        <form onSubmit={submit} className="auth-form">

          <input
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            required
          />

          <input
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            required
          />

          <button className="auth-btn" type="submit">Sign In</button>
        </form>

        <p className="auth-switch">
          Don’t have an account? <Link to="/signup">Create One</Link>
        </p>

        {msg && <p className="auth-error">{msg}</p>}
      </div>
    </div>
  );
}
  