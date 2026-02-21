import React from "react";

export default function ConfirmationModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = "Confirm", 
  type = "danger" 
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card animate-pop-in">
        <h2 className="modal-title">{title}</h2>
        <p className="modal-message">{message}</p>
        
        <div className="modal-actions">
          <button 
            className={`modal-btn ${type === "danger" ? "btn-red" : "btn-gold"}`} 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          <button className="modal-btn btn-grey" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-card {
          background: #0a0a0a;
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 40px;
          border-radius: 24px;
          width: 100%;
          max-width: 400px;
          text-align: center;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        }

        .modal-title {
          color: white;
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 12px;
          letter-spacing: -0.5px;
        }

        .modal-message {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.95rem;
          line-height: 1.5;
          margin-bottom: 30px;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .modal-btn {
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          border: none;
          transition: 0.2s;
          flex: 1;
        }

        .btn-red { background: #b91c1c; color: white; }
        .btn-gold { background: #ffcc33; color: #000; }
        .btn-grey { background: #333; color: white; }

        .modal-btn:hover { transform: translateY(-2px); opacity: 0.9; }

        @keyframes pop-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-pop-in { animation: pop-in 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
}