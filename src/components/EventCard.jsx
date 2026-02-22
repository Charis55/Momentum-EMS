// src/components/EventCard.jsx
import React, { useState, useEffect } from "react";
import { enrollUser, unenrollUser, isUserEnrolled, getAttendeesCount } from "../firebase/events";
import { useAuth } from "../context/AuthContext";
import { getCategoryImage } from "../utils/categoryImages";
import ConfirmationModal from "./ConfirmationModal";

export default function EventCard({ event, onDeleted = () => { }, isOrganizerView = false }) {
  const { user } = useAuth();
  const [enrolled, setEnrolled] = useState(false);
  const [count, setCount] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const timing = event.timingISO || "";
  const timezone = event.timeZone || "UTC";

  useEffect(() => {
    if (user) {
      isUserEnrolled(event.id, user.uid).then(setEnrolled);
    } else {
      setEnrolled(false);
    }
    getAttendeesCount(event.id).then(setCount);
  }, [event.id, user]);

  async function handleEnroll() {
    if (!user) {
      setModalOpen(true);
      return;
    }
    setProcessing(true);
    try {
      await enrollUser(event.id, user);
      setEnrolled(true);
      setCount(await getAttendeesCount(event.id));
    } finally {
      setProcessing(false);
    }
  }

  async function handleUnenroll() {
    setProcessing(true);
    try {
      await unenrollUser(event.id, user.uid);
      setEnrolled(false);
      setCount(await getAttendeesCount(event.id));
    } finally {
      setProcessing(false);
    }
  }

  function speak() {
    const msg = `${event.name}. Scheduled ${new Date(timing).toLocaleString()} (${timezone}). ${event.description || ""}`;
    speechSynthesis.speak(new SpeechSynthesisUtterance(msg));
  }

  return (
    <article className="event-card" aria-labelledby={`ev-${event.id}`}>
      <div style={{ display: "flex", gap: 12 }}>
        <img
          src={getCategoryImage(event.category)}
          alt={event.name}
          style={{ width: 110, height: 80, objectFit: "cover", borderRadius: 8 }}
        />
        <div style={{ flex: 1 }}>
          <h4 id={`ev-${event.id}`}>{event.name}</h4>
          <p style={{ margin: "6px 0" }}>{event.description?.slice(0, 160)}</p>
          <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
            When: {timing ? new Date(timing).toLocaleString() : "TBA"} ({timezone})
          </p>
          <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
            Organizer: {event.organizerEmail}
          </p>
          <p style={{ marginTop: 6, fontSize: 13, color: "#6b7280" }}>
            Attendees: {count ?? "—"}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        {!isOrganizerView && (
          <>
            {enrolled ? (
              <button className="btn" onClick={handleUnenroll} disabled={processing}>Unenroll</button>
            ) : (
              <button className="btn btn-primary" onClick={handleEnroll} disabled={processing}>Enroll</button>
            )}

            <button className="btn btn-ghost" onClick={speak}>Listen</button>
            {event.link && <a className="btn btn-ghost" href={event.link} target="_blank">Open link</a>}
          </>
        )}

        {isOrganizerView && (
          <>
            <a className="btn" href={`/event/${event.id}`}>View</a>
            <button className="btn btn-ghost" onClick={() => onDeleted(event.id)}>Delete</button>
          </>
        )}
      </div>

      <ConfirmationModal
        isOpen={modalOpen}
        title="Authentication Required"
        message="Please sign in to enroll in this webinar."
        type="info"
        onConfirm={() => setModalOpen(false)}
      />
    </article>
  );
}
