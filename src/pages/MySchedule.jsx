import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Toolbar from "../components/Toolbar";

export default function MySchedule() {
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    async function fetchMyEnrollments() {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const subColRef = collection(db, "users", user.uid, "my_enrollments");
        const snapshot = await getDocs(subColRef);
        
        const fetched = snapshot.docs.map(doc => ({
          enrollmentId: doc.id,
          ...doc.data()
        }));

        // Sort: Closest date first
        const sorted = fetched.sort((a, b) => {
          const dateA = new Date(a.eventDate || a.date || 0);
          const dateB = new Date(b.eventDate || b.date || 0);
          return dateA - dateB;
        });

        setMyEvents(sorted);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMyEnrollments();
  }, []);

  const upcomingSession = myEvents.length > 0 ? myEvents[0] : null;

  return (
    <div className="stencil-wrapper">
      <Toolbar />
      
      <main className="stencil-container">
        <section className="stencil-hero">
          <div className="hero-text-block">
             <span className="hero-badge">Personal Dashboard</span>
             <h1 className="hero-main-title">My Schedule</h1>
             <p className="hero-sub-text">
               Access your upcoming video conferences and managed events. 
               Join your sessions directly from the cards below.
             </p>
             <button className="stencil-primary-btn" onClick={() => nav("/events")}>
               + Browse More Events
             </button>
          </div>

          <div className="analytics-glass-grid">
            <div className="glass-card">
              <label className="glass-label">Total Enrollments</label>
              <h3 className="glass-number">{myEvents.length}</h3>
            </div>
            <div className="glass-card highlight">
              <label className="glass-label">Upcoming Session</label>
              <h3 className="glass-text-small">
                {upcomingSession ? (upcomingSession.eventTitle || upcomingSession.name || "Untitled Event") : "None Scheduled"}
              </h3>
            </div>
          </div>
        </section>

        <div className="section-divider">
          <h2 className="section-title">Enrolled Conferences</h2>
        </div>

        {loading ? (
          <div className="loader-container"><div className="loader"></div></div>
        ) : (
          <section className="replica-grid">
            <AnimatePresence>
              {myEvents.length > 0 ? (
                myEvents.map((item) => (
                  <motion.div 
                    key={item.enrollmentId} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="replica-card"
                  >
                    <div className="replica-image-placeholder">
                       {/* Using a stable logo path */}
                       <img src="/momentum-logo.png" alt="Momentum" className="replica-logo" />
                    </div>

                    <div className="replica-body">
                      {/* Mapping Data: Checks both possible field names */}
                      <h2 className="replica-title">{item.eventTitle || item.name || "Untitled Webinar"}</h2>
                      
                      <div className="replica-info-line">
                        <span className="icon">🎤</span>
                        <p>{item.organizerName || item.speaker || "Guest Speaker"}</p>
                      </div>

                      <div className="replica-info-line">
                        <span className="icon">🕒</span>
                        <p>
                          {item.eventDate || item.date 
                            ? new Date(item.eventDate || item.date).toLocaleString('en-GB', {
                                day: '2-digit', month: '2-digit', year: 'numeric',
                                hour: '2-digit', minute: '2-digit', second: '2-digit'
                              })
                            : "Date TBA"}
                        </p>
                      </div>

                      <p className="replica-desc">
                        {item.description 
                          ? (item.description.length > 80 ? item.description.substring(0, 80) + "..." : item.description)
                          : "Explore this upcoming session on the live event page."}
                      </p>

                      <button 
                        className="replica-btn" 
                        onClick={() => nav(`/event/${item.eventId}`)}
                      >
                        View Details →
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="empty-state">
                  <p>No events found in your schedule.</p>
                </div>
              )}
            </AnimatePresence>
          </section>
        )}
      </main>

      <style>{`
        .stencil-wrapper {
          min-height: 100vh;
          background: linear-gradient(180deg, #d35400 0%, #e67e22 40%, #f39c12 100%);
          padding-top: 80px; padding-bottom: 100px;
          font-family: 'Inter', sans-serif;
        }
        .stencil-container { max-width: 1300px; margin: 0 auto; padding: 0 40px; }
        .stencil-hero { display: grid; grid-template-columns: 1.2fr 1.8fr; gap: 40px; margin: 40px 0 80px; }
        .hero-text-block { background: rgba(255, 255, 255, 0.1); padding: 40px; border-radius: 30px; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); }
        .hero-main-title { font-size: 3.5rem; font-weight: 900; color: #fff; margin: 20px 0; letter-spacing: -2px; line-height: 1; }
        .hero-sub-text { color: rgba(255,255,255,0.9); line-height: 1.6; font-size: 1.1rem; margin-bottom: 30px; }
        .stencil-primary-btn { background: #ffcc33; color: #000; border: none; padding: 15px 25px; border-radius: 12px; font-weight: 900; cursor: pointer; }
        
        .analytics-glass-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .glass-card { background: rgba(255, 255, 255, 0.15); padding: 25px; border-radius: 25px; border: 1px solid rgba(255, 255, 255, 0.2); text-align: center; }
        .glass-label { font-size: 0.75rem; font-weight: 800; color: #fff; display: block; margin-bottom: 5px; text-transform: capitalize; }
        .glass-number { font-size: 2.8rem; font-weight: 900; color: #fff; }
        .glass-text-small { font-size: 1rem; font-weight: 800; color: #fff; text-transform: uppercase; margin-top: 10px; }

        .replica-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 30px; }
        .replica-card { 
          background: #fffdf9; 
          border-radius: 35px; 
          padding: 25px;
          box-shadow: 0 15px 40px rgba(0,0,0,0.12);
          transition: transform 0.3s ease;
        }
        .replica-card:hover { transform: translateY(-5px); }
        
        .replica-image-placeholder {
          background: #fff;
          border-radius: 25px;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #f0f0f0;
          margin-bottom: 25px;
        }
        .replica-logo { width: 140px; }

        .replica-title { font-size: 2rem; font-weight: 900; color: #1a1a1a; margin-bottom: 20px; letter-spacing: -0.5px; }
        .replica-info-line { display: flex; align-items: center; gap: 15px; margin-bottom: 12px; color: #444; font-weight: 700; font-size: 1.05rem; }
        .replica-desc { color: #777; margin: 20px 0 30px; line-height: 1.5; font-size: 1rem; font-weight: 500; }
        
        .replica-btn {
          width: 100%;
          padding: 20px;
          border: none;
          border-radius: 15px;
          background: linear-gradient(90deg, #ff7e00, #ffcc33);
          color: #fff;
          font-weight: 900;
          font-size: 1.1rem;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(255, 126, 0, 0.3);
        }

        .section-title { color: #fff; font-size: 1.8rem; font-weight: 900; margin-bottom: 30px; text-transform: capitalize; }
        .empty-state { grid-column: 1 / -1; text-align: center; color: #fff; padding: 100px; font-weight: 800; font-size: 1.2rem; }
      `}</style>
    </div>
  );
}