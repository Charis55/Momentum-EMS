import React, { useState } from "react";

/**
 * Simple accessible registration form component.
 * Props:
 * - onSubmit({name,email,accessibilityNeeds})
 */
export default function AccessibleForm({ onSubmit, initial = {} }) {
  const [form, setForm] = useState({
    name: initial.name || "",
    email: initial.email || "",
    accessibilityNeeds: initial.accessibilityNeeds || ""
  });
  const [status, setStatus] = useState(null);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    try {
      await onSubmit(form);
      setStatus("success");
      // reset accessible message for SR
      setForm({ name: "", email: "", accessibilityNeeds: "" });
    } catch (err) {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-describedby="form-status" noValidate>
      <div>
        <label htmlFor="name">Full name</label>
        <input id="name" name="name" value={form.name} onChange={handleChange} required />
      </div>

      <div>
        <label htmlFor="email">Email address</label>
        <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
      </div>

      <div>
        <label htmlFor="accessibilityNeeds">Accessibility needs (optional)</label>
        <textarea id="accessibilityNeeds" name="accessibilityNeeds" value={form.accessibilityNeeds} onChange={handleChange} />
      </div>

      <button type="submit">Register</button>

      <div id="form-status" role="status" aria-live="polite">
        {status === "submitting" && "Submitting…"}
        {status === "success" && "Registration successful. A confirmation email will be sent."}
        {status === "error" && "There was an error. Please try again or contact support."}
      </div>
    </form>
    
  );
}
