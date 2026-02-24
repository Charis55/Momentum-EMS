import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import logo from "/assets/momentum-logo.svg";
import MomentumAI from "./MomentumAI";

export default function Toolbar() {
  const [displayName, setDisplayName] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for auth state to grab the name
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setDisplayName(user.displayName || "User");
      }
    });
    return () => unsubscribe();
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  // Common styling for NavLinks including the orange gradient for active state
  const getNavLinkStyle = ({ isActive }) => ({
    color: 'var(--card-text)',
    textDecoration: 'none',
    fontSize: '1.3rem',
    fontWeight: '700',
    padding: '10px 0',
    transition: 'all 0.3s ease',
    display: 'block',
    letterSpacing: '0.5px',
    background: isActive
      ? 'linear-gradient(90deg, #ff7a00, #ffcc33)'
      : 'transparent',
    WebkitBackgroundClip: isActive ? 'text' : 'unset',
    WebkitTextFillColor: isActive ? 'transparent' : 'var(--card-text)',
    // Hover effect is handled via the className logic in your CSS or inline styles
  });

  return (
    <header className="app-header" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 30px',
      position: 'fixed',
      width: '100%',
      top: 0,
      left: 0,
      zIndex: 1000,
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(15px)',
      WebkitBackdropFilter: 'blur(15px)',
      height: '80px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
    }}>

      <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flex: 1 }}>
        <img
          src={logo}
          alt="Momentum EMS"
          style={{ height: '42px', marginRight: '12px' }}
        />
        <h1 style={{ color: 'var(--text-main)', fontSize: '1.6rem', margin: 0, fontWeight: '800', letterSpacing: '-1px' }}>
          Momentum
        </h1>
      </Link>

      {/* MIDDLE: WELCOME MESSAGE (Centered) */}
      <div className="toolbar-welcome" style={{
        flex: 1,
        textAlign: 'center',
        color: 'var(--text-main)',
        fontWeight: '600',
        fontSize: '1.1rem',
        letterSpacing: '1px',
        textTransform: 'uppercase'
      }}>
        {displayName && `WELCOME, ${displayName}`}
      </div>

      {/* RIGHT: HAMBURGER TRIGGER */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={toggleMenu}
          className="hamburger-btn"
          style={{
            background: 'var(--input-bg)',
            border: '1px solid var(--input-border)',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '5px',
            padding: '12px',
            zIndex: 1100,
            transition: 'all 0.3s ease'
          }}
        >
          <div style={{ width: '22px', height: '2px', background: '#ffcc33', transition: '0.3s', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : '' }}></div>
          <div style={{ width: '22px', height: '2px', background: '#ffcc33', opacity: menuOpen ? 0 : 1, transition: '0.3s' }}></div>
          <div style={{ width: '22px', height: '2px', background: '#ffcc33', transition: '0.3s', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : '' }}></div>
        </button>
      </div>

      {/* GLASSMORPHIC SLIDE-OUT MENU */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '320px',
        height: '100vh',
        background: 'var(--card-bg)',
        backdropFilter: 'blur(25px)',
        WebkitBackdropFilter: 'blur(25px)',
        boxShadow: '-10px 0 40px rgba(0,0,0,0.6)',
        transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: '0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        padding: '120px 40px',
        gap: '20px',
        zIndex: 1050,
        borderLeft: '1px solid var(--card-border)',
        willChange: 'transform'
      }}>
        {/* Navigation Links with Active State Gradient and Hover Styling */}
        <NavLink to="/dashboard" onClick={toggleMenu} style={getNavLinkStyle} className="nav-drawer-link">Home</NavLink>
        <NavLink to="/my-schedule" onClick={toggleMenu} style={getNavLinkStyle} className="nav-drawer-link">My Schedule</NavLink>
        <NavLink to="/events" onClick={toggleMenu} style={getNavLinkStyle} className="nav-drawer-link">Explore Events</NavLink>
        <NavLink to="/create" onClick={toggleMenu} style={getNavLinkStyle} className="nav-drawer-link">Host Event</NavLink>
        <NavLink to="/organizer-dashboard" onClick={toggleMenu} style={getNavLinkStyle} className="nav-drawer-link">Organizer Hub</NavLink>
        <NavLink to="/profile" onClick={toggleMenu} style={getNavLinkStyle} className="nav-drawer-link">My Profile</NavLink>



        <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
          <button
            onClick={() => { setAiOpen(true); toggleMenu(); }}
            className="nav-drawer-link"
            style={{
              ...getNavLinkStyle({ isActive: false }),
              background: 'none',
              border: 'none',
              padding: '10px 0',
              textAlign: 'left',
              cursor: 'pointer',
              width: '100%',
              color: '#ffcc33',
              marginBottom: '10px'
            }}
          >
            ✨ Momentum Guide
          </button>

          <button onClick={handleLogout} style={{
            width: '100%',
            background: 'rgba(255, 68, 68, 0.1)',
            color: '#ff4444',
            border: '1px solid rgba(255, 68, 68, 0.3)',
            padding: '15px',
            borderRadius: '14px',
            cursor: 'pointer',
            fontWeight: '800',
            fontSize: '1rem',
            transition: '0.3s'
          }}
            onMouseOver={(e) => e.target.style.background = 'rgba(255, 68, 68, 0.2)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(255, 68, 68, 0.1)'}
          >
            LOGOUT
          </button>
        </div>
      </div>

      <MomentumAI isOpen={aiOpen} onClose={() => setAiOpen(false)} />

      {/* DARK BACKDROP BLUR */}
      {menuOpen && (
        <div
          onClick={toggleMenu}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 1040,
            transition: '0.3s'
          }}
        />
      )}

      {/* Embedded Style for Hovers and Mobile Responsiveness */}
      <style>{`
        .nav-drawer-link:hover {
          padding-left: 10px !important;
          color: #ffcc33 !important;
          opacity: 0.8;
        }
        .hamburger-btn:hover {
          background: rgba(255, 255, 255, 0.15) !important;
          transform: scale(1.05);
        }
        @media (max-width: 768px) {
          .toolbar-welcome {
            font-size: 0.85rem !important;
            letter-spacing: 0.5px !important;
          }
          .app-header {
            padding: 0 15px !important;
          }
        }
      `}</style>
    </header>
  );
}