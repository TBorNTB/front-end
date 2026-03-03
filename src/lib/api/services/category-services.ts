// src/lib/api/services/category-service.ts
// 보안 학습 주제 조회 관련 API 서비스


import { PROJECT_ENDPOINTS, getProjectApiUrl } from '@/lib/api/endpoints/project-endpoints';
import { fetchWithRefresh } from '@/lib/api/fetch-with-refresh';
import { getSafeApiErrorMessage } from '@/lib/api/helpers';


// API 응답 타입 정의
export interface CategoryItem {
  id: number;
  name: string;
  description: string;
  content?: string;
}

export interface CategoryResponse {
  categories: CategoryItem[];
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
  content: string;
}

export interface UpdateCategoryRequest {
  prevName: string;
  nextName: string;
  description: string;
  content: string;
}

export interface DeleteCategoryRequest {
  name: string;
}

export interface CategoryMutationResponse {
  id: number;
  name: string;
  message: string;
  description?: string;
  content?: string;
}

/**
 * 보안 학습 주제(카테고리) 목록 조회
 * @returns 카테고리 목록
 */
export const categoryService = {
  /**
   * 보안 학습 주제 목록 조회
   * GET /project-service/api/category
   * @returns 카테고리 목록 응답
   */
  getCategories: async (): Promise<CategoryResponse> => {
    try {
      const url = getProjectApiUrl(PROJECT_ENDPOINTS.PROJECT.GET_CATEGORIES);

      const response = await fetchWithRefresh(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        if (process.env.NODE_ENV === 'development') {
          const errorText = await response.text().catch(() => '');
          console.error('[category] getCategories error', response.status, errorText);
        }
        throw new Error(getSafeApiErrorMessage(response, '카테고리'));
      }

      const data: CategoryResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  /**
   * 카테고리 생성
   * POST /project-service/api/category
   */
  createCategory: async (
    payload: CreateCategoryRequest,
  ): Promise<CategoryMutationResponse> => {
    const url = getProjectApiUrl(PROJECT_ENDPOINTS.PROJECT.GET_CATEGORIES);

    const response = await fetchWithRefresh(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (process.env.NODE_ENV === 'development') {
        const errorText = await response.text().catch(() => '');
        console.error('[category] create error', response.status, errorText);
      }
      throw new Error(getSafeApiErrorMessage(response, '카테고리'));
    }

    return response.json();
  },

  /**
   * 카테고리 수정
   * PUT /project-service/api/category
   */
  updateCategory: async (
    payload: UpdateCategoryRequest,
  ): Promise<CategoryMutationResponse> => {
    const url = getProjectApiUrl(PROJECT_ENDPOINTS.PROJECT.GET_CATEGORIES);

    const response = await fetchWithRefresh(url, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (process.env.NODE_ENV === 'development') {
        const errorText = await response.text().catch(() => '');
        console.error('[category] update error', response.status, errorText);
      }
      throw new Error(getSafeApiErrorMessage(response, '카테고리'));
    }

    return response.json();
  },

  /**
   * 카테고리 삭제
   * DELETE /project-service/api/category
   */
  deleteCategory: async (
    payload: DeleteCategoryRequest,
  ): Promise<CategoryMutationResponse> => {
    const url = getProjectApiUrl(PROJECT_ENDPOINTS.PROJECT.GET_CATEGORIES);

    const response = await fetchWithRefresh(url, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (process.env.NODE_ENV === 'development') {
        const errorText = await response.text().catch(() => '');
        console.error('[category] delete error', response.status, errorText);
      }
      throw new Error(getSafeApiErrorMessage(response, '카테고리'));
    }

    return response.json();
  },
};

