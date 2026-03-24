// src/lib/api/services/article.ts
import { ARTICLE_ENDPOINTS, getArticleApiUrl } from '@/lib/api/endpoints/article-endpoints';
import { fetchWithRefresh } from '@/lib/api/fetch-with-refresh';
import { getSafeApiErrorMessage, parseApiError, safeJsonParse } from '@/lib/api/helpers';
import { INTERNAL_ENDPOINTS, getInternalApiUrl } from '@/lib/api/endpoints';

export interface WriterProfile {
  username: string;
  nickname: string;
  realName: string;
  profileImageUrl: string;
}

export interface AttachmentInfo {
  fileKey: string;
  originalFileName: string;
}

export interface AttachmentReq {
  tempKey: string;
  originalFileName: string;
}

export interface ArticleResponse {
  id: number;
  title: string;
  content: string;
  description?: string;
  writerProfile: WriterProfile;
  category: string;
  thumbnailUrl: string;
  attachments?: AttachmentInfo[];
  createdAt: string;
}

export interface ArticleCreateRequest {
  title: string;
  content: string;
  description: string;
  category: string;
  thumbnailKey?: string;
  contentImageKeys?: string[];
  attachments?: AttachmentReq[];
}

export interface ArticleUpdateRequest {
  title: string;
  content: string;
  description: string;
  category: string;
  thumbnailKey?: string;
  contentImageKeys?: string[];
  attachments?: AttachmentReq[];
  attachmentKeysToDelete?: string[];
}

/**
 * ID로 아티클 상세 정보 가져오기
 * @param id 아티클 ID
 * @returns 아티클 상세 정보
 */
export const fetchArticleById = async (id: string | number): Promise<ArticleResponse | null> => {
  try {
    const endpoint = ARTICLE_ENDPOINTS.ARTICLE.GET_BY_ID.replace(':id', String(id));
    const url = getArticleApiUrl(endpoint);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Article with ID ${id} not found`);
        return null;
      }
      throw new Error(getSafeApiErrorMessage(response, '아티클'));
    }

    const data: ArticleResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching article:', error);
    // 네트워크 에러나 기타 에러의 경우 null 반환하여 기본값 사용 가능하도록
    return null;
  }
};

/**
 * 아티클 수정
 * @param id 아티클 ID
 * @param data 수정할 데이터 (title, content, category)
 * @returns 수정된 아티클 정보
 */
export const updateArticle = async (id: string | number, data: ArticleUpdateRequest): Promise<ArticleResponse> => {
  const endpoint = ARTICLE_ENDPOINTS.ARTICLE.UPDATE.replace(':id', String(id));
  const url = getArticleApiUrl(endpoint);
  const headers: HeadersInit = {
    'accept': 'application/json',
    'Content-Type': 'application/json',
  };

  const response = await fetchWithRefresh(url, {
    method: 'PUT',
    headers,
    credentials: 'include',
    body: JSON.stringify({
      ...data,
      description: data.description ?? '',
    }),
  });

  if (!response.ok) {
    if (process.env.NODE_ENV === 'development') {
      const errorText = await response.text();
      console.error('[article] update error', response.status, errorText);
    }
    throw new Error(getSafeApiErrorMessage(response, '아티클'));
  }

  return response.json();
};

/**
 * 아티클 삭제
 * @param id 아티클 ID
 */
export const deleteArticle = async (id: string | number): Promise<void> => {
  // Use a dedicated Next.js API route for deletion.
  // This mirrors the backend curl behavior (Authorization: Bearer ..., accept: */*)
  // and safely handles 204/empty responses.
  const endpoint = INTERNAL_ENDPOINTS.CS_KNOWLEDGE.DELETE.replace(
    ':id',
    encodeURIComponent(String(id))
  );
  const url = getInternalApiUrl(endpoint);
  const headers: HeadersInit = {
    'accept': '*/*',
  };

  const response = await fetchWithRefresh(url, {
    method: 'DELETE',
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    if (process.env.NODE_ENV === 'development') {
      const errorText = await response.text();
      console.error('[article] delete error', response.status, errorText);
    }
    const data = await safeJsonParse(response.clone());
    throw new Error(parseApiError(response, data, 'CS 지식'));
  }
};

/**
 * CS 지식 생성
 * @param data 생성할 데이터 (title, content, category)
 * @returns 생성된 아티클 정보 (id 포함)
 */
export const createArticle = async (data: ArticleCreateRequest): Promise<ArticleResponse> => {
  const url = getArticleApiUrl(ARTICLE_ENDPOINTS.ARTICLE.CREATE);
  const headers: HeadersInit = {
    'accept': 'application/json',
    'Content-Type': 'application/json',
  };

  const response = await fetchWithRefresh(url, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify({
      ...data,
      description: data.description ?? '',
    }),
  });

  if (!response.ok) {
    if (process.env.NODE_ENV === 'development') {
      const errorText = await response.text();
      console.error('[article] create error', response.status, errorText);
    }
    throw new Error(getSafeApiErrorMessage(response, '아티클'));
  }

  return response.json();
};

export const fetchAttachmentDownloadUrl = async (id: string | number, fileKey: string): Promise<string> => {
  const endpoint = ARTICLE_ENDPOINTS.ARTICLE.ATTACHMENT_DOWNLOAD.replace(':id', String(id));
  const url = getArticleApiUrl(`${endpoint}?key=${encodeURIComponent(fileKey)}`);

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'accept': 'application/json' },
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('다운로드 URL을 가져오는데 실패했습니다.');
  }

  return response.json();
};

export const articleService = {
  fetchArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  fetchAttachmentDownloadUrl,
};