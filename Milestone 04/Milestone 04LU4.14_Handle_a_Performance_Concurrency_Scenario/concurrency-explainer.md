# Concurrency Explainer

**Your name:** Sahaj Srivastava
**Date:** 28 April 2026

---

## The Root Cause — Why Check-Then-Insert Fails

The root cause of the issue is a race condition created by the check-then-insert pattern. In this approach, the application first checks whether a booking already exists for a given seat and show using a query like findFirst(). If no record is found, it proceeds to create a new booking. While this works in low-traffic scenarios, it fails under concurrent load.

A race condition occurs when two or more requests execute simultaneously and depend on the same shared data. In this case, if two users send booking requests at nearly the same time, both requests can perform the check before either has completed the insert. Since the database has not yet been updated, both checks return “no booking found.” Each request then proceeds to create a booking, resulting in duplicate entries for the same seat. The gap between the check and the insert is the critical weakness — it is a non-atomic operation where the system temporarily allows inconsistent state.

---

## Why the Unique Constraint Fixes It

The unique constraint moves the responsibility of enforcing data integrity from the application layer to the database. By adding @@unique([seatId, showId]) in the schema, the database guarantees that no two rows can have the same combination of seatId and showId. This check is enforced atomically at the database level, meaning it happens as a single, indivisible operation.

Application-level checks cannot guarantee this behavior because they run as separate queries and are subject to timing issues. Even if the application is fast, it cannot prevent two concurrent requests from passing the check simultaneously. The database, however, locks and validates constraints internally during the insert operation itself, ensuring that only one request succeeds and all others fail.

---

## Why Rate Limiting Alone Is Not Enough

Rate limiting helps control the number of requests from a single IP address, but it does not solve the race condition problem. For example, consider two different users attempting to book the same seat at the same time. Each user sends only one request, which is well within the allowed rate limit.

Without the unique constraint, both requests would still pass the application-level check and proceed to insert duplicate bookings. This shows that rate limiting is effective for preventing abuse and server overload, but it cannot guarantee data consistency. It reduces traffic but does not eliminate concurrency issues.

---

## What P2002 Means and Why 409

P2002 is a Prisma error code that indicates a unique constraint violation. It occurs when an attempt is made to insert a record that conflicts with an existing unique constraint defined in the database. In this case, it means that the seat has already been booked for the given show.

Returning a 409 Conflict status code is appropriate because the request is valid but cannot be completed due to a conflict with the current state of the resource. A 400 Bad Request would imply that the client sent incorrect data, which is not true. A 500 Internal Server Error would suggest a server malfunction, which is also incorrect because the system is behaving as expected. Therefore, 409 clearly communicates that the issue is a state conflict, not a client or server error.

---

