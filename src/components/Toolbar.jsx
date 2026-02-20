import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebase/config"; // Ensure this matches your config path
import logo from "/assets/momentum-logo.svg";

export default function Toolbar() {
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    // Listen for auth state to grab the name
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Fallback to "User" if displayName isn't set in Firebase Auth
        setDisplayName(user.displayName || "User");
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <header className="app-header" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      padding: '0 20px' 
    }}>
      {/* Left: Brand */}
      <div className="brand" style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <img src={logo} alt="Momentum EMS" className="brand-logo" />
        <h1>Momentum</h1>
      </div>

      {/* Middle: Welcome Message */}
      <div className="toolbar-welcome" style={{ 
        flex: 1, 
        textAlign: 'center', 
        color: 'white', 
        fontWeight: '600',
        fontSize: '1.2rem' 
      }}>
        {displayName && `WELCOME, ${displayName}`}
      </div>

      {/* Right: Navigation */}
      <nav className="toolbar-nav" style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <Link to="/dashboard">Home</Link>
        <Link to="/events">Events</Link> 
        <Link to="/create">Create</Link>
        <Link to="/organizer-dashboard" className="nav-highlight">Organizer</Link>
        <Link to="/profile">Profile</Link>
      </nav>
    </header>
  );
}