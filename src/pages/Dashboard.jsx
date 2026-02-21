import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Toolbar from "../components/Toolbar";
import { subscribeUpcomingEvents } from "../firebase/events";
import logo from "/assets/momentum-logo.svg";

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        <div className="hero-content-wrapper">
          <h1 className="hero-title">
            Welcome to <span className="gradient-text">Momentum EMS</span>
          </h1>

          {/* REFINED MISSION STATEMENT WITH FINESSE */}
          <div className="finesse-description-container">
            <p className="hero-description">
              <span className="hero-accent">Experience a seamless bridge between coordination and connection.</span>
              Momentum EMS is your dedicated workspace for hosting high-accessibility
              webinars and managing real-time video conferences. From professional
              knowledge sharing to interactive team syncs, we provide the tools to
              ensure every voice is heard and every event leaves an impact.
            </p>
          </div>

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
      <section className="container" style={{ marginTop: "80px", paddingTop: "80px", paddingBottom: "100px" }}>

        <div className="section-header" style={{ textAlign: "center", marginBottom: "60px" }}>
          <h2 className="section-title-glow">
            <span className="gradient-text">Upcoming Webinars</span>
          </h2>
          <p className="section-sub-fancy">
            Join inspiring sessions led by world-class innovators.
          </p>
          <div className="underline-accent" style={{ margin: "20px auto" }}></div>
        </div>

        {/* SYMMETRICAL EVENT GRID (Uses responsive .event-grid-dashboard from styles.css) */}
        <div className="event-grid-dashboard" style={{
          maxWidth: "1200px",
          margin: "0 auto"
        }}>
          {loading && <p style={{ color: "#fff", gridColumn: "1 / -1", textAlign: "center" }}>Loading events...</p>}

          {!loading && events.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px" }}>
              <p style={{ opacity: 0.8, color: "#fff", marginBottom: "20px" }}>No upcoming events yet.</p>
              <Link to="/create" className="btn-primary" style={{ fontSize: "0.9rem" }}>Be the first to host</Link>
            </div>
          )}

          {events.slice(0, 4).map((e) => (
            <div key={e.id} className="event-card-curve scroll-fade" style={{ width: "100%", margin: "0" }}>
              <div className="event-card-body" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <img
                  src={logo}
                  className="event-thumb-img"
                  alt="Momentum Logo"
                  style={{ objectFit: "contain", padding: "10px", borderRadius: "12px", marginBottom: "20px" }}
                />

                <h3 style={{ marginBottom: "12px" }}>{e.name}</h3>

                <div className="event-meta-row" style={{ marginBottom: "8px" }}>
                  <span className="event-icon" style={{ marginRight: "8px" }}>🎤</span>
                  {e.speaker || "Speaker TBA"}
                </div>

                <div className="event-meta-row" style={{ marginBottom: "15px" }}>
                  <span className="event-icon" style={{ marginRight: "8px" }}>🕒</span>
                  {e.date || e.timingISO ? new Date(e.date || e.timingISO).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "Date coming soon"}
                </div>

                <p style={{ flexGrow: 1 }}>
                  {e.description?.substring(0, 120) || "No event description available yet."}...
                </p>

                <Link to={`/event/${e.id}`} className="event-btn">
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        .hero-content-wrapper {
          max-width: 680px;
        }
        .finesse-description-container {
          margin: 25px 0 45px 0;
          padding-left: 20px;
          border-left: 3px solid rgba(255, 204, 51, 0.4);
        }
        .hero-description {
          color: rgba(255, 255, 255, 0.8);
          font-size: 1.15rem;
          line-height: 1.8;
          font-weight: 400;
          letter-spacing: 0.01em;
          animation: fadeInUp 1s ease-out;
        }
        .hero-accent {
          display: block;
          color: #ffffff;
          font-size: 1.35rem;
          font-weight: 800;
          margin-bottom: 12px;
          letter-spacing: -0.01em;
          line-height: 1.3;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-title {
          margin-bottom: 20px;
        }
      `}</style>
    </>
  );
}