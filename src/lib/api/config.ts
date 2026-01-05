import { API_URL, ENABLE_MOCKS, ENABLE_API_LOGGING } from "@/lib/api/env";

export const BASE_URL = API_URL;

export const getApiUrl = (endpoint: string): string => {
  const url = `${BASE_URL}${endpoint}`;
  
  if (ENABLE_API_LOGGING) {
    console.log(`🔗 API Request: ${url}${ENABLE_MOCKS ? ' [MOCK]' : ''}`);
  }
  
  return url;
};
