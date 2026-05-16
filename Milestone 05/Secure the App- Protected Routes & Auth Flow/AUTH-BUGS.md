# AUTH BUG ANALYSIS

---

# Observed Behaviours

## 1. Unauthenticated Route Access

Navigating directly to /dashboard without logging in renders the dashboard page instead of redirecting to /login.

Navigating directly to /settings without logging in renders the settings page.

Navigating directly to /profile without logging in renders the profile page.

---

## 2. Token Persistence Failure

After logging in, refreshing the browser logs the user out.

No token/user data persists correctly in localStorage.

---

## 3. Logout State Failure

After clicking logout, the Navbar still displays authenticated UI state.

---

# Root Cause Analysis

## Bug 1 — AuthProvider Wiring

AuthProvider was either:
- missing entirely
OR
- not wrapping Router/App correctly.

This prevented auth state from being globally available.

---

## Bug 2 — Missing localStorage Sync

AuthContext did not:
- save token to localStorage during login
- restore token on mount
- clear localStorage on logout

This caused refresh logout issues.

---

## Bug 3 — Missing Protected Routes

Private routes were rendered directly in App.jsx without authentication checks.

Unauthenticated users could access private pages directly via URL.

---

## Bug 4 — Navbar Not Reactive

Navbar was not consuming:
- isAuthenticated
- user
- logout()

from AuthContext properly.

UI did not update correctly after login/logout.