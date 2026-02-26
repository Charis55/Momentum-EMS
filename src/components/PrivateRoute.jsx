import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  // This prevents the "ghost" render of the dashboard while the URL is /login
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 15% 15%, #8b4513 0%, #3d1f0a 35%, #0f0e0e 75%, #0a0a0a 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "'Inter', sans-serif"
      }}>
        <div className="loader-spinner" style={{
          border: "4px solid rgba(255, 255, 255, 0.1)",
          borderLeft: "4px solid #ffcc33",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          animation: "spin 1s linear infinite",
          marginBottom: "20px"
        }}></div>
        <h2 style={{ fontSize: "1.2rem", fontWeight: "600", opacity: 0.8 }}>
          Securing Session...
        </h2>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // replace={true} prevents the user from hitting "back" into a protected route
  return user ? children : <Navigate to="/login" replace />;
}