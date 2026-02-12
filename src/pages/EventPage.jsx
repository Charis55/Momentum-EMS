import React, { useEffect, useState } from "react";
import { subscribeUpcomingEvents } from "../firebase/events";
import { Link } from "react-router-dom";
import Toolbar from "../components/Toolbar";
import logo from "/assets/momentum-logo.svg";

export default function EventPage() {
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
    <div style={{ minHeight: "100vh", display: "block" }}>
      <Toolbar />
      <div className="container" style={{ paddingTop: "100px" }}>
        <h2 className="section-title-glow" style={{ textAlign: "center" }}>
          Explore All <span className="gradient-text">Webinars</span>
        </h2>
        
        <div className="event-grid" style={{ marginTop: "40px" }}>
          {loading && <p style={{ color: "#fff", textAlign: "center" }}>Loading events...</p>}
          {!loading && events.length === 0 && <p style={{ color: "#fff", textAlign: "center" }}>No events found.</p>}

          {events.map((e) => (
            <div key={e.id} className="event-card-curve">
              <div className="event-card-body">
                <img src={logo} alt="logo" style={{ width: "40px", marginBottom: "10px" }} />
                <h3>{e.name}</h3>
                <p className="event-meta-row">🕒 {e.date ? new Date(e.date).toLocaleString() : "TBA"}</p>
                <p>{e.description?.substring(0, 120)}...</p>
                {/* ✅ ACTIVE LINK */}
                <Link to={`/event/${e.id}`} className="event-btn">View Full Details</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}