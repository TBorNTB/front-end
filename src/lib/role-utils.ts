import { UserRole, UserRoleDisplay, UserRoleBadgeColor, UserRoleDescription, UserRoleColor } from '@/types/core';

/** Get base color name for role (e.g., "gray", "blue"). */
export const getRoleColor = (role?: string | null): string => {
	if (!role) return UserRoleColor[UserRole.GUEST];
	return UserRoleColor[role as UserRole] ?? UserRoleColor[UserRole.GUEST];
};

/** Return true if the role is ADMIN. */
export const hasAdminAccess = (role?: string | null): boolean => {
	return role === UserRole.ADMIN;
};

/** Get Korean display label for role. */
export const getRoleDisplayLabel = (role?: string | null): string => {
	if (!role) return UserRoleDisplay[UserRole.GUEST];
	return UserRoleDisplay[role as UserRole] ?? UserRoleDisplay[UserRole.GUEST];
};

/** Get badge color classes for role. */
export const getRoleBadgeColor = (role?: string | null): string => {
	if (!role) return UserRoleBadgeColor[UserRole.GUEST];
	return UserRoleBadgeColor[role as UserRole] ?? UserRoleBadgeColor[UserRole.GUEST];
};

/** Get description for role. */
export const getRoleDescription = (role?: string | null): string => {
	if (!role) return UserRoleDescription[UserRole.GUEST];
	return UserRoleDescription[role as UserRole] ?? UserRoleDescription[UserRole.GUEST];
};
