import { ProjectDetailResponse } from '@/types/services/project';
import { PROJECT_ENDPOINTS, getProjectApiUrl } from '../endpoints/project-endpoints';
import { fetchWithRefresh } from '@/lib/api/fetch-with-refresh';

// Fetch project detail by ID
export const fetchProjectDetail = async (id: string | number): Promise<ProjectDetailResponse> => {
  const endpoint = PROJECT_ENDPOINTS.PROJECT.GET_BY_ID.replace(':id', String(id));
  const url = getProjectApiUrl(endpoint);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch project: ${response.status} - ${errorText}`);
  }

  return response.json();
};

// Document types
export interface Document {
  id: number;
  title: string;
  content: string;
  description: string;
  thumbnailUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentRequest {
  title: string;
  content: string;
  description: string;
  thumbnailUrl?: string;
}

export interface UpdateDocumentRequest {
  title: string;
  content: string;
  description: string;
  thumbnailUrl?: string;
}

// Create a document
export const createDocument = async (
  projectId: string | number,
  data: CreateDocumentRequest
): Promise<Document> => {
  const endpoint = PROJECT_ENDPOINTS.DOCUMENT.CREATE.replace(':projectId', String(projectId));
  const url = getProjectApiUrl(endpoint);

  const response = await fetchWithRefresh(url, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create document: ${response.status} - ${errorText}`);
  }

  return response.json();
};

// Fetch document by ID
export const fetchDocument = async (documentId: string | number): Promise<Document> => {
  const endpoint = PROJECT_ENDPOINTS.DOCUMENT.GET_BY_ID.replace(':id', String(documentId));
  const url = getProjectApiUrl(endpoint);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch document: ${response.status} - ${errorText}`);
  }

  return response.json();
};

// Update a document
export const updateDocument = async (
  documentId: string | number,
  data: UpdateDocumentRequest
): Promise<Document> => {
  const endpoint = PROJECT_ENDPOINTS.DOCUMENT.UPDATE.replace(':id', String(documentId));
  const url = getProjectApiUrl(endpoint);

  const response = await fetchWithRefresh(url, {
    method: 'PUT',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update document: ${response.status} - ${errorText}`);
  }

  return response.json();
};

// Delete a document
export const deleteDocument = async (documentId: string | number): Promise<void> => {
  const endpoint = PROJECT_ENDPOINTS.DOCUMENT.DELETE.replace(':id', String(documentId));
  const url = getProjectApiUrl(endpoint);

  const response = await fetchWithRefresh(url, {
    method: 'DELETE',
    headers: {
      'accept': '*/*',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete document: ${response.status} - ${errorText}`);
  }
};

// Category types
export interface Category {
  id: number;
  name: string;
  description: string;
  content?: string;
}

export interface CategoryListResponse {
  categories: Category[];
}

// Fetch categories
export const fetchCategories = async (): Promise<CategoryListResponse> => {
  const url = getProjectApiUrl(PROJECT_ENDPOINTS.PROJECT.GET_CATEGORIES);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch categories: ${response.status} - ${errorText}`);
  }

  return response.json();
};

// Project creation types
export interface CreateProjectRequest {
  title: string;
  description: string;
  thumbnail: string;
  content: string;
  projectStatus: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED';
  categories: string[];
  collaborators: string[]; // usernames
  techStacks: string[];
  subGoals: string[];
  startedAt: string;
  endedAt: string;
  thumbnailKey: string | null;
  contentImageKeys: string[];
}

export interface CreateProjectResponse {
  id: number;
  title: string;
  message: string;
  content?: string;
  endedAt?: string;
}

// Create a project
export const createProject = async (data: CreateProjectRequest): Promise<CreateProjectResponse> => {
  const url = getProjectApiUrl(PROJECT_ENDPOINTS.PROJECT.CREATE);

  const response = await fetchWithRefresh(url, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create project: ${response.status} - ${errorText}`);
  }

  return response.json();
};

// Delete a project
export const deleteProject = async (projectId: string | number): Promise<void> => {
  const endpoint = PROJECT_ENDPOINTS.PROJECT.DELETE.replace(':id', String(projectId));
  const url = getProjectApiUrl(endpoint);

  const response = await fetchWithRefresh(url, {
    method: 'DELETE',
    headers: {
      'accept': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete project: ${response.status} - ${errorText}`);
  }
};