# Audit of the app.js
# Pre-Refactor:-

## 1. Poor Variable Naming
- Variable `d` is unclear — holds request body data
- Variable `r` is unclear — holds request params
- Variable `x` used as counter — not descriptive
- Variable `arr` unclear — represents sorted confessions
- Variable `tmp` unclear — represents a new confession object
- Variable `res2` unclear — result of delete operation
- Variable `handler` unclear — index of item to delete
- Variable `stuff` unclear — filtered list of confessions

## 2. Monolithic Function (handleAll)
- Function `handleAll` handles multiple responsibilities:
  - Input validation
  - Data creation
  - Data retrieval
  - Filtering
  - Deletion
  - Response formatting
- Uses a flag `t` to switch behavior (create, getAll, getOne, etc.)
- Violates Single Responsibility Principle


## 3. Deeply Nested Conditional Logic
- Multiple nested `if` statements in create logic
- Hard to read and maintain
- Example:
  - Checking text existence
  - Checking length > 0
  - Checking length < 500
  - Checking category validity


## 4. No Separation of Concerns
- Routes, business logic, and data storage all in one file
- No MVC structure
- No clear boundary between layers

## 5. Hardcoded Values
- Port `3000` hardcoded
- Delete token `'supersecret123'` hardcoded
- Categories array repeated in multiple places
- API routes hardcoded directly in app


## 6. No Environment Configuration
- No `.env` file
- Sensitive values (like delete token) exposed in code


## 7. Repeated Logic
- Categories array defined multiple times
- Response patterns inconsistent (`send`, `json`, mixed formats)


## 8. Inconsistent Error Handling
- Sometimes uses `.send()`, sometimes `.json()`
- Error messages inconsistent ("buddy", "bad", "broken")

## 9. No Comments
- No explanation of why logic exists
- Debug logs present but no documentation


## 10. Improper HTTP Practices
- Missing `return` after sending response (risk of multiple responses)
- No consistent structure for API responses


## 11. Data Handling Issues
- Sorting modifies original array (`confessions.sort`)
- No immutability practices


## 12. Unnecessary Complexity
- Filter function:
    if (x.category === cat) return true
return false
can be simple than this and more understandable.

## 13. Global State Issues
- `confessions` array stored in memory
- `x` as global counter
- Not scalable or persistent

---

## 14. Console Logs in Production Code
- Debug logs like:
- "added one info"
- "deleted something"
- Not structured logging


## 15. Code Outside App Flow
- This block:
    if (confessions.length > 500) {
    console.log("too many")
    }


runs outside request lifecycle


## 16. Route Design Issues
- Same handler used for all routes via flag `t`
- Makes routes tightly coupled to internal logic


## 17. Magic Strings
- 'create', 'getAll', 'getOne', etc. used as control flags
- Error-prone and hard to maintain