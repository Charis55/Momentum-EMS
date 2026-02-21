import React, { useState, useEffect } from "react";
import { createEvent, updateEvent, getEventById } from "../firebase/events";
import { auth } from "../firebase/config";
import { useNavigate, useParams } from "react-router-dom";
import Toolbar from "../components/Toolbar";
import logo from "/assets/momentum-logo.svg";
import "./CreateEvent.css";

const WEBINAR_CATEGORIES = [
  "Artificial Intelligence & Machine Learning",
  "Arts & Culture",
  "Business & Entrepreneurship",
  "Data Science & Analytics",
  "Design & Creativity",
  "Diversity & Inclusion",
  "Education & E-Learning",
  "Engineering & Architecture",
  "Finance & Investing",
  "Fitness & Wellness",
  "Gaming & Esports",
  "Healthcare & Medicine",
  "Human Resources (HR)",
  "Leadership & Management",
  "Legal & Compliance",
  "Marketing & SEO",
  "Nonprofit & Charity",
  "Personal Development",
  "Productivity & Time Management",
  "Real Estate",
  "Sales & Customer Success",
  "Science & Research",
  "Technology & Software",
  "Travel & Hospitality",
  "Writing & Publishing"
];

// Custom Searchable Dropdown Component
const SearchableDropdown = ({ options, value, name, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        type="text"
        className="form-input stencil-input"
        placeholder="Search or select category..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)} // Delay to allow click register
      />
      {isOpen && (
        <ul style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          zIndex: 50,
          background: "#1c1c1c",
          maxHeight: "220px",
          overflowY: "auto",
          margin: "5px 0 0 0",
          padding: "0",
          listStyle: "none",
          borderRadius: "8px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
          border: "1px solid #2a2a2a"
        }}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <li
                key={opt}
                style={{
                  padding: "12px 16px",
                  cursor: "pointer",
                  color: "#ffffff",
                  borderBottom: "1px solid #2a2a2a",
                  fontSize: "0.95rem",
                  transition: "background 0.2s"
                }}
                onMouseDown={() => onSelect(name, opt)}
                onMouseEnter={(e) => e.currentTarget.style.background = "#2a2a2a"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#1c1c1c"}
              >
                {opt}
              </li>
            ))
          ) : (
            <li style={{ padding: "12px 16px", color: "#888", fontSize: "0.95rem" }}>
              No categories found
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default function CreateEvent() {
  const { id } = useParams();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    speaker: "",
    date: "",
    timezone: "Africa/Lagos",
    category: "Technology & Software", // Updated Default
    link: "",
    description: "",
    objectives: "",
    relevance: "",
    isPrivate: false,
    maxCapacity: 100,
  });

  useEffect(() => {
    if (id) {
      const fetchEvent = async () => {
        try {
          const eventData = await getEventById(id);
          if (eventData) {
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

  const handleCategorySelect = (name, value) => {
    setForm({ ...form, [name]: value });
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
        await updateEvent(id, form);
        alert("✅ Event Updated!");
      } else {
        await createEvent(form, user);
        alert(`✅ Event Published!`);
      }
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
      <section className="create-hero-wide">
        <div className="create-header-wide">
          <img src={logo} alt="Momentum Logo" className="form-hero-logo" />
          <div className="create-title-group">
            <h2 className="create-title-main">{id ? "Edit Event" : "Host a Premium Webinar"}</h2>
            <p className="create-sub-main">Share knowledge, inspire audiences & create lasting impact.</p>
          </div>
        </div>

        <div className="create-form-card-wide">
          <form onSubmit={submit} className="form-wide-layout">
            <div className="form-grid-2col">
              <div className="form-group">
                <label>Event Name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} className="form-input stencil-input" required />
              </div>

              <div className="form-group">
                <label>Speaker Name</label>
                <input type="text" name="speaker" value={form.speaker} onChange={handleChange} className="form-input stencil-input" placeholder="Presenter name" required />
              </div>
            </div>

            <div className="form-grid-3col">
              <div className="form-group">
                <label>Date & Time</label>
                <input type="datetime-local" name="date" value={form.date} onChange={handleChange} className="form-input stencil-input" required />
              </div>
              <div className="form-group">
                <label>Time Zone</label>
                <input type="text" name="timezone" value={form.timezone} onChange={handleChange} className="form-input stencil-input" />
              </div>
              <div className="form-group">
                <label>Category</label>
                <SearchableDropdown
                  options={WEBINAR_CATEGORIES}
                  value={form.category}
                  name="category"
                  onSelect={handleCategorySelect}
                />
              </div>
            </div>

            <div className="form-grid-2col">
              <div className="form-group">
                <label>External Link (Optional)</label>
                <input type="url" name="link" value={form.link} onChange={handleChange} className="form-input stencil-input" />
              </div>

              <div className="form-group toggle-container stencil-input">
                <label className="switch">
                  <input type="checkbox" name="isPrivate" checked={form.isPrivate} onChange={handleChange} />
                  <span className="slider round"></span>
                </label>
                <span className="toggle-label stencil-text">
                  {form.isPrivate ? "Private (Link Only)" : "Public (Visible to All)"}
                </span>
              </div>
            </div>

            <div className="form-grid-3col-textareas">
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} className="form-textarea stencil-input" required></textarea>
              </div>

              <div className="form-group">
                <label>Learning Objectives</label>
                <textarea name="objectives" value={form.objectives} onChange={handleChange} className="form-textarea stencil-input" required></textarea>
              </div>

              <div className="form-group">
                <label>Topic Relevance</label>
                <textarea name="relevance" value={form.relevance} onChange={handleChange} className="form-textarea stencil-input" required></textarea>
              </div>
            </div>

            <button className="btn-primary form-submit-btn stencil-btn" disabled={loading}>
              {loading ? "Processing..." : id ? "Update Event" : "Publish Event →"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}