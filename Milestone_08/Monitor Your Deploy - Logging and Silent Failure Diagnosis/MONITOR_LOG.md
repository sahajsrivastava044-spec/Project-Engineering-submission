# Monitor & Debug Log
**Engineer:** Sahaj Srivastava
**Date:** 2026-06-29

## Before
Before: No logs were visible in Render (silent failure).
The response returned a status 200 with an empty array `[]`, but nothing was printed in the logs to indicate why.

## Morgan Log Line
`::ffff:127.0.0.1 - - [29/Jun/2026:12:35:00 +0000] "GET /api/products HTTP/1.1" 200 2 "-" "curl/7.88.1"`
Notice the response size is `2` bytes, which matches the empty array `[]`.

## Root Cause
- **File:** `src/controllers/productController.js`
- **Line:** 6
- **Issue:** The query was `await Product.find({ category: req.query.category });`. When no category query parameter is provided in the request URL, `req.query.category` is undefined. Passing `{ category: undefined }` caused the database to return an empty list because no products have an undefined category, leading to an empty array response without throwing any errors. 

## After Fix
`::ffff:127.0.0.1 - - [29/Jun/2026:12:40:00 +0000] "GET /api/products HTTP/1.1" 200 543 "-" "curl/7.88.1"`
(The response size has increased to 543 bytes, indicating that products are now being returned successfully).
