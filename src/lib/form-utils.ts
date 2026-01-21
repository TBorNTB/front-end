// lib/form-utils.ts
import { useState } from "react";

/**
 * Generates consistent input className based on validation state
 * Used across all authentication forms for consistent styling
 */
export const getInputClassName = (
  hasError: boolean, 
  baseClasses: string = "h-10 w-full bg-gray-50 rounded-lg text-gray-900 focus:outline-none transition-colors"
): string => {
  const errorClasses = hasError 
    ? 'border-error focus:border-error focus:ring-1 focus:ring-error'
    : 'border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500';
  
  return `${baseClasses} ${errorClasses}`;
};

/**
 * Generates className for inputs with icons (left padding)
 * Consistent spacing for icon + input combinations
 */
export const getIconInputClassName = (hasError: boolean): string => {
  return getInputClassName(hasError, "h-10 w-full pl-10 pr-4 bg-gray-50 rounded-lg text-gray-900 focus:outline-none transition-colors");
};

/**
 * Generates className for password inputs (left icon + right toggle)
 * Used in login, signup, admin forms
 */
export const getPasswordInputClassName = (hasError: boolean): string => {
  return getInputClassName(hasError, "h-10 w-full pl-10 pr-10 bg-gray-50 rounded-lg text-gray-900 focus:outline-none transition-colors");
};

/**
 * Generates className for inputs without icons (standard padding)
 * Used for URL inputs and other simple text fields
 */
export const getStandardInputClassName = (hasError: boolean): string => {
  return getInputClassName(hasError, "h-10 w-full px-3 bg-gray-50 rounded-lg text-gray-900 focus:outline-none transition-colors");
};

/**
 * Generates className for textarea inputs
 * Used for description and multi-line text fields
 */
export const getTextareaClassName = (hasError: boolean): string => {
  return getInputClassName(hasError, "w-full p-3 text-sm bg-gray-50 rounded-lg text-gray-900 focus:outline-none transition-colors resize-none");
};

/**
 * Generates className for OTP/verification code inputs
 * Used for 6-digit verification code inputs
 */
export const getOTPInputClassName = (hasError: boolean, isActive?: boolean): string => {
  const baseClasses = "w-12 h-12 text-center text-lg font-bold text-black bg-white rounded-lg focus:outline-none transition-all duration-200 shadow-sm";
  const errorClasses = hasError
    ? "border-2 border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
    : "border-2 border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20";
  const activeClasses = isActive ? "ring-2 ring-primary-500/30 border-primary-500 bg-blue-50" : "";

  return `${baseClasses} ${errorClasses} ${activeClasses}`;
};

/**
 * Common API error handling for authentication forms
 * Standardizes error message extraction from API responses
 */
export const handleAuthError = (error: unknown, fallbackMessage: string = "알 수 없는 오류가 발생했습니다."): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message);
  }
  
  return fallbackMessage;
};

/**
 * File validation utility for profile images
 * Validates file type and size for image uploads
 */
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!validTypes.includes(file.type)) {
    return { isValid: false, error: "JPG, PNG, GIF 형식의 이미지만 업로드 가능합니다." };
  }
  
  if (file.size > maxSize) {
    return { isValid: false, error: "이미지 크기는 5MB 이하여야 합니다." };
  }
  
  return { isValid: true };
};

/**
 * Convert file to base64 string
 * Used for file upload in forms
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("파일 읽기 실패"));
    reader.readAsDataURL(file);
  });
};

/**
 * Password strength validator
 * Returns strength level and feedback
 */
export const validatePasswordStrength = (password: string) => {
  const length = password.length;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  let strength = 0;
  const feedback: string[] = [];
  
  if (length >= 8) strength++;
  else feedback.push("최소 8글자 이상");
  
  if (hasUppercase) strength++;
  else feedback.push("대문자 포함");
  
  if (hasLowercase) strength++;
  else feedback.push("소문자 포함");
  
  if (hasNumbers) strength++;
  else feedback.push("숫자 포함");
  
  if (hasSpecialChar) strength++;
  else feedback.push("특수문자 포함");
  
  const levels = ["매우 약함", "약함", "보통", "강함", "매우 강함"];
  const colors = ["text-red-600", "text-orange-500", "text-yellow-500", "text-blue-500", "text-green-600"];
  
  return {
    strength,
    level: levels[strength] || "매우 약함",
    color: colors[strength] || "text-red-600",
    feedback: feedback.slice(0, 3), // Show max 3 feedback items
    isStrong: strength >= 3
  };
};

/**
 * Common form states and loading management
 * Reduces boilerplate in form components
 */
export const useAuthFormState = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resetStates = () => {
    setError("");
    setSuccess("");
  };

  const handleError = (err: unknown, fallback?: string) => {
    setError(handleAuthError(err, fallback));
    setIsLoading(false);
  };

  const handleSuccess = (message: string) => {
    setSuccess(message);
    setError("");
    setIsLoading(false);
  };

  return {
    isLoading,
    error,
    success,
    setIsLoading,
    setError,
    setSuccess,
    resetStates,
    handleError,
    handleSuccess
  };
};

/**
 * Common authentication API configurations
 * Centralizes fetch configurations for auth endpoints
 */
export const authFetchConfig = {
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  credentials: "include" as RequestCredentials,
  cache: "no-store" as RequestCache,
};

/**
 * Makes authenticated API calls with consistent configuration
 * Used in login success flows for additional API calls
 */
export const makeAuthenticatedRequest = async (endpoint: string, options: RequestInit = {}) => {
  return fetch(endpoint, {
    ...authFetchConfig,
    ...options,
    headers: {
      ...authFetchConfig.headers,
      ...options.headers,
    },
  });
};
