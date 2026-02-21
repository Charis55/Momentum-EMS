import React, { useEffect, useState } from "react";
import { subscribeUpcomingEvents } from "../firebase/events";
import { Link } from "react-router-dom";
import Toolbar from "../components/Toolbar";
import logo from "/assets/momentum-logo.svg";

export default function EventPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search and Sort State
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("dateAsc");

  useEffect(() => {
    const unsubscribe = subscribeUpcomingEvents((data) => {
      setEvents(data || []);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Filter and Sort Logic
  const filteredAndSortedEvents = events
    .filter((e) => {
      const term = searchTerm.toLowerCase();
      const matchName = e.name?.toLowerCase().includes(term);
      const matchSpeaker = e.speaker?.toLowerCase().includes(term);
      const matchCategory = e.category?.toLowerCase().includes(term);
      const matchDesc = e.description?.toLowerCase().includes(term);
      return matchName || matchSpeaker || matchCategory || matchDesc;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      const nameA = (a.name || "").toLowerCase();
      const nameB = (b.name || "").toLowerCase();

      if (sortBy === "dateAsc") return dateA - dateB;
      if (sortBy === "dateDesc") return dateB - dateA;
      if (sortBy === "nameAsc") return nameA.localeCompare(nameB);
      if (sortBy === "nameDesc") return nameB.localeCompare(nameA);
      return 0;
    });

  return (
    <div style={{
      minHeight: "100vh",
      display: "block",
      background: "radial-gradient(circle at 15% 15%, #8b4513 0%, #3d1f0a 35%, #0f0e0e 75%, #0a0a0a 100%)",
      backgroundAttachment: "fixed"
    }}>
      <Toolbar />
      <div className="container" style={{ paddingTop: "120px", paddingBottom: "100px" }}>
        <h2 className="section-title-glow" style={{ textAlign: "center", marginBottom: "10px" }}>
          Explore All <span className="gradient-text">Webinars</span>
        </h2>
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.8)", marginBottom: "40px", fontSize: "1.1rem" }}>
          Discover upcoming sessions, expert speakers, and niche categories.
        </p>

        {/* SEARCH AND SORT CONTROLS */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          marginBottom: "50px",
          background: "rgba(0, 0, 0, 0.4)",
          padding: "25px",
          borderRadius: "20px",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
        }}>
          <div style={{ flex: "1 1 300px" }}>
            <label style={{ color: "#ffcc33", display: "block", marginBottom: "8px", fontWeight: "700", fontSize: "0.9rem" }}>Search Sessions</label>
            <input
              type="text"
              placeholder="Search by Event, Speaker, Category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "15px 20px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.9)",
                color: "#000",
                fontSize: "1rem",
                fontWeight: "600",
                outline: "none"
              }}
            />
          </div>
          <div style={{ flex: "0 1 250px" }}>
            <label style={{ color: "#ffcc33", display: "block", marginBottom: "8px", fontWeight: "700", fontSize: "0.9rem" }}>Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                width: "100%",
                padding: "15px 20px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.9)",
                color: "#000",
                fontSize: "1rem",
                fontWeight: "600",
                outline: "none",
                cursor: "pointer"
              }}
            >
              <option value="dateAsc">📅 Date: Closest First</option>
              <option value="dateDesc">📅 Date: Furthest First</option>
              <option value="nameAsc">🔤 Name: A to Z</option>
              <option value="nameDesc">🔤 Name: Z to A</option>
            </select>
          </div>
        </div>

        <div className="event-grid">
          {loading && <p style={{ color: "#fff", textAlign: "center", gridColumn: "1 / -1" }}>Loading events...</p>}

          {!loading && filteredAndSortedEvents.length === 0 && (
            <div style={{ textAlign: "center", gridColumn: "1 / -1", padding: "60px 40px", background: "rgba(0,0,0,0.2)", borderRadius: "20px", border: "1px dashed rgba(255,255,255,0.2)" }}>
              <p style={{ color: "#fff", fontSize: "1.2rem", fontWeight: "bold" }}>No matching events found.</p>
              <p style={{ color: "rgba(255,255,255,0.6)", marginTop: "10px" }}>Try adjusting your search terms.</p>
            </div>
          )}

          {filteredAndSortedEvents.map((e) => (
            <div key={e.id} className="event-card-curve" style={{
              display: "flex",
              flexDirection: "column",
              background: "#fff",
              borderRadius: "25px",
              overflow: "hidden"
            }}>
              <div className="event-card-body" style={{ flexGrow: 1, display: "flex", flexDirection: "column", padding: "10px 5px" }}>
                <img src={logo} alt="logo" style={{ width: "40px", marginBottom: "15px" }} />

                {e.category && (
                  <span style={{
                    display: "inline-block",
                    background: "rgba(211, 84, 0, 0.1)",
                    color: "#d35400",
                    padding: "5px 12px",
                    borderRadius: "20px",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    marginBottom: "15px",
                    alignSelf: "flex-start"
                  }}>
                    {e.category}
                  </span>
                )}

                <h3 style={{ fontSize: "1.2rem", fontWeight: "800", marginBottom: "8px", color: "#1a1a1a" }}>{e.name}</h3>

                {e.speaker && (
                  <p className="event-meta-row" style={{ color: "#555", fontWeight: "600", marginBottom: "5px", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.9rem" }}>
                    <span>🎤</span> {e.speaker}
                  </p>
                )}

                <p className="event-meta-row" style={{ color: "#555", fontWeight: "600", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.9rem" }}>
                  <span>🕒</span> {e.date ? new Date(e.date).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "TBA"}
                </p>

                <p style={{ color: "#666", flexGrow: 1, marginBottom: "20px", lineHeight: "1.5", fontSize: "0.9rem" }}>
                  {e.description?.substring(0, 120) || "No description available."}...
                </p>

                <Link to={`/event/${e.id}`} className="event-btn" style={{
                  marginTop: "auto",
                  textAlign: "center",
                  display: "block",
                  background: "linear-gradient(90deg, #ff7e00, #ffcc33)",
                  color: "#fff",
                  textDecoration: "none",
                  padding: "12px",
                  borderRadius: "12px",
                  fontWeight: "bold",
                  fontSize: "0.9rem"
                }}>
                  View Full Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}