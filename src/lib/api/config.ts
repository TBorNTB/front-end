// src/lib/api/config.ts
// API 설정 중앙화 - BASE_URL 관리
const API_CONFIG = {
  DEVELOPMENT: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  STAGING: 'https://api.sejongssg.kr',
  PRODUCTION: 'https://api.sejongssg.kr',
} as const;

// 환경에 맞는 Base URL 반환
export const getBaseUrl = () => {
  const explicit = process.env.NEXT_PUBLIC_API_URL;
  if (explicit) return explicit;

  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv === 'production') return API_CONFIG.PRODUCTION;
  if (nodeEnv === 'development') return API_CONFIG.DEVELOPMENT;
  return API_CONFIG.STAGING;
};

export const BASE_URL = 'http://localhost:8000';

export const getApiUrl = (endpoint: string) => {
  const url = `${BASE_URL}${endpoint}`;
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔗 API Request: ${url}`);
  }
  return url;
};
