import React, { useState, useEffect } from "react";

/**
 * CompositeDateTime Component
 * Visually appears as a single input but consists of multiple focusable segments
 * to allow accurate screen reader focus notifications for each part.
 */
export default function CompositeDateTime({ value, onChange, name, id }) {
  // Parse ISO string (YYYY-MM-DDTHH:mm) into parts
  const parseValue = (val) => {
    if (!val) return { year: "", month: "", day: "", hour: "", minute: "", period: "AM" };
    try {
      const date = new Date(val);
      if (isNaN(date)) return { year: "", month: "", day: "", hour: "", minute: "", period: "AM" };
      
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

  useEffect(() => {
    setParts(parseValue(value));
  }, [value]);

  const updateParts = (newParts) => {
    setParts(newParts);
    // Construct ISO string
    let h = parseInt(newParts.hour) || 0;
    if (newParts.period === "PM" && h < 12) h += 12;
    if (newParts.period === "AM" && h === 12) h = 0;
    
    // YYYY-MM-DDTHH:mm
    const isoString = `${newParts.year || "2026"}-${newParts.month || "01"}-${newParts.day || "01"}T${h.toString().padStart(2, "0")}:${newParts.minute || "00"}`;
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
    </div>
  );
}
