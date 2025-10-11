// shared/types/core.ts - Core types used across the application

// Base entity with common fields used in most database models
export interface BaseEntity {
  id: string;
  created_at: string;  // Note: using snake_case to match your DB schema
  updated_at: string;
}

// Entity with only timestamp fields, useful for lightweight tracking
export interface TimestampEntity {
  created_at: string;
  updated_at: string;
}

// Lightweight reference to a user, used in nested objects or relations
export interface UserReference {
  nickname: string;
  full_name?: string;      // Optional display name  
  profileImage?: string;  // Optional profile image URL
}

// 🏷️ Enum for user roles within the system, used for access control and UI labels
export enum UserRole {
  GUEST = "외부인",        // External guest
  ASSOCIATE = "준회원",    // Associate member
  REGULAR = "정회원",      // Regular member
  MENTOR = "선배님",       // Mentor
  ADMIN = "운영진",        // Administrator
}

//Enum for tracking project lifecycle status
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