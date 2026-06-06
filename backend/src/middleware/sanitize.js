// Strips HTML tags, script injections, and dangerous patterns from any string
const clean = (value) => {
  if (typeof value !== 'string') return value;
  return value
    .replace(/<[^>]*>/gi, '')                        // remove HTML tags
    .replace(/javascript\s*:/gi, '')                 // remove javascript: URIs
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')    // remove inline event handlers
    .replace(/[<>]/g, '')                            // strip remaining < >
    .trim();
};

const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'string') obj[key] = clean(obj[key]);
    else if (typeof obj[key] === 'object') sanitizeObject(obj[key]);
  }
  return obj;
};

module.exports = (req, res, next) => {
  sanitizeObject(req.body);
  sanitizeObject(req.query);
  sanitizeObject(req.params);
  next();
};
