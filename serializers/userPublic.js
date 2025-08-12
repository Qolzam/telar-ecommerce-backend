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
