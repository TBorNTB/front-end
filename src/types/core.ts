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

// Update your UserRole enum to handle both backend and display values
export enum UserRole {
  GUEST = "GUEST",      // Backend value
  ASSOCIATE = "ASSOCIATE", // Backend value  
  REGULAR = "REGULAR",     // Backend value
  SENIOR = "SENIOR",       // Backend value (SENIOR maps to 선배님)
  ADMIN = "ADMIN",         // Backend value
}

// Add display mapping
export const UserRoleDisplay: Record<UserRole, string> = {
  [UserRole.GUEST]: "외부인",
  [UserRole.ASSOCIATE]: "준회원", 
  [UserRole.REGULAR]: "정회원",
  [UserRole.SENIOR]: "선배님",
  [UserRole.ADMIN]: "운영진",
};

export enum ProjectStatus {
  ACTIVE = 'ACTIVE', 
  PLANNING = 'PLANNING',      
  COMPLETED = 'COMPLETED',
}

export enum PostType {
  PROJECT = 'PROJECT',
  ARTICLE = 'ARTICLE',
  NEWS = 'NEWS',
}
