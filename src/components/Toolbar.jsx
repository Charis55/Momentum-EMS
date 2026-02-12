import React from "react";
import { Link } from "react-router-dom";
import logo from "/assets/momentum-logo.svg";

export default function Toolbar() {
  return (
    <header className="app-header">
      <div className="brand">
        <img src={logo} alt="Momentum EMS" className="brand-logo" />
        <h1>Momentum</h1>
      </div>

      <nav className="toolbar-nav">
        <Link to="/dashboard">Home</Link>
        {/* ✅ Re-routed to /events to show the "Explore All" page */}
        <Link to="/events">Events</Link> 
        <Link to="/create">Create</Link>
        <Link to="/profile">Profile</Link>
      </nav>
    </header>
  );
}