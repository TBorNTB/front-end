// app/(main)/(auth)/types.ts - Fixed version
import { z } from "zod";
import { BaseEntity, UserRole } from '@/types/core';

// ===== DOMAIN ENTITIES =====
// Backend User entity - matches your actual backend response
export interface User extends BaseEntity {
  nickname: string;
  realName: string;        // Backend field name
  email: string;
  role: UserRole;
  profileImageUrl?: string; // Backend field name
  description?: string;
  techStack?: string;
  githubUrl?: string;
  blogUrl?: string;
  linkedinUrl?: string;
  is_confirmed: boolean;
  is_active: boolean;
}

// types/api.ts
/*export interface SignupRequest {
  nickname: string;
  realName: string;
  email: string;
  password: string;
  description?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  blogUrl?: string;
  profileImageUrl?: string;
}

export interface SignupResponse {
  userId: string;
  message: string;
}

// Then in route.ts
const data: SignupResponse = await backendResponse.json();*/

// ===== API RESPONSE TYPES =====
// Enhanced auth response with proper typing
export interface AuthResponse {
  message: string;
  authenticated: boolean;
  user?: {
    nickname: string;
    realName?: string;        // Primary backend field
    fullName?: string;        // Alternative backend field
    email: string;
    role: string;
    profileImageUrl?: string; // Primary backend field
    profileImage?: string;    // Alternative backend field
    techStack?: string;
  };
}

// Create a discriminated union for better type safety
export type UserData = User | NonNullable<AuthResponse['user']>;

// Frontend AuthUser - clean mapping for UI consumption
export interface AuthUser {
  nickname: string;
  full_name: string;       // Mapped from realName or fullName
  email: string;
  role: UserRole;
  profile_image?: string;  // Mapped from profileImageUrl or profileImage
  tech_stack?: string;
}

// ===== FIXED TYPE MAPPERS =====
/**
 * Maps backend User to frontend AuthUser with proper union type handling
 * FIXED: Resolves 'never' type and boolean assignment errors
 */
export function mapUserToAuthUser(user: UserData): AuthUser {
  if (!user) {
    throw new Error('User data is required');
  }
  
  // Helper function to check if user is from User interface
  const isUserEntity = (u: UserData): u is User => {
    return 'realName' in u && 'profileImageUrl' in u && 'is_confirmed' in u;
  };
  
  // Helper function to check if user is from AuthResponse
  const isAuthResponseUser = (u: UserData): u is NonNullable<AuthResponse['user']> => {
    return 'fullName' in u || ('realName' in u && !('is_confirmed' in u));
  };
  
  // Safe property access with type guards
  let fullName: string;
  let profileImage: string | undefined;
  let techStack: string | undefined;
  
  if (isUserEntity(user)) {
    // User entity - use realName and profileImageUrl
    fullName = user.realName || user.nickname || "User";
    profileImage = user.profileImageUrl;
    techStack = user.techStack;
  } else if (isAuthResponseUser(user)) {
    // AuthResponse user - use fullName/realName and profileImage/profileImageUrl
    fullName = user.fullName || user.realName || user.nickname || "User";
    profileImage = user.profileImage || user.profileImageUrl;
    techStack = user.techStack;
  } else {
    // This case is now properly typed as User | AuthResponse['user']
    fullName = "User";
    profileImage = undefined;
    techStack = undefined;
  }
  
  return {
    nickname: user.nickname || "user",
    full_name: fullName,
    email: user.email || "",
    role: (user.role as UserRole) || UserRole.GUEST,
    profile_image: profileImage || undefined, // FIXED: Ensure undefined instead of false
    tech_stack: techStack || undefined,
  };
}

// ===== ALTERNATIVE SIMPLIFIED APPROACH =====
/**
 * Simplified version using safe property access
 * FIXED: Handles both 'never' type and boolean assignment issues
 */
export function mapUserToAuthUserSimple(user: UserData): AuthUser {
  if (!user) {
    throw new Error('User data is required');
  }
  
  // Safe property access using optional chaining and nullish coalescing
  const realName = 'realName' in user ? user.realName : undefined;
  const fullName = 'fullName' in user ? user.fullName : undefined;
  const profileImageUrl = 'profileImageUrl' in user ? user.profileImageUrl : undefined;
  const profileImage = 'profileImage' in user ? user.profileImage : undefined;
  const techStack = 'techStack' in user ? (user as any).techStack : undefined;
  
  return {
    nickname: user.nickname || "user",
    full_name: realName || fullName || user.nickname || "User",
    email: user.email || "",
    role: (user.role as UserRole) || UserRole.GUEST,
    profile_image: profileImageUrl || profileImage || undefined, // FIXED: Always string | undefined
    tech_stack: typeof techStack === 'string' ? techStack : undefined,
  };
}

