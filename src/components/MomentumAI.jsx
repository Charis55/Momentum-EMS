import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORIES, getCategoryImage } from "../utils/categoryImages";
import { subscribeUpcomingEvents } from "../firebase/events";

export default function MomentumAI({ isOpen, onClose }) {
    const [step, setStep] = useState(0);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [goal, setGoal] = useState("");
    const [experience, setExperience] = useState("");
    const [stylePref, setStylePref] = useState("");
    const [events, setEvents] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const modalRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            const unsubscribe = subscribeUpcomingEvents((data) => {
                setEvents(data || []);
            });
            return () => unsubscribe();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && modalRef.current) {
             const firstCmp = modalRef.current.querySelector("[tabIndex='0']");
             if (firstCmp) firstCmp.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === "Escape") reset();
            if (e.key === "Tab") {
                if (!modalRef.current) return;
                const focusables = modalRef.current.querySelectorAll(
                    'a[href], button, textarea, input, select, [tabIndex]:not([tabIndex="-1"])'
                );
                if (focusables.length === 0) return;
                
                const firstElement = focusables[0];
                const lastElement = focusables[focusables.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === firstElement || document.activeElement === document.body) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    });

    const toggleCategory = (cat) => {
        setSelectedCategories(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    };

    const handleNext = () => {
        if (step === 4) {
            generateRecommendations();
        }
        setStep(s => s + 1);
    };

    const generateRecommendations = () => {
        const matched = events.filter(e => {
            const eventCat = (e.category || "").trim().toLowerCase();
            if (!eventCat) return false; // Don't match empty categories

            const catMatch = selectedCategories.some(selectedCat => {
                const normalizedSelected = selectedCat.trim().toLowerCase();
                if (!normalizedSelected) return false;
                return eventCat.includes(normalizedSelected) || normalizedSelected.includes(eventCat);
            });
            return catMatch;
        }).slice(0, 3);
        setRecommendations(matched);
    };

    const reset = () => {
        setStep(0);
        setSelectedCategories([]);
        setGoal("");
        setExperience("");
        setStylePref("");
        setRecommendations([]);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={styles.overlay}
                    onClick={reset}
                >
                    <motion.div
                        ref={modalRef}
                        role="dialog"
                        aria-modal="true"
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        style={styles.modal}
                        onClick={e => e.stopPropagation()}
                    >
                        <button style={styles.closeBtn} onClick={reset}>✕</button>

                        {step === 0 && (
                            <div style={styles.content}>
                                <h2 style={styles.title} tabIndex={0}>Meet <span style={styles.highlight}>Momentum Guide</span></h2>
                                <p style={styles.text} tabIndex={0}>I'm your personal growth agent. I help you navigate the Momentum ecosystem to find events that actually matter to your career and passion.</p>
                                <p style={styles.text} tabIndex={0}>Ready for a 30-second interview?</p>
                                <button style={styles.primaryBtn} onClick={handleNext}>LET'S BEGIN</button>
                            </div>
                        )}

                        {step === 1 && (
                            <div style={styles.content}>
                                <h3 style={styles.subtitle} tabIndex={0}>What sparks your <span style={styles.highlight}>interest</span>?</h3>
                                <p style={styles.subtext} tabIndex={0}>Select categories you'd like to explore.</p>
                                <div style={styles.categoryGrid}>
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => toggleCategory(cat)}
                                            style={{
                                                ...styles.catTag,
                                                background: selectedCategories.includes(cat) ? '#ffcc33' : 'rgba(255,255,255,0.05)',
                                                color: selectedCategories.includes(cat) ? '#000' : '#fff',
                                                border: selectedCategories.includes(cat) ? 'none' : '1px solid rgba(255,255,255,0.1)'
                                            }}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    style={{ ...styles.primaryBtn, opacity: selectedCategories.length === 0 ? 0.5 : 1, cursor: selectedCategories.length === 0 ? 'not-allowed' : 'pointer' }}
                                    onClick={selectedCategories.length === 0 ? undefined : handleNext}
                                    aria-disabled={selectedCategories.length === 0}
                                >
                                    NEXT STEP
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div style={styles.content}>
                                <h3 style={styles.subtitle} tabIndex={0}>What is your <span style={styles.highlight}>primary goal</span>?</h3>
                                <div style={styles.goalList}>
                                    {["Skill Acquisition", "Networking", "Industry Insights", "Personal Growth"].map(g => (
                                        <button
                                            key={g}
                                            onClick={() => setGoal(g)}
                                            style={{
                                                ...styles.goalItem,
                                                border: goal === g ? '2px solid #ffcc33' : '1px solid rgba(255,255,255,0.1)',
                                                background: goal === g ? 'rgba(255,204,51,0.1)' : 'transparent'
                                            }}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    style={{ ...styles.primaryBtn, opacity: !goal ? 0.5 : 1, cursor: !goal ? 'not-allowed' : 'pointer' }}
                                    onClick={!goal ? undefined : handleNext}
                                    aria-disabled={!goal}
                                >
                                    GENERATE RECOMMENDATIONS
                                </button>
                            </div>
                        )}

                        {step === 3 && (
                            <div style={styles.content}>
                                <h3 style={styles.subtitle} tabIndex={0}>What is your <span style={styles.highlight}>experience level</span>?</h3>
                                <div style={styles.goalList}>
                                    {["Beginner / Student", "Junior Professional", "Mid-Level Professional", "Senior / Executive"].map(lvl => (
                                        <button
                                            key={lvl}
                                            onClick={() => setExperience(lvl)}
                                            style={{
                                                ...styles.goalItem,
                                                border: experience === lvl ? '2px solid #ffcc33' : '1px solid rgba(255,255,255,0.1)',
                                                background: experience === lvl ? 'rgba(255,204,51,0.1)' : 'transparent'
                                            }}
                                        >
                                            {lvl}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    style={{ ...styles.primaryBtn, opacity: !experience ? 0.5 : 1, cursor: !experience ? 'not-allowed' : 'pointer' }}
                                    onClick={!experience ? undefined : handleNext}
                                    aria-disabled={!experience}
                                >
                                    NEXT STEP
                                </button>
                            </div>
                        )}

                        {step === 4 && (
                            <div style={styles.content}>
                                <h3 style={styles.subtitle} tabIndex={0}>Preferred <span style={styles.highlight}>learning style</span>?</h3>
                                <div style={styles.goalList}>
                                    {["Hands-on Workshops", "Expert Panels & Discussions", "Quick Bite-sized Sessions", "Deep Dive Lectures"].map(style => (
                                        <button
                                            key={style}
                                            onClick={() => setStylePref(style)}
                                            style={{
                                                ...styles.goalItem,
                                                border: stylePref === style ? '2px solid #ffcc33' : '1px solid rgba(255,255,255,0.1)',
                                                background: stylePref === style ? 'rgba(255,204,51,0.1)' : 'transparent'
                                            }}
                                        >
                                            {style}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    style={{ ...styles.primaryBtn, opacity: !stylePref ? 0.5 : 1, cursor: !stylePref ? 'not-allowed' : 'pointer' }}
                                    onClick={!stylePref ? undefined : handleNext}
                                    aria-disabled={!stylePref}
                                >
                                    GENERATE RECOMMENDATIONS
                                </button>
                            </div>
                        )}

                        {step === 5 && (
                            <div style={styles.content}>
                                <h3 style={styles.subtitle} tabIndex={0}>Your Personalized <span style={styles.highlight}>Picks</span></h3>
                                <div style={styles.recList}>
                                    {recommendations.length > 0 ? recommendations.map(e => (
                                        <div key={e.id} style={styles.recItem}>
                                            <img src={getCategoryImage(e.category)} alt={e.name} style={styles.recImg} />
                                            <div style={styles.recInfo}>
                                                <h4 style={styles.recName} tabIndex={0}>{e.name}</h4>
                                                <p style={styles.recMeta} tabIndex={0}>{e.speaker} • {e.category}</p>
                                                <a href={`/event/${e.id}`} style={styles.viewLink} aria-label="View Details">View Details <span aria-hidden="true">→</span></a>
                                            </div>
                                        </div>
                                    )) : (
                                        <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center' }} tabIndex={0}>
                                            No live events found yet matching your profile criteria. Check back soon — new sessions are added regularly!
                                        </p>
                                    )}
                                </div>
                                <button style={styles.ghostBtn} onClick={reset}>FINISH</button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

const styles = {
    overlay: {
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
    },
    modal: {
        width: '90%', maxWidth: '600px', background: 'rgba(20,20,20,0.8)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '32px',
        padding: '40px', position: 'relative', boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(30px)'
    },
    closeBtn: {
        position: 'absolute', top: '20px', right: '20px', background: 'none',
        border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', opacity: 0.5
    },
    content: { display: 'flex', flexDirection: 'column', gap: '20px' },
    title: { fontSize: '2.4rem', fontWeight: '900', color: '#fff', margin: 0, letterSpacing: '-1px' },
    subtitle: { fontSize: '1.8rem', fontWeight: '800', color: '#fff', margin: 0 },
    subtext: { color: 'rgba(255,255,255,0.6)', margin: 0 },
    highlight: { color: '#ffcc33' },
    text: { color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', lineHeight: 1.6 },
    primaryBtn: {
        background: '#ffcc33', color: '#000', border: 'none', padding: '18px',
        borderRadius: '16px', fontWeight: '900', fontSize: '1rem', cursor: 'pointer',
        letterSpacing: '1px', marginTop: '10px'
    },
    ghostBtn: {
        background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)',
        padding: '18px', borderRadius: '16px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer'
    },
    categoryGrid: {
        display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '200px',
        overflowY: 'auto', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px'
    },
    catTag: {
        padding: '10px 16px', borderRadius: '20px', fontSize: '0.85rem',
        fontWeight: '700', cursor: 'pointer', transition: '0.2s'
    },
    goalList: { display: 'flex', flexDirection: 'column', gap: '10px' },
    goalItem: {
        padding: '15px 20px', borderRadius: '12px', color: '#fff', fontWeight: '700',
        textAlign: 'left', cursor: 'pointer', transition: '0.3s'
    },
    recList: { display: 'flex', flexDirection: 'column', gap: '15px' },
    recItem: {
        display: 'flex', gap: '15px', background: 'rgba(255,255,255,0.03)',
        padding: '15px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)'
    },
    recImg: { width: '80px', height: '60px', borderRadius: '8px', objectFit: 'cover' },
    recInfo: { flex: 1 },
    recName: { margin: '0 0 5px 0', color: '#ffcc33', fontSize: '1.1rem', fontWeight: '800' },
    recMeta: { margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' },
    viewLink: { color: '#fff', fontSize: '0.85rem', fontWeight: '700', textDecoration: 'none', display: 'block', marginTop: '8px' }
};
