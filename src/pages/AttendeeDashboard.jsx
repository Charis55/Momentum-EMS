// src/pages/AttendeeDashboard.jsx
import React, { useEffect, useState } from "react";
import { subscribeUpcomingEvents } from "../firebase/events";
import EventCard from "../components/EventCard";

export default function AttendeeDashboard(){
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const unsub = subscribeUpcomingEvents(setEvents);
    return unsub;
  }, []);

  return (
    <main style={{padding:24}}>
      <h2>Events</h2>
      <p>Explore upcoming webinars and enroll.</p>
      <section style={{marginTop:12}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:12}}>
          {events.map(ev => <EventCard key={ev.id} event={ev} />)}
        </div>
      </section>
    </main>
  );
}
