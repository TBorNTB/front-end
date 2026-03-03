import { ProjectDetailResponse } from '@/types/services/project';
import { PROJECT_ENDPOINTS, getProjectApiUrl } from '../endpoints/project-endpoints';
import { fetchWithRefresh } from '@/lib/api/fetch-with-refresh';
import { getSafeApiErrorMessage } from '@/lib/api/helpers';

export type ProjectSortType = 'LATEST' | 'POPULAR';
export type ProjectStatusApiValue = 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED';

export interface ProjectSearchParams {
  query?: string;
  projectStatus?: ProjectStatusApiValue[];
  categories?: string[];
  projectSortType?: ProjectSortType;
  size?: number;
  page?: number;
}

export interface ProjectSearchItem {
  id: number;
  title?: string;
  description?: string;
  thumbnailUrl?: string | null;
  projectTechStacks?: string[];
  projectCategories?: string[];
  projectStatus?: ProjectStatusApiValue;
  likeCount?: number;
  viewCount?: number;
  updatedAt?: string;
  createdAt?: string;
  owner?: {
    username?: string;
    nickname?: string;
    realname?: string;
    profileImageUrl?: string;
  };
  collaborators?: Array<{
    username?: string;
    nickname?: string;
    realname?: string;
    profileImageUrl?: string;
  }>;
}

export interface ProjectSearchResponse {
  content: ProjectSearchItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  error?: string;
}

export const fetchProjects = async (params: ProjectSearchParams): Promise<ProjectSearchResponse> => {
  try {
    const queryParams = new URLSearchParams();

    const queryValue = params.query?.trim();
    if (queryValue && queryValue !== ' ') {
      queryParams.append('query', queryValue);
    }

    params.projectStatus?.forEach(status => {
      if (status?.trim()) {
        queryParams.append('projectStatus', status.trim());
      }
    });

    params.categories?.forEach(category => {
      if (category?.trim()) {
        queryParams.append('categories', category.trim());
      }
    });

    queryParams.append('projectSortType', params.projectSortType || 'LATEST');
    queryParams.append('size', String(params.size ?? 12));
    queryParams.append('page', String(params.page ?? 0));

    const response = await fetch(`/api/projects/search?${queryParams.toString()}`);

    if (!response.ok) {
      return {
        content: [],
        page: params.page ?? 0,
        size: params.size ?? 12,
        totalElements: 0,
        totalPages: 0,
        error: getSafeApiErrorMessage(response, '프로젝트'),
      };
    }

    return await response.json();
  } catch {
    return {
      content: [],
      page: params.page ?? 0,
      size: params.size ?? 12,
      totalElements: 0,
      totalPages: 0,
      error: '프로젝트 목록을 불러오는 중 오류가 발생했습니다.',
    };
  }
};

export const fetchProjectSearchSuggestions = async (query: string): Promise<string[]> => {
  if (!query?.trim()) return [];

  try {
    const response = await fetch(`/api/projects/suggestions?query=${encodeURIComponent(query.trim())}`);

    if (!response.ok) return [];

    const data = await response.json();
    return Array.isArray(data) ? data.slice(0, 5) : [];
  } catch {
    return [];
  }
};

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
    if (process.env.NODE_ENV === 'development') {
      const errorText = await response.text();
      console.error('[project] fetch error', response.status, errorText);
    }
    throw new Error(getSafeApiErrorMessage(response, '프로젝트'));
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
  thumbnailKey?: string;
  contentImageKeys?: string[];
}

export interface UpdateDocumentRequest {
  title: string;
  description: string;
  content: string;
  thumbnailKey?: string;
  contentImageKeys?: string[];
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
    if (process.env.NODE_ENV === 'development') {
      const errorText = await response.text();
      console.error('[project] create document error', response.status, errorText);
    }
    throw new Error(getSafeApiErrorMessage(response, '문서'));
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
    if (process.env.NODE_ENV === 'development') {
      const errorText = await response.text();
      console.error('[project] fetch document error', response.status, errorText);
    }
    throw new Error(getSafeApiErrorMessage(response, '문서'));
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
    if (process.env.NODE_ENV === 'development') {
      const errorText = await response.text();
      console.error('[project] update document error', response.status, errorText);
    }
    throw new Error(getSafeApiErrorMessage(response, '문서'));
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
    if (process.env.NODE_ENV === 'development') {
      const errorText = await response.text();
      console.error('[project] delete document error', response.status, errorText);
    }
    throw new Error(getSafeApiErrorMessage(response, '문서'));
  }
};

