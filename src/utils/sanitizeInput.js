export function sanitizeString(input) {
  if (typeof input !== 'string') return input;
  return input.trim();
}

export function sanitizeObject(input) {
  if (!input || typeof input !== 'object') return input;
  if (Array.isArray(input)) return input.map(sanitizeObject);
  const out = {};
  for (const [k, v] of Object.entries(input)) {
    if (k.startsWith('$') || k.includes('.')) continue;
    out[k] = typeof v === 'string' ? sanitizeString(v) : sanitizeObject(v);
  }
  return out;
}

export function slugify(s) {
  if (!s) return '';
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
