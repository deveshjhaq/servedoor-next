/**
 * Sanitizes user input by removing potentially dangerous content
 * @param {string} str - The string to sanitize
 * @returns {string} - The sanitized string
 */
export function sanitize(str) {
  if (typeof str !== 'string') return str
  
  return str
    // Remove script tags and their content
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    // Remove all HTML tags
    .replace(/<[^>]+>/g, '')
    // Remove javascript: URIs
    .replace(/javascript:/gi, '')
    .trim()
}
