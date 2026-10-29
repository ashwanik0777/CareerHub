import { Role } from '@platform/types';

export const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.USER]: 1,
  [Role.MODERATOR]: 2,
  [Role.ADMIN]: 3,
  [Role.SUPERADMIN]: 4,
};

/**
 * Verifies if a user role meets the required role threshold.
 */
export function hasRequiredRole(userRole: Role, requiredRole: Role): boolean {
  const userScore = ROLE_HIERARCHY[userRole] || 0;
  const requiredScore = ROLE_HIERARCHY[requiredRole] || 0;
  return userScore >= requiredScore;
}
