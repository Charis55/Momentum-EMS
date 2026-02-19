import React, { useState, useEffect } from "react";
import { createEvent, updateEvent, getEventById } from "../firebase/events"; 
import { auth } from "../firebase/config";
import { useNavigate, useParams } from "react-router-dom"; 
import Toolbar from "../components/Toolbar";
import logo from "/assets/momentum-logo.svg";
import "./CreateEvent.css";

export default function CreateEvent() {
  const { id } = useParams(); 
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    name: "",
    speaker: "",
    date: "",
    timezone: "Africa/Lagos",
    link: "",
    description: "",
    objectives: "",
    relevance: "",
    isPrivate: false,
    maxCapacity: 100, // Default capacity
  });

  useEffect(() => {
    if (id) {
      const fetchEvent = async () => {
        try {
          const eventData = await getEventById(id);
          if (eventData) {
            // Populate form with existing data, keeping date in string format for input
            setForm(eventData);
          }
        } catch (err) {
          console.error("Error fetching event:", err);
        }
      };
      fetchEvent();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ 
      ...form, 
      [name]: type === "checkbox" ? checked : value 
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in.");
      setLoading(false);
      return;
    }

    try {
      if (id) {
        // UPDATE EXISTING EVENT
        await updateEvent(id, form);
        alert("✅ Event Updated!");
      } else {
        // CREATE NEW EVENT
        // Passing 'user' ensures 'organizerId' is saved for Dashboard visibility
        await createEvent(form, user);
        alert(`✅ Event Published!`);
      }
      nav("/dashboard"); // Redirect to Dashboard to see the new/updated card
    } catch (err) {
      alert("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toolbar />
      <section className="create-hero">
        <div className="create-left">
          <div className="create-logo-card">
            <img src={logo} alt="Momentum Logo" className="form-hero-logo" />
            <h2 className="create-title">{id ? "Edit Event" : "Host a Premium Webinar"}</h2>
            <p className="create-sub">Share knowledge, inspire audiences & create lasting impact.</p>
          </div>
        </div>

        <div className="create-form-card">
          <h2 className="form-title">{id ? "Edit Details" : "Create New Event"}</h2>

          <form onSubmit={submit}>
            <div className="form-group">
              <label>Event Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} className="form-input" required />
            </div>

            <div className="form-group">
              <label>Speaker Name</label>
              <input type="text" name="speaker" value={form.speaker} onChange={handleChange} className="form-input" placeholder="Name of presenter" required />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Date & Time</label>
                <input 
                  type="datetime-local" 
                  name="date" 
                  value={form.date} 
                  onChange={handleChange} 
                  className="form-input" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Time Zone</label>
                <input 
                  type="text" 
                  name="timezone" 
                  value={form.timezone} 
                  onChange={handleChange} 
                  className="form-input" 
                />
              </div>
            </div>

            <div className="toggle-container">
               <label className="switch">
                <input type="checkbox" name="isPrivate" checked={form.isPrivate} onChange={handleChange} />
                <span className="slider round"></span>
              </label>
              <span className="toggle-label">
                {form.isPrivate ? "Private (Link Only)" : "Public (Visible to All)"}
              </span>
            </div>

            <div className="form-group">
              <label>External Link (Optional)</label>
              <input type="url" name="link" value={form.link} onChange={handleChange} className="form-input" />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} className="form-textarea" required></textarea>
            </div>

            <div className="form-group">
              <label>Learning Objectives</label>
              <textarea name="objectives" value={form.objectives} onChange={handleChange} className="form-textarea" required></textarea>
            </div>

            <div className="form-group">
              <label>Topic Relevance & Specificity</label>
              <textarea name="relevance" value={form.relevance} onChange={handleChange} className="form-textarea" required></textarea>
            </div>

            <button className="btn-primary form-submit-btn" disabled={loading}>
              {loading ? "Processing..." : id ? "Update Event" : "Publish Event →"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}