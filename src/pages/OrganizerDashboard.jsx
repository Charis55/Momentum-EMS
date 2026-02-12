// src/pages/OrganizerDashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { subscribeOrganizerEvents, deleteEventById, updateEvent } from "../firebase/events";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./OrganizerDashboard.css";

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  // Listen to organizer's events in Firestore
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeOrganizerEvents(user.uid, setEvents);
    return unsubscribe;
  }, [user]);

  // Delete event
  async function handleDelete(id) {
    if (!window.confirm("Delete this event permanently?")) return;
    try {
      setLoading(true);
      await deleteEventById(id);
    } catch (err) {
      alert("Error deleting: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  // Start inline edit mode
  function startEdit(ev) {
    setEditing({ id: ev.id, name: ev.name });
  }

  // Save edit to Firestore
  async function saveEdit() {
    if (!editing) return;
    try {
      await updateEvent(editing.id, { name: editing.name });
      setEditing(null);
    } catch (err) {
      alert("Error updating: " + err.message);
    }
  }

  return (
    <main className="organizer-dashboard">
      <header className="dashboard-header">
        <motion.h2
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Organizer Dashboard
        </motion.h2>

        <motion.button
          className="btn btn-primary"
          onClick={() => nav("/create")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          + Create New Event
        </motion.button>
      </header>

      <section className="event-section">
        <h3>Your Events</h3>

        {events.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            You haven’t created any events yet.
          </motion.p>
        )}

        <div className="event-grid">
          {events.map((ev) => (
            <motion.div
              key={ev.id}
              className="event-item"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {editing && editing.id === ev.id ? (
                <div className="edit-box">
                  <input
                    className="input"
                    value={editing.name}
                    onChange={(e) =>
                      setEditing({ ...editing, name: e.target.value })
                    }
                  />
                  <div className="edit-actions">
                    <button className="btn btn-save" onClick={saveEdit}>
                      Save
                    </button>
                    <button
                      className="btn btn-cancel"
                      onClick={() => setEditing(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="event-info">
                    <h4>{ev.name}</h4>
                    <p className="event-time">
                      {new Date(ev.timingISO).toLocaleString()} (
                      {ev.timezone || "N/A"})
                    </p>
                    <p className="event-desc">{ev.description}</p>
                  </div>

                  <div className="event-actions">
                    <button className="btn" onClick={() => startEdit(ev)}>
                      Edit
                    </button>
                    <button
                      className="btn btn-ghost"
                      onClick={() => handleDelete(ev.id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                    <button
                      className="btn btn-view"
                      onClick={() => nav(`/event/${ev.id}`)}
                    >
                      View
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
