import { UserRole, UserRoleDisplay, UserRoleBadgeColor, UserRoleDescription } from '@/types/core';

/** Return true if the role is ADMIN. */
export const hasAdminAccess = (role?: string | null): boolean => {
	return role === UserRole.ADMIN;
};

/** Get Korean display label for role. */
export const getRoleDisplayLabel = (role?: string | null): string => {
	if (!role) return '외부인';
	return UserRoleDisplay[role as UserRole] ?? '외부인';
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
