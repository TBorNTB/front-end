// src/lib/user-service.ts
import { getApiUrl } from '@/lib/api/config'; // <-- use the shared gateway base URL

// Feature-specific endpoints matching microservices
export const META_ENDPOINTS = {

  // Meta-service endpoints
  META: {
    COUNT: '/meta-service/api/meta/count',
    COMMENTS: '/meta-service/comments',
    COMMENTS_BY_POST: '/meta-service/comments/post/:postId',
    LIKES: '/meta-service/likes',
    LIKE_POST: '/meta-service/likes/post/:postId',
  },
} as const;

export const getMetaApiUrl = (endpoint: string) => getApiUrl(endpoint);
