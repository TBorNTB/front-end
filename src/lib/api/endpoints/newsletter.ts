// src/lib/user-service.ts
import { BASE_URL } from '@/lib/api/config'; // <-- use the shared gateway base URL

// Feature-specific endpoints matching microservices
export const NEWSLETTER_ENDPOINTS = {

  // Newsletter-service endpoints
  NEWSLETTER: {
    SUBSCRIBE: '/newsletter-service/subscribe',
    UNSUBSCRIBE: '/newsletter-service/unsubscribe',
  },
} as const;

// ✅ Helper function with environment logging
export const getNewsletterApiUrl = (endpoint: string) => {
  const url = `${BASE_URL}${endpoint}`;

  if (process.env.NODE_ENV === 'development') {
    // Avoid noisy logs in production
    console.log(`🔗 API Request: ${url}`);
  }

  return url;
};