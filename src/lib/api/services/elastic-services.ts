// lib/api/services/elastic.ts
import { ELASTIC_ENDPOINTS, getElasticApiUrl } from '@/lib/api/endpoints';

export interface CSKnowledgeSuggestionParams {
  query: string; // 검색어
}

export interface CSKnowledgeSearchParams {
  keyword?: string; // 검색어
  category?: string; // e.g., 'WEB-HACKING', 'SYSTEM-HACKING'
  sortType?: 'LATEST' | 'POPULAR' | 'VIEWS'; // 정렬 타입
  page?: number; // 페이지 번호 (0부터 시작)
  size?: number; // 페이지 크기
}

export interface CSKnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  likeCount: number;
  viewCount: number;
}

export interface CSKnowledgeSearchResponse {
  content: CSKnowledgeItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/**
 * CS 지식 검색 API 호출
 * @param params 검색 파라미터
 * @returns 검색 결과 (페이지네이션 포함)
 */
export const searchCSKnowledge = async (
  params: CSKnowledgeSearchParams
): Promise<CSKnowledgeSearchResponse> => {
  try {
    const queryParams = new URLSearchParams();

    // keyword 처리: 검색어가 있을 때만 전송
    if (params.keyword && params.keyword.trim()) {
      queryParams.append('keyword', params.keyword.trim());
    }

    // category 처리: 카테고리가 있으면 추가
    if (params.category && params.category.trim()) {
      queryParams.append('category', params.category.trim());
    }

    // sortType 처리: 기본값 LATEST
    queryParams.append('sortType', params.sortType || 'LATEST');

    // size와 page는 항상 전송
    queryParams.append('size', (params.size || 6).toString());
    queryParams.append('page', (params.page !== undefined ? params.page : 0).toString());

    const url = `${getElasticApiUrl(ELASTIC_ENDPOINTS.ELASTIC.ARTICLE_SEARCH)}?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to search CS knowledge: ${response.status}`);
    }

    const data: CSKnowledgeSearchResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching CS knowledge:', error);
    throw error;
  }
};

export const elasticService = {
  searchCSKnowledge,
};

