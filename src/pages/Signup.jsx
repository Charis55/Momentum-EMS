import React, { useState } from "react";
import { registerUser } from "../firebase/auth";
import { sendEmailVerification } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // New state for password popover and validation
  const [showRequirements, setShowRequirements] = useState(false);

  const nav = useNavigate();

  // Password validation rules
  const reqLength = password.length >= 8;
  const reqUpper = /[A-Z]/.test(password);
  const reqLower = /[a-z]/.test(password);
  const reqNumber = /[0-9]/.test(password);
  const reqSpecial = /[^A-Za-z0-9]/.test(password);

  const isValidPassword = reqLength && reqUpper && reqLower && reqNumber && reqSpecial;

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!isValidPassword) {
      setMsg("Please ensure all password requirements are met.");
      setShowRequirements(true);
      return;
    }

    setLoading(true);

    try {
      // 1. Register the user
      // Now 'result' is the full userCredential object
      const result = await registerUser(email, password);

      // 2. Check result.user
      if (result && result.user) {
        // 3. Trigger email verification
        await sendEmailVerification(result.user);
        setIsEmailSent(true);
      } else {
        throw new Error("Unable to retrieve user information. Please try again.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      // Handles Firebase errors like "auth/email-already-in-use"
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-bg auth-center">
      <section className="auth-box animate-fade">
        <img src="/assets/momentum-logo.svg" alt="Momentum Logo" className="auth-logo" />

        <h2 className="auth-title">
          {isEmailSent ? "Verify Email" : "Create Account"}
        </h2>

        {!isEmailSent ? (
          <form onSubmit={submit} className="auth-form">
            <input
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              required
              disabled={loading}
            />

            <div className="password-wrapper">
              <input
                className="auth-input password-input-padded"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setShowRequirements(true)}
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>

              {showRequirements && (
                <div className="password-popover shadow-lg">
                  <div className="popover-header">
                    <h4>Password Requirements</h4>
                    <button type="button" onClick={() => setShowRequirements(false)} className="close-btn" aria-label="Close requirements">
                      &times;
                    </button>
                  </div>
                  <p className="popover-desc">To improve account security, your password must meet the following complexity requirements:</p>

                  <ul className="requirements-list">
                    <li className={reqLength ? "met" : "unmet"}>
                      <span className="icon">{reqLength ? "✓" : "○"}</span> Minimum 8 characters
                    </li>
                    <li className={reqUpper ? "met" : "unmet"}>
                      <span className="icon">{reqUpper ? "✓" : "○"}</span> Require uppercase character
                    </li>
                    <li className={reqLower ? "met" : "unmet"}>
                      <span className="icon">{reqLower ? "✓" : "○"}</span> Require lowercase character
                    </li>
                    <li className={reqSpecial ? "met" : "unmet"}>
                      <span className="icon">{reqSpecial ? "✓" : "○"}</span> Require special character
                    </li>
                    <li className={reqNumber ? "met" : "unmet"}>
                      <span className="icon">{reqNumber ? "✓" : "○"}</span> Require numeric character
                    </li>
                  </ul>

                  <button type="button" className="got-it-btn" onClick={() => setShowRequirements(false)}>
                    Got it
                  </button>
                </div>
              )}
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Sign Up"}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <p style={{ color: "white", marginBottom: "20px", lineHeight: "1.5" }}>
              A verification link has been sent to <strong>{email}</strong>.
              Please check your inbox to activate your account.
            </p>
            <button
              className="auth-btn"
              onClick={() => nav("/login")}
              style={{ background: "white", color: "#ff4b2b", fontWeight: "bold" }}
            >
              Go to Login
            </button>
          </div>
        )}

        {!isEmailSent && (
          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        )}

        {/* Displays the caught error message */}
        {msg && <p className="auth-error" style={{ marginTop: "15px", color: "#ff4d4d", fontSize: "0.9rem" }}>{msg}</p>}
      </section>
    </main>
  );
}