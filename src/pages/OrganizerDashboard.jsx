import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  subscribeOrganizerEvents, 
  deleteEventById, 
  subscribeToAttendees 
} from "../firebase/events";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Toolbar from "../components/Toolbar";
import "./OrganizerDashboard.css";

// ✅ Updated Live Attendee Counter to match your .stat-badge CSS
function AttendeeStats({ eventId }) {
  const [attendees, setAttendees] = useState([]);

  useEffect(() => {
    // Real-time listener for this specific event's attendees
    const unsub = subscribeToAttendees(eventId, setAttendees);
    return unsub;
  }, [eventId]);

  return (
    <div className="stat-badge">
      <span className="stat-count">{attendees.length}</span>
      <span className="stat-label">Enrolled</span>
    </div>
  );
}

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    if (!user) return;
    
    // Subscribe to events where organizerId matches current user
    const unsubscribe = subscribeOrganizerEvents(user.uid, (data) => {
      setEvents(data);
      setLoading(false);
    });
    
    return unsubscribe;
  }, [user]);

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this event permanently? This cannot be undone.")) return;
    try {
      await deleteEventById(id);
    } catch (err) {
      alert("Error deleting event: " + err.message);
    }
  }

  return (
    <div className="org-dash-wrapper">
      <Toolbar />
      
      <main className="org-content" style={{ padding: '40px' }}>
        <header className="dashboard-header-flex">
          <div className="title-area">
            <h2 className="bright-text" style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Organizer Hub</h2>
            <p className="dim-text">Monitor your webinar performance and attendee counts.</p>
          </div>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="create-btn-primary"
            onClick={() => nav("/create")}
            style={{ 
              padding: '15px 30px', 
              borderRadius: '12px', 
              background: '#2563eb', 
              color: 'white', 
              border: 'none', 
              fontWeight: 'bold', 
              cursor: 'pointer' 
            }}
          >
            + Create New Event
          </motion.button>
        </header>

        <section className="events-grid-container">
          <AnimatePresence>
            {events.length === 0 && !loading ? (
              <div className="empty-state-card">
                <div className="empty-icon">📅</div>
                <h3 className="bright-text">No events created yet</h3>
                <p className="dim-text">Your scheduled webinars will appear here.</p>
                <button className="action-link" onClick={() => nav("/create")} style={{ marginTop: '20px' }}>
                  Create your first event →
                </button>
              </div>
            ) : (
              events.map((ev) => (
                <motion.div 
                  key={ev.id} 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="organizer-event-card"
                >
                  <div className="card-top">
                    <div className="event-main-info">
                      <span className="event-date-pill">
                        {ev.date ? new Date(ev.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "TBA"}
                      </span>
                      <h4>{ev.name}</h4>
                      <p className="event-excerpt" style={{ display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {ev.description || "No description provided."}
                      </p>
                    </div>
                    
                    {/* Live Counter Component */}
                    <AttendeeStats eventId={ev.id} />
                  </div>

                  <div className="card-actions">
                    <button className="action-link" onClick={() => nav(`/event/${ev.id}`)}>
                      VIEW LIVE PAGE
                    </button>
                    
                    <div className="footer-right">
                      <button 
                        className="btn-icon-only" 
                        title="Edit Event"
                        onClick={() => nav(`/edit/${ev.id}`)}
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-icon-only" 
                        title="Delete Event"
                        style={{ color: '#ef4444' }}
                        onClick={() => handleDelete(ev.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}