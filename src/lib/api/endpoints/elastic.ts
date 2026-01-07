// src/lib/user-service.ts
import { BASE_URL } from '@/lib/api/config'; // <-- use the shared gateway base URL

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
    CSKNOWLEDGE_SEARCH: '/elastic-service/api/elastic/csknowledge/search',
    CSKNOWLEDGE_SUGGESTION: '/elastic-service/api/elastic/csknowledge/suggestion',
  },
    // RAG Service endpoints
  RAG: {
    QUERY: '/elastic-service/api/v1/rag/query',
  },
} as const;

// ✅ Helper function with environment logging
export const getElasticApiUrl = (endpoint: string) => {
  const url = `${BASE_URL}${endpoint}`;

  if (process.env.NODE_ENV === 'development') {
    // Avoid noisy logs in production
    console.log(`🔗 API Request: ${url}`);
  }

  return url;
};