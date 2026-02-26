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
  increment,
} from "firebase/firestore";
import { db } from "./config";
import {
  sendEventCreatedEmail,
  sendEventDeletedEmail,
  sendEnrollmentEmail,
  sendUnenrollmentEmail,
} from "../utils/emailService";


// ✅ CREATE EVENT: Standardized for Organizer Dashboard visibility
export async function createEvent(eventPayload, user) {
  if (!user?.uid) throw new Error("No authenticated organizer found.");

  const payload = {
    name: eventPayload.name || "",
    category: eventPayload.category || "",
    speaker: eventPayload.speaker || "",
    date: eventPayload.date || "",
    timezone: eventPayload.timezone || "Africa/Lagos",
    link: eventPayload.link || "",
    description: eventPayload.description || "",
    objectives: eventPayload.objectives || "",
    relevance: eventPayload.relevance || "",
    isPrivate: Boolean(eventPayload.isPrivate),
    organizerId: user.uid, // Required for Dashboard filter
    organizerEmail: user.email || null,
    createdBy: user.uid,
    createdAt: serverTimestamp(), // Required for orderBy
    maxCapacity: Number(eventPayload.maxCapacity) || 100,
    enrolledCount: 0,
    imageUrl: eventPayload.imageUrl || "",
  };

  const ref = await addDoc(collection(db, "events"), payload);
  // 📧 Notify organiser their event is now live
  sendEventCreatedEmail(user, { ...payload, id: ref.id });
  return ref.id;
}

// ✅ UPDATE EVENT
export async function updateEvent(eventId, eventPayload) {
  const eventRef = doc(db, "events", eventId);
  const updateData = {
    ...eventPayload,
    updatedAt: serverTimestamp(),
  };
  await updateDoc(eventRef, updateData);
}

// ✅ DELETE EVENT
export async function deleteEventById(eventId, user, eventData) {
  await deleteDoc(doc(db, "events", eventId));
  // 📧 Notify organiser the event has been removed
  if (user && eventData) sendEventDeletedEmail(user, eventData);
}

// ✅ GET EVENT BY ID
export async function getEventById(eventId) {
  const snap = await getDoc(doc(db, "events", eventId));
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }
  return null;
}

// ✅ SUBSCRIBE ORGANIZER EVENTS: Standardized for Hub
export function subscribeOrganizerEvents(organizerId, cb) {
  const q = query(
    collection(db, "events"),
    where("organizerId", "==", organizerId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    cb(data);
  }, (err) => {
    console.error("Organizer Subscription Error:", err);
  });
}

// ✅ SUBSCRIBE UPCOMING EVENTS
export function subscribeUpcomingEvents(cb) {
  const q = query(
    collection(db, "events"),
    where("isPrivate", "==", false),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

// ✅ SUBSCRIBE TO ATTENDEES: Real-time feedback
export function subscribeToAttendees(eventId, cb) {
  const q = query(collection(db, "events", eventId, "attendees"), orderBy("enrolledAt", "desc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

// ✅ ENROLLMENT WORKFLOW: Increments count
export async function enrollInEvent(eventId, user) {
  if (!user) throw new Error("Login required to enroll.");

  const eventRef = doc(db, "events", eventId);
  const eventSnap = await getDoc(eventRef);
  const eventData = eventSnap.data();

  if (eventData.organizerId === user.uid) {
    return { success: false, message: "Organizers cannot enroll in their own events." };
  }

  const enrollRef = doc(db, "events", eventId, "attendees", user.uid);
  const enrollSnap = await getDoc(enrollRef);
  if (enrollSnap.exists()) {
    return { success: false, message: "Already enrolled" };
  }

  const currentCount = eventData.enrolledCount || 0;
  if (eventData.maxCapacity && currentCount >= eventData.maxCapacity) {
    return { success: false, message: "Event full" };
  }

  await setDoc(enrollRef, {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || "Anonymous",
    enrolledAt: serverTimestamp(),
  });

  await updateDoc(eventRef, {
    enrolledCount: increment(1)
  });

  const userEventRef = doc(db, "users", user.uid, "my_enrollments", eventId);
  await setDoc(userEventRef, {
    eventId: eventId,
    eventName: eventData.name,
    enrolledAt: serverTimestamp()
  });

  // 📧 Send enrollment confirmation email
  sendEnrollmentEmail(user, { ...eventData, id: eventId });
  return { success: true, message: "Successfully enrolled" };
}

// ✅ UNENROLLMENT WORKFLOW: Correctly decrements count
export async function unenrollFromEvent(eventId, uid, user, eventData) {
  if (!uid) throw new Error("User ID required.");

  const eventRef = doc(db, "events", eventId);
  const enrollRef = doc(db, "events", eventId, "attendees", uid);
  const userEventRef = doc(db, "users", uid, "my_enrollments", eventId);

  // Remove records and update count
  await deleteDoc(enrollRef);
  await updateDoc(eventRef, {
    enrolledCount: increment(-1)
  });
  await deleteDoc(userEventRef);

  // 📧 Notify attendee they have unenrolled
  if (user && eventData) sendUnenrollmentEmail(user, eventData);
  return { success: true, message: "Successfully unenrolled" };
}

export async function isUserEnrolled(eventId, uid) {
  if (!uid) return false;
  const snap = await getDoc(doc(db, "events", eventId, "attendees", uid));
  return snap.exists();
}