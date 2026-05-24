# Changes.md

## Role-Based Access Control Audit & Fixes

### Project
ExpenseApp — Node.js + Express + MongoDB

---

# Role Gap Audit

Logged in as:

- `user@expenseapp.io`
- Role: `user`

Generated JWT using the login endpoint and tested sensitive endpoints manually.

## Actions That Incorrectly Succeeded Before Fixes

| Action | Endpoint | Should User Access? | Actual Result Before Fix |
|---|---|---|---|
| View all expenses | `GET /api/expenses` | ❌ No | ✅ Allowed |
| Approve expense | `PUT /api/expenses/:id/approve` | ❌ No | ✅ Allowed |
| Reject expense | `PUT /api/expenses/:id/reject` | ❌ No | ✅ Allowed |
| Delete another user's expense | `DELETE /api/expenses/:id` | ❌ No | ✅ Allowed |
| View all users | `GET /api/users` | ❌ No | ✅ Allowed |
| Change another user's role | `PUT /api/users/:id/role` | ❌ No | ✅ Allowed |
| Edit another user's expense | `PUT /api/expenses/:id` | ❌ No | ✅ Allowed |
| Promote self to admin | `PUT /api/users/:id/role` | ❌ No | ✅ Allowed |

These findings confirmed that the application had authentication but lacked proper authorisation checks.

---

# Checkpoint 1 — Role in User Model and JWT

## User Model Audit

Checked the `User` model for role support.

### Result

Role field existed / was added with the following schema:

```js
role: {
  type: String,
  enum: ['user', 'manager', 'admin'],
  default: 'user',
}
```

This ensures:
- Only valid roles can exist
- Every new account defaults to `user`

---

## JWT Payload Audit

Checked token generation logic.

### Required Payload

```js
jwt.sign(
  { userId: user._id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
)
```

### Why This Matters

If `role` is not included in the JWT payload:
- `req.user.role` becomes `undefined`
- Middleware role checks fail
- Access control becomes impossible at middleware level

---

# Checkpoint 2 — Role Middleware Existence

## Middleware Audit

Searched codebase for:
- `requireRole`
- role-based middleware
- permission checks

### Findings

Before fixes:
- Authentication middleware existed
- No reusable role middleware existed
- No centralised permission enforcement existed
- Routes relied only on authentication

This meant:
- Any authenticated user could access sensitive endpoints

---

# Checkpoint 3 — Route Protection Coverage

| Route | Sensitive? | Currently Restricted Before Fix? | Should Be Restricted To |
|---|---|---|---|
| `POST /api/expenses` | Yes | ❌ No | user, manager, admin |
| `GET /api/expenses/mine` | Yes | ❌ No | user, manager, admin |
| `GET /api/expenses` | Yes | ❌ No | manager, admin |
| `PUT /api/expenses/:id/approve` | Yes | ❌ No | manager, admin |
| `PUT /api/expenses/:id/reject` | Yes | ❌ No | manager, admin |
| `DELETE /api/expenses/:id` | Yes | ❌ No | admin |
| `GET /api/users` | Yes | ❌ No | admin |
| `PUT /api/users/:id/role` | Yes | ❌ No | admin |
| `GET /api/users/me` | Yes | ❌ No | user, manager, admin |
| `PUT /api/expenses/:id` | Yes | ❌ No | Owner OR privileged roles |

---

# Checkpoint 4 — Ownership Gaps

## Expense Ownership Audit

Checked expense modification routes.

### Findings

Before fixes:
- No ownership verification existed
- Any authenticated user could:
  - Edit another user's expense
  - Delete another user's expense

### Security Risk

This allowed:
- Data tampering
- Cross-user modification
- Privilege abuse

---

# Fix 1 — Ensure Role Is Stored and Signed

## User Model Update

Added / confirmed role field:

```js
role: {
  type: String,
  enum: ['user', 'manager', 'admin'],
  default: 'user',
}
```

---

## JWT Update

Added role to signed JWT payload:

```js
jwt.sign(
  { userId: user._id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
)
```

---

# Fix 2 — Build and Apply requireRole Middleware

## Created Middleware

File:
`middleware/roleMiddleware.js`

```js
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated.' })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required: ${allowedRoles.join(' or ')}.`
      })
    }

    next()
  }
}
```

---

## Applied Middleware to Routes

### Expense Routes

| Route | Middleware Applied |
|---|---|
| `POST /api/expenses` | `requireRole('user', 'manager', 'admin')` |
| `GET /api/expenses/mine` | `requireRole('user', 'manager', 'admin')` |
| `GET /api/expenses` | `requireRole('manager', 'admin')` |
| `PUT /api/expenses/:id/approve` | `requireRole('manager', 'admin')` |
| `PUT /api/expenses/:id/reject` | `requireRole('manager', 'admin')` |
| `DELETE /api/expenses/:id` | `requireRole('admin')` |

---

### User Routes

| Route | Middleware Applied |
|---|---|
| `GET /api/users` | `requireRole('admin')` |
| `PUT /api/users/:id/role` | `requireRole('admin')` |
| `GET /api/users/me` | `requireRole('user', 'manager', 'admin')` |

---

# Fix 3 — Ownership Checks for Expense Modification

## Added Ownership Validation

Implemented ownership verification inside update/delete expense controllers.

```js
const expense = await Expense.findById(req.params.id)

const isOwner =
  expense.submittedBy.toString() === req.user.userId

const isPrivileged =
  ['manager', 'admin'].includes(req.user.role)

if (!isOwner && !isPrivileged) {
  return res.status(403).json({
    message: 'You can only modify your own expenses.'
  })
}
```

---

# Final Security Outcome

## After Fixes

### Regular User Can:
- Submit expenses
- View own expenses
- Edit own expenses
- View own profile

### Regular User Cannot:
- Approve/reject expenses
- View all expenses
- Delete arbitrary expenses
- View all users
- Change roles
- Modify another user's records

---

### Manager Can:
- View all expenses
- Approve/reject expenses
- Manage own expenses

### Manager Cannot:
- Delete expenses
- Change user roles
- Access admin-only routes

---

### Admin Can:
- Perform all actions
- Manage users
- Delete expenses
- Change roles

---

# Verification Tests Performed

| Test | Expected Result | Actual Result |
|---|---|---|
| User approving expense | 403 Forbidden | ✅ Passed |
| User viewing all users | 403 Forbidden | ✅ Passed |
| User changing roles | 403 Forbidden | ✅ Passed |
| User editing another user's expense | 403 Forbidden | ✅ Passed |
| Manager approving expense | 200 OK | ✅ Passed |
| Admin deleting expense | 200 OK | ✅ Passed |
| Admin changing role | 200 OK | ✅ Passed |

---

# Summary

Implemented complete Role-Based Access Control (RBAC) for ExpenseApp by:

- Adding role validation
- Including role in JWT payload
- Creating reusable role middleware
- Protecting all sensitive routes
- Enforcing ownership checks
- Preventing privilege escalation
- Preventing cross-user modification

The application now correctly enforces:
- Authentication
- Authorisation
- Ownership validation
- Principle of least privilege