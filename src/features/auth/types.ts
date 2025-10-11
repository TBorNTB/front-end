// features/auth/types.ts - Clean auth domain types
import { BaseEntity, UserRole } from '@/shared/types/core';


//Core User entity - nickname is the unique identifier
export interface User extends BaseEntity {
  nickname: string;        // Unique identifier (primary key for user lookup)
  full_name: string;       // Full display name
  email: string;
  role: UserRole;
  profile_image?: string;
  description?: string;    // Bio field from your SignupRequest
  github_url?: string;
  blog_url?: string;
  linkedin_url?: string;
  is_confirmed: boolean;
  is_active: boolean;
}

// Derived user types
export type AuthUser = Pick<User, 'nickname' | 'full_name' | 'email' | 'role' | 'profile_image'>;
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