// src/lib/api/services/category-service.ts
// 보안 학습 주제 조회 관련 API 서비스


import { PROJECT_ENDPOINTS, getProjectApiUrl } from '@/lib/api/endpoints';
import { USE_MOCK_DATA } from '@/lib/api/env';
import { getCategories as getMockCategories } from '@/lib/mock-data';
import { fetchWithRefresh } from '@/lib/api/fetch-with-refresh';
import { BASE_URL } from '@/lib/api/config';
import { PROJECT_ENDPOINTS} from '@/lib/api/endpoints';

// API 응답 타입 정의
export interface CategoryItem {
  id: number;
  name: string;
  description: string;
}

export interface CategoryResponse {
  categories: CategoryItem[];
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
}

export interface UpdateCategoryRequest {
  prevName: string;
  nextName: string;
  description: string;
}

export interface DeleteCategoryRequest {
  name: string;
}

export interface CategoryMutationResponse {
  id: number;
  name: string;
  message: string;
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
        throw new Error(`Failed to fetch categories: ${response.status}`);
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
      const errorText = await response.text().catch(() => '');
      throw new Error(
        `Failed to create category: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`,
      );
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
      const errorText = await response.text().catch(() => '');
      throw new Error(
        `Failed to update category: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`,
      );
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
      const errorText = await response.text().catch(() => '');
      throw new Error(
        `Failed to delete category: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`,
      );
    }

    return response.json();
  },
};

