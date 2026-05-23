# Changes.md

## What I Found

After running the app locally and signing up with the test account:

Email: test@example.com  
Password: password123

I opened the MongoDB database and inspected the created user document.

### Database Record Before Fix

```json
{
  "_id": "6650c4f3a4c2f4d8b2d11a21",
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "__v": 0
}

The password field was stored as:

password123

This falls under the category:

❌ Plain Text Password Storage

The password was not hashed or encrypted before being stored in the database.

Checkpoint 1 — Signup

I inspected the signup controller handling:

POST /api/auth/signup

I traced the password flow from:

req.body.password

to the database save operation.

What I Found

The password was being directly stored in the database without hashing.

Example:

const user = await User.create({
  name,
  email,
  password
})

There was:

❌ No bcrypt.hash() call
❌ No password transformation
❌ No hashing middleware
❌ No security layer before saving

This means the original password entered by the user was permanently stored exactly as typed.

Checkpoint 2 — Database Record
Password Field Observed
password123
Classification

❌ Plain Text Password

The value was fully readable and directly usable by anyone with database access.

A secure bcrypt hash should instead look similar to:

$2b$10$K7Qj0x8dJj5M7wA2YfJH2uL9dA0x...
Checkpoint 3 — Login Comparison

I inspected the login controller handling:

POST /api/auth/login
What I Found

The submitted password was being compared using direct string equality.

Example:

if (user.password === password) {
  // login success
}

Problems with this approach:

❌ Direct comparison against plain text
❌ No bcrypt verification
❌ Passwords must remain readable in database
❌ Unsafe authentication logic

There was also:

❌ No bcrypt.compare()
❌ No hashing of submitted password before comparison
Checkpoint 4 — User Model

I inspected the User model file.

What Was Present
Basic schema fields for:
name
email
password
What Was Missing
❌ No pre('save') hook
❌ No password hashing middleware
❌ No select: false on password field
❌ No password validation rules
❌ No authentication helper methods

This meant the application had no built-in protection for password handling.

Root Cause

The root cause of the issue was that the signup flow directly stored the password received from req.body.password into the database without hashing it first.

The signup controller created the user like this:

const user = await User.create({
  name,
  email,
  password
})

Since no bcrypt hashing step existed in the controller or model middleware, MongoDB stored the password exactly as the user entered it.

Additionally, the login controller relied on direct string comparison:

user.password === password

This design forced the application to keep passwords readable in the database, creating a major security vulnerability.

Why This Is Dangerous

If the database were ever leaked, hacked, or accidentally exposed, every user's real password would immediately be visible to attackers.

Attackers could then:

Log into user accounts directly
Attempt credential stuffing attacks on Gmail, Instagram, banking apps, etc.
Sell password dumps online
Hijack accounts using reused passwords
Gain unauthorized access to sensitive user data

Because the passwords were stored in plain text, attackers would not even need to crack hashes or perform brute-force attacks. The credentials would already be exposed in fully readable form.

This turns a normal database breach into a catastrophic account compromise event.

What I Fixed
Fix 1 — Hash Password Before Saving
Before
const user = await User.create({
  name,
  email,
  password
})
After
import bcrypt from 'bcryptjs'

const saltRounds = 10

const hashedPassword = await bcrypt.hash(password, saltRounds)

const user = await User.create({
  name,
  email,
  password: hashedPassword
})
Result

Passwords are now stored as bcrypt hashes instead of plain text.

Example:

$2b$10$wYQ8XQ3v0N5v8M4Q0i8N0u...
Fix 2 — Secure Password Comparison During Login
Before
if (user.password === password) {
  // login success
}
After
import bcrypt from 'bcryptjs'

const isMatch = await bcrypt.compare(password, user.password)

if (!isMatch) {
  return res.status(401).json({
    message: 'Invalid credentials'
  })
}
Result

The application now safely verifies passwords without exposing or storing the original password.

Verification
Before Fix
Signed up with:
test@example.com
password123
Database Result
password123

❌ Password visible in plain text

After Fix

Signed up again with a new account.

Database Result
$2b$10$wYQ8XQ3v0N5v8M4Q0i8N0u...

✅ Password stored as bcrypt hash

Login Testing
Correct Credentials
Status: 200 OK
JWT returned successfully

✅ Login works correctly

Incorrect Credentials
Status: 401 Unauthorized
Message: Invalid credentials

✅ Invalid passwords rejected correctly

