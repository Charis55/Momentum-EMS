import React, { useEffect, useRef } from "react";

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "OK",
  type = "info" // danger, success, info
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
        const titleEl = modalRef.current.querySelector("h2");
        if (titleEl) titleEl.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (onCancel) onCancel();
        return;
      }
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
  }, [isOpen, onCancel]);

  const stripEmojis = (str) => {
    if (!str) return "";
    // Regex for common emojis [success, error, sparkles, info, etc]
    return str.replace(/[✅❌✨📽️👥🌍🟢🎤🕒💡⚠️🔥🚀📅📍🔗→]/gu, "").trim();
  };

  if (!isOpen) return null;

  const srTitle = stripEmojis(title);
  const srMessage = stripEmojis(message);

  return (
    <div className="modal-overlay">
      <div className="modal-card animate-pop-in" ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="modal-title-sr">
        <h2 id="modal-title-sr" className="modal-title" tabIndex={0} aria-label={srTitle}>{title}</h2>
        <p className="modal-message" tabIndex={0} aria-label={srMessage}>{message}</p>

        <div className="modal-actions">
          <button
            className={`modal-btn stencil-btn-impact ${type === "danger" ? "btn-red" :
                type === "success" ? "btn-green" : "btn-gold"
              }`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          {onCancel && (
            <button className="modal-btn btn-grey" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(12px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-card {
          background: rgba(15, 15, 15, 0.95);
          border: 1px solid rgba(255, 204, 51, 0.15);
          padding: 50px;
          border-radius: 32px;
          width: 90%;
          max-width: 480px;
          text-align: center;
          box-shadow: 0 30px 60px rgba(0,0,0,0.8), inset 0 0 20px rgba(255,204,51,0.05);
          position: relative;
        }

        .modal-card::before {
          content: "";
          position: absolute;
          top: -2px; left: -2px; right: -2px; bottom: -2px;
          background: linear-gradient(45deg, rgba(255,204,51,0.3), transparent, rgba(255,204,51,0.3));
          border-radius: 34px;
          z-index: -1;
          opacity: 0.5;
        }

        .modal-title {
          color: #ffcc33;
          font-size: 2rem;
          font-weight: 900;
          margin-bottom: 16px;
          letter-spacing: -0.5px;
          text-transform: uppercase;
        }

        .modal-message {
          color: rgba(255, 255, 255, 0.8);
          font-size: 1.1rem;
          line-height: 1.6;
          margin-bottom: 40px;
        }

        .modal-actions {
          display: flex;
          gap: 15px;
          justify-content: center;
        }

        .modal-btn {
          padding: 16px 32px;
          border-radius: 14px;
          font-weight: 900;
          cursor: pointer;
          border: none;
          transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          flex: 1;
          letter-spacing: 1px;
          font-size: 0.9rem;
        }

        .btn-red { background: #e11d48; color: white; box-shadow: 0 10px 20px rgba(225, 29, 72, 0.3); }
        .btn-green { background: #10b981; color: white; box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3); }
        .btn-gold { 
          background: #ffcc33; 
          color: #000; 
          box-shadow: 0 10px 30px rgba(255, 204, 51, 0.4);
        }
        .btn-grey { background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1); }

        .modal-btn:hover { 
          transform: translateY(-4px); 
          filter: brightness(1.1);
        }

        .modal-btn:active {
          transform: translateY(0);
        }

        @keyframes pop-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-pop-in { animation: pop-in 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
}