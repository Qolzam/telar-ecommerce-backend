/**
 * Converts a full user object into a "public" version
 * containing only safe-to-expose fields.
 *
 * This prevents leaking sensitive data (e.g., password, tokens).
 * No dynamic key access is used to avoid object injection warnings.
 *
 * @param {Object} user - Prisma user object or plain JS object
 * @returns {Object} Public user data with only whitelisted fields
 */

export function toPublicUser(user) {
  const raw = typeof user?.toJSON === 'function' ? user.toJSON() : user;

  const { id, email, fullName, role, isActive, createdAt, updatedAt } = raw ?? {};

  return {
    ...(id !== undefined && { id }),
    ...(email !== undefined && { email }),
    ...(fullName !== undefined && { fullName }),
    ...(role !== undefined && { role }),
    ...(isActive !== undefined && { isActive }),
    ...(createdAt !== undefined && { createdAt }),
    ...(updatedAt !== undefined && { updatedAt })
  };
}
