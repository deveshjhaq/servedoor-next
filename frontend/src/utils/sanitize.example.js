/**
 * Example usage of the sanitize utility in form handlers
 * 
 * This file demonstrates how to apply sanitization to form inputs
 * before submitting to the API, as per requirement 2.4.AC2
 */

import { sanitize } from './sanitize'

// Example 1: Login form handler
export const handleLoginSubmit = async (formData) => {
  const sanitizedData = {
    email: sanitize(formData.email),
    password: formData.password, // Don't sanitize passwords - they need exact values
  }
  // Call API with sanitizedData
}

// Example 2: Address form handler
export const handleAddressSubmit = async (formData) => {
  const sanitizedData = {
    label: sanitize(formData.label),
    street: sanitize(formData.street),
    city: sanitize(formData.city),
    pincode: sanitize(formData.pincode),
  }
  // Call API with sanitizedData
}

// Example 3: Restaurant review handler
export const handleReviewSubmit = async (formData) => {
  const sanitizedData = {
    rating: formData.rating, // Numbers don't need sanitization
    comment: sanitize(formData.comment),
    userName: sanitize(formData.userName),
  }
  // Call API with sanitizedData
}

// Example 4: Bulk sanitization helper for objects
export const sanitizeFormData = (data) => {
  const sanitized = {}
  for (const [key, value] of Object.entries(data)) {
    // Only sanitize string values
    sanitized[key] = typeof value === 'string' ? sanitize(value) : value
  }
  return sanitized
}

// Example 5: Using with react-hook-form
export const onSubmit = async (data) => {
  // Sanitize all string fields
  const sanitizedData = sanitizeFormData(data)
  
  // Submit to API
  // await api.post('/endpoint', sanitizedData)
}
