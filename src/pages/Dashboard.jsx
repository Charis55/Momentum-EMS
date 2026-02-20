import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Toolbar from "../components/Toolbar";
import { subscribeUpcomingEvents } from "../firebase/events";
import logo from "/assets/momentum-logo.svg";

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listens for all events in real-time
    const unsubscribe = subscribeUpcomingEvents((data) => {
      setEvents(data || []);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <Toolbar />

      {/* PREMIUM HERO */}
      <section className="hero-premium container">
        <div>
          <h1 className="hero-title">
            Welcome to <span className="gradient-text">Momentum EMS</span>
          </h1>
          <p className="hero-sub">
            Plan, host & attend impactful webinars — built for accessibility & excellence.
          </p>

          <div className="hero-btns">
            <Link to="/create" className="btn-primary">
              + Create Event
            </Link>
            <Link to="/events" className="btn-primary" style={{ opacity: 0.85 }}>
              Browse Events
            </Link>
          </div>
        </div>

        <div className="hero-logo-card">
          <img src={logo} alt="Momentum Logo" />
        </div>
      </section>

      {/* UPCOMING WEBINARS SECTION */}
      <section className="container" style={{ marginTop: "130px", paddingTop: "80px", paddingBottom: "100px" }}>
        
        <div className="section-header" style={{ textAlign: "center", marginBottom: "60px" }}>
          <h2 className="section-title-glow">
            <span className="gradient-text">Upcoming Webinars</span>
          </h2>
          <p className="section-sub-fancy">
            Join inspiring sessions led by world-class innovators.
          </p>
          <div className="underline-accent" style={{ margin: "20px auto" }}></div>
        </div>

        {/* SYMMETRICAL 2-COLUMN GRID */}
        <div className="event-grid" style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(2, 1fr)", 
          gap: "35px", 
          maxWidth: "1200px", 
          margin: "0 auto" 
        }}>
          {loading && <p style={{ color: "#fff", gridColumn: "span 2", textAlign: "center" }}>Loading events...</p>}

          {!loading && events.length === 0 && (
            <p style={{ opacity: 0.8, color: "#fff", gridColumn: "span 2", textAlign: "center" }}>No upcoming events yet.</p>
          )}

          {/* Slicing to 4 events to maintain the 2x2 row structure */}
          {events.slice(0, 4).map((e) => (
            <div key={e.id} className="event-card-curve scroll-fade" style={{ width: "100%", margin: "0" }}>
              <div className="event-card-body" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                {/* Logo and Branding */}
                <img
                  src={logo}
                  className="event-thumb-img"
                  alt="Momentum Logo"
                  style={{ objectFit: "contain", background: "#fff", padding: "10px", borderRadius: "12px", marginBottom: "20px" }}
                />

                {/* Event Info Retained from Previous State */}
                <h3 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#333", marginBottom: "12px" }}>{e.name}</h3>

                <div className="event-meta-row" style={{ color: "#555", fontWeight: "600", marginBottom: "8px" }}>
                  <span className="event-icon" style={{ marginRight: "8px" }}>🎤</span>
                  {e.speaker || "Speaker TBA"}
                </div>

                <div className="event-meta-row" style={{ color: "#555", fontWeight: "600", marginBottom: "15px" }}>
                  <span className="event-icon" style={{ marginRight: "8px" }}>🕒</span>
                  {e.date || e.timingISO ? new Date(e.date || e.timingISO).toLocaleString() : "Date coming soon"}
                </div>

                <p style={{ color: "#666", fontSize: "0.95rem", lineHeight: "1.5", flexGrow: 1 }}>
                  {e.description?.substring(0, 100) || "No event description available yet."}...
                </p>

                {/* Action Link */}
                <Link to={`/event/${e.id}`} className="event-btn" style={{ marginTop: "20px" }}>
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}