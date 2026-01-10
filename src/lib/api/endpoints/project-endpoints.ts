import { getApiUrl } from '../config'; // Shared gateway

// Feature-specific endpoints matching microservices
export const PROJECT_ENDPOINTS = {

  // Project-service endpoints
  PROJECT: {
    GET_ALL: '/project-service/projects',
    GET_BY_ID: '/project-service/api/project/:id', // Updated to match actual API path
    GET_BY_CATEGORY: '/project-service/projects/category/:category',
    CREATE: '/project-service/api/project',
    UPDATE: '/project-service/projects/:id',
    DELETE: '/project-service/projects/:id',
    GET_COLLABORATORS: '/project-service/projects/:id/collaborators',
    GET_CATEGORIES: '/project-service/api/category',
  },

  // Document endpoints
  DOCUMENT: {
    CREATE: '/project-service/api/document/:projectId',
    GET_BY_ID: '/project-service/api/document/:id',
    UPDATE: '/project-service/api/document/:id',
    DELETE: '/project-service/api/document/:id',
  },
} as const;

export const getProjectApiUrl = (endpoint: string) => getApiUrl(endpoint);
