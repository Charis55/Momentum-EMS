import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, deleteField } from "firebase/firestore";
import { db } from "../firebase/config";
import Toolbar from "../components/Toolbar";
import { motion } from "framer-motion";
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
const SearchableDropdownEdit = ({ options, value, name, onSelect }) => {
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
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
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

export default function EditEvent() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    speaker: "",
    category: "Technology & Software", // ADDED CATEGORY FIELD
    date: "",
    timeZone: "Africa/Lagos",
    isPrivate: true,
    externalLink: "",
    description: "",
    learningObjectives: ""
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const docRef = doc(db, "events", eventId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();

          let initialPrivateStatus = true;
          if (data.isPrivate !== undefined) {
            initialPrivateStatus = data.isPrivate;
          } else if (data.isPublic !== undefined) {
            initialPrivateStatus = !data.isPublic;
          }

          setFormData({
            ...formData,
            ...data,
            isPrivate: initialPrivateStatus
          });
        } else {
          navigate("/organizer-dashboard");
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const docRef = doc(db, "events", eventId);

      const cleanData = {
        ...formData,
        isPublic: deleteField(),
        updatedAt: new Date().toISOString()
      };

      await updateDoc(docRef, cleanData);
      navigate("/organizer-dashboard");
    } catch (error) {
      console.error("Firestore Update Error:", error);
      alert("Failed to update: Check Firestore permissions.");
    }
  };

  const handleCategorySelect = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  if (loading) return <div className="loader">Loading...</div>;

  return (
    <>
      <Toolbar />
      <section className="create-hero-wide">
        <div className="create-header-wide">
          <img src={logo} alt="Momentum Logo" className="form-hero-logo" />
          <div className="create-title-group">
            <h2 className="create-title-main">Edit Webinar</h2>
            <p className="create-sub-main">Update event details, switch visibility, and more.</p>
          </div>
        </div>

        <div className="create-form-card-wide">
          <form onSubmit={handleUpdate} className="form-wide-layout">
            <div className="form-grid-2col">
              <div className="form-group">
                <label>Event Name</label>
                <input type="text" name="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="form-input stencil-input" required />
              </div>

              <div className="form-group">
                <label>Speaker Name</label>
                <input type="text" name="speaker" value={formData.speaker} onChange={(e) => setFormData({ ...formData, speaker: e.target.value })} className="form-input stencil-input" placeholder="Presenter name" required />
              </div>
            </div>

            <div className="form-grid-3col">
              <div className="form-group">
                <label>Date & Time</label>
                <input type="datetime-local" name="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="form-input stencil-input" required />
              </div>
              <div className="form-group">
                <label>Time Zone</label>
                <input type="text" name="timeZone" value={formData.timeZone} onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })} className="form-input stencil-input" />
              </div>
              <div className="form-group">
                <label>Category</label>
                <SearchableDropdownEdit
                  options={WEBINAR_CATEGORIES}
                  value={formData.category}
                  name="category"
                  onSelect={handleCategorySelect}
                />
              </div>
            </div>

            <div className="form-grid-2col">
              <div className="form-group">
                <label>External Link (Optional)</label>
                <input type="url" name="externalLink" value={formData.externalLink} onChange={(e) => setFormData({ ...formData, externalLink: e.target.value })} className="form-input stencil-input" />
              </div>

              <div className="form-group toggle-container stencil-input">
                <label className="switch">
                  <input type="checkbox" name="isPrivate" checked={formData.isPrivate} onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })} />
                  <span className="slider round"></span>
                </label>
                <span className="toggle-label stencil-text">
                  {formData.isPrivate ? "Private (Link Only)" : "Public (Visible to All)"}
                </span>
              </div>
            </div>

            <div className="form-grid-2col">
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="form-textarea stencil-input" required></textarea>
              </div>

              <div className="form-group">
                <label>Learning Objectives</label>
                <textarea name="learningObjectives" value={formData.learningObjectives} onChange={(e) => setFormData({ ...formData, learningObjectives: e.target.value })} className="form-textarea stencil-input" required></textarea>
              </div>
            </div>

            <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
              <button className="btn-primary form-submit-btn stencil-btn" style={{ flex: 2 }} disabled={loading}>
                Update Webinar →
              </button>
              <button
                type="button"
                onClick={() => navigate("/organizer-dashboard")}
                className="btn-primary form-submit-btn stencil-btn"
                style={{ flex: 1, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", boxShadow: "none" }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}