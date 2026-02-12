import React, { useState } from "react";
import { motion } from "framer-motion";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { app } from "../firebase";
import "./Auth.css";

const auth = getAuth(app);

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage("Welcome back to Momentum EMS!");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage("Account created successfully!");
      }
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="auth-container">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2>{mode === "login" ? "Welcome Back" : "Join Momentum EMS"}</h2>
        <p className="auth-subtitle">
          {mode === "login"
            ? "Sign in to manage and attend webinars seamlessly."
            : "Create your account and start your learning journey."}
        </p>

        <form onSubmit={handleAuth}>
          <label>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />

          <motion.button whileHover={{ scale: 1.05 }} className="auth-btn" type="submit">
            {mode === "login" ? "Sign In" : "Sign Up"}
          </motion.button>
        </form>

        {message && <p className="auth-message">{message}</p>}

        <p className="switch-text">
          {mode === "login" ? (
            <>
              Don’t have an account?{" "}
              <button className="switch-btn" onClick={() => setMode("signup")}>
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button className="switch-btn" onClick={() => setMode("login")}>
                Sign in
              </button>
            </>
          )}
        </p>
      </motion.div>

      <div className="auth-hero">
        <img src="/assets/auth-illustration.jpg" alt="Person attending a virtual meeting on a laptop" />
      </div>
    </div>
  );
}
