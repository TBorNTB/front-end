// Internal (Next.js) API routes
// These hit Next.js route handlers under /src/app/api

export const INTERNAL_ENDPOINTS = {
  CS_KNOWLEDGE: {
    DELETE: '/api/cs-knowledge/:id',
  },
} as const;

export const getInternalApiUrl = (endpoint: string): string => {
  // Keep parity with other *ApiUrl helpers.
  // For internal API routes, we intentionally return a relative path.
  return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
};