/**
 * PUT /project-service/api/collaborator/:id
 * Body: string[] (협력자 username만, Owner 제외)
 */
export const updateCollaborators = async (
  projectId: string | number,
  usernames: string[]
): Promise<{ id: number; collaboratorName: string }[]> => {
  const endpoint = PROJECT_ENDPOINTS.PROJECT.UPDATE_COLLABORATORS.replace(':id', String(projectId));
  const url = getProjectApiUrl(endpoint);

  const response = await fetchWithRefresh(url, {
    method: 'PUT',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(usernames),
  });

  if (!response.ok) {
    if (process.env.NODE_ENV === 'development') {
      const errorText = await response.text();
      console.error('[project] update collaborators error', response.status, errorText);
    }
    throw new Error(getSafeApiErrorMessage(response) || '협력자 수정에 실패했습니다.');
  }

  return response.json();
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
    if (process.env.NODE_ENV === 'development') {
      const errorText = await response.text();
      console.error('[project] fetch categories error', response.status, errorText);
    }
    throw new Error(getSafeApiErrorMessage(response, '카테고리'));
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
  parentProjectId?: number | null;
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
    if (process.env.NODE_ENV === 'development') {
      const errorText = await response.text();
      console.error('[project] create project error', response.status, errorText);
    }
    throw new Error(getSafeApiErrorMessage(response, '프로젝트'));
  }

  return response.json();
};

function throwSafeError(response: Response, fallback: string): never {
  throw new Error(getSafeApiErrorMessage(response) || fallback);
}

export interface UpdateProjectRequestBody {
  title: string;
  description: string;
  projectStatus: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED';
  thumbnailUrl: string;
  thumbnailKey: string;
  contentImageKeys: string[];
  content: string;
  parentProjectId?: number | null;
}

export interface UpdateProjectResponse {
  id: number;
  title: string;
  message: string;
}

// Update a project (PUT /project-service/api/project/:id)
export const updateProject = async (
  projectId: string | number,
  data: UpdateProjectRequestBody
): Promise<UpdateProjectResponse> => {
  const endpoint = PROJECT_ENDPOINTS.PROJECT.UPDATE.replace(':id', String(projectId));
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
    if (process.env.NODE_ENV === 'development') {
      const errorText = await response.text();
      console.error('[project] update error', response.status, errorText);
    }
    throwSafeError(response, '프로젝트 수정에 실패했습니다.');
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
    if (process.env.NODE_ENV === 'development') {
      const errorText = await response.text();
      console.error('[project] delete error', response.status, errorText);
    }
    throwSafeError(response, '프로젝트 삭제에 실패했습니다.');
  }
};

// --- Category/TechStack Update APIs ---

/** PUT /project-service/api/category/:postId?categoryNames=... - 프로젝트 카테고리 수정 */
export const updateProjectCategories = async (
  projectId: string | number,
  categoryNames: string[]
): Promise<{ categories: { id: number; name: string }[] }> => {
  const endpoint = PROJECT_ENDPOINTS.PROJECT.UPDATE_PROJECT_CATEGORIES.replace(':postId', String(projectId));
  const params = new URLSearchParams();
  categoryNames.forEach(name => params.append('categoryNames', name));
  const url = `${getProjectApiUrl(endpoint)}?${params.toString()}`;

  const response = await fetchWithRefresh(url, {
    method: 'PUT',
    headers: { accept: 'application/json' },
    credentials: 'include',
  });

  if (!response.ok) {
    if (process.env.NODE_ENV === 'development') {
      const errorText = await response.text();
      console.error('[project] update categories error', response.status, errorText);
    }
    throwSafeError(response, '카테고리 수정에 실패했습니다.');
  }

  return response.json();
};

