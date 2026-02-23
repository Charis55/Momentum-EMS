import React, { useState, useEffect, useRef } from "react";
import "./AccessibilityWidget.css";

// ──────────────────────────────────────────────────────────
// Momentum-themed wheelchair SVG icon
// ──────────────────────────────────────────────────────────
function WheelchairIcon({ size = 32 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="32" cy="10" r="6" fill="#ffcc33" />
            <path d="M32 16 L28 30 L20 30" stroke="#ffcc33" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M28 30 L28 44" stroke="#ffcc33" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M28 44 L20 50" stroke="#ffcc33" strokeWidth="3" strokeLinecap="round" />
            <path d="M28 34 L44 34" stroke="#ffcc33" strokeWidth="3" strokeLinecap="round" />
            <circle cx="26" cy="50" r="10" stroke="#ff7a00" strokeWidth="3" fill="none" />
            <circle cx="44" cy="50" r="5" stroke="#ff7a00" strokeWidth="2.5" fill="none" />
        </svg>
    );
}

// ──────────────────────────────────────────────────────────
// Screen Reader Helpers
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

    // Existing States
    const [lightMode, setLightMode] = useState(() => localStorage.getItem("a11y_light") === "true");
    const [keyboardNav, setKeyboardNav] = useState(() => localStorage.getItem("a11y_keyboard") === "true");
    const [screenReader, setScreenReader] = useState(() => localStorage.getItem("a11y_reader") === "true");

    // New Super-Features States
    const [textScale, setTextScale] = useState(() => Number(localStorage.getItem("a11y_textScale")) || 100);
    const [extraSpacing, setExtraSpacing] = useState(() => localStorage.getItem("a11y_spacing") === "true");
    const [bigCursor, setBigCursor] = useState(() => localStorage.getItem("a11y_cursor") === "true");
    const [readingMask, setReadingMask] = useState(() => localStorage.getItem("a11y_mask") === "true");
    const [monochrome, setMonochrome] = useState(() => localStorage.getItem("a11y_mono") === "true");
    const [pauseAnims, setPauseAnims] = useState(() => localStorage.getItem("a11y_pause") === "true");

    // Reading Mask Y-Position Tracking
    const [mouseY, setMouseY] = useState(0);

    const panelRef = useRef(null);

    // ── Apply / Sync LocalStorage for Toggles ──────────────
    useEffect(() => {
        document.body.classList.toggle("momentum-light-theme", lightMode);
        localStorage.setItem("a11y_light", lightMode);
    }, [lightMode]);

    useEffect(() => {
        document.body.classList.toggle("momentum-keyboard-nav", keyboardNav);
        localStorage.setItem("a11y_keyboard", keyboardNav);
    }, [keyboardNav]);

    useEffect(() => {
        document.body.classList.toggle("momentum-extra-spacing", extraSpacing);
        localStorage.setItem("a11y_spacing", extraSpacing);
    }, [extraSpacing]);

    useEffect(() => {
        document.body.classList.toggle("momentum-big-cursor", bigCursor);
        localStorage.setItem("a11y_cursor", bigCursor);
    }, [bigCursor]);

    useEffect(() => {
        document.body.classList.toggle("momentum-monochrome", monochrome);
        localStorage.setItem("a11y_mono", monochrome);
    }, [monochrome]);

    useEffect(() => {
        document.body.classList.toggle("momentum-pause-animations", pauseAnims);
        localStorage.setItem("a11y_pause", pauseAnims);
    }, [pauseAnims]);

    useEffect(() => {
        document.documentElement.style.fontSize = `${textScale}%`;
        localStorage.setItem("a11y_textScale", textScale);
    }, [textScale]);

    // ── Reading Mask Position Tracking ──────────────────────
    useEffect(() => {
        localStorage.setItem("a11y_mask", readingMask);
        if (!readingMask) return;

        const handleMouseMove = (e) => setMouseY(e.clientY);
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [readingMask]);

    // ── Screen Reader ───────────────────────────────────────
    const srActiveRef = useRef(screenReader);

    useEffect(() => {
        localStorage.setItem("a11y_reader", screenReader);
        srActiveRef.current = screenReader;

        if (screenReader) {
            speak("Screen reader enabled. Use Tab to navigate.");
        } else {
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
    }, []);

    // ── Close panel on click outside ────────────────────────
    useEffect(() => {
        function handleClickOutside(e) {
            if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
        }
        if (open) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    // Helpers for Text Scale
    const handleTextIncrease = () => setTextScale(prev => Math.min(prev + 10, 130)); // Max 130%
    const handleTextDecrease = () => setTextScale(prev => Math.max(prev - 10, 90)); // Min 90%
    const handleTextReset = () => setTextScale(100);

    return (
        <div className="a11y-widget-root" ref={panelRef}>
            {/* ── Reading Mask Overlay (Renders globally if active) ── */}
            {readingMask && (
                <>
                    {/* Shadow overlay above the mouse */}
                    <div className="a11y-reading-mask-top" style={{ height: `${Math.max(0, mouseY - 50)}px` }} />
                    {/* Shadow overlay below the mouse */}
                    <div className="a11y-reading-mask-bottom" style={{ top: `${mouseY + 50}px` }} />
                </>
            )}

            {/* ── Speech bubble panel ──────────────────────────── */}
            {open && (
                <div className="a11y-panel" role="dialog" aria-label="Accessibility Options">
                    <div className="a11y-panel-header">
                        <span className="a11y-panel-title">Accessibility Options</span>
                        <button className="a11y-close-btn" onClick={() => setOpen(false)} aria-label="Close accessibility panel">✕</button>
                    </div>

                    <div className="a11y-options a11y-scrollable">

                        {/* Dynamic Text Sizing */}
                        <div className="a11y-option-group">
                            <span className="a11y-group-title">Text Size ({textScale}%)</span>
                            <div className="a11y-text-controls">
                                <button onClick={handleTextDecrease} disabled={textScale <= 90} aria-label="Decrease text size">A-</button>
                                <button onClick={handleTextReset} disabled={textScale === 100} aria-label="Reset text size">Reset</button>
                                <button onClick={handleTextIncrease} disabled={textScale >= 130} aria-label="Increase text size">A+</button>
                            </div>
                        </div>

                        {/* White Mode */}
                        <button className={`a11y-option-btn ${lightMode ? "a11y-active" : ""}`} onClick={() => setLightMode(v => !v)} aria-pressed={lightMode}>
                            <div className="a11y-option-text">
                                <span className="a11y-option-label">{lightMode ? "Dark Mode" : "Light Mode"}</span>
                                <span className="a11y-option-desc">{lightMode ? "Switch back to dark theme" : "High contrast white theme for readability"}</span>
                            </div>
                            <div className={`a11y-toggle ${lightMode ? "on" : ""}`} />
                        </button>

                        {/* Monochrome */}
                        <button className={`a11y-option-btn ${monochrome ? "a11y-active" : ""}`} onClick={() => setMonochrome(v => !v)} aria-pressed={monochrome}>
                            <div className="a11y-option-text">
                                <span className="a11y-option-label">Monochrome Filter</span>
                                <span className="a11y-option-desc">Removes all colors (Grayscale mode)</span>
                            </div>
                            <div className={`a11y-toggle ${monochrome ? "on" : ""}`} />
                        </button>

                        {/* Extra Spacing */}
                        <button className={`a11y-option-btn ${extraSpacing ? "a11y-active" : ""}`} onClick={() => setExtraSpacing(v => !v)} aria-pressed={extraSpacing}>
                            <div className="a11y-option-text">
                                <span className="a11y-option-label">Text Spacing</span>
                                <span className="a11y-option-desc">Increases tracking and leading for dyslexia</span>
                            </div>
                            <div className={`a11y-toggle ${extraSpacing ? "on" : ""}`} />
                        </button>

                        {/* Pause Animations */}
                        <button className={`a11y-option-btn ${pauseAnims ? "a11y-active" : ""}`} onClick={() => setPauseAnims(v => !v)} aria-pressed={pauseAnims}>
                            <div className="a11y-option-text">
                                <span className="a11y-option-label">Pause Animations</span>
                                <span className="a11y-option-desc">Stops moving backgrounds and transitions</span>
                            </div>
                            <div className={`a11y-toggle ${pauseAnims ? "on" : ""}`} />
                        </button>

                        {/* Big Cursor */}
                        <button className={`a11y-option-btn ${bigCursor ? "a11y-active" : ""}`} onClick={() => setBigCursor(v => !v)} aria-pressed={bigCursor}>
                            <div className="a11y-option-text">
                                <span className="a11y-option-label">Big Cursor</span>
                                <span className="a11y-option-desc">Enlarges the mouse pointer</span>
                            </div>
                            <div className={`a11y-toggle ${bigCursor ? "on" : ""}`} />
                        </button>

                        {/* Reading Mask */}
                        <button className={`a11y-option-btn ${readingMask ? "a11y-active" : ""}`} onClick={() => setReadingMask(v => !v)} aria-pressed={readingMask}>
                            <div className="a11y-option-text">
                                <span className="a11y-option-label">Reading Mask</span>
                                <span className="a11y-option-desc">Focuses a spotlight on the current line</span>
                            </div>
                            <div className={`a11y-toggle ${readingMask ? "on" : ""}`} />
                        </button>

                        {/* Keyboard Navigation */}
                        <button className={`a11y-option-btn ${keyboardNav ? "a11y-active" : ""}`} onClick={() => setKeyboardNav(v => !v)} aria-pressed={keyboardNav}>
                            <div className="a11y-option-text">
                                <span className="a11y-option-label">Keyboard Navigation</span>
                                <span className="a11y-option-desc">Highlights focused elements with a gold ring</span>
                            </div>
                            <div className={`a11y-toggle ${keyboardNav ? "on" : ""}`} />
                        </button>

                        {/* Screen Reader */}
                        <button className={`a11y-option-btn ${screenReader ? "a11y-active" : ""}`} onClick={() => setScreenReader(v => !v)} aria-pressed={screenReader}>
                            <div className="a11y-option-text">
                                <span className="a11y-option-label">Screen Reader</span>
                                <span className="a11y-option-desc">Reads hovered or focused text aloud</span>
                            </div>
                            <div className={`a11y-toggle ${screenReader ? "on" : ""}`} />
                        </button>
                    </div>

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
