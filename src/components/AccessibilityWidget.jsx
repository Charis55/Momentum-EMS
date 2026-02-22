import React, { useState, useEffect, useRef } from "react";
import "./AccessibilityWidget.css";

// ──────────────────────────────────────────────────────────
// Momentum-themed wheelchair SVG icon
// ──────────────────────────────────────────────────────────
function WheelchairIcon({ size = 32 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            {/* Head */}
            <circle cx="32" cy="10" r="6" fill="#ffcc33" />
            {/* Body */}
            <path d="M32 16 L28 30 L20 30" stroke="#ffcc33" strokeWidth="3.5" strokeLinecap="round" />
            {/* Seat back */}
            <path d="M28 30 L28 44" stroke="#ffcc33" strokeWidth="3.5" strokeLinecap="round" />
            {/* Footrest */}
            <path d="M28 44 L20 50" stroke="#ffcc33" strokeWidth="3" strokeLinecap="round" />
            {/* Armrest / push */}
            <path d="M28 34 L44 34" stroke="#ffcc33" strokeWidth="3" strokeLinecap="round" />
            {/* Big wheel */}
            <circle cx="26" cy="50" r="10" stroke="#ff7a00" strokeWidth="3" fill="none" />
            {/* Small front wheel */}
            <circle cx="44" cy="50" r="5" stroke="#ff7a00" strokeWidth="2.5" fill="none" />
        </svg>
    );
}

// ──────────────────────────────────────────────────────────
// Screen Reader: reads any focused element's text aloud
// ──────────────────────────────────────────────────────────
function speak(text) {
    if (!("speechSynthesis" in window) || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
}

function getReadableText(el) {
    return (
        el.getAttribute("aria-label") ||
        el.getAttribute("title") ||
        el.getAttribute("placeholder") ||
        el.textContent?.trim() ||
        ""
    ).slice(0, 200);
}

// ──────────────────────────────────────────────────────────
// Main Widget
// ──────────────────────────────────────────────────────────
export default function AccessibilityWidget() {
    const [open, setOpen] = useState(false);
    const [lightMode, setLightMode] = useState(() => localStorage.getItem("a11y_light") === "true");
    const [keyboardNav, setKeyboardNav] = useState(() => localStorage.getItem("a11y_keyboard") === "true");
    const [screenReader, setScreenReader] = useState(() => localStorage.getItem("a11y_reader") === "true");

    const panelRef = useRef(null);

    // ── Apply / remove light mode ──────────────────────────
    useEffect(() => {
        document.body.classList.toggle("momentum-light-mode", lightMode);
        localStorage.setItem("a11y_light", lightMode);
    }, [lightMode]);

    // ── Apply / remove keyboard nav ────────────────────────
    useEffect(() => {
        document.body.classList.toggle("momentum-keyboard-nav", keyboardNav);
        localStorage.setItem("a11y_keyboard", keyboardNav);
    }, [keyboardNav]);

    // ── Screen reader ─────────────────────────────────────────
    // Use a ref to gate handlers — registered ONCE at mount.
    // This avoids React Strict Mode double-invocation issues.
    const srActiveRef = useRef(screenReader);

    useEffect(() => {
        localStorage.setItem("a11y_reader", screenReader);
        srActiveRef.current = screenReader;

        if (screenReader) {
            speak("Screen reader enabled. Use Tab to navigate.");
        } else {
            // Cancel any in-progress or queued speech immediately
            window.speechSynthesis?.cancel();
        }
    }, [screenReader]);

    // Register focus + hover handlers once at mount
    useEffect(() => {
        const handleFocus = (e) => {
            if (!srActiveRef.current) return;
            const text = getReadableText(e.target);
            if (text) speak(text);
        };
        const handleHover = (e) => {
            if (!srActiveRef.current) return;
            const text = getReadableText(e.target);
            if (text) speak(text);
        };

        document.addEventListener("focusin", handleFocus, true);
        document.addEventListener("mouseover", handleHover, true);

        return () => {
            document.removeEventListener("focusin", handleFocus, true);
            document.removeEventListener("mouseover", handleHover, true);
            window.speechSynthesis?.cancel();
        };
    }, []); // ← empty dep array: mount once, never re-register

    // ── Close panel on click outside ──────────────────────
    useEffect(() => {
        function handleClickOutside(e) {
            if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
        }
        if (open) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    return (
        <div className="a11y-widget-root" ref={panelRef}>
            {/* ── Speech bubble panel ──────────────────────────── */}
            {open && (
                <div className="a11y-panel" role="dialog" aria-label="Accessibility Options">
                    <div className="a11y-panel-header">
                        <span className="a11y-panel-title">Accessibility</span>
                        <button className="a11y-close-btn" onClick={() => setOpen(false)} aria-label="Close accessibility panel">✕</button>
                    </div>

                    <div className="a11y-options">
                        {/* White Mode */}
                        <button
                            className={`a11y-option-btn ${lightMode ? "a11y-active" : ""}`}
                            onClick={() => setLightMode(v => !v)}
                            aria-pressed={lightMode}
                        >
                            <span className="a11y-option-icon">{lightMode ? "" : ""}</span>
                            <div className="a11y-option-text">
                                <span className="a11y-option-label">{lightMode ? "Dark Mode" : "Light Mode"}</span>
                                <span className="a11y-option-desc">{lightMode ? "Switch back to dark theme" : "High contrast white theme"}</span>
                            </div>
                            <div className={`a11y-toggle ${lightMode ? "on" : ""}`} />
                        </button>

                        {/* Keyboard Navigation */}
                        <button
                            className={`a11y-option-btn ${keyboardNav ? "a11y-active" : ""}`}
                            onClick={() => setKeyboardNav(v => !v)}
                            aria-pressed={keyboardNav}
                        >
                            <span className="a11y-option-icon"></span>
                            <div className="a11y-option-text">
                                <span className="a11y-option-label">Keyboard Navigation</span>
                                <span className="a11y-option-desc">Visible focus outlines for Tab key</span>
                            </div>
                            <div className={`a11y-toggle ${keyboardNav ? "on" : ""}`} />
                        </button>

                        {/* Screen Reader */}
                        <button
                            className={`a11y-option-btn ${screenReader ? "a11y-active" : ""}`}
                            onClick={() => setScreenReader(v => !v)}
                            aria-pressed={screenReader}
                        >
                            <span className="a11y-option-icon"></span>
                            <div className="a11y-option-text">
                                <span className="a11y-option-label">Screen Reader</span>
                                <span className="a11y-option-desc">Reads focused elements aloud</span>
                            </div>
                            <div className={`a11y-toggle ${screenReader ? "on" : ""}`} />
                        </button>
                    </div>

                    {/* Arrow pointing down to trigger button */}
                    <div className="a11y-arrow" />
                </div>
            )}

            {/* ── Trigger: Wheelchair icon button ─────────────── */}
            <button
                className="a11y-trigger"
                onClick={() => setOpen(v => !v)}
                aria-label="Open accessibility options"
                aria-expanded={open}
                title="Accessibility"
            >
                <WheelchairIcon size={28} />
            </button>
        </div>
    );
}
