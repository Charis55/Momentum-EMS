import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import {
  subscribeOrganizerEvents,
  deleteEventById,
  subscribeToAttendees
} from "../firebase/events";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Toolbar from "../components/Toolbar";
import ConfirmationModal from "../components/ConfirmationModal";

/**
 * ✅ Live Attendee Counter Component
 */
function AttendeeStats({ eventId, onUpdate }) {
  const [attendees, setAttendees] = useState([]);

  useEffect(() => {
    const unsub = subscribeToAttendees(eventId, (data) => {
      setAttendees(data);
      if (onUpdate) onUpdate(eventId, data.length);
    });
    return () => unsub();
  }, [eventId, onUpdate]);

  return (
    <div className="stat-badge-ui">
      <span className="stat-count-ui">{attendees.length}</span>
      <span className="stat-label-ui">ENROLLED</span>
    </div>
  );
}

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({});
  const nav = useNavigate();

  const [modal, setModal] = useState({ show: false, title: "", message: "", onConfirm: null });

  // Search and Sort State
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("dateAsc");

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeOrganizerEvents(user.uid, (data) => {
      setEvents(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleCountUpdate = (id, count) => {
    setCounts(prev => ({ ...prev, [id]: count }));
  };

  const totalEnrollments = useMemo(() =>
    Object.values(counts).reduce((acc, curr) => acc + curr, 0), [counts]
  );

  const topEventName = useMemo(() => {
    if (events.length === 0 || Object.keys(counts).length === 0) return "N/A";
    const topId = Object.keys(counts).reduce((a, b) => (counts[a] || 0) > (counts[b] || 0) ? a : b);
    return events.find(e => e.id === topId)?.name || "N/A";
  }, [counts, events]);

  const handleDelete = (id) => {
    setModal({
      show: true,
      title: "Are you sure?",
      message: "This action is irreversible. You may need to log in again to confirm.",
      confirmText: "Confirm Delete",
      type: "danger",
      onConfirm: async () => {
        try {
          const eventData = events.find(e => e.id === id);
          await deleteEventById(id, user, eventData);
          setModal({ ...modal, show: false });
        } catch (err) { console.error(err); }
      }
    });
  };

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
      if (sortBy === "recent") {
        const createdA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
        const createdB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
        return createdB - createdA;
      }
      return 0;
    });

  if (loading) return <main className="loader-container"><div className="loader"></div></main>;

  return (
    <div className="org-dash-wrapper">
      <Toolbar />

      <main className="org-content">
        {/* ✅ ANALYTICS BAR - Retaining the Orange/Red Mood */}
        <section className="analytics-bar">
          <div className="analytics-pill">
            <label className="ui-heading-label">TOTAL REACH</label>
            <h3 className="analytics-val">{totalEnrollments}</h3>
          </div>
          <div className="analytics-pill">
            <label className="ui-heading-label">ACTIVE EVENTS</label>
            <h3 className="analytics-val">{events.length}</h3>
          </div>
          <div className="analytics-pill top-performer">
            <label className="ui-heading-label">TOP PERFORMER</label>
            <h3 className="analytics-text-gold">{topEventName}</h3>
          </div>
        </section>

        <header className="dashboard-header-nav">
          <div className="title-block">
            <h1 className="dash-main-title">Organizer Hub</h1>
            <p className="dash-sub-text">Monitor your webinar performance and attendee counts.</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="create-event-btn"
            onClick={() => nav("/create")}
          >
            + CREATE NEW EVENT
          </motion.button>
        </header>

        {/* SEARCH AND SORT CONTROLS */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          marginBottom: "50px",
          background: "var(--card-bg)",
          padding: "25px",
          borderRadius: "20px",
          backdropFilter: "blur(10px)",
          border: "1px solid var(--card-border)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
        }}>
          <div style={{ flex: "1 1 300px" }}>
            <label htmlFor="search-events" style={{ color: "#ffcc33", display: "block", marginBottom: "8px", fontWeight: "700", fontSize: "0.9rem" }}>Search Sessions</label>
            <input
              id="search-events"
              type="text"
              placeholder="Search by Event, Speaker, Category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "15px 20px",
                borderRadius: "12px",
                border: "1px solid var(--input-border)",
                background: "var(--input-bg)",
                color: "#ffffff",
                fontSize: "1rem",
                fontWeight: "600",
                outline: "none"
              }}
            />
          </div>
          <div style={{ flex: "0 1 250px" }}>
            <label htmlFor="sort-events" style={{ color: "#ffcc33", display: "block", marginBottom: "8px", fontWeight: "700", fontSize: "0.9rem" }}>Sort By</label>
            <select
              id="sort-events"
              aria-label="Sort events"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                width: "100%",
                padding: "15px 20px",
                borderRadius: "12px",
                border: "1px solid var(--input-border)",
                background: "var(--input-bg)",
                color: "#ffffff",
                fontSize: "1rem",
                fontWeight: "600",
                outline: "none",
                cursor: "pointer"
              }}
            >
              <option value="dateAsc">Date: Closest First</option>
              <option value="dateDesc">Date: Furthest First</option>
              <option value="recent">Recently Created</option>
              <option value="nameAsc">Name: A to Z</option>
              <option value="nameDesc">Name: Z to A</option>
            </select>
          </div>
        </div>

        <section className="events-list-grid">
          <AnimatePresence>
            {filteredAndSortedEvents.length === 0 && (
              <div style={{ textAlign: "center", gridColumn: "1 / -1", padding: "60px 40px", background: "var(--card-bg)", borderRadius: "20px", border: "1px dashed var(--card-border)" }}>
                <p style={{ color: "var(--card-text)", fontSize: "1.2rem", fontWeight: "bold" }}>No matching events found.</p>
                <p style={{ color: "var(--card-text-muted)", marginTop: "10px" }}>Try adjusting your search terms.</p>
              </div>
            )}

            {filteredAndSortedEvents.map((ev) => (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="organizer-card-ui"
              >
                <div className="card-top-row">
                  <span className="date-tag">
                    {ev.date ? new Date(ev.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase() : "DATE TBA"}
                  </span>
                  <AttendeeStats eventId={ev.id} onUpdate={handleCountUpdate} />
                </div>

                <div className="card-body-content">
                  <h4 className="card-event-name">{ev.name}</h4>
                  <p className="card-event-desc">{ev.description}</p>
                </div>

                <div className="card-footer-actions">
                  <button className="view-live-btn" onClick={() => nav(`/event/${ev.id}`)}>
                    VIEW LIVE PAGE →
                  </button>
                  <div className="tool-icons">
                    <button className="icon-action edit" onClick={() => nav(`/edit-event/${ev.id}`)}>✏️</button>
                    <button className="icon-action delete" onClick={() => handleDelete(ev.id)}>🗑️</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </section>
      </main>

      <ConfirmationModal
        isOpen={modal.show}
        title={modal.title}
        message={modal.message}
        confirmText={modal.confirmText}
        type={modal.type}
        onConfirm={modal.onConfirm}
        onCancel={() => setModal({ ...modal, show: false })}
      />

      <style>{`
        .org-dash-wrapper {
          min-height: 100vh;
          width: 100%;
          background: var(--bg-main);
          padding-top: 100px;
          padding-bottom: 80px;
        }

        .org-content { max-width: 1240px; margin: 0 auto; padding: 0 40px; }

        /* ANALYTICS STYLE - Match the Event Card aesthetic */
        .analytics-bar {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 50px;
        }
        .analytics-pill {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          padding: 25px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }
        .analytics-val { color: #ffcc33; font-size: 2.8rem; font-weight: 900; margin-top: 10px; }
        .analytics-text-gold { color: #ffcc33; font-size: 1.1rem; font-weight: 800; margin-top: 12px; text-transform: uppercase; }

        /* HEADER */
        .dashboard-header-nav {
          display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px;
        }
        .dash-main-title { font-size: 3.5rem; font-weight: 900; color: #ffcc33; letter-spacing: -1.5px; }
        .dash-sub-text { color: var(--text-muted); font-size: 1.1rem; margin-top: 5px; }
        .create-event-btn {
          background: #ffcc33; color: #000; padding: 18px 32px; border-radius: 12px;
          border: none; font-weight: 900; cursor: pointer; letter-spacing: 1px;
        }

        /* EVENT CARDS - Obsidian Style */
        .events-list-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 25px; }
        .organizer-card-ui {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 30px; padding: 35px;
          box-shadow: 0 15px 40px rgba(0,0,0,0.5);
        }
        .card-top-row { display: flex; justify-content: space-between; align-items: flex-start; }
        .date-tag { color: #ffcc33; font-size: 0.75rem; font-weight: 900; letter-spacing: 2px; }
        
        .stat-badge-ui { text-align: right; }
        .stat-count-ui { font-size: 2.2rem; font-weight: 900; color: var(--card-text); line-height: 1; display: block; }
        .stat-label-ui { font-size: 0.6rem; letter-spacing: 1.5px; color: #ffcc33; font-weight: 900; }

        .card-event-name { font-size: 1.8rem; font-weight: 800; color: var(--card-text); margin: 15px 0 10px; }
        .card-event-desc { color: var(--card-text-muted); font-size: 0.95rem; line-height: 1.5; min-height: 3rem; }

        .card-footer-actions {
          margin-top: 30px; padding-top: 25px; border-top: 1px solid var(--card-border);
          display: flex; justify-content: space-between; align-items: center;
        }
        .view-live-btn { background: none; border: none; color: #ffcc33; font-weight: 900; cursor: pointer; font-size: 0.8rem; }
        .icon-action { background: var(--input-bg); border: none; padding: 10px; border-radius: 10px; cursor: pointer; margin-left: 8px; transition: 0.2s; }
        .icon-action:hover { background: var(--input-border); }
        .ui-heading-label { color: #ffcc33; font-size: 0.7rem; font-weight: 900; letter-spacing: 3px; opacity: 0.8; }

        @media (max-width: 900px) {
          .analytics-bar {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}