import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, deleteField } from "firebase/firestore";
import { db } from "../firebase/config"; 
import Toolbar from "../components/Toolbar";
import { motion } from "framer-motion";
import "./OrganizerDashboard.css";

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

// Custom Searchable Dropdown for EditEvent (Styled to match EditEvent inputs)
const SearchableDropdownEdit = ({ options, value, name, onSelect, customStyle }) => {
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
        style={customStyle}
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
          background: "#ffffff",
          maxHeight: "220px",
          overflowY: "auto",
          margin: "5px 0 0 0",
          padding: "0",
          listStyle: "none",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          border: "none"
        }}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <li
                key={opt}
                style={{
                  padding: "15px 18px",
                  cursor: "pointer",
                  color: "#000",
                  borderBottom: "1px solid #f0f0f0",
                  fontSize: "1rem",
                  fontWeight: "600",
                  transition: "background 0.2s"
                }}
                onMouseDown={() => onSelect(name, opt)}
                onMouseEnter={(e) => e.currentTarget.style.background = "#ffeedb"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#ffffff"}
              >
                {opt}
              </li>
            ))
          ) : (
            <li style={{ padding: "15px 18px", color: "#888", fontWeight: "600" }}>
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

  const inputStyle = {
    background: 'rgba(255, 255, 255, 0.95)',
    color: '#000000',
    width: '100%',
    textAlign: 'left',
    padding: '18px',
    fontSize: '1.1rem',
    fontWeight: '600',
    border: 'none',
    borderRadius: '12px'
  };

  const labelStyle = { 
    fontWeight: '800', 
    color: 'white', 
    display: 'block', 
    marginBottom: '10px', 
    textTransform: 'uppercase', 
    fontSize: '0.85rem', 
    letterSpacing: '1.2px' 
  };

  return (
    <div className="org-dash-wrapper">
      <Toolbar />
      
      <main className="org-content" style={{ padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bright-text" 
            style={{ fontSize: '3.5rem', fontWeight: '900', letterSpacing: '-1.5px' }}
          >
            Edit Webinar
          </motion.h2>
        </header>

        <motion.form 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          onSubmit={handleUpdate} 
          className="organizer-event-card" 
          style={{ 
            maxWidth: '800px', 
            width: '100%', 
            padding: '50px', 
            borderRadius: '28px',
            background: 'linear-gradient(145deg, #ff8a00, #e52e71)', 
            boxShadow: '0 25px 50px rgba(0,0,0,0.4)'
          }}
        >
          {/* HIGH CONTRAST STATUS BANNER */}
          <div style={{
            marginBottom: '30px',
            padding: '20px',
            borderRadius: '15px',
            textAlign: 'center',
            fontWeight: '900',
            fontSize: '1.1rem',
            background: formData.isPrivate ? '#000000' : '#22c55e', 
            color: '#ffffff',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            border: '2px solid rgba(255,255,255,0.4)'
          }}>
            {formData.isPrivate ? "🔒 THIS EVENT IS CURRENTLY PRIVATE" : "🌐 THIS EVENT IS CURRENTLY PUBLIC"}
          </div>

          {/* Event Name */}
          <div style={{ marginBottom: '25px' }}>
            <label style={labelStyle}>Event Name</label>
            <input 
              type="text" 
              style={inputStyle}
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required 
            />
          </div>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
            {/* Speaker Name */}
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Speaker Name</label>
              <input 
                type="text" 
                style={inputStyle}
                value={formData.speaker}
                onChange={(e) => setFormData({...formData, speaker: e.target.value})}
              />
            </div>

            {/* IMPLEMENTED SEARCHABLE DROPDOWN */}
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Category</label>
              <SearchableDropdownEdit
                options={WEBINAR_CATEGORIES}
                value={formData.category}
                name="category"
                onSelect={handleCategorySelect}
                customStyle={inputStyle}
              />
            </div>
          </div>

          {/* Date/Time and Time Zone */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Date & Time</label>
              <input 
                type="datetime-local" 
                style={inputStyle}
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Time Zone</label>
              <select 
                style={inputStyle}
                value={formData.timeZone}
                onChange={(e) => setFormData({...formData, timeZone: e.target.value})}
              >
                <option value="Africa/Lagos">Africa/Lagos</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York</option>
              </select>
            </div>
          </div>

          {/* PRIVATE TOGGLE SECTION */}
          <div style={{ 
            marginBottom: '25px', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center', 
            background: 'rgba(0,0,0,0.2)', 
            padding: '20px', 
            borderRadius: '15px'
          }}>
            <div>
              <label style={{ ...labelStyle, marginBottom: '5px' }}>Private Event</label>
              <p style={{ color: 'white', opacity: 0.8, fontSize: '0.8rem', margin: 0 }}>
                {formData.isPrivate ? "Only people with the link can join." : "Visible to everyone on the platform."}
              </p>
            </div>
            <input 
              type="checkbox" 
              checked={formData.isPrivate}
              onChange={(e) => setFormData({...formData, isPrivate: e.target.checked})}
              style={{ 
                width: '35px', 
                height: '35px', 
                cursor: 'pointer',
                accentColor: '#ff4b2b'
              }}
            />
          </div>

          {/* External Link */}
          <div style={{ marginBottom: '25px' }}>
            <label style={labelStyle}>External Link (Optional)</label>
            <input 
              type="url" 
              style={inputStyle}
              value={formData.externalLink}
              onChange={(e) => setFormData({...formData, externalLink: e.target.value})}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '25px' }}>
            <label style={labelStyle}>Description</label>
            <textarea 
              rows="4"
              style={{ ...inputStyle, height: 'auto', fontWeight: '500' }}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* Learning Objectives */}
          <div style={{ marginBottom: '35px' }}>
            <label style={labelStyle}>Learning Objectives</label>
            <textarea 
              rows="4"
              style={{ ...inputStyle, height: 'auto', fontWeight: '500' }}
              value={formData.learningObjectives}
              onChange={(e) => setFormData({...formData, learningObjectives: e.target.value})}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "20px" }}>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              style={{ flex: 2, padding: '18px', borderRadius: '15px', background: 'white', color: '#000', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
            >
              Update Webinar
            </motion.button>
            <button 
              type="button" 
              onClick={() => navigate("/organizer-dashboard")} 
              style={{ flex: 1, color: 'white', background: 'transparent', border: '1px solid white', padding: '17px', borderRadius: '15px', cursor: 'pointer' }}
            >
              CANCEL
            </button>
          </div>
        </motion.form>
      </main>
    </div>
  );
}