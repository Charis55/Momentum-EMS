import React from "react";
import Toolbar from "../components/Toolbar";

export default function Settings() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-main)", paddingTop: "100px", color: "var(--text-main)" }}>
      <Toolbar />
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 20px" }}>
        <h2 style={{ fontSize: "2.2rem", fontWeight: "900", marginBottom: "20px" }}>Settings</h2>
        <p style={{ color: "var(--text-muted)" }}>Application settings go here.</p>
      </div>
    </div>
  )
}
