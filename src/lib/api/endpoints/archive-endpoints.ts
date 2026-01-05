// src/lib/user-service.ts
import { getApiUrl } from '@/lib/api/config'; // <-- use the shared gateway base URL

// Feature-specific endpoints matching microservices
export const ARCHIVE_ENDPOINTS = {

// Archive-service endpoints
  ARCHIVES: {
    GET_ALL: '/archive-service/archives',
    GET_BY_ID: '/archive-service/archives/:id',
    GET_BY_CATEGORY: '/archive-service/archives/category/:category',
    CREATE: '/archive-service/archives',
    UPDATE: '/archive-service/archives/:id',
    DELETE: '/archive-service/archives/:id',
  },
    // Categories
  CATEGORIES: {
    GET_ALL: '/archive-service/categories',
  },
} as const;

export const getArchiveApiUrl = (endpoint: string) => getApiUrl(endpoint);
