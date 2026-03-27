import React, { useState, useEffect } from "react";

/**
 * CompositeDateTime Component
 * Visually appears as a single input but consists of multiple focusable segments
 * to allow accurate screen reader focus notifications for each part.
 * Now includes a hidden native picker for the browser calendar experience.
 */
export default function CompositeDateTime({ value, onChange, name, id }) {
  const nativePickerRef = React.useRef(null);
  const lastInternalValue = React.useRef(value);

  // Parse ISO string (YYYY-MM-DDTHH:mm) into parts
  const parseValue = (val) => {
    if (!val) return { year: "", month: "", day: "", hour: "", minute: "", period: "AM" };
    try {
      const date = new Date(val);
      if (isNaN(date)) {
          // If invalid, try to preserve what we can or return defaults
          return { year: "", month: "", day: "", hour: "", minute: "", period: "AM" };
      }
      
      let h = date.getHours();
      const p = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12; // Convert 0 to 12 for 12h format
      
      return {
        year: date.getFullYear().toString(),
        month: (date.getMonth() + 1).toString().padStart(2, "0"),
        day: date.getDate().toString().padStart(2, "0"),
        hour: h.toString().padStart(2, "0"),
        minute: date.getMinutes().toString().padStart(2, "0"),
        period: p
      };
    } catch {
      return { year: "", month: "", day: "", hour: "", minute: "", period: "AM" };
    }
  };

  const [parts, setParts] = useState(parseValue(value));

  // Sync from prop ONLY if it changed externally (e.g. from picker)
  useEffect(() => {
    if (value !== lastInternalValue.current) {
      setParts(parseValue(value));
      lastInternalValue.current = value;
    }
  }, [value]);

  const updateParts = (newParts) => {
    setParts(newParts);
    
    // Build ISO string with STRICT padding for native picker compatibility
    const pYear = (newParts.year || "2026").padStart(4, "0");
    const pMonth = (newParts.month || "01").padStart(2, "0");
    const pDay = (newParts.day || "01").padStart(2, "0");
    const pMin = (newParts.minute || "00").padStart(2, "0");
    
    let h = parseInt(newParts.hour) || 0;
    if (newParts.period === "PM" && h < 12) h += 12;
    if (newParts.period === "AM" && h === 12) h = 0;
    const pHour = h.toString().padStart(2, "0");
    
    // YYYY-MM-DDTHH:mm
    const isoString = `${pYear}-${pMonth}-${pDay}T${pHour}:${pMin}`;
    
    lastInternalValue.current = isoString;
    onChange({ target: { name, value: isoString } });
  };

  const handlePartChange = (partName, val) => {
    const updated = { ...parts, [partName]: val };
    updateParts(updated);
  };

  const containerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    background: "var(--input-bg)",
    border: "1px solid var(--input-border)",
    padding: "12px 16px",
    borderRadius: "12px",
    color: "var(--card-text)",
    transition: "all 0.3s ease",
    width: "100%"
  };

  const inputPartStyle = {
    background: "transparent",
    border: "none",
    color: "inherit",
    fontSize: "1rem",
    outline: "none",
    textAlign: "center",
    padding: "0 2px",
    width: "2.5rem"
  };

  const separatorStyle = { opacity: 0.5, fontWeight: "bold" };

  return (
    <div 
      className="composite-datetime-wrapper focus-within-ring" 
      style={containerStyle}
      id={id}
    >
      <input
        type="text"
        placeholder="MM"
        style={{ ...inputPartStyle, width: "1.8rem" }}
        value={parts.month}
        onChange={(e) => handlePartChange("month", e.target.value.slice(0, 2))}
        aria-label="Month"
      />
      <span style={separatorStyle}>/</span>
      <input
        type="text"
        placeholder="DD"
        style={{ ...inputPartStyle, width: "1.8rem" }}
        value={parts.day}
        onChange={(e) => handlePartChange("day", e.target.value.slice(0, 2))}
        aria-label="Day"
      />
      <span style={separatorStyle}>/</span>
      <input
        type="text"
        placeholder="YYYY"
        style={{ ...inputPartStyle, width: "3.2rem" }}
        value={parts.year}
        onChange={(e) => handlePartChange("year", e.target.value.slice(0, 4))}
        aria-label="Year"
      />
      
      <span style={{ margin: "0 8px", opacity: 0.3 }}>|</span>

      <input
        type="text"
        placeholder="12"
        style={{ ...inputPartStyle, width: "1.8rem" }}
        value={parts.hour}
        onChange={(e) => handlePartChange("hour", e.target.value.slice(0, 2))}
        aria-label="Hour"
      />
      <span style={separatorStyle}>:</span>
      <input
        type="text"
        placeholder="00"
        style={{ ...inputPartStyle, width: "1.8rem" }}
        value={parts.minute}
        onChange={(e) => handlePartChange("minute", e.target.value.slice(0, 2))}
        aria-label="Minute"
      />
      
      <select
        value={parts.period}
        onChange={(e) => handlePartChange("period", e.target.value)}
        style={{ ...inputPartStyle, width: "3rem", cursor: "pointer", appearance: "none" }}
        aria-label="AM or PM"
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>

      <div style={{ marginLeft: "auto", position: "relative", display: "flex", alignItems: "center" }}>
        <button
          type="button"
          onClick={() => {
            if (nativePickerRef.current) {
               if (nativePickerRef.current.showPicker) {
                 nativePickerRef.current.showPicker();
               } else {
                 nativePickerRef.current.focus();
               }
            }
          }}
          style={{
            background: "transparent",
            border: "none",
            color: "#ffcc33",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            opacity: 0.8,
            transition: "opacity 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
          onMouseLeave={(e) => e.currentTarget.style.opacity = "0.8"}
          aria-label="Open Calendar Picker"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </button>

        <input
          ref={nativePickerRef}
          type="datetime-local"
          value={value || ""}
          onChange={(e) => onChange(e)}
          style={{
            position: "absolute",
            opacity: 0,
            width: 0,
            height: 0,
            pointerEvents: "none"
          }}
          tabIndex={-1}
        />
      </div>
    </div>
  );
}
