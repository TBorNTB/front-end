import { getApiUrl } from '../config'; // Shared gateway

// Feature-specific endpoints matching microservices
export const PROJECT_ENDPOINTS = {

  // Project-service endpoints
  PROJECT: {
    GET_ALL: '/project-service/projects',
    GET_BY_ID: '/project-service/api/project/:id', // Updated to match actual API path
    GET_BY_CATEGORY: '/project-service/projects/category/:category',
    CREATE: '/project-service/api/project',
    UPDATE: '/project-service/api/project/:id',
    DELETE: '/project-service/api/project/:id',
    GET_COLLABORATORS: '/project-service/projects/:id/collaborators',
    UPDATE_COLLABORATORS: '/project-service/api/collaborator/:id',
    GET_CATEGORIES: '/project-service/api/category',
    UPDATE_PROJECT_CATEGORIES: '/project-service/api/category/:postId',
    COUNTS: '/project-service/api/project/counts',
  },

  // TechStack endpoints
  TECH_STACK: {
    GET_BY_ID: '/project-service/api/tech-stack/:techStackId',
    UPDATE_PROJECT_TECH_STACKS: '/project-service/api/tech-stack/project/:postId',
  },

  // Q&A (Question) endpoints
  QUESTION: {
    OFFSET_SEARCH: '/project-service/api/question/offset/search',
    CREATE: '/project-service/api/question',
    GET_BY_ID: '/project-service/api/question/:id',
    UPDATE: '/project-service/api/question/:id',
    DELETE: '/project-service/api/question/:id',
    ANSWER_OFFSET: '/project-service/api/question/:questionId/answer/offset',
    ANSWER_CREATE: '/project-service/api/question/:questionId/answer',
    ANSWER_UPDATE: '/project-service/api/question/answer/:answerId',
    ANSWER_DELETE: '/project-service/api/question/answer/:answerId',
    ANSWER_ACCEPT: '/project-service/api/question/:questionId/answer/:answerId/accept',
  },

  // Document endpoints
  DOCUMENT: {
    CREATE: '/project-service/api/document/:projectId',
    GET_BY_ID: '/project-service/api/document/:id',
    UPDATE: '/project-service/api/document/:id',
    DELETE: '/project-service/api/document/:id',
  },

  // Subgoal endpoints
  SUBGOAL: {
    LIST: '/project-service/api/subgoal/:projectId',
    CHECK: '/project-service/api/subgoal/check/:projectId',
    DELETE: '/project-service/api/subgoal/:projectId/:subGoalId',
    CREATE: '/project-service/api/subgoal/:projectId',
  },
} as const;

export const getProjectApiUrl = (endpoint: string) => getApiUrl(endpoint);
