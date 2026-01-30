// shared/types/core.ts
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimestampEntity {
  createdAt: string;
  updatedAt: string;
}

export interface UserReference {
  nickname: string;
  full_name?: string;
  profileImage?: string;
}

// Backend API 응답과 일치하는 UserRole enum
export enum UserRole {
  GUEST = "GUEST",
  ASSOCIATE_MEMBER = "ASSOCIATE_MEMBER",
  FULL_MEMBER = "FULL_MEMBER",
  SENIOR = "SENIOR",
  ADMIN = "ADMIN",
}

// Role -> 한글 표시명
export const UserRoleDisplay: Record<UserRole, string> = {
  [UserRole.GUEST]: "외부인",
  [UserRole.ASSOCIATE_MEMBER]: "준회원",
  [UserRole.FULL_MEMBER]: "정회원",
  [UserRole.SENIOR]: "선배님",
  [UserRole.ADMIN]: "운영진",
};

// 한글 -> Role (역방향 매핑, 자동 생성)
export const UserRoleFromDisplay = Object.fromEntries(
  Object.entries(UserRoleDisplay).map(([k, v]) => [v, k])
) as Record<string, UserRole>;

// Role별 설명
export const UserRoleDescription: Record<UserRole, string> = {
  [UserRole.GUEST]: "제한된 권한을 가진 방문자",
  [UserRole.ASSOCIATE_MEMBER]: "기본 권한을 가진 회원",
  [UserRole.FULL_MEMBER]: "모든 기능을 사용할 수 있는 회원",
  [UserRole.SENIOR]: "경험과 지식을 가진 선배 회원",
  [UserRole.ADMIN]: "관리 권한을 가진 회원",
};

// Role별 기본 색상 (tailwind color name)
export const UserRoleColor: Record<UserRole, string> = {
  [UserRole.GUEST]: "gray",
  [UserRole.ASSOCIATE_MEMBER]: "blue",
  [UserRole.FULL_MEMBER]: "green",
  [UserRole.SENIOR]: "purple",
  [UserRole.ADMIN]: "orange",
};

// Role별 뱃지 색상
export const UserRoleBadgeColor: Record<UserRole, string> = {
  [UserRole.GUEST]: "bg-gray-100 text-gray-800 border-gray-200",
  [UserRole.ASSOCIATE_MEMBER]: "bg-blue-100 text-blue-800 border-blue-200",
  [UserRole.FULL_MEMBER]: "bg-green-100 text-green-800 border-green-200",
  [UserRole.SENIOR]: "bg-purple-100 text-purple-800 border-purple-200",
  [UserRole.ADMIN]: "bg-orange-100 text-orange-800 border-orange-200",
};

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export enum ProjectStatus {
  ACTIVE = 'ACTIVE', 
  PLANNING = 'PLANNING',      
  COMPLETED = 'COMPLETED',
}

export enum PostType {
  PROJECT = 'PROJECT',
  ARTICLES = 'ARTICLES',
  ARTICLE = 'ARTICLE',
  NEWS = 'NEWS',
  QNA_QUESTION = 'QNA_QUESTION',
  QNA_ANSWER = 'QNA_ANSWER',
  DOCUMENT = 'DOCUMENT',
}
