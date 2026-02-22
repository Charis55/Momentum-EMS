import React, { useState, useEffect, useRef } from "react";
import { createEvent, updateEvent, getEventById } from "../firebase/events";
import { auth } from "../firebase/config";
import { useNavigate, useParams } from "react-router-dom";
import Toolbar from "../components/Toolbar";
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
const SearchableDropdown = ({ options, value, name, onSelect, placeholder }) => {
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
        placeholder={placeholder || "Search or select..."}
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
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    speaker: "",
    date: "",
    timezone: "",
    category: "",
    link: "",
    description: "",
    objectives: "",
    relevance: "",
    isPrivate: false,
    maxCapacity: 100,
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
      setModal({
        isOpen: true,
        title: "Authentication Required",
        message: "You must be logged in to create or edit an event.",
        type: "danger",
        onConfirm: () => setModal({ ...modal, isOpen: false })
      });
      setLoading(false);
      return;
    }

    try {
      if (id) {
        setLoading("Updating Event...");
        await updateEvent(id, form);
        setModal({
          isOpen: true,
          title: "Success",
          message: "✅ Event Updated Successfully!",
          type: "success",
          onConfirm: () => {
            setModal({ ...modal, isOpen: false });
            nav("/dashboard");
          }
        });
      } else {
        setLoading("Creating Event...");
        await createEvent(form, user);
        setModal({
          isOpen: true,
          title: "Success",
          message: "✅ Event Published Successfully!",
          type: "success",
          onConfirm: () => {
            setModal({ ...modal, isOpen: false });
            nav("/dashboard");
          }
        });
      }
    } catch (err) {
      setModal({
        isOpen: true,
        title: "Error",
        message: "❌ " + err.message,
        type: "danger",
        onConfirm: () => setModal({ ...modal, isOpen: false })
      });
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
                <SearchableDropdown
                  options={TIMEZONES}
                  value={form.timezone}
                  name="timezone"
                  onSelect={handleCategorySelect}
                  placeholder="Select Time Zone"
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <SearchableDropdown
                  options={WEBINAR_CATEGORIES}
                  value={form.category}
                  name="category"
                  onSelect={handleCategorySelect}
                  placeholder="Select Category"
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
              {loading ? (typeof loading === 'string' ? loading : "Processing...") : id ? "Update Event" : "Publish Event →"}
            </button>
          </form>
        </div>
      </section>

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