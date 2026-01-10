import { UserRole, UserRoleDisplay } from '@/types/core';

/**
 * Normalize arbitrary role strings (including Korean labels) into our UserRole enum.
 */
export const normalizeRole = (role?: string | null): UserRole | null => {
	if (!role) return null;

	const trimmed = role.trim();
	if (!trimmed) return null;

	const upper = trimmed.toUpperCase();

	// Direct enum matches
	if (upper in UserRole) return UserRole[upper as keyof typeof UserRole];

	// Korean / alias mapping
	const aliasMap: Record<string, UserRole> = {
		'운영진': UserRole.ADMIN,
		'외부인': UserRole.GUEST,
		'준회원': UserRole.ASSOCIATE,
		'정회원': UserRole.REGULAR,
		'선배님': UserRole.SENIOR,
	};

	return aliasMap[trimmed] ?? null;
};

/** Return true if the role corresponds to an admin/운영진. */
export const hasAdminAccess = (role?: string | null): boolean => {
	return normalizeRole(role) === UserRole.ADMIN;
};

/** Safely resolve display label from any raw role string. */
export const getRoleDisplayLabel = (role?: string | null): string => {
	const normalized = normalizeRole(role);
	if (!normalized) return '외부인';
	return UserRoleDisplay[normalized] ?? role ?? '외부인';
};

/**
 * Choose the best role source between profile data and auth context.
 */
export const pickRole = (
	primaryRole?: string | null,
	fallbackRole?: string | null
): string | null => {
	return primaryRole ?? fallbackRole ?? null;
};
