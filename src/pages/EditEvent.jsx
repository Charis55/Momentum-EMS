import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, deleteField } from "firebase/firestore";
import { db } from "../firebase/config";
import Toolbar from "../components/Toolbar";
import { motion } from "framer-motion";
import ConfirmationModal from "../components/ConfirmationModal";
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

const TIMEZONES = [
  "Africa/Abidjan", "Africa/Accra", "Africa/Addis_Ababa", "Africa/Algiers", "Africa/Asmara",
  "Africa/Bamako", "Africa/Bangui", "Africa/Banjul", "Africa/Bissau", "Africa/Blantyre",
  "Africa/Brazzaville", "Africa/Bujumbura", "Africa/Cairo", "Africa/Casablanca", "Africa/Ceuta",
  "Africa/Conakry", "Africa/Dakar", "Africa/Dar_es_Salaam", "Africa/Djibouti", "Africa/Douala",
  "Africa/El_Aaiun", "Africa/Freetown", "Africa/Gaborone", "Africa/Harare", "Africa/Johannesburg",
  "Africa/Juba", "Africa/Kampala", "Africa/Khartoum", "Africa/Kigali", "Africa/Kinshasa",
  "Africa/Lagos", "Africa/Libreville", "Africa/Lome", "Africa/Luanda", "Africa/Lubumbashi",
  "Africa/Lusaka", "Africa/Malabo", "Africa/Maputo", "Africa/Maseru", "Africa/Mbabane",
  "Africa/Mogadishu", "Africa/Monrovia", "Africa/Nairobi", "Africa/Ndjamena", "Africa/Niamey",
  "Africa/Nouakchott", "Africa/Ouagadougou", "Africa/Porto-Novo", "Africa/Sao_Tome", "Africa/Tripoli",
  "Africa/Tunis", "Africa/Windhoek",
  "America/Anchorage", "America/Argentina/Buenos_Aires", "America/Asuncion", "America/Bahia", "America/Barbados",
  "America/Belize", "America/Bogota", "America/Cancun", "America/Caracas", "America/Chicago",
  "America/Costa_Rica", "America/Denver", "America/Detroit", "America/El_Salvador", "America/Guatemala",
  "America/Guyana", "America/Havana", "America/Jamaica", "America/La_Paz", "America/Lima",
  "America/Los_Angeles", "America/Managua", "America/Manaus", "America/Mazatlan", "America/Mexico_City",
  "America/Montevideo", "America/Nassau", "America/New_York", "America/Panama", "America/Paramaribo",
  "America/Phoenix", "America/Port-au-Prince", "America/Port_of_Spain", "America/Puerto_Rico", "America/Santiago",
  "America/Santo_Domingo", "America/Sao_Paulo", "America/St_Johns", "America/Tegucigalpa", "America/Toronto",
  "America/Vancouver", "America/Winnipeg",
  "Asia/Almaty", "Asia/Amman", "Asia/Anadyr", "Asia/Baghdad", "Asia/Baku",
  "Asia/Bangkok", "Asia/Beirut", "Asia/Bishkek", "Asia/Brunei", "Asia/Colombo",
  "Asia/Damascus", "Asia/Dhaka", "Asia/Dubai", "Asia/Gaza", "Asia/Ho_Chi_Minh",
  "Asia/Hong_Kong", "Asia/Irkutsk", "Asia/Jakarta", "Asia/Jayapura", "Asia/Jerusalem",
  "Asia/Kabul", "Asia/Kamchatka", "Asia/Karachi", "Asia/Kathmandu", "Asia/Kolkata",
  "Asia/Kuala_Lumpur", "Asia/Kuwait", "Asia/Macau", "Asia/Magadan", "Asia/Makassar",
  "Asia/Manila", "Asia/Muscat", "Asia/Nicosia", "Asia/Novosibirsk", "Asia/Omsk",
  "Asia/Oral", "Asia/Pontianak", "Asia/Pyongyang", "Asia/Qatar", "Asia/Qyzylorda",
  "Asia/Riyadh", "Asia/Sakhalin", "Asia/Samarkand", "Asia/Seoul", "Asia/Shanghai",
  "Asia/Singapore", "Asia/Taipei", "Asia/Tashkent", "Asia/Tbilisi", "Asia/Tehran",
  "Asia/Thimphu", "Asia/Tokyo", "Asia/Ulaanbaatar", "Asia/Urumqi", "Asia/Vientiane",
  "Asia/Vladivostok", "Asia/Yakutsk", "Asia/Yangon", "Asia/Yekaterinburg", "Asia/Yerevan",
  "Atlantic/Azores", "Atlantic/Bermuda", "Atlantic/Canary", "Atlantic/Cape_Verde", "Atlantic/Faroe",
  "Atlantic/Madeira", "Atlantic/Reykjavik", "Atlantic/South_Georgia", "Atlantic/Stanley",
  "Australia/Adelaide", "Australia/Brisbane", "Australia/Darwin", "Australia/Hobart", "Australia/Melbourne",
  "Australia/Perth", "Australia/Sydney",
  "Europe/Amsterdam", "Europe/Andorra", "Europe/Athens", "Europe/Belfast", "Europe/Belgrade",
  "Europe/Berlin", "Europe/Bratislava", "Europe/Brussels", "Europe/Bucharest", "Europe/Budapest",
  "Europe/Chisinau", "Europe/Copenhagen", "Europe/Dublin", "Europe/Gibraltar", "Europe/Helsinki",
  "Europe/Istanbul", "Europe/Kaliningrad", "Europe/Kiev", "Europe/Lisbon", "Europe/London",
  "Europe/Luxembourg", "Europe/Madrid", "Europe/Malta", "Europe/Minsk", "Europe/Monaco",
  "Europe/Moscow", "Europe/Oslo", "Europe/Paris", "Europe/Prague", "Europe/Riga",
  "Europe/Rome", "Europe/Samara", "Europe/Sarajevo", "Europe/Simferopol", "Europe/Sofia",
  "Europe/Stockholm", "Europe/Tallinn", "Europe/Tirane", "Europe/Uzhgorod", "Europe/Vaduz",
  "Europe/Vienna", "Europe/Vilnius", "Europe/Volgograd", "Europe/Warsaw", "Europe/Zagreb", "Europe/Zaporozhye", "Europe/Zurich",
  "Indian/Antananarivo", "Indian/Chagos", "Indian/Christmas", "Indian/Cocos", "Indian/Comoro",
  "Indian/Kerguelen", "Indian/Mahe", "Indian/Maldives", "Indian/Mauritius", "Indian/Mayotte", "Indian/Reunion",
  "Pacific/Apia", "Pacific/Auckland", "Pacific/Chatham", "Pacific/Chuuk", "Pacific/Easter",
  "Pacific/Efate", "Pacific/Enderbury", "Pacific/Fakaofo", "Pacific/Fiji", "Pacific/Funafuti",
  "Pacific/Galapagos", "Pacific/Gambier", "Pacific/Guadalcanal", "Pacific/Guam", "Pacific/Honolulu",
  "Pacific/Kiritimati", "Pacific/Kosrae", "Pacific/Kwajalein", "Pacific/Majuro", "Pacific/Marquesas",
  "Pacific/Midway", "Pacific/Nauru", "Pacific/Niue", "Pacific/Norfolk", "Pacific/Noumea",
  "Pacific/Pago_Pago", "Pacific/Palau", "Pacific/Pitcairn", "Pacific/Pohnpei", "Pacific/Port_Moresby",
  "Pacific/Rarotonga", "Pacific/Saipan", "Pacific/Tahiti", "Pacific/Tarawa", "Pacific/Tongatapu",
  "Pacific/Wake", "Pacific/Wallis", "UTC"
];

