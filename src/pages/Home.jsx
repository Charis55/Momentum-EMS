import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { subscribeUpcomingEvents } from "../firebase/events";
import { getCategoryImage } from "../utils/categoryImages";
import logo from "/assets/momentum-logo.svg";
import "./Home.css";

export default function Home() {
  const [recentEvents, setRecentEvents] = useState([]);

  useEffect(() => {
    // Listen for events and limit to 4
    const unsubscribe = subscribeUpcomingEvents((data) => {
      setRecentEvents(data.slice(0, 4));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="logo">
          <img src={logo} alt="Momentum Logo" />
          <h2>Momentum</h2>
        </div>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/login">Login</Link>
        </nav>
      </header>

      <section className="hero-section">
        <motion.div
          className="hero-left"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1>Take Control of Your <span className="gradient-text">Events</span></h1>
          <p>Momentum EMS helps you track impactful webinars — built for accessibility & excellence. Built for innovators and smart event managers.</p>
          <div className="hero-buttons">
            <Link to="/dashboard" className="btn-primary">Go to Dashboard →</Link>
            <Link to="/signup" className="btn-secondary">Create Account</Link>
          </div>
        </motion.div>
        <motion.div
          className="hero-right"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, type: "spring" }}
        >
          <div className="glass-card" style={{
            animation: 'none',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(255, 204, 51, 0.1)'
          }}>
            <motion.img
              src={logo}
              alt="Logo"
              animate={{
                y: [0, -15, 0],
                rotate: [0, 2, -2, 0]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <h2>Momentum EMS</h2>
            <p>Your Premium Event Companion</p>
          </div>
        </motion.div>
      </section>

      {/* RECENT EVENTS SECTION */}
      <section className="container" style={{ paddingBottom: "80px" }}>
        <h2 className="section-title-glow">Recent <span className="gradient-text">Webinars</span></h2>
        <div className="event-grid">
          {recentEvents.map((e) => (
            <div key={e.id} className="event-card-curve">
              <div className="event-card-body">
                <div style={{
                  width: '100%',
                  height: '160px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  marginBottom: '20px',
                  background: 'rgba(255,255,255,0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img
                    src={getCategoryImage(e.category)}
                    alt={e.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                <h3>{e.name}</h3>
                <p>{e.description?.substring(0, 100)}...</p>
                <Link to={`/event/${e.id}`} className="event-btn">Details →</Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}