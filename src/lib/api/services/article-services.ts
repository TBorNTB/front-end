// src/lib/api/services/article.ts
import { ARTICLE_ENDPOINTS, getArticleApiUrl } from '@/lib/api/endpoints/article-endpoints';

export interface ArticleResponse {
  id: number;
  title: string;
  content: string;
  writerId: string;
  nickname: string;
  category: string;
  createdAt: string;
}

export interface ArticleCreateRequest {
  title: string;
  content: string;
  category: string;
}

export interface ArticleUpdateRequest {
  title: string;
  content: string;
  category: string;
}

// Helper function to get access token from cookies
const getAccessToken = (): string | null => {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'accessToken') {
      return decodeURIComponent(value);
    }
  }
  return null;
};

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
      throw new Error(`Failed to fetch article: ${response.status}`);
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

  const accessToken = getAccessToken();
  const headers: HeadersInit = {
    'accept': 'application/json',
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    method: 'PUT',
    headers,
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update article: ${response.status} - ${errorText}`);
  }

  return response.json();
};

/**
 * 아티클 삭제
 * @param id 아티클 ID
 */
export const deleteArticle = async (id: string | number): Promise<void> => {
  const endpoint = ARTICLE_ENDPOINTS.ARTICLE.DELETE.replace(':id', String(id));
  const url = getArticleApiUrl(endpoint);

  const accessToken = getAccessToken();
  const headers: HeadersInit = {
    'accept': '*/*',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    method: 'DELETE',
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete article: ${response.status} - ${errorText}`);
  }
};

/**
 * CS 지식 생성
 * @param data 생성할 데이터 (title, content, category)
 * @returns 생성된 아티클 정보 (id 포함)
 */
export const createArticle = async (data: ArticleCreateRequest): Promise<ArticleResponse> => {
  const url = getArticleApiUrl(ARTICLE_ENDPOINTS.ARTICLE.CREATE);

  const accessToken = getAccessToken();
  const headers: HeadersInit = {
    'accept': 'application/json',
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create article: ${response.status} - ${errorText}`);
  }

  return response.json();
};

export const articleService = {
  fetchArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
};