# Changes.md

## Security Audit & Fixes for Event Manager

This document records the vulnerabilities discovered in the starter code and the fixes applied to enforce proper authorization. The app originally allowed authenticated users to bypass access controls, exposing private events to anyone who logged in.

---

### 1. Global Node Listing (Unauthorized Event Discovery)
**Path:** `server/routes/events.js` – `GET /api/events`

- **Issue:** The endpoint returned **all events**, regardless of whether the user was the creator or invited.
- **Risk:** Any logged‑in user could discover private events they were not supposed to see.
- **Fix:** Filter events so that only those where `req.user.id === event.creatorId` or `req.user.email` is in `event.invitedEmails` are returned.

---

### 2. Private Detail Disclosure
**Path:** `server/routes/events.js` – `GET /api/events/:id`

- **Issue:** Any authenticated user could fetch event details by ID, even if they were not invited.
- **Risk:** Sensitive event details (title, description, date, invited emails) were exposed to unauthorized users.
- **Fix:** Added an authorization check. Only return the event if the user is the creator or invited. Otherwise, return `403 Forbidden`.  
- **Enhancement:** Include `isCreator` and `isInvited` flags in the response for the frontend to render buttons correctly.

---

### 3. RSVP Gatekeeping Bypass
**Path:** `server/routes/events.js` – `POST /api/events/:id/rsvp`

- **Issue:** Any authenticated user could RSVP to any event. Duplicate RSVPs were also possible.
- **Risk:** Unauthorized users could join private events, and users could RSVP multiple times.
- **Fix:**  
  - Check that `req.user.email` is in `event.invitedEmails`. If not, return `403 Forbidden`.  
  - Check that `req.user.id` is not already in `event.rsvps`. If present, return `400 Bad Request`.  
  - Only invited users who haven’t RSVP’d yet can RSVP successfully.

---

### 4. Unauthorized Data Deletion
**Path:** `server/routes/events.js` – `DELETE /api/events/:id`

- **Issue:** Any authenticated user could delete any event.
- **Risk:** Invited guests or unrelated users could purge events they didn’t own.
- **Fix:** Use `findIndex` to locate the event, then enforce ownership: only delete if `event.creatorId === req.user.id`. Otherwise, return `403 Forbidden`.

---

### 5. Misleading UI (Frontend Logic)
**Path:** `client/src/pages/EventDetail.jsx`

- **Issue:** RSVP and Delete buttons were shown to all logged‑in users, regardless of permissions.
- **Risk:** Users were misled into thinking they could RSVP or delete events they weren’t authorized to access.
- **Fix:** Backend now provides `isCreator` and `isInvited` flags. Frontend updated to conditionally render buttons:  
  - Show RSVP only if `isInvited` is true and user hasn’t RSVP’d yet.  
  - Show Delete only if `isCreator` is true.  
  - Hide buttons otherwise.

---

## Summary

- **Before:** Authentication worked, but authorization was broken. Any logged‑in user could list, view, RSVP, and delete events they didn’t own or weren’t invited to.  
- **After:** Each route now enforces proper authorization:
  - Event listing filtered by creator/invitee.  
  - Event detail restricted to creator/invitee.  
  - RSVP restricted to invited users, with duplicate prevention.  
  - Delete restricted to event creator.  
  - Frontend buttons rendered based on backend flags.  

**Result:** Private events are now protected. Only authorized users can view, RSVP, or delete events.
