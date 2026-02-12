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

      {/* UPCOMING EVENTS */}
      <section className="container" style={{ marginTop: "130px", paddingTop: "80px" }}>
        
        <div className="section-header">
          <h2 className="section-title-glow">
            <span className="gradient-text">Upcoming Webinars</span>
          </h2>
          <p className="section-sub-fancy">
            Join inspiring sessions led by world-class innovators.
          </p>
          <div className="underline-accent"></div>
        </div>

        <div className="event-grid">
          {loading && <p style={{ color: "#fff" }}>Loading events...</p>}

          {!loading && events.length === 0 && (
            <p style={{ opacity: 0.8, color: "#fff" }}>No upcoming events yet.</p>
          )}

          {/* Limit to only the 4 most recent events on the dashboard preview */}
          {events.slice(0, 4).map((e) => (
            <div key={e.id} className="event-card-curve scroll-fade">
              <div className="event-card-body">
                <img
                  src={logo}
                  className="event-thumb-img"
                  alt="Momentum Logo"
                  style={{ objectFit: "contain", background: "#fff" }}
                />

                <h3>{e.name}</h3>

                <div className="event-meta-row">
                  <span className="event-icon">🎤</span>
                  {e.speaker || "Speaker TBA"}
                </div>

                <div className="event-meta-row">
                  <span className="event-icon">🕒</span>
                  {e.date || e.timingISO ? new Date(e.date || e.timingISO).toLocaleString() : "Date coming soon"}
                </div>

                <p>{e.description?.substring(0, 100) || "No event description available yet."}...</p>

                {/* ✅ FIXED: Button now routes to the dynamic event detail page */}
                <Link to={`/event/${e.id}`} className="event-btn">
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