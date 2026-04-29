# 🐛 Bug Report — TrackFlow Bug Report Form

## Overview
The Bug Report Form in TrackFlow was functionally rendering but lacked proper validation, submission lifecycle management, and error handling. These issues led to unreliable behavior in real-world usage scenarios.

Below is a detailed breakdown of all identified bugs, their observed behavior, and root causes.

---

## 🔴 Bug 1: Empty Submission Allowed

### Observed Behavior
The form submits successfully even when all required fields are left empty.

### Root Cause
The `validate()` function always returns `true`, and its return value is ignored in `handleSubmit`. As a result, no validation gate prevents invalid submissions.

---

## 🔴 Bug 2: Multiple Submissions (No Loading State)

### Observed Behavior
Clicking the "Submit" button multiple times rapidly triggers multiple API requests.

### Root Cause
The `loading` state is never set to `true` before the API call, and the submit button is not disabled during submission. This allows duplicate requests.

---

## 🔴 Bug 3: Form Not Reset After Successful Submission

### Observed Behavior
After a successful submission, the form retains previously entered values.

### Root Cause
The form state is not reset because `setForm(EMPTY_FORM)` is never called in the success path.

---

## 🔴 Bug 4: Silent Server Errors

### Observed Behavior
When the API returns an error (e.g., submitting "login" as title), no error message is displayed to the user.

### Root Cause
The `catch` block captures errors but does not update any UI state (`setErrors` or `setServerError`). This results in silent failures.

---

## 🔴 Bug 5: Missing Field-Level Error Messages

### Observed Behavior
Validation errors are not displayed next to their respective fields.

### Root Cause
Although an `errors` state exists, it is never populated nor referenced in the JSX. Therefore, users receive no feedback on incorrect inputs.

---

## 🔴 Bug 6: Invalid Steps Count Accepted

### Observed Behavior
The "No. of Steps" field accepts invalid values such as `0`, negative numbers, or empty input.

### Root Cause
The `validate()` function does not include any rules for validating `stepsCount`.

---

## ✅ Summary of Fixes Implemented

- Implemented a structured `validate()` function returning field-specific errors
- Blocked submission when validation fails
- Displayed field-level error messages in the UI
- Introduced proper loading state management
- Disabled submit button during API calls
- Reset form after successful submission
- Handled server-side errors (field-level and global)
- Cleared errors dynamically when users update inputs
