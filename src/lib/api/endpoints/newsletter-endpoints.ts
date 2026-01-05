// src/lib/user-service.ts
import { getApiUrl } from '@/lib/api/config'; // <-- use the shared gateway base URL

// Feature-specific endpoints matching microservices
export const NEWSLETTER_ENDPOINTS = {

  // Newsletter-service endpoints
  NEWSLETTER: {
    SUBSCRIBE: '/newsletter-service/subscribe',
    UNSUBSCRIBE: '/newsletter-service/unsubscribe',
  },
} as const;

// ✅ Helper function with environment logging
export const getNewsletterApiUrl = (endpoint: string) => getApiUrl(endpoint);
