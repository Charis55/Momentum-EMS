import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Toolbar from "../components/Toolbar";
import Footer from "../components/Footer";
import { subscribeUpcomingEvents } from "../firebase/events";
import { getCategoryImage } from "../utils/categoryImages";
import { useAuth } from "../context/AuthContext";
import logo from "/assets/momentum-logo.svg";

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Only subscribe to events if user is authenticated
    if (!user) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeUpcomingEvents((data) => {
      setEvents(data || []);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const totalAttendees = events.reduce((acc, curr) => acc + (curr.enrolledCount || 0), 0);
  const activeWebinars = events.length;

  const stats = [
    { label: "Active Webinars", value: activeWebinars.toString(), icon: "📽️" },
    { label: "Total Enrollments", value: totalAttendees.toString(), icon: "👥" },
    { label: "Event Coverage", value: "Global", icon: "🌍" },
    { label: "Platform Status", value: "Online", icon: "🟢" }
  ];

  return (
    <>
      <Toolbar />

      <main>
        {/* PREMIUM HERO */}
        <section className="hero-premium container">
          <div className="hero-content-wrapper">
            <motion.h1
              className="hero-title"
              tabIndex={0}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Welcome to <span className="gradient-text">Momentum EMS</span>
            </motion.h1>

            {/* REFINED MISSION STATEMENT */}
            <motion.div
              className="mission-card-glass"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <div className="mission-accent-line"></div>
              <motion.p
                className="hero-description-new"
                tabIndex={0}
              >
                <span className="hero-accent-new">Experience a seamless bridge between coordination and connection.</span>
                <span className="hero-body-text">
                  Momentum EMS is your dedicated workspace for hosting high-accessibility
                  webinars and managing real-time video conferences. From professional
                  knowledge sharing to interactive team syncs, we provide the tools to
                  ensure every voice is heard and every event leaves an impact.
                </span>
              </motion.p>
            </motion.div>

            <div className="hero-btns">
              {user ? (
                <>
                  <Link to="/create" className="btn-primary">
                    + Create Event
                  </Link>
                  <Link to="/events" className="btn-primary" style={{ opacity: 0.85 }}>
                    Browse Events
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-primary">
                    Sign In
                  </Link>
                  <Link to="/signup" className="btn-primary" style={{ opacity: 0.85 }}>
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </div>

          <motion.div
            className="hero-logo-card"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, type: "spring" }}
          >
            <img src={logo} alt="Momentum Logo" />
          </motion.div>
        </section>

        {/* AUTHENTICATED CONTENT */}
        {user && (
          <>
            {/* STATS ANALYTICS SECTION */}
            <section className="container">
              <div className="stats-grid">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="stat-card"
                    tabIndex={0}
                    aria-label={`${stat.label}: ${stat.value}`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 * index, duration: 0.5 }}
                  >
                    <span className="stat-icon" aria-hidden="true">{stat.icon}</span>
                    <span className="stat-value" aria-hidden="true">{stat.value}</span>
                    <span className="stat-label" aria-hidden="true">{stat.label}</span>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* UPCOMING WEBINARS SECTION */}
            <section className="container" style={{ paddingTop: "20px", paddingBottom: "100px" }}>
              <div className="section-header" style={{ textAlign: "center", marginBottom: "60px" }}>
                <h2 className="section-title-glow" tabIndex={0}>
                  <span className="gradient-text">Upcoming Webinars</span>
                </h2>
                <p className="section-sub-fancy" tabIndex={0}>
                  Join inspiring sessions led by world-class innovators.
                </p>
                <div className="underline-accent" style={{ margin: "20px auto" }}></div>
              </div>

              <div className="event-grid-dashboard" style={{
                maxWidth: "1200px",
                margin: "0 auto"
              }}>
                {loading && <p style={{ color: "var(--text-main)", gridColumn: "1 / -1", textAlign: "center" }} role="status" aria-live="polite">Loading events...</p>}

                {!loading && events.length === 0 && (
                  <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px" }}>
                    <p style={{ opacity: 0.8, color: "var(--text-main)", marginBottom: "20px" }}>No upcoming events yet.</p>
                    <Link to="/create" className="btn-primary" style={{ fontSize: "0.9rem" }}>Be the first to host</Link>
                  </div>
                )}

                {events.slice(0, 4).map((e) => (
                  <div key={e.id} className="event-card-curve scroll-fade" style={{ width: "100%", margin: "0" }}>
                    <div className="event-card-body" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                      <div style={{
                        width: '100%',
                        height: '180px',
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
                          className="event-thumb-img"
                          alt={e.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </div>

                      <h3 style={{ marginBottom: "12px" }} tabIndex={0}>{e.name}</h3>

                      <div className="event-meta-row" style={{ marginBottom: "8px" }} tabIndex={0}>
                        <span className="sr-only">Speaker: </span>
                        {e.speaker || "Speaker TBA"}
                      </div>

                      <div className="event-meta-row" style={{ marginBottom: "15px" }} tabIndex={0} aria-label={`Starts at: ${e.date || e.timingISO ? new Date(e.date || e.timingISO).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "Date coming soon"}`}>
                        <span className="event-icon" style={{ marginRight: "8px" }} aria-hidden="true">🕒</span>
                        <span aria-hidden="true">{e.date || e.timingISO ? new Date(e.date || e.timingISO).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "Date coming soon"}</span>
                      </div>

                      <p style={{ flexGrow: 1 }} tabIndex={0}>
                        {e.description?.substring(0, 120) || "No event description available yet."}...
                      </p>

                      <Link to={`/event/${e.id}`} className="event-btn" aria-label="View Details">
                        View Details <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        <style>{`
          .hero-content-wrapper {
            max-width: 720px;
          }
          .mission-card-glass {
            margin: 35px 0 55px 0;
            padding: 30px;
            background: var(--mission-bg);
            backdrop-filter: blur(10px);
            border: 1px solid var(--mission-border);
            border-radius: 24px;
            position: relative;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          }
          .mission-accent-line {
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 4px;
            background: linear-gradient(to bottom, #ffcc33, #ff7a00);
          }
          .hero-description-new {
            margin: 0;
          }
          .hero-accent-new {
            display: block;
            color: var(--mission-text);
            font-size: 1.4rem;
            font-weight: 850;
            margin-bottom: 16px;
            letter-spacing: -0.02em;
            line-height: 1.2;
          }
          .hero-body-text {
            display: block;
            color: var(--mission-text-muted);
            font-size: 1.1rem;
            line-height: 1.7;
            font-weight: 400;
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .hero-title {
            margin-bottom: 20px;
            font-size: 4rem;
            line-height: 1.1;
          }
          @media (max-width: 768px) {
            .hero-title { font-size: 2.8rem; }
            .hero-accent-new { font-size: 1.2rem; }
          }
        `}</style>
      </main>
      <Footer />
    </>
  );
}