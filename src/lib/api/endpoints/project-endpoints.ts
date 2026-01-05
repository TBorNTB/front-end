import { getApiUrl } from '../config'; // Shared gateway

export const PROJECT_ENDPOINTS = {
  PROJECT: {
    GET_ALL: '/project-service/projects',
    GET_BY_ID: '/project-service/projects/:id',
    GET_BY_CATEGORY: '/project-service/projects/category/:category',
    CREATE: '/project-service/projects',
    UPDATE: '/project-service/projects/:id',
    DELETE: '/project-service/projects/:id',
    GET_COLLABORATORS: '/project-service/projects/:id/collaborators',
    GET_CATEGORIES: '/project-service/api/category',
  },
} as const;

export const getProjectApiUrl = (endpoint: string) => getApiUrl(endpoint);
