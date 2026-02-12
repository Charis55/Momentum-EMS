import React, { useState } from "react";
import { createEvent } from "../firebase/events";
import { auth } from "../firebase/config"; // Added auth import
import { useNavigate } from "react-router-dom";
import Toolbar from "../components/Toolbar";
import logo from "/assets/momentum-logo.svg";
import "./CreateEvent.css";

export default function CreateEvent() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    date: "",
    timezone: "Africa/Lagos",
    link: "",
    description: "",
    objectives: "",
    relevance: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to create an event.");
      setLoading(false);
      return;
    }

    try {
      const eventId = await createEvent(form, user);
      // Generate the internal link automatically
      const generatedLink = `${window.location.origin}/events/${eventId}`;
      alert(`✅ Event Published! \nYour Event Link: ${generatedLink}`);
      nav("/dashboard");
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
            <h2 className="create-title">Host a Premium Webinar</h2>
            <p className="create-sub">
              Share knowledge, inspire audiences & create lasting impact.
            </p>
          </div>
        </div>

        <div className="create-form-card">
          <h2 className="form-title">Create New Event</h2>

          <form onSubmit={submit}>
            {[
              ["name", "Event Name"],
              ["date", "Date & Time", "datetime-local"],
              ["timezone", "Time Zone"],
              ["link", "External Link (Optional)"],
            ].map(([key, label, type]) => (
              <div key={key} className="form-group">
                <label>{label}</label>
                <input
                  type={type || "text"}
                  name={key}
                  value={form[key]}
                  onChange={handleChange}
                  className="form-input"
                  required={key !== "link"}
                />
              </div>
            ))}

            {[
              ["description", "Description"],
              ["objectives", "Learning Objectives"],
              ["relevance", "Topic Relevance & Specificity"],
            ].map(([key, label]) => (
              <div key={key} className="form-group">
                <label>{label}</label>
                <textarea
                  name={key}
                  value={form[key]}
                  onChange={handleChange}
                  className="form-textarea"
                  rows="3"
                ></textarea>
              </div>
            ))}

            <button className="btn-primary form-submit-btn" disabled={loading}>
              {loading ? "Publishing..." : "Publish Event →"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}