// src/lib/env.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
export const ENABLE_DEV_BYPASS = process.env.NEXT_PUBLIC_ENABLE_DEV_BYPASS === "true";
export const USE_MOCK_DATA = process.env.NEXT_PUBLIC_MOCK_DATA === "true";

// Vercel system vars for deployment awareness[web:54]
export const VERCEL_ENV = process.env.VERCEL_ENV || "development"; // "production", "preview", "development"
export const IS_PREVIEW = VERCEL_ENV === "preview";

// Computed flags
export const ENABLE_API_LOGGING = 
  process.env.NODE_ENV === "development" || IS_PREVIEW;
export const ENABLE_MOCKS = USE_MOCK_DATA || IS_PREVIEW;
