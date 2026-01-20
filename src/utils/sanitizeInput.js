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
    if (typeof v === 'string') {
      const s = sanitizeString(v);
      // If the string looks like JSON (array or object), try to parse it so
      // downstream validation receives correct types when using multipart/form-data
      if (s && (s[0] === '{' || s[0] === '[')) {
        try {
          const parsed = JSON.parse(s);
          out[k] = sanitizeObject(parsed);
          continue;
        } catch (err) {
          // fall through and keep as string if JSON.parse fails
        }
      }
      out[k] = s;
    } else {
      out[k] = sanitizeObject(v);
    }
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
