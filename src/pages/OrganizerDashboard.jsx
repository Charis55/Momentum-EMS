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

/**
 * ✅ Live Attendee Counter Component
 * Listens to the 'attendees' sub-collection for real-time updates.
 */
function AttendeeStats({ eventId }) {
  const [attendees, setAttendees] = useState([]);

  useEffect(() => {
    // Starts a real-time listener for this specific event's enrollment
    const unsub = subscribeToAttendees(eventId, (data) => {
      setAttendees(data);
    });
    return () => unsub(); // Proper cleanup to prevent memory leaks
  }, [eventId]);

  return (
    <div className="stat-badge" style={{
      background: 'rgba(255, 255, 255, 0.1)',
      padding: '10px 20px',
      borderRadius: '15px',
      textAlign: 'center',
      minWidth: '80px',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      <span className="stat-count" style={{ 
        display: 'block', 
        fontSize: '1.8rem', 
        fontWeight: '900', 
        color: '#fff' 
      }}>
        {attendees.length}
      </span>
      <span className="stat-label" style={{ 
        fontSize: '0.7rem', 
        textTransform: 'uppercase', 
        letterSpacing: '1px', 
        color: 'rgba(255,255,255,0.7)' 
      }}>
        Enrolled
      </span>
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
    
    // Subscribe to events where the creator's UID matches
    const unsubscribe = subscribeOrganizerEvents(user.uid, (data) => {
      setEvents(data);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [user]);

  async function handleDelete(id) {
    if (!window.confirm("Permanently delete this webinar? This action cannot be undone.")) return;
    try {
      await deleteEventById(id);
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  if (loading) return <div className="loader-container"><div className="loader"></div></div>;

  return (
    <div className="org-dash-wrapper">
      <Toolbar />
      
      <main className="org-content" style={{ padding: '40px' }}>
        <header className="dashboard-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '50px' }}>
          <div className="title-area">
            <h2 className="bright-text" style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '10px' }}>Organizer Hub</h2>
            <p className="dim-text" style={{ fontSize: '1.1rem' }}>Monitor your webinar performance and attendee counts.</p>
          </div>

          <motion.button 
            whileHover={{ scale: 1.05, backgroundColor: '#1d4ed8' }}
            whileTap={{ scale: 0.95 }}
            className="create-btn-primary"
            onClick={() => nav("/create")}
            style={{ 
              padding: '18px 35px', 
              borderRadius: '15px', 
              background: '#2563eb', 
              color: 'white', 
              border: 'none', 
              fontWeight: '800', 
              cursor: 'pointer',
              boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)'
            }}
          >
            + Create New Event
          </motion.button>
        </header>

        <section className="events-grid-container">
          <AnimatePresence>
            {events.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state">
                <h3 className="dim-text">No webinars found. Start by creating one!</h3>
              </motion.div>
            ) : (
              events.map((ev) => (
                <motion.div 
                  key={ev.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="organizer-event-card"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '24px',
                    padding: '30px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    marginBottom: '20px'
                  }}
                >
                  <div className="card-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div className="event-main-info" style={{ flex: 1 }}>
                      <span className="event-date-pill" style={{ background: 'rgba(255,255,255,0.15)', padding: '5px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', color: '#fff' }}>
                        {ev.date ? new Date(ev.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "DATE TBA"}
                      </span>
                      <h4 style={{ fontSize: '1.6rem', color: '#fff', margin: '15px 0 10px 0' }}>{ev.name}</h4>
                      <p className="event-excerpt" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: '1.5', maxWidth: '80%' }}>
                        {ev.description || "No description provided."}
                      </p>
                    </div>
                    
                    {/* ✅ FUNCTIONAL COUNTER */}
                    <AttendeeStats eventId={ev.id} />
                  </div>

                  <div className="card-actions" style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                    <button className="action-link" onClick={() => nav(`/event/${ev.id}`)} style={{ background: 'none', border: 'none', color: '#60a5fa', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem' }}>
                      VIEW LIVE PAGE →
                    </button>
                    
                    <div className="footer-right" style={{ display: 'flex', gap: '15px' }}>
                      <button className="btn-icon-only" onClick={() => nav(`/edit-event/${ev.id}`)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '10px', padding: '10px', cursor: 'pointer' }}>
                        ✏️
                      </button>
                      <button className="btn-icon-only" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '10px', padding: '10px', cursor: 'pointer' }} onClick={() => handleDelete(ev.id)}>
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