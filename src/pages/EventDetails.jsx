import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { subscribeUpcomingEvents } from "../firebase/events";
import Toolbar from "../components/Toolbar";
import "./CreateEvent.css"; 

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [copied, setCopied] = useState(false); // ✅ Share feedback state

  useEffect(() => {
    const unsubscribe = subscribeUpcomingEvents((events) => {
      const found = events.find((e) => e.id === id);
      setEvent(found);
    });
    return () => unsubscribe();
  }, [id]);

  // ✅ Share functionality
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!event) {
    return (
      <div className="auth-bg">
        <Toolbar />
        <p style={{ color: 'white', textAlign: 'center', paddingTop: '100px' }}>
          Loading event details...
        </p>
      </div>
    );
  }

  return (
    <div className="auth-bg" style={{ minHeight: '100vh' }}>
      <Toolbar />
      <div className="container" style={{ paddingTop: '100px', paddingBottom: '50px' }}>
        <div className="create-form-card animate-fade" style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <button 
              onClick={() => navigate(-1)} 
              style={{ background: 'none', border: 'none', color: '#ffcc33', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
            >
              ← Back to Events
            </button>

            {/* ✅ SHARE BUTTON */}
            <button 
              onClick={handleShare}
              style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', transition: '0.3s' }}
            >
              {copied ? "✅ Link Copied!" : "🔗 Share Event"}
            </button>
          </div>

          <h2 className="form-title" style={{ fontSize: '2.5rem', marginBottom: '10px' }}>
            {event.name}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', marginTop: '30px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '800' }}>Date & Time</label>
                <p style={{ color: 'white', fontSize: '1.1rem', margin: '5px 0' }}>
                  {new Date(event.date || event.timingISO).toLocaleString()}
                </p>
              </div>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '800' }}>Speaker</label>
                <p style={{ color: 'white', fontSize: '1.1rem', margin: '5px 0' }}>
                  {event.speaker || "To be announced"}
                </p>
              </div>
            </div>

            <div className="info-section">
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '800' }}>Description</label>
              <p style={{ color: 'white', lineHeight: '1.6', marginTop: '8px' }}>{event.description}</p>
            </div>

            {event.objectives && (
              <div className="info-section">
                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '800' }}>Objectives</label>
                <p style={{ color: 'white', lineHeight: '1.6', marginTop: '8px' }}>{event.objectives}</p>
              </div>
            )}

            {event.link && (
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <a href={event.link} target="_blank" rel="noreferrer" className="auth-btn" style={{ display: 'inline-block', textDecoration: 'none', padding: '15px 40px' }}>
                  Join Webinar Now →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}