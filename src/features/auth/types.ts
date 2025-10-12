// features/auth/types.ts - Clean auth domain types
import { BaseEntity, UserRole } from '@/types/core';


// Backend User entity - match your actual backend response
export interface User extends BaseEntity {
  nickname: string;
  realName: string;        // Backend uses realName, not full_name
  email: string;
  role: UserRole;
  profileImageUrl?: string; // Backend uses profileImageUrl
  description?: string;
  githubUrl?: string;
  blogUrl?: string;
  linkedinUrl?: string;
  is_confirmed: boolean;
  is_active: boolean;
}

// Derived user types
// Frontend display user - map backend fields to frontend needs
export type AuthUser = {
  nickname: string;
  full_name: string;       // Map from realName
  email: string;
  role: UserRole;
  profile_image?: string;  // Map from profileImageUrl
};
export type PublicUser = Omit<User, 'email'>; //Hides sensitive fields

// Login Credentials
export interface LoginRequest {
  email: string;
  password: string;
  keepSignedIn?: boolean;
}

// Signup Data
export interface SignupRequest {
  nickname: string;
  full_name: string;
  email: string;
  password: string;
  description?: string;
  profile_image?: string | File;
  github_url?: string;
  blog_url?: string;
  linkedin_url?: string;
}

//Authentication response
export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

// Form validation types
export interface LoginFormData {
  email: string;
  password: string;
  keepSignedIn?: boolean;
}

export interface SignupFormData {
  nickname: string;
  full_name: string;
  email: string;
  password: string;
  confirmPassword: string;
  description: string;
  profile_image?: File;
  github_url: string;
  blog_url: string;
  linkedin_url: string;
}