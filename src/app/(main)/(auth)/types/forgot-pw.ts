// app/(main)/(auth)/types.ts - Add to existing types
import { z } from "zod";

// Add password reset schemas
export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "올바른 이메일 형식을 입력해주세요." }),
});

export const verifyCodeSchema = z.object({
  email: z.string().email(),
  verificationCode: z.string()
    .length(6, { message: "인증코드는 6자리입니다." })
    .regex(/^\d{6}$/, { message: "인증코드는 숫자만 입력 가능합니다." }),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  verificationCode: z.string().length(6),
  newPassword: z.string()
    .min(6, { message: "비밀번호는 최소 6글자 이상이어야 합니다." })
    .max(128, { message: "비밀번호는 128글자 이하여야 합니다." }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다.",
  path: ["confirmPassword"],
});

// Form data types
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type VerifyCodeFormData = z.infer<typeof verifyCodeSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Password reset flow steps
export type PasswordResetStep = 'email' | 'verification' | 'reset' | 'success';

// API request/response types
export interface PasswordResetRequest {
  email: string;
}

export interface VerifyCodeRequest {
  email: string;
  verificationCode: string;
}

export interface ResetPasswordRequest {
  email: string;
  verificationCode: string;
  newPassword: string;
}

export interface PasswordResetResponse {
  message: string;
  success: boolean;
  expiresIn?: number; // in minutes
}
