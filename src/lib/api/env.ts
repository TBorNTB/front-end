// src/lib/env.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const ENABLE_DEV_BYPASS = process.env.NEXT_PUBLIC_ENABLE_DEV_BYPASS === "true";

// Vercel system vars for deployment awareness[web:54]
export const VERCEL_ENV = process.env.VERCEL_ENV || "development"; // "production", "preview", "development"
export const IS_PREVIEW = VERCEL_ENV === "preview";

// Computed flags
export const ENABLE_API_LOGGING = 
  process.env.NODE_ENV === "development" || IS_PREVIEW;