// Custom Searchable Dropdown Component
const SearchableDropdownEdit = ({ options, value, name, onSelect, placeholder }) => {
  const [searchTerm, setSearchTerm] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const listboxRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listboxRef.current) {
      const optionElement = listboxRef.current.children[focusedIndex];
      if (optionElement) {
        optionElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [focusedIndex, isOpen]);

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
          onSelect(name, filteredOptions[focusedIndex]);
          setIsOpen(false);
          setFocusedIndex(-1);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
      default:
        break;
    }
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        id={name}
        type="text"
        ref={inputRef}
        className="form-input stencil-input"
        placeholder={placeholder || "Search or select..."}
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
          setFocusedIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        aria-controls={`${name}-listbox-edit`}
        aria-activedescendant={focusedIndex >= 0 ? `${name}-option-edit-${focusedIndex}` : undefined}
      />
      {isOpen && (
        <ul
          id={`${name}-listbox-edit`}
          ref={listboxRef}
          role="listbox"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 50,
            background: "var(--card-bg, #181615)",
            maxHeight: "220px",
            overflowY: "auto",
            margin: "5px 0 0 0",
            padding: "0",
            listStyle: "none",
            borderRadius: "8px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
            border: "1px solid #2a2a2a"
          }}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, index) => (
              <li
                key={opt}
                id={`${name}-option-edit-${index}`}
                role="option"
                aria-selected={focusedIndex === index || opt === value}
                style={{
                  padding: "12px 16px",
                  cursor: "pointer",
                  color: "#ffffff",
                  borderBottom: "1px solid #2a2a2a",
                  fontSize: "0.95rem",
                  transition: "background 0.2s",
                  background: focusedIndex === index ? "var(--input-border, #444)" : "var(--card-bg, #181615)"
                }}
                onMouseDown={() => {
                  onSelect(name, opt);
                  setIsOpen(false);
                }}
                onMouseEnter={() => setFocusedIndex(index)}
              >
                {opt}
              </li>
            ))
          ) : (
            <li role="option" aria-disabled="true" style={{ padding: "12px 16px", color: "#888", fontSize: "0.95rem" }}>
              No items found
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
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    speaker: "",
    category: "",
    date: "",
    timezone: "",
    isPrivate: true,
    link: "",
    description: "",
    objectives: "",
    relevance: "",
    imageUrl: ""
  });

  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: () => { }
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
            timezone: data.timezone || data.timeZone || "",
            link: data.link || data.externalLink || "",
            objectives: data.objectives || data.learningObjectives || "",
            relevance: data.relevance || "",
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
    setLoading("Processing...");
    try {
      const docRef = doc(db, "events", eventId);

      setLoading("Saving Changes...");
      const cleanData = {
        ...formData,
        isPublic: deleteField(),
        updatedAt: new Date().toISOString()
      };

      await updateDoc(docRef, cleanData);
      setModal({
        isOpen: true,
        title: "Success",
        message: "✅ Event Updated Successfully!",
        type: "success",
        onConfirm: () => {
          setModal({ ...modal, isOpen: false });
          navigate("/organizer-dashboard");
        }
      });
    } catch (error) {
      console.error("Firestore Update Error:", error);
      setModal({
        isOpen: true,
        title: "Error",
        message: "❌ " + error.message,
        type: "danger",
        onConfirm: () => setModal({ ...modal, isOpen: false })
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  if (loading) return <div className="loader">Loading...</div>;

  return (
    <>
      <Toolbar />
      <main className="create-hero-wide">
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
                <label htmlFor="name">Event Name</label>
                <input id="name" type="text" name="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="form-input stencil-input" required />
              </div>

              <div className="form-group">
                <label htmlFor="speaker">Speaker Name</label>
                <input id="speaker" type="text" name="speaker" value={formData.speaker} onChange={(e) => setFormData({ ...formData, speaker: e.target.value })} className="form-input stencil-input" placeholder="Presenter name" required />
              </div>
            </div>

            <div className="form-grid-3col">
              <div className="form-group">
                <label htmlFor="date">Date & Time</label>
                <input id="date" type="datetime-local" name="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="form-input stencil-input" required />
              </div>
              <div className="form-group">
                <label htmlFor="timezone">Time Zone</label>
                <SearchableDropdownEdit
                  options={TIMEZONES}
                  value={formData.timezone}
                  name="timezone"
                  onSelect={handleCategorySelect}
                  placeholder="Select Time Zone"
                />
              </div>
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <SearchableDropdownEdit
                  options={WEBINAR_CATEGORIES}
                  value={formData.category}
                  name="category"
                  onSelect={handleCategorySelect}
                  placeholder="Select Category"
                />
              </div>
            </div>

            <div className="form-grid-2col">
              <div className="form-group">
                <label htmlFor="link">External Link (Optional)</label>
                <input id="link" type="url" name="link" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} className="form-input stencil-input" />
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

            <div className="form-grid-3col-textareas">
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="form-textarea stencil-input" required></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="objectives">Learning Objectives</label>
                <textarea id="objectives" name="objectives" value={formData.objectives} onChange={(e) => setFormData({ ...formData, objectives: e.target.value })} className="form-textarea stencil-input" required></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="relevance">Topic Relevance</label>
                <textarea id="relevance" name="relevance" value={formData.relevance} onChange={(e) => setFormData({ ...formData, relevance: e.target.value })} className="form-textarea stencil-input" required></textarea>
              </div>
            </div>

            <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
              <button className="btn-primary form-submit-btn stencil-btn" style={{ flex: 2 }} disabled={!!loading}>
                {loading && typeof loading === 'string' ? loading : loading ? "Updating..." : "Update Webinar →"}
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
      </main>

      <ConfirmationModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={modal.onConfirm}
      />
    </>
  );
}
