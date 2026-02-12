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

// ✅ Create a new event (Updated with Privacy & Speaker)
export async function createEvent(eventPayload, user) {
  if (!user?.uid) throw new Error("No authenticated organizer found.");

  console.log("🚀 [createEvent] Incoming payload:", eventPayload);

  const payload = {
    name: eventPayload.name || "",
    speaker: eventPayload.speaker || "", // NEW FEATURE
    date: eventPayload.date || "", 
    timezone: eventPayload.timezone || "Africa/Lagos",
    link: eventPayload.link || "",
    description: eventPayload.description || "",
    objectives: eventPayload.objectives || "",
    relevance: eventPayload.relevance || "",
    isPrivate: eventPayload.isPrivate || false, // NEW FEATURE
    organizerId: user.uid,
    organizerEmail: user.email || null,
    createdBy: user.uid,
    createdAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, "events"), payload);
  console.log("🎯 [createEvent] Event created with ID:", ref.id);
  return ref.id;
}

// ✅ Update an existing event (FEATURE: Edit Ability)
export async function updateEvent(eventId, eventPayload) {
  console.log("updateEvent] Updating ID:", eventId);
  const eventRef = doc(db, "events", eventId);
  
  const updateData = {
    name: eventPayload.name,
    speaker: eventPayload.speaker, // NEW FEATURE
    date: eventPayload.date,
    timezone: eventPayload.timezone,
    link: eventPayload.link,
    description: eventPayload.description,
    objectives: eventPayload.objectives,
    relevance: eventPayload.relevance,
    isPrivate: eventPayload.isPrivate, // NEW FEATURE
    updatedAt: serverTimestamp(),
  };

  await updateDoc(eventRef, updateData);
  console.log("✅ [updateEvent] Update successful");
}

// ✅ Fetch a single event (Required to pre-fill the Edit Form)
export async function getEventById(eventId) {
  const snap = await getDoc(doc(db, "events", eventId));
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }
  return null;
}

// ✅ Organizer events feed (Shows ALL their own events regardless of privacy)
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

// ✅ Public events (FEATURE: Only shows non-private events for Discovery)
export function subscribeUpcomingEvents(cb) {
  // Filters out events where isPrivate is true
  const q = query(
    collection(db, "events"), 
    where("isPrivate", "==", false), 
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    console.log("📡 Public Dashboard Feed:", data);
    cb(data);
  });
}

// ✅ Attendee helpers (Unchanged)
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

export async function getEvents() {
  const snapshot = await getDocs(collection(db, "events"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}