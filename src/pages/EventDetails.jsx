import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getEventById,
  enrollInEvent,
  unenrollFromEvent,
  isUserEnrolled
} from "../firebase/events";
import { auth } from "../firebase/config";
import { getCategoryImage } from "../utils/categoryImages";
import Toolbar from "../components/Toolbar";
import ConfirmationModal from "../components/ConfirmationModal"; //

export default function EventDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);

  // Modal State Management
  const [modal, setModal] = useState({
    show: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    type: "danger",
    onConfirm: null
  });

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

  // SHARING HANDLERS
  const shareUrl = window.location.href;
  const shareText = `Join me for "${event?.name}" with ${event?.speaker}! Check it out on Momentum:`;

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`, "_blank");
  };

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, "_blank");
  };

  const shareInstagram = () => {
    navigator.clipboard.writeText(shareUrl);
    setModal({
      show: true,
      title: "Link Copied!",
      message: "The event link has been copied to your clipboard. You can now paste it into your Instagram Story or DMs.",
      confirmText: "Got it",
      type: "gold",
      onConfirm: () => setModal({ ...modal, show: false })
    });
  };

  const shareMessages = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: event?.name, text: shareText, url: shareUrl });
      } catch (err) { console.log("Share failed", err); }
    } else {
      window.location.href = `sms:?&body=${encodeURIComponent(shareText + " " + shareUrl)}`;
    }
  };

  const handleToggleEnrollment = async () => {
    const user = auth.currentUser;
    if (!user) {
      setModal({
        show: true,
        title: "Login Required",
        message: "Please sign in to your account to register for this event.",
        confirmText: "Login",
        type: "gold",
        onConfirm: () => nav("/login")
      });
      return;
    }

    if (alreadyEnrolled) {
      setModal({
        show: true,
        title: "Are you sure?",
        message: "This action is irreversible. You will need to re-register if you change your mind.",
        confirmText: "Confirm Unenroll",
        type: "danger",
        onConfirm: async () => {
          setModal({ ...modal, show: false });
          setIsProcessing(true);
          try {
            await unenrollFromEvent(id, user.uid, user, event);
            setAlreadyEnrolled(false);
          } catch (e) { console.error(e); }
          finally { setIsProcessing(false); }
        }
      });
    } else {
      setIsProcessing(true);
      try {
        await enrollInEvent(id, user);
        setAlreadyEnrolled(true);
      } catch (e) { console.error(e); }
      finally { setIsProcessing(false); }
    }
  };

  if (loading) return <div className="event-details-wrapper full-page"><Toolbar /></div>;

  return (
    <>
      <Toolbar />
      <div className="event-details-wrapper">
        <main className="container details-container">

          <div className="details-header-nav">
            <button onClick={() => nav(-1)} className="back-explore-btn">← BACK TO EXPLORE</button>
            <div className="social-share-group">
              <button onClick={shareWhatsApp} className="social-pill whatsapp-pill">WHATSAPP</button>
              <button onClick={shareTwitter} className="social-pill twitter-pill">   X   </button>
              <button onClick={shareInstagram} className="social-pill insta-pill">INSTAGRAM</button>
              <button onClick={shareMessages} className="social-pill msg-pill">MESSAGES</button>
            </div>
          </div>

          <div className="details-card-ultra">
            <div style={{
              width: '100%',
              height: '400px',
              borderRadius: '24px',
              overflow: 'hidden',
              marginBottom: '40px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <img
                src={getCategoryImage(event?.category)}
                alt={event?.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
              <div style={{ flex: 1 }}>
                <span className="badge-ui" style={{ background: "#ffcc33", color: "#000", padding: "6px 14px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "900", letterSpacing: "1px", textTransform: "uppercase" }}>
                  {event?.category || "WEBINAR"}
                </span>
                <h1 className="form-title-glow" style={{ marginTop: "20px", marginBottom: "10px" }}>{event?.name}</h1>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1.1rem" }}>Organized by <span style={{ color: "#ffcc33", fontWeight: "700" }}>{event?.speaker}</span></p>
              </div>
            </div>

            <div className="event-content-layout">
              <div className="event-text-column">
                <div className="info-block-ui">
                  <label className="ui-heading-label">EVENT DESCRIPTION</label>
                  <p className="ui-body-text">{event?.description}</p>
                </div>
                {event?.objectives && (
                  <div className="info-block-ui">
                    <label className="ui-heading-label">LEARNING OBJECTIVES</label>
                    <p className="ui-body-text">{event?.objectives}</p>
                  </div>
                )}
                {event?.relevance && (
                  <div className="info-block-ui">
                    <label className="ui-heading-label">TOPIC RELEVANCE</label>
                    <p className="ui-body-text">{event?.relevance}</p>
                  </div>
                )}
              </div>

              <div className="event-sidebar-column">
                <div className="sidebar-glass-box">
                  <div className="sidebar-field">
                    <label className="ui-heading-label">SPEAKER</label>
                    <p className="sidebar-text-white">{event?.speaker}</p>
                  </div>
                  <div className="sidebar-field">
                    <label className="ui-heading-label">SCHEDULE</label>
                    <h2 className="schedule-date-ui">
                      {event?.date ? new Date(event.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric' }) : "Date TBA"}
                    </h2>
                    <h2 className="schedule-date-ui">
                      {event?.date ? new Date(event.date).toLocaleDateString('en-GB', { month: 'long' }) : ""} at {event?.date ? new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : "00:00"}
                    </h2>
                    <p className="timezone-subtext">{event?.timezone}</p>
                  </div>

                  {event?.link && (
                    <div className="sidebar-field" style={{ marginTop: '25px' }}>
                      <label className="ui-heading-label">EVENT LINK</label>
                      <a
                        href={event.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="event-external-link"
                      >
                        Join Webinar ↗
                      </a>
                    </div>
                  )}

                  <button
                    onClick={handleToggleEnrollment}
                    disabled={isProcessing}
                    className={alreadyEnrolled ? "register-btn-ui enrolled" : "register-btn-ui"}
                  >
                    {isProcessing ? "..." : alreadyEnrolled ? "Unenroll" : "Register Now"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* CUSTOM CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={modal.show}
        title={modal.title}
        message={modal.message}
        confirmText={modal.confirmText}
        type={modal.type}
        onConfirm={modal.onConfirm}
        onCancel={() => setModal({ ...modal, show: false })}
      />

      <style>{`
        /* Styles remain identical to previous design to preserve background/spacing */
        .event-details-wrapper {
          min-height: 100vh; width: 100%;
          background: radial-gradient(circle at 15% 15%, #8b4513 0%, #3d1f0a 35%, #0f0e0e 75%, #0a0a0a 100%);
          padding-top: 100px; padding-bottom: 80px; display: flex; justify-content: center;
        }
        .details-container { max-width: 1240px; width: 100%; padding: 0 40px; }
        .details-header-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        .back-explore-btn { background: none; border: none; color: #ffcc33; font-weight: 900; letter-spacing: 2.2px; font-size: 0.75rem; cursor: pointer; }
        .social-share-group { display: flex; gap: 10px; flex-wrap: wrap; }
        .social-pill { padding: 10px 18px; border-radius: 6px; border: none; color: white; font-weight: 800; font-size: 0.65rem; letter-spacing: 1.5px; cursor: pointer; transition: 0.3s ease; }
        .whatsapp-pill { background: #25D366; }
        .twitter-pill { background: #000000; }
        .insta-pill { background: linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%); }
        .msg-pill { background: #34C759; }
        .event-main-card { background: #110f10; border-radius: 40px; padding: 70px; box-shadow: 0 0 100px rgba(139, 69, 19, 0.15), 0 20px 80px rgba(0,0,0,0.8); border: 1px solid rgba(255, 255, 255, 0.03); }
        .event-content-layout { display: grid; grid-template-columns: 1.6fr 1fr; gap: 60px; }
        .category-tag-ui { background: rgba(255, 204, 51, 0.1); color: #ffcc33; padding: 6px 16px; border-radius: 20px; font-size: 0.75rem; font-weight: 900; letter-spacing: 2px; }
        .event-main-title { font-size: 4.8rem; color: #ffcc33; margin: 30px 0; font-weight: 900; letter-spacing: -1.5px; line-height: 1; }
        .ui-heading-label { color: #ffcc33; font-size: 0.72rem; font-weight: 900; letter-spacing: 3.2px; display: block; margin-bottom: 18px; opacity: 0.85; }
        .ui-body-text { color: #e0e0e0; line-height: 1.8; font-size: 1.18rem; letter-spacing: 0.6px; }
        .sidebar-glass-box { background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 30px; padding: 45px; height: 100%; }
        .sidebar-text-white { color: white; font-size: 1.6rem; font-weight: 700; }
        .schedule-date-ui { color: white; font-size: 2.8rem; font-weight: 900; line-height: 1.1; margin: 0; letter-spacing: -1px; }
        .timezone-subtext { color: #ffcc33; font-size: 0.85rem; font-weight: 800; margin-top: 15px; letter-spacing: 1px; }
        .register-btn-ui { width: 100%; padding: 22px; border-radius: 16px; margin-top: 30px; font-size: 1.2rem; font-weight: 900; cursor: pointer; letter-spacing: 1px; }
        .register-btn-ui:not(.enrolled) { background: #ffcc33; color: #000; border: none; }
        .register-btn-ui.enrolled { background: rgba(255, 68, 68, 0.05); border: 1px solid #ff4444; color: #ff4444; }

        .event-external-link {
          display: inline-block;
          background: rgba(255, 204, 51, 0.1);
          color: #ffcc33;
          padding: 12px 20px;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 800;
          font-size: 0.9rem;
          letter-spacing: 0.5px;
          border: 1px solid rgba(255, 204, 51, 0.2);
          transition: all 0.3s ease;
          width: 100%;
          text-align: center;
          box-sizing: border-box;
        }

        .event-external-link:hover {
          background: #ffcc33;
          color: #000;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(255, 204, 51, 0.2);
        }

        @media (max-width: 900px) {
          .details-container { padding: 0 20px; }
          .event-main-card { padding: 40px 30px; }
          .event-content-layout { grid-template-columns: 1fr; gap: 40px; }
          .event-main-title { font-size: 3rem; }
          .schedule-date-ui { font-size: 2rem; }
          .details-header-nav { flex-direction: column; gap: 20px; align-items: flex-start; }
          .event-details-wrapper { padding-top: 80px; }
        }
      `}</style>
    </>
  );
}