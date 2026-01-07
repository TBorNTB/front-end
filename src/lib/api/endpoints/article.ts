// src/lib/api/endpoints/article.ts
import { BASE_URL } from '@/lib/api/config';

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

// Helper function with environment logging
export const getArticleApiUrl = (endpoint: string) => {
  const url = `${BASE_URL}${endpoint}`;

  if (process.env.NODE_ENV === 'development') {
    console.log(`🔗 API Request: ${url}`);
  }

  return url;
};

