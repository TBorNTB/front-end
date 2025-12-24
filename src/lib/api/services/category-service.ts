// src/lib/api/services/category-service.ts
// 보안 학습 주제 조회 관련 API 서비스

import { BASE_URL, API_ENDPOINTS } from '@/lib/api/config';

// API 응답 타입 정의
export interface CategoryItem {
  id: number;
  name: string;
  description: string;
}

export interface CategoryResponse {
  categories: CategoryItem[];
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
      const url = `${BASE_URL}${API_ENDPOINTS.PROJECTS.GET_CATEGORIES}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
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
};

