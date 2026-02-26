// lib/api/services/elastic.ts
import { ELASTIC_ENDPOINTS, getElasticApiUrl } from '@/lib/api/endpoints';
import { fetchWithRefresh } from '@/lib/api/fetch-with-refresh';

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

export interface CSKnowledgeSearchByMemberParams {
  name: string; // realName 또는 nickname
  page?: number; // 페이지 번호 (0부터 시작)
  size?: number; // 페이지 크기
}

export interface CSKnowledgeWriter {
  username: string;
  nickname: string;
  realname: string;
  profileImageUrl: string;
}

export interface CSKnowledgeItem {
  id: number;
  title: string;
  content: string;
  description?: string;
  category: string;
  createdAt: string;
  likeCount: number;
  viewCount: number;
  writer: CSKnowledgeWriter;
  thumbnailUrl?: string;
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
      console.error(`CS Knowledge API error: ${response.status} ${response.statusText}`);
      // Return empty results instead of throwing
      return {
        content: [],
        page: params.page || 0,
        size: params.size || 6,
        totalElements: 0,
        totalPages: 0,
      };
    }

    const data: CSKnowledgeSearchResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching CS knowledge:', error);
    // Return empty results instead of throwing
    return {
      content: [],
      page: 0,
      size: 6,
      totalElements: 0,
      totalPages: 0,
    };
  }
};

/**
 * CS 지식 저자별 검색 API 호출
 * @param params 검색 파라미터 (name: realName 또는 nickname)
 * @returns 검색 결과 (페이지네이션 포함)
 */
export const searchCSKnowledgeByMember = async (
  params: CSKnowledgeSearchByMemberParams
): Promise<CSKnowledgeSearchResponse> => {
  try {
    const queryParams = new URLSearchParams();

    // name은 필수 파라미터
    queryParams.append('name', params.name.trim());

    // size와 page는 항상 전송
    queryParams.append('size', (params.size || 10).toString());
    queryParams.append('page', (params.page !== undefined ? params.page : 0).toString());

    const url = `${getElasticApiUrl(ELASTIC_ENDPOINTS.ELASTIC.ARTICLE_SEARCH_BY_MEMBER)}?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`CS Knowledge By Member API error: ${response.status} ${response.statusText}`);
      // Return empty results instead of throwing
      return {
        content: [],
        page: params.page || 0,
        size: params.size || 10,
        totalElements: 0,
        totalPages: 0,
      };
    }

    const data: CSKnowledgeSearchResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching CS knowledge by member:', error);
    // Return empty results instead of throwing
    return {
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    };
  }
};

/**
 * CS 지식 검색 제안 API 호출 (API 라우트를 통해 호출)
 * @param params 검색 파라미터 (query: 검색어)
 * @returns 검색 제안 목록 (문자열 배열)
 */
export const getCSKnowledgeSuggestion = async (
  params: CSKnowledgeSuggestionParams
): Promise<string[]> => {
  try {
    if (!params.query || !params.query.trim()) {
      return [];
    }

    // API 라우트를 통해 호출 (Projects와 동일한 방식)
    const response = await fetch(
      `/api/articles/suggestions?query=${encodeURIComponent(params.query.trim())}`
    );

    if (!response.ok) {
      console.error(`CS Knowledge Suggestion API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data: string[] = await response.json();
    // 배열이 아니거나 빈 배열인 경우 빈 배열 반환
    return Array.isArray(data) ? data.slice(0, 5) : [];
  } catch (error) {
    console.error('Error fetching CS knowledge suggestions:', error);
    return [];
  }
};

/** RAG 문서 업로드 응답 (한 번에 1개 PDF만 가능, 용량 제한 있음) */
export interface RAGDocumentUploadResponse {
  success: boolean;
  data?: { documentId: string; message: string };
  error?: string;
}

/**
 * RAG 학습용 PDF 업로드 (1개만 가능, 용량 초과 시 더 작은 파일 요청 안내)
 * POST /elastic-service/api/v1/rag/documents, multipart/form-data, field: file
 */
export async function uploadRAGDocument(file: File): Promise<RAGDocumentUploadResponse> {
  if (!file || file.type !== 'application/pdf') {
    throw new Error('PDF 파일만 업로드 가능합니다.');
  }
  const url = getElasticApiUrl(ELASTIC_ENDPOINTS.RAG.DOCUMENTS);
  const formData = new FormData();
  formData.append('file', file, file.name);

  const response = await fetchWithRefresh(url, {
    method: 'POST',
    headers: {
      accept: 'application/json',
    },
    credentials: 'include',
    body: formData,
  });

  const json = (await response.json().catch(() => ({}))) as RAGDocumentUploadResponse;

  if (!response.ok) {
    const msg =
      response.status === 413 || /용량|크기|size|limit|초과/i.test(json.error || '')
        ? '용량이 초과되었습니다. 더 작은 파일을 올려주세요.'
        : json.error || `업로드 실패 (${response.status})`;
    throw new Error(msg);
  }

  if (json.success === false && json.error) {
    const msg = /용량|크기|size|limit|초과/i.test(json.error)
      ? '용량이 초과되었습니다. 더 작은 파일을 올려주세요.'
      : json.error;
    throw new Error(msg);
  }

  return json;
}

export interface ProjectSearchItem {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string | null;
}

export interface ProjectSearchPageResponse {
  content: ProjectSearchItem[];
  totalPages: number;
  totalElements: number;
}

export const searchProjectsByQuery = async (query: string, size = 5): Promise<ProjectSearchItem[]> => {
  const params = new URLSearchParams({ query, size: String(size), page: '0' });
  const url = `${getElasticApiUrl(ELASTIC_ENDPOINTS.ELASTIC.PROJECT_SEARCH)}?${params.toString()}`;
  try {
    const response = await fetch(url, { method: 'GET', headers: { accept: 'application/json' } });
    if (!response.ok) return [];
    const data: ProjectSearchPageResponse = await response.json();
    return data.content ?? [];
  } catch {
    return [];
  }
};

export const fetchLatestProjects = async (size = 6, page = 0): Promise<ProjectSearchItem[]> => {
  const params = new URLSearchParams({ size: String(size), page: String(page) });
  const url = `${getElasticApiUrl(ELASTIC_ENDPOINTS.ELASTIC.PROJECT_SEARCH_LATEST)}?${params.toString()}`;
  try {
    const response = await fetch(url, { method: 'GET', headers: { accept: 'application/json' } });
    if (!response.ok) return [];
    const data: ProjectSearchItem[] = await response.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const elasticService = {
  searchCSKnowledge,
  searchCSKnowledgeByMember,
  getCSKnowledgeSuggestion,
  uploadRAGDocument,
  searchProjectsByQuery,
};

