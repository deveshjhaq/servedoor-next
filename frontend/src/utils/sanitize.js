export function sanitize(value) {
  if (typeof value !== 'string') return value;

  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .trim();
}

export function sanitizeObject(input) {
  if (!input || typeof input !== 'object') return input;

  const sanitized = {};
  Object.keys(input).forEach((key) => {
    sanitized[key] = sanitize(input[key]);
  });
  return sanitized;
}
