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

/** Return true if the role is GUEST (외부인). */
export const isGuest = (role?: string | null): boolean => {
	return !role || role === UserRole.GUEST;
};

export type GuestRestrictionAction = 'create' | 'edit' | 'delete';
export type GuestRestrictionSubject = 'article' | 'project' | 'news' | 'document' | 'qna';

/** "외부인은 ~ 합니다" 형태의 권한 안내 메시지 */
export function getGuestRestrictionMessage(
	action: GuestRestrictionAction,
	subject?: GuestRestrictionSubject
): string {
	if (action === 'create' && subject) {
		const subjectLabel: Record<GuestRestrictionSubject, string> = {
			article: '글을 작성',
			project: '프로젝트를 생성',
			news: '뉴스를 작성',
			document: '문서를 작성',
			qna: '질문을 작성',
		};
		const label = subjectLabel[subject];
		return label ? `외부인은 ${label}할 수 없습니다.` : '외부인은 이 작업을 할 수 없습니다.';
	}
	if (action === 'edit') return '외부인은 수정할 수 없습니다.';
	if (action === 'delete') return '외부인은 삭제할 수 없습니다.';
	return '외부인은 이 작업을 할 수 없습니다.';
}

/** GUEST면 alert로 메시지 표시 후 false 반환, 아니면 true. 버튼/제출 시 사용 */
export function requireNotGuest(
	role: string | undefined | null,
	action: GuestRestrictionAction,
	subject?: GuestRestrictionSubject
): boolean {
	if (!isGuest(role)) return true;
	const message = getGuestRestrictionMessage(action, subject);
	if (typeof window !== 'undefined') window.alert(message);
	return false;
}

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
