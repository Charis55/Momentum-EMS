import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="app-header">
      <div className="brand">
        <img 
          src="/assets/momentum-logo.svg" 
          alt="Momentum Logo" 
          className="brand-logo"
        />
        <h1>Momentum EMS</h1>
      </div>
    </header>
  );
}