/** PUT /project-service/api/tech-stack/project/:postId?techStackNames=... - 프로젝트 테크스택 수정 */
export const updateProjectTechStacks = async (
  projectId: string | number,
  techStackNames: string[]
): Promise<{ id: number; name: string }[]> => {
  const endpoint = PROJECT_ENDPOINTS.TECH_STACK.UPDATE_PROJECT_TECH_STACKS.replace(':postId', String(projectId));
  const params = new URLSearchParams();
  techStackNames.forEach(name => params.append('techStackNames', name));
  const url = `${getProjectApiUrl(endpoint)}?${params.toString()}`;

  const response = await fetchWithRefresh(url, {
    method: 'PUT',
    headers: { accept: 'application/json' },
    credentials: 'include',
  });

  if (!response.ok) {
    if (process.env.NODE_ENV === 'development') {
      const errorText = await response.text();
      console.error('[project] update tech stacks error', response.status, errorText);
    }
    throwSafeError(response, '테크스택 수정에 실패했습니다.');
  }

  return response.json();
};

// --- Subgoal APIs ---

export interface SubGoalItem {
  id: number;
  content: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

/** GET /project-service/api/subgoal/:projectId - 하위 목표 목록 조회 */
export const fetchSubgoals = async (projectId: string | number): Promise<SubGoalItem[]> => {
  const endpoint = PROJECT_ENDPOINTS.SUBGOAL.LIST.replace(':projectId', String(projectId));
  const url = getProjectApiUrl(endpoint);
  const response = await fetch(url, {
    method: 'GET',
    headers: { accept: 'application/json' },
    cache: 'no-store',
  });
  if (!response.ok) {
    if (process.env.NODE_ENV === 'development') {
      const errorText = await response.text();
      console.error('[project] fetch subgoals error', response.status, errorText);
    }
    throw new Error(getSafeApiErrorMessage(response, '하위 목표'));
  }
  const list = await response.json();
  return Array.isArray(list) ? list : [];
};

/** PUT /project-service/api/subgoal/check/:projectId?subGoalId= - 체크/해제 (completed 반영) */
export const checkSubgoal = async (
  projectId: string | number,
  subGoalId: string | number,
  isCheck: boolean
): Promise<{ isCheck: boolean; content: string; message: string }> => {
  const endpoint = PROJECT_ENDPOINTS.SUBGOAL.CHECK.replace(':projectId', String(projectId));
  const url = `${getProjectApiUrl(endpoint)}?subGoalId=${encodeURIComponent(String(subGoalId))}`;
  const response = await fetchWithRefresh(url, {
    method: 'PUT',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ isCheck }),
  });
  if (!response.ok) {
    if (process.env.NODE_ENV === 'development') {
      const errorText = await response.text();
      console.error('[project] check subgoal error', response.status, errorText);
    }
    throwSafeError(response, '체크 상태 변경에 실패했습니다.');
  }
  return response.json();
};

/** DELETE /project-service/api/subgoal/:projectId/:subGoalId */
export const deleteSubgoal = async (
  projectId: string | number,
  subGoalId: string | number
): Promise<{ id: number; message: string }> => {
  const endpoint = PROJECT_ENDPOINTS.SUBGOAL.DELETE.replace(':projectId', String(projectId)).replace(
    ':subGoalId',
    String(subGoalId)
  );
  const url = getProjectApiUrl(endpoint);
  const response = await fetchWithRefresh(url, {
    method: 'DELETE',
    headers: { accept: 'application/json' },
    credentials: 'include',
  });
  if (!response.ok) {
    if (process.env.NODE_ENV === 'development') {
      const errorText = await response.text();
      console.error('[project] delete subgoal error', response.status, errorText);
    }
    throwSafeError(response, '하위 목표 삭제에 실패했습니다.');
  }
  return response.json();
};

/** POST /project-service/api/subgoal/:projectId - 하위 목표 추가 (completed 필드로 체크 여부 판단) */
export const createSubgoal = async (
  projectId: string | number,
  content: string
): Promise<{ content: string; message: string; completed: boolean }> => {
  const endpoint = PROJECT_ENDPOINTS.SUBGOAL.CREATE.replace(':projectId', String(projectId));
  const url = getProjectApiUrl(endpoint);
  const response = await fetchWithRefresh(url, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ content: content.trim() }),
  });
  if (!response.ok) {
    if (process.env.NODE_ENV === 'development') {
      const errorText = await response.text();
      console.error('[project] create subgoal error', response.status, errorText);
    }
    throwSafeError(response, '하위 목표 추가에 실패했습니다.');
  }
  return response.json();
};