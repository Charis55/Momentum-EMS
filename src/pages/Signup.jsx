import React, { useState } from "react";
import { registerUser } from "../firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css"; // ✅ use the exact same stylesheet as Login

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(email, password);
      nav("/dashboard");
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <main className="auth-bg auth-center"> {/* ✅ hard-center the card */}
      <section className="auth-box animate-fade">
        {/* Logo */}
        <img
          src="/assets/momentum-logo.svg"
          alt="Momentum Logo"
          className="auth-logo"
        />

        {/* Title (same typographic style as login) */}
        <h2 className="auth-title">Create Account</h2>

        {/* Form */}
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
          <button className="auth-btn" type="submit">
            Sign Up
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>

        {msg && <p className="auth-error">{msg}</p>}
      </section>
    </main>
  );
}
