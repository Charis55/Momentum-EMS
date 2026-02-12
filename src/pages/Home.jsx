import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { subscribeUpcomingEvents } from "../firebase/events"; 
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
        <div className="hero-left">
          <h1>Take Control of Your <span className="gradient-text">Events</span></h1>
          <p>CashPilot helps you track impactful webinars — built for accessibility & excellence. Built for innovators and smart event managers.</p>
          <div className="hero-buttons">
            <Link to="/dashboard" className="btn-primary">Go to Dashboard →</Link>
            <Link to="/signup" className="btn-secondary">Create Account</Link>
          </div>
        </div>
        <div className="hero-right">
          <div className="glass-card">
            <img src={logo} alt="Logo" />
            <h2>Momentum EMS</h2>
            <p>Your Premium Event Companion</p>
          </div>
        </div>
      </section>

      {/* RECENT EVENTS SECTION */}
      <section className="container" style={{ paddingBottom: "80px" }}>
        <h2 className="section-title-glow">Recent <span className="gradient-text">Webinars</span></h2>
        <div className="event-grid">
          {recentEvents.map((e) => (
            <div key={e.id} className="event-card-curve">
               <div className="event-card-body">
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