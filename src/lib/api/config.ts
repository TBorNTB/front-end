import { API_URL, ENABLE_API_LOGGING } from "@/lib/api/env";

export const BASE_URL = API_URL;

export const getApiUrl = (endpoint: string): string => {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = typeof window === 'undefined'
    ? `${BASE_URL}${normalizedEndpoint}`
    : `/api/gateway${normalizedEndpoint}`;
  
  if (ENABLE_API_LOGGING) {
    console.log(`🔗 API Request: ${url}`);
  }
  
  return url;
};
