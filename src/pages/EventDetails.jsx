import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
// Imports including the unenroll function and count increment logic
import { 
  getEventById, 
  enrollInEvent, 
  unenrollFromEvent, 
  isUserEnrolled 
} from "../firebase/events"; 
import { auth } from "../firebase/config";
import Toolbar from "../components/Toolbar";
import "./CreateEvent.css"; 

export default function EventDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollStatus, setEnrollStatus] = useState(""); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const data = await getEventById(id);
        if (data) {
          setEvent(data);
          if (auth.currentUser) {
            const enrolled = await isUserEnrolled(id, auth.currentUser.uid);
            setAlreadyEnrolled(enrolled);
          }
        }
      } catch (err) {
        console.error("Error fetching event details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEventData();
  }, [id]);

  /**
   * ✅ TOGGLE ENROLLMENT HANDLER
   * Handles both Enrolling and Unenrolling to prevent permission errors
   */
  const handleToggleEnrollment = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please login to manage enrollment.");
      return;
    }
    
    setIsProcessing(true);
    setEnrollStatus(""); 
    
    try {
      if (alreadyEnrolled) {
        // Logic for Unenrolling
        const result = await unenrollFromEvent(id, user.uid);
        if (result.success) {
          setAlreadyEnrolled(false);
          setEnrollStatus(result.message);
          
          // Instant local update for the enrollment count
          setEvent(prev => ({ 
            ...prev, 
            enrolledCount: Math.max(0, (prev.enrolledCount || 1) - 1) 
          }));
        }
      } else {
        // Logic for Enrolling
        const result = await enrollInEvent(id, user);
        if (result.success) {
          setAlreadyEnrolled(true);
          setEnrollStatus(result.message);
          
          // Instant local update for the enrollment count
          setEvent(prev => ({ 
            ...prev, 
            enrolledCount: (prev.enrolledCount || 0) + 1 
          }));
        } else {
          setEnrollStatus(result.message);
        }
      }
    } catch (err) {
      // Catch and display permission or network errors
      console.error("Enrollment Action Failed:", err);
      setEnrollStatus("Error: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return (
    <div className="auth-bg full-page">
      <Toolbar />
      <div className="main-viewport-expanded">
        <h2 className="bright-text">Loading event details...</h2>
      </div>
    </div>
  );

  // Check if current user is the one who created the event
  const isOrganizer = auth.currentUser?.uid === event?.organizerId;

  return (
    <>
      <Toolbar />
      <div className="auth-bg full-page">
        <main className="main-viewport-expanded">
          <div className="details-card-ultra animate-fade">
            
            {/* Top Navigation Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <button onClick={() => nav(-1)} className="back-link" style={{color: '#ffcc33', fontWeight: '800', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px'}}>
                ← BACK TO EXPLORE
              </button>
              
              <button className="share-btn-redesign" onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Event link copied to clipboard!");
              }}>
                <span style={{fontSize: '1.2rem'}}>🔗</span> SHARE EVENT
              </button>
            </div>

            <div className="details-main-grid">
              {/* Left Column: Event Content */}
              <div className="primary-info">
                <h1 className="form-title-glow">
                  {event?.name}
                </h1>
                
                <div className="info-section" style={{ marginTop: '50px' }}>
                  <label className="meta-label">About this webinar</label>
                  <p className="bright-text" style={{ fontSize: '1.15rem', lineHeight: '1.8', opacity: 0.9 }}>
                    {event?.description || "No description provided."}
                  </p>
                </div>

                <div className="info-section" style={{ marginTop: '40px' }}>
                  <label className="meta-label">Learning Objectives</label>
                  <p className="bright-text" style={{ fontSize: '1.15rem', lineHeight: '1.8', opacity: 0.9 }}>
                    {event?.objectives || "No specific objectives listed."}
                  </p>
                </div>
              </div>

              {/* Right Column: Enrollment & Meta Info */}
              <div className="secondary-info">
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '40px', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  
                  {/* ✅ ONLY CREATOR CAN VIEW COUNT */}
                  {isOrganizer && (
                    <div className="enrollment-counter-box" style={{ marginBottom: '30px' }}>
                      <span className="counter-number">{event?.enrolledCount || 0}</span>
                      <span className="counter-label">Enrolled</span>
                    </div>
                  )}

                  <div style={{ marginBottom: '30px' }}>
                    <label className="meta-label">Speaker</label>
                    <p className="bright-text" style={{ fontSize: '1.5rem', fontWeight: '600' }}>{event?.speaker || "TBA"}</p>
                  </div>

                  <div style={{ marginBottom: '40px' }}>
                    <label className="meta-label">Date & Time</label>
                    <p className="bright-text" style={{ fontSize: '1.2rem' }}>
                      {event?.date ? new Date(event.date).toLocaleString(undefined, { 
                        weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                      }) : "TBA"}
                    </p>
                    <p style={{ color: '#ffcc33', fontSize: '0.8rem', marginTop: '5px', fontWeight: '600' }}>{event?.timezone}</p>
                  </div>

                  {/* Toggle Button */}
                  <button 
                    onClick={handleToggleEnrollment} 
                    disabled={isProcessing}
                    className="btn-primary form-submit-btn"
                    style={{ 
                      height: '75px', 
                      fontSize: '1.2rem', 
                      boxShadow: alreadyEnrolled ? 'none' : '0 10px 30px rgba(255, 122, 0, 0.3)',
                      background: alreadyEnrolled ? 'rgba(255, 255, 255, 0.05)' : 'linear-gradient(90deg, #ff7a00, #ffcc33)',
                      color: alreadyEnrolled ? '#ff4444' : '#000',
                      border: alreadyEnrolled ? '1px solid rgba(255, 68, 68, 0.4)' : 'none',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {isProcessing ? "Processing..." : alreadyEnrolled ? "Unenroll from Event" : "Confirm Enrollment →"}
                  </button>

                  {/* Enrollment Status Message */}
                  {enrollStatus && (
                    <p style={{ 
                      color: enrollStatus.toLowerCase().includes("error") ? "#ff4444" : "#4caf50", 
                      marginTop: '20px', 
                      textAlign: 'center', 
                      fontWeight: '700',
                      fontSize: '0.9rem'
                    }}>
                      {enrollStatus}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}