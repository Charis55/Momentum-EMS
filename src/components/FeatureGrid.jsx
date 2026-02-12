import React from "react";
import { motion } from "framer-motion";

const items = [
  { icon: "A", title: "Accessible by design", text: "Screen-reader friendly flows, ARIA labels and keyboard-first interactions." },
  { icon: "B", title: "Live captions & transcripts", text: "Add automatic captions and downloadable transcripts for recordings." },
  { icon: "C", title: "Register & Remind", text: "Easy attendee registration, reminders and calendar integration." },
  { icon: "D", title: "Analytics dashboard", text: "Engagement metrics, attendance reports and exportable CSVs." },
  { icon: "E", title: "Notifications", text: "Email notifications and organizer alerts with Cloud Functions." },
  { icon: "F", title: "Privacy controls", text: "GDPR-ready consent and secure data handling." },
];

export default function FeatureGrid(){
  return (
    <section id="features" className="features" aria-label="Momentum features">
      {items.map((it, idx)=>(
        <motion.article
          key={it.title}
          className="feature scroll-fade"
          initial={{opacity:0, y:14}}
          whileInView={{opacity:1,y:0}}
          viewport={{once:true, amount:0.2}}
          transition={{delay: idx * 0.08, duration:0.6}}
        >
          <div className="icon" aria-hidden>{it.icon}</div>
          <div>
            <h4>{it.title}</h4>
            <p>{it.text}</p>
          </div>
        </motion.article>
      ))}
    </section>
  );
}
