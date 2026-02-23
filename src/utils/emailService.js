import emailjs from "@emailjs/browser";

// ─────────────────────────────────────────────────────────────────
// ✏️  FILL IN YOUR EMAILJS CREDENTIALS BELOW
//     Get these from https://dashboard.emailjs.com
// ─────────────────────────────────────────────────────────────────
const SERVICE_ID = "service_u9gzsre";   // ✅ Your service ID
const PUBLIC_KEY = "DZs-LvIngg41Qmbp2";   // e.g. "abc123XYZ"

// Template IDs — add more as you upgrade your EmailJS plan
const TEMPLATES = {
    eventCreated: null,                 // Moved to enrolled
    eventDeleted: null,                 // ⏸ Needs template (EmailJS free = 2 max)
    enrolled: "template_5q7g23d",       // ✅ Active (repurposed from creation)
    unenrolled: null,                 // ⏸ Needs template
    reminder: "template_ezrohyv",  // ✅ Active
};
// ─────────────────────────────────────────────────────────────────

// Shared sender helper — silently skips if template is not configured
async function send(templateId, params) {
    if (!templateId) {
        console.info("[EmailJS] ⏸ Email skipped — no template configured for this event type.");
        return;
    }
    try {
        await emailjs.send(SERVICE_ID, templateId, params, PUBLIC_KEY);
        console.log(`[EmailJS] ✅ Sent template: ${templateId}`);
    } catch (err) {
        console.error(`[EmailJS] ❌ Failed to send template "${templateId}":`, err);
    }
}

// ── 1. Organiser creates an event ────────────────────────────────
export function sendEventCreatedEmail(user, event) {
    return send(TEMPLATES.eventCreated, {
        to_name: user.displayName || "Organizer",
        to_email: user.email,
        event_name: event.name,
        event_date: event.date,
        event_link: event.link || "N/A",
    });
}

// ── 2. Organiser deletes an event ────────────────────────────────
export function sendEventDeletedEmail(user, event) {
    return send(TEMPLATES.eventDeleted, {
        to_name: user.displayName || "Organizer",
        to_email: user.email,
        event_name: event.name,
        event_date: event.date,
    });
}

// ── 3. Attendee enrolls in an event ──────────────────────────────
export function sendEnrollmentEmail(user, event) {
    // We map to the existing "Event Created" template fields.
    // The email will say "Hi {{to_name}}, your event {{event_name}} has been successfully created and is now live!"
    // To make this contextually an ENROLLMENT email, you need to edit the text on the EmailJS Dashboard to say:
    // "Hi {{to_name}}, you have successfully enrolled in the event {{event_name}}! 🎉"

    return send(TEMPLATES.enrolled, {
        to_name: user.displayName || "Attendee",
        to_email: user.email,
        event_name: event.name,
        event_date: event.date,
        event_link: event.link || "N/A",
    });
}

// ── 4. Attendee unenrolls from an event ──────────────────────────
export function sendUnenrollmentEmail(user, event) {
    return send(TEMPLATES.unenrolled, {
        to_name: user.displayName || "Attendee",
        to_email: user.email,
        event_name: event.name,
        event_date: event.date,
    });
}

// ── 5. Upcoming event reminder (fire within 24h of event) ────────
export function sendUpcomingEventReminder(user, event) {
    return send(TEMPLATES.reminder, {
        to_name: user.displayName || "Attendee",
        to_email: user.email,
        event_name: event.name,
        event_date: event.date,
        event_link: event.link || "N/A",
        speaker: event.speaker || "TBA",
    });
}
