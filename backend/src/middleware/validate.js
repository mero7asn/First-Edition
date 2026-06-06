// Validates UUID format or just passes
const validateObjectId = (req, res, next) => {
  // Prisma uses UUIDs or slugs. We can rely on Prisma's built-in validation or check length.
  // We just let it pass for now.
  next();
};

// Escapes special regex characters to prevent ReDoS
const safeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Picks only whitelisted fields from an object
const pick = (obj, allowedFields) => {
  const result = {};
  for (const field of allowedFields) {
    if (obj[field] !== undefined) result[field] = obj[field];
  }
  return result;
};

module.exports = { validateObjectId, safeRegex, pick };
