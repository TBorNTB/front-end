// src/lib/user-service.ts
import { getApiUrl } from '@/lib/api/config'; // <-- use the shared gateway base URL

// Feature-specific endpoints matching microservices
export const ELASTIC_ENDPOINTS = {

   // Elastic-service endpoints
  ELASTIC: {
    PROJECT_SEARCH: '/elastic-service/api/elastic/project/search',
    PROJECT_SEARCH_LATEST: '/elastic-service/api/elastic/project/search/latest',
    PROJECT_SUGGESTION: '/elastic-service/api/elastic/project/suggestion',
    NEWS_SEARCH: '/elastic-service/api/elastic/news/search',
    NEWS_SEARCH_LATEST: '/elastic-service/api/elastic/news/search/latest',
    NEWS_SUGGESTION: '/elastic-service/api/elastic/news/suggestion',
    ARTICLE_SEARCH: '/elastic-service/api/elastic/csknowledge/search',
    ARTICLE_SEARCH_BY_MEMBER: '/elastic-service/api/elastic/csknowledge/search/member',
    ARTICLE_SUGGESTION: '/elastic-service/api/elastic/csknowledge/suggestion',
    CONTENTS_POPULAR: '/elastic-service/api/elastic/contents/popular',
  },
    // RAG Service endpoints
  RAG: {
    QUERY: '/elastic-service/api/v1/rag/query',
  },
} as const;

export const getElasticApiUrl = (endpoint: string) => getApiUrl(endpoint);
