// src/firebase/events.js
import {
  collection,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./config";

// ✅ Create a new event
export async function createEvent(eventPayload, user) {
  if (!user?.uid) throw new Error("No authenticated organizer found.");

  console.log("🚀 [createEvent] Incoming eventPayload:", eventPayload);
  console.log("👤 [createEvent] User:", user.uid, user.email);

  const normalizedPayload = {
    name: eventPayload.name || "",
    timingISO: eventPayload.timingISO || "", 
    timeZone: eventPayload.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    link: eventPayload.link || "",
    description: eventPayload.description || "",
    objectives: eventPayload.objectives || "",
    topicRelevance: eventPayload.topicRelevance || "",
    speaker: eventPayload.speaker || "",
  };

  const payload = {
    ...normalizedPayload,
    organizerId: user.uid,
    organizerEmail: user.email || null,
    createdBy: user.uid,
    createdAt: serverTimestamp(),
  };

  console.log("✅ [createEvent] Final Payload Object:", payload);
  console.log("📦 [createEvent] Final Payload JSON:", JSON.stringify(payload, null, 2));
  console.log("🔑 [createEvent] organizerId:", payload.organizerId);

  const ref = await addDoc(collection(db, "events"), payload);
  console.log("🎯 [createEvent] Event created with ID:", ref.id);

  return ref.id;
}

// ✅ Organizer events feed
export function subscribeOrganizerEvents(organizerId, cb) {
  const q = query(
    collection(db, "events"),
    where("organizerId", "==", organizerId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );
}

// ✅ Public events (attendee dashboard)
export function subscribeUpcomingEvents(cb) {
  const q = query(collection(db, "events"), orderBy("createdAt", "desc"));

  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    console.log("📡 Dashboard Live Events:", data);
    cb(data);
  });
}

// ✅ Attendee helpers
export async function enrollUser(eventId, user) {
  const ref = doc(db, "events", eventId, "attendees", user.uid);
  await setDoc(ref, {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || "",
    enrolledAt: serverTimestamp(),
  });
}

export async function unenrollUser(eventId, uid) {
  await deleteDoc(doc(db, "events", eventId, "attendees", uid));
}

export async function isUserEnrolled(eventId, uid) {
  const snap = await getDoc(doc(db, "events", eventId, "attendees", uid));
  return snap.exists();
}

export async function getAttendeesCount(eventId) {
  const snap = await getDocs(collection(db, "events", eventId, "attendees"));
  return snap.size;
}
// ✅ Fetch events from Firestore
export async function getEvents() {
  const snapshot = await getDocs(collection(db, "events"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}