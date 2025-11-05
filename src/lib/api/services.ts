import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints'; // Your existing endpoints

// ✅ User Service Functions
export const userService = {
  // Authentication
  login: (credentials: any, request?: Request) => 
    apiClient.post(API_ENDPOINTS.USERS.LOGIN, credentials, request),
    
  logout: (request?: Request) => 
    apiClient.post(API_ENDPOINTS.USERS.LOGOUT, undefined, request),
    
  signup: (userData: any, request?: Request) => 
    apiClient.post(API_ENDPOINTS.USERS.SIGNUP, userData, request),

  // Profile & User Management
  getProfile: (request?: Request) => 
    apiClient.get(API_ENDPOINTS.USERS.PROFILE, request),
    
  getRole: (request?: Request) => 
    apiClient.get(API_ENDPOINTS.USERS.ROLE, request),
    
  getAllUsers: (request?: Request) => 
    apiClient.get(API_ENDPOINTS.USERS.GET_ALL, request),
    
  updateUser: (userData: any, request?: Request) => 
    apiClient.patch(API_ENDPOINTS.USERS.UPDATE_USER, userData, request),
    
  deleteUser: (request?: Request) => 
    apiClient.delete(API_ENDPOINTS.USERS.DELETE_USER, request),

  // Admin functions
  confirmUser: (username: string, request?: Request) => 
    apiClient.patch(API_ENDPOINTS.USERS.CONFIRM_USER.replace('{username}', username), undefined, request),
    
  grantAdmin: (username: string, request?: Request) => 
    apiClient.patch(API_ENDPOINTS.USERS.GRANT_ADMIN.replace('{grantedUsername}', username), undefined, request),
};

// ✅ Project Service Functions
export const projectService = {
  getAll: (request?: Request) => 
    apiClient.get(API_ENDPOINTS.PROJECTS.GET_ALL, request),
    
  getById: (id: string, request?: Request) => 
    apiClient.get(API_ENDPOINTS.PROJECTS.GET_BY_ID.replace(':id', id), request),
    
  getByCategory: (category: string, request?: Request) => 
    apiClient.get(API_ENDPOINTS.PROJECTS.GET_BY_CATEGORY.replace(':category', category), request),
    
  create: (projectData: any, request?: Request) => 
    apiClient.post(API_ENDPOINTS.PROJECTS.CREATE, projectData, request),
    
  update: (id: string, projectData: any, request?: Request) => 
    apiClient.put(API_ENDPOINTS.PROJECTS.UPDATE.replace(':id', id), projectData, request),
    
  delete: (id: string, request?: Request) => 
    apiClient.delete(API_ENDPOINTS.PROJECTS.DELETE.replace(':id', id), request),
    
  getCollaborators: (id: string, request?: Request) => 
    apiClient.get(API_ENDPOINTS.PROJECTS.GET_COLLABORATORS.replace(':id', id), request),
};

// ✅ Archive Service Functions
export const archiveService = {
  getAll: (request?: Request) => 
    apiClient.get(API_ENDPOINTS.ARCHIVES.GET_ALL, request),
    
  getById: (id: string, request?: Request) => 
    apiClient.get(API_ENDPOINTS.ARCHIVES.GET_BY_ID.replace(':id', id), request),
    
  getByCategory: (category: string, request?: Request) => 
    apiClient.get(API_ENDPOINTS.ARCHIVES.GET_BY_CATEGORY.replace(':category', category), request),
    
  create: (archiveData: any, request?: Request) => 
    apiClient.post(API_ENDPOINTS.ARCHIVES.CREATE, archiveData, request),
    
  update: (id: string, archiveData: any, request?: Request) => 
    apiClient.put(API_ENDPOINTS.ARCHIVES.UPDATE.replace(':id', id), archiveData, request),
    
  delete: (id: string, request?: Request) => 
    apiClient.delete(API_ENDPOINTS.ARCHIVES.DELETE.replace(':id', id), request),
};

// ✅ Meta Service Functions
export const metaService = {
  getComments: (request?: Request) => 
    apiClient.get(API_ENDPOINTS.META.COMMENTS, request),
    
  getCommentsByPost: (postId: string, request?: Request) => 
    apiClient.get(API_ENDPOINTS.META.COMMENTS_BY_POST.replace(':postId', postId), request),
    
  getLikes: (request?: Request) => 
    apiClient.get(API_ENDPOINTS.META.LIKES, request),
    
  likePost: (postId: string, request?: Request) => 
    apiClient.post(API_ENDPOINTS.META.LIKE_POST.replace(':postId', postId), undefined, request),
};

// ✅ Newsletter Service Functions
export const newsletterService = {
  subscribe: (email: string, request?: Request) => 
    apiClient.post(API_ENDPOINTS.NEWSLETTER.SUBSCRIBE, { email }, request),
    
  unsubscribe: (email: string, request?: Request) => 
    apiClient.post(API_ENDPOINTS.NEWSLETTER.UNSUBSCRIBE, { email }, request),
};

// ✅ Token Management
export const tokenService = {
  refresh: (request?: Request) => 
    apiClient.post(API_ENDPOINTS.TOKEN.REFRESH, undefined, request),
    
  reissue: (request?: Request) => 
    apiClient.post(API_ENDPOINTS.TOKEN.REISSUE, undefined, request),
};

// ✅ S3 Service
export const s3Service = {
  getPresignedUrl: (fileData: any, request?: Request) => 
    apiClient.post(API_ENDPOINTS.S3.PRESIGNED_URL, fileData, request),
};
