import React from "react";

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-logo">
            <span className="gradient-text">Momentum EMS</span>
          </div>
          <p className="copyright-text">
            © {new Date().getFullYear()} <span className="highlight-text">CharisCorp</span>. All rights reserved.
          </p>
        </div>
      </div>

      <style>{`
        .footer-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          text-align: center;
        }
        .app-footer {
          padding: 40px 0;
          background: transparent;
          margin-top: 100px;
        }
        .footer-logo {
          font-size: 1.5rem;
          font-weight: 900;
          letter-spacing: -0.5px;
        }
        .copyright-text {
          color: var(--text-muted);
          font-size: 0.95rem;
          margin: 0;
        }
        .highlight-text {
          color: var(--gold);
          font-weight: 700;
        }
      `}</style>
    </footer>
  );
}

