// src/components/Tabs.jsx
import React from "react";

/**
 * Basic accessible tabs.
 * Usage:
 * <Tabs tabs={[{id:'one',label:'One'}, {id:'two',label:'Two'}]} active={active} onChange={setActive}>
 *  <div data-tab="one">...</div>
 *  <div data-tab="two">...</div>
 * </Tabs>
 */
export default function Tabs({ tabs, active, onChange, children }) {
  return (
    <div>
      <div role="tablist" aria-label="Sections" style={{display:'flex',gap:8}}>
        {tabs.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active===t.id}
            onClick={()=>onChange(t.id)}
            className={active===t.id ? "btn btn-primary" : "btn btn-ghost"}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div style={{marginTop:12}}>
        {React.Children.toArray(children).filter(c => (c.props && c.props["data-tab"] === active) )}
      </div>
    </div>
  );
}
