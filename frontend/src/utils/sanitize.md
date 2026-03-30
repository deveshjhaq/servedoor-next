# Input Sanitization Utility

## Overview

The `sanitize()` function provides XSS (Cross-Site Scripting) protection by removing potentially dangerous content from user input strings before they are submitted to the API.

## Purpose

**Requirement**: 2.4.AC1 - A shared `sanitize(str)` utility strips `<script>`, HTML tags, and dangerous attributes from string inputs.

This utility is part of the production-ready security enhancements for serveDoor.

## Usage

```javascript
import { sanitize } from './utils/sanitize'

// Basic usage
const userInput = '<script>alert("xss")</script>Hello World'
const safe = sanitize(userInput)
// Result: "Hello World"

// In form handlers
const handleSubmit = async (formData) => {
  const sanitizedData = {
    name: sanitize(formData.name),
    address: sanitize(formData.address),
    comment: sanitize(formData.comment),
  }
  await api.post('/endpoint', sanitizedData)
}
```

## What It Removes

### 1. Script Tags
Removes all `<script>` tags and their content, case-insensitively:
- `<script>alert("xss")</script>` → removed
- `<SCRIPT>bad()</SCRIPT>` → removed
- `<script type="text/javascript">...</script>` → removed

### 2. HTML Tags
Removes all HTML tags while preserving text content:
- `<div>Hello</div>` → `"Hello"`
- `<a href="evil.com">Link</a>` → `"Link"`
- `<img src="x" onerror="bad()">` → removed

### 3. JavaScript URIs
Removes `javascript:` protocol URIs, case-insensitively:
- `javascript:alert("xss")` → `alert("xss")`
- `JavaScript:bad()` → `bad()`

### 4. Whitespace
Trims leading and trailing whitespace:
- `"  text  "` → `"text"`

## What It Preserves

- Plain text content
- Safe special characters: `$`, `&`, `!`, `@`, etc.
- Numbers and non-string types (returned unchanged)

## Type Safety

The function handles non-string inputs gracefully:

```javascript
sanitize(null)      // Returns: null
sanitize(undefined) // Returns: undefined
sanitize(123)       // Returns: 123
sanitize({})        // Returns: {}
```

## When to Use

✅ **DO use sanitize() for:**
- User names
- Addresses
- Comments and reviews
- Search queries
- Any user-provided text that will be displayed or stored

❌ **DON'T use sanitize() for:**
- Passwords (they need exact values for authentication)
- Numeric fields (already type-safe)
- Boolean fields
- Data that has already been sanitized

## Integration Points

According to requirement 2.4.AC2, this utility should be applied in all form `onSubmit` handlers before calling the API.

### Forms to Update (Task 6.4)
- Login/Register forms (EnhancedAuth)
- Address forms
- Checkout forms
- Coupon input
- Admin create/edit forms
- Restaurant reviews
- Profile updates

## Testing

The utility includes comprehensive unit tests covering:
- Script tag removal (5 test cases)
- HTML tag removal (5 test cases)
- JavaScript URI removal (3 test cases)
- Combined attack vectors (2 test cases)
- Edge cases (6 test cases)
- Real-world scenarios (3 test cases)

Run tests with:
```bash
npm test -- sanitize.test.js --watchAll=false
```

## Security Notes

⚠️ **Important**: This is a **defense-in-depth** measure. It should be used alongside:
- Backend validation (Pydantic validators)
- Content Security Policy headers
- Proper output encoding when rendering user content
- HTTPS for data in transit

This utility provides **client-side** protection but should never be the only line of defense against XSS attacks.

## Implementation Details

The function uses three regex replacements:
1. `/<script[\s\S]*?>[\s\S]*?<\/script>/gi` - Removes script tags with content
2. `/<[^>]+>/g` - Removes all HTML tags
3. `/javascript:/gi` - Removes javascript: protocol

These patterns are applied in sequence, followed by `.trim()` to clean up whitespace.

## Related Files

- `frontend/src/utils/sanitize.js` - Main implementation
- `frontend/src/utils/sanitize.test.js` - Unit tests
- `frontend/src/utils/sanitize.example.js` - Usage examples
- `.kiro/specs/production-ready-enhancements/requirements.md` - Requirement 2.4
- `.kiro/specs/production-ready-enhancements/design.md` - Design specification

## Property-Based Testing

Task 6.3 includes a property-based test for **Property P4: Sanitization Completeness**:
> For any string input containing `<script>` tags, HTML tags, or `javascript:` URIs, the `sanitize()` function must return a string containing none of those patterns.

This will be implemented separately to validate the correctness property across a wide range of inputs.