// ===== TYPE-SAFE ALTERNATIVE WITH ASSERTIONS =====
/**
 * Type assertion approach for quick fix
 * FIXED: Uses type assertions to avoid union type issues
 */
export function mapUserToAuthUserWithAssertions(user: UserData): AuthUser {
  if (!user) {
    throw new Error('User data is required');
  }
  
  // Type assertion approach - less type-safe but simpler
  const userAny = user as any;
  
  return {
    nickname: user.nickname || "user",
    full_name: userAny.realName || userAny.fullName || user.nickname || "User",
    email: user.email || "",
    role: (user.role as UserRole) || UserRole.GUEST,
    profile_image: userAny.profileImageUrl || userAny.profileImage || undefined, // FIXED
    tech_stack: userAny.techStack || undefined,
  };
}

// ===== REST OF YOUR TYPES (UNCHANGED) =====
export const loginSchema = z.object({
  email: z.string().email({ message: "올바른 이메일 형식을 입력해주세요." }),
  password: z.string().min(6, { message: "비밀번호 입력해주세요." }),
  keepSignedIn: z.boolean().optional().default(false),
});

export const signupSchema = z.object({
  nickname: z.string()
    .min(2, { message: "유저네임는 최소 2글자 이상이어야 합니다." })
    .max(20, { message: "유저네임는 20글자 이하여야 합니다." }),
  password: z.string().min(6, { message: "비밀번호는 최소 6글자 이상이어야 합니다." }),
  confirmPassword: z.string().min(6, { message: "비밀번호 확인을 입력해주세요." }),
  realName: z.string()
    .min(1, { message: "성명을 입력해주세요." })
    .max(50, { message: "성명은 50글자 이하여야 합니다." }),
  email: z.string().email({ message: "올바른 이메일 형식을 입력해주세요." }),
  description: z.string().optional(),
  techStack: z.string()
    .max(255, { message: "기술스택은 255자 이하여야 합니다." })
    .optional()
    .or(z.literal("")),
  githubUrl: z.string().url({ message: "올바른 URL 형식을 입력해주세요." }).optional().or(z.literal("")),
  linkedinUrl: z.string().url({ message: "올바른 URL 형식을 입력해주세요." }).optional().or(z.literal("")),
  blogUrl: z.string().url({ message: "올바른 URL 형식을 입력해주세요." }).optional().or(z.literal("")),
  profileImageUrl: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다.",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "올바른 이메일 형식을 입력해주세요." }),
});

// ===== INFERRED FORM TYPES =====
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// ===== API REQUEST/RESPONSE TYPES =====
export interface LoginRequest {
  email: string;
  password: string;
  keepSignedIn?: boolean;
}

export interface SignupRequest extends Omit<SignupFormData, 'confirmPassword' | 'profileImageUrl'> {
  fileData?: string;
  fileName?: string;
  fileType?: string;
}

// Enhanced auth response with tokens (if your backend provides them)
export interface AuthTokenResponse extends AuthResponse {
  accessToken?: string;
  refreshToken?: string;
  tokenType?: 'Bearer';
  expiresIn?: number;
}

// ===== UTILITY TYPES =====
export interface SignupSubmitData extends Omit<SignupFormData, 'confirmPassword'> {
  fileData?: string;
  fileName?: string;
  fileType?: string;
}

//export interface ForgotPasswordSubmitData extends ForgotPasswordFormData {
  // Additional fields if needed for forgot password
//}

// ===== CONTEXT TYPES =====
export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (user: AuthUser, keepSignedIn?: boolean) => void;
  logout: () => void;
}

// ===== FORM UTILITIES =====
export type AuthFormMode = 'login' | 'signup' | 'forgot-password' | 'reset-password';

export interface FormFieldError {
  message: string;
  type: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// Public user type - hides sensitive information
export type PublicUser = Omit<User, 'email' | 'is_confirmed' | 'is_active'>;

/**
 * Maps form data to API request format
 * Handles field transformations for backend compatibility
 */
export function mapSignupFormToRequest(
  formData: SignupFormData,
  fileData?: { fileData: string; fileName: string; fileType: string }
): SignupRequest {
  const { confirmPassword: _confirmPassword, profileImageUrl: _profileImageUrl, ...baseData } = formData;
  
  return {
    ...baseData,
    ...fileData,
  };
}
