import React, { useState } from "react";
import { resetPassword } from "../firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import logo from "/assets/momentum-logo.svg";
import "./Login.css";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [msg, setMsg] = useState("");
    const [msgType, setMsgType] = useState(""); // "error" or "success"
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setMsg("");
        setLoading(true);
        try {
            await resetPassword(email);
            setMsgType("success");
            setMsg("Password reset email sent! Please check your inbox.");
        } catch (err) {
            setMsgType("error");
            setMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-bg auth-center">
            <div className="auth-box animate-fade">
                <img src={logo} alt="Momentum Logo" className="auth-logo" />

                <h2 className="auth-title">Reset Password</h2>

                <form onSubmit={submit} className="auth-form">
                    <input
                        className="auth-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        type="email"
                        required
                        disabled={loading}
                    />

                    <button className="auth-btn" type="submit" disabled={loading}>
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>
                </form>

                <p className="auth-switch">
                    Remembered your password? <Link to="/login">Sign In</Link>
                </p>

                {msg && (
                    <p className={msgType === "success" ? "auth-success" : "auth-error"}>
                        {msg}
                    </p>
                )}
            </div>
        </div>
    );
}
