// types/auth.ts
import { User } from "next-auth";

// Authentication Types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  keepSignedIn?: boolean;
}

export interface SignupRequest {
  nickname: string;
  full_name: string;
  password: string;
  email: string;
  description?: string;
  profile_image?: string | File;
  github_url?: string;
  blog_url?: string;
  linkedin_url?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface GitHubAuthRequest {
  provider: 'github';
  redirectTo?: string;
}

// Extended User interface for your application
export interface ExtendedUser extends User {
  id: string;
  email: string;
  nickname: string;
  full_name: string;
  description?: string;
  profile_image?: string;
  github_url?: string;
  blog_url?: string;
  linkedin_url?: string;
  created_at: Date;
  updated_at: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type LoginResponse = ApiResponse<AuthResponse>;
export type SignupResponse = ApiResponse<AuthResponse>;
export type ForgotPasswordResponse = ApiResponse<{ message: string }>;
export type ResetPasswordResponse = ApiResponse<{ message: string }>;

// Form validation types
export interface LoginFormData {
  email: string;
  password: string;
  keepSignedIn: boolean;
}

export interface SignupFormData {
  nickname: string;
  full_name: string;
  password: string;
  confirmPassword: string;
  email: string;
  description: string;
  profile_image?: File;
  github_url: string;
  blog_url: string;
  linkedin_url: string;
}

// Authentication context types
export interface AuthContextType {
  user: ExtendedUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  signup: (userData: SignupRequest) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (data: ResetPasswordRequest) => Promise<void>;
  loginWithGitHub: () => Promise<void>;
  clearError: () => void;
  updateProfile: (data: Partial<ExtendedUser>) => Promise<void>;
}
