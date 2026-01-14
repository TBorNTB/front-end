// src/lib/user-service.ts
import { getApiUrl } from '@/lib/api/config'; // <-- use the shared gateway base URL

// Feature-specific endpoints matching microservices
export const ELASTIC_ENDPOINTS = {

   // Elastic-service endpoints
  ELASTIC: {
    PROJECT_SEARCH: '/elastic-service/api/elastic/project/search',
    PROJECT_SEARCH_LATEST: '/elastic-service/api/elastic/project/search/latest',
    PROJECT_SUGGESTION: '/elastic-service/api/elastic/project/suggestion',
    PROJECT_BY_USER: '/elastic-service/api/elastic/project/user',
    NEWS_SEARCH: '/elastic-service/api/elastic/news/search',
    NEWS_SEARCH_LATEST: '/elastic-service/api/elastic/news/search/latest',
    NEWS_SUGGESTION: '/elastic-service/api/elastic/news/suggestion',
    NEWS_BY_USER: '/elastic-service/api/elastic/news/user',
    ARTICLE_SEARCH: '/elastic-service/api/elastic/csknowledge/search',
    ARTICLE_SEARCH_BY_MEMBER: '/elastic-service/api/elastic/csknowledge/search/member',
    ARTICLE_SUGGESTION: '/elastic-service/api/elastic/csknowledge/suggestion',
    ARTICLE_BY_USER: '/elastic-service/api/elastic/csknowledge/user',
    CONTENTS_POPULAR: '/elastic-service/api/elastic/contents/popular',
    CONTENTS_POSTS: '/elastic-service/api/elastic/contents/posts',
  },
    // RAG Service endpoints
  RAG: {
    QUERY: '/elastic-service/api/v1/rag/query',
  },
} as const;

export const getElasticApiUrl = (endpoint: string) => getApiUrl(endpoint);
