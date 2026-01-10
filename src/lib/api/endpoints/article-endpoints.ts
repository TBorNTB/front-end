// src/lib/api/endpoints/article.ts
import { getApiUrl } from '@/lib/api/config';

// CS Knowledge (Article) endpoints
export const ARTICLE_ENDPOINTS = {
  ARTICLE: {
    GET_BY_ID: '/project-service/cs-knowledge/:id',
    GET_ALL: '/project-service/cs-knowledge',
    CREATE: '/project-service/cs-knowledge',
    UPDATE: '/project-service/cs-knowledge/:id',
    DELETE: '/project-service/cs-knowledge/:id',
  },
} as const;

export const getArticleApiUrl = (endpoint: string) => getApiUrl(endpoint);