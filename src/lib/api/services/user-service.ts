// lib/user-service.ts
// Configuration for frontend API endpoints connecting with SSG backend microservices

const API_CONFIG = {
  DEVELOPMENT: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080', // Local backend
  STAGING: 'https://api.sejongssg.kr', // Your deployed server
  PRODUCTION: 'https://api.sejongssg.kr', // Same for now, change later if needed
};

// ✅ Auto-detect environment
const getBaseUrl = () => {
  // Check if running in browser
  if (typeof window !== 'undefined') {
    // Use environment variable if set, otherwise use staging
    return process.env.NEXT_PUBLIC_API_URL || API_CONFIG.STAGING;
  }
  
  // Server-side: use environment variable or staging
  return process.env.NEXT_PUBLIC_API_URL || API_CONFIG.STAGING;
};

export const BASE_URL = getBaseUrl();
//Check if variables are loaded
console.log('Base URL:', process.env.NEXT_PUBLIC_API_URL);


// Feature-specific endpoints matching microservices
export const API_ENDPOINTS = {
  // User-service endpoints 
  USERS: {
    // Authentication endpoints
    LOGIN: '/user-service/users/login',
    SIGNUP: '/user-service/users',
    LOGOUT: '/user-service/users/logout',
    ROLE: '/user-service/users/role/one',
    PROFILE: '/user-service/users/profile',
    
    // User management endpoints
    GET_ALL: '/user-service/users',
    GET_PAGED: '/user-service/users/page',
    DELETE_USER: '/user-service/users',
    UPDATE_USER: '/user-service/users',
    CONFIRM_USER: '/user-service/users/{username}/confirm',
    GRANT_ADMIN: '/user-service/users/{grantedUsername}/admin',
  },

  // Token management 
  TOKEN: {
    REISSUE: '/user-service/token/reissue',
    REFRESH: '/user-service/token/refresh',
  },

  // S3 File management 
  S3: {
    PRESIGNED_URL: '/user-service/api/s3/presigned-url',
  },

  // Archive-service endpoints
  ARCHIVES: {
    GET_ALL: '/archive-service/archives',
    GET_BY_ID: '/archive-service/archives/:id',
    GET_BY_CATEGORY: '/archive-service/archives/category/:category',
    CREATE: '/archive-service/archives',
    UPDATE: '/archive-service/archives/:id',
    DELETE: '/archive-service/archives/:id',
  },

  // Project-service endpoints  
  PROJECTS: {
    GET_ALL: '/project-service/projects',
    GET_BY_ID: '/project-service/projects/:id',
    GET_BY_CATEGORY: '/project-service/projects/category/:category',
    CREATE: '/project-service/projects',
    UPDATE: '/project-service/projects/:id',
    DELETE: '/project-service/projects/:id',
    GET_COLLABORATORS: '/project-service/projects/:id/collaborators',
    GET_CATEGORIES: '/project-service/api/category',
  },

  // Meta-service endpoints
  META: {
    COMMENTS: '/meta-service/comments',
    COMMENTS_BY_POST: '/meta-service/comments/post/:postId',
    LIKES: '/meta-service/likes',
    LIKE_POST: '/meta-service/likes/post/:postId',
  },

  // Newsletter-service endpoints
  NEWSLETTER: {
    SUBSCRIBE: '/newsletter-service/subscribe',
    UNSUBSCRIBE: '/newsletter-service/unsubscribe',
  },

  // Categories
  CATEGORIES: {
    GET_ALL: '/archive-service/categories',
  },

  // Alarm endpoints
  ALARM: {
    RECEIVED: '/user-service/alarm/received',
  },
  
  // RAG Service endpoints
  RAG: {
    QUERY: '/elastic-service/api/v1/rag/query',
  },
} as const;

// ✅ Helper function with environment logging
export const getApiUrl = (endpoint: string) => {
  const url = `${BASE_URL}${endpoint}`;
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔗 API Request: ${url}`);
  }
  
  return url;
};

// ✅ Helper function to get access token from cookies (client-side only)
export const getAccessTokenFromCookies = (): string | null => {
  if (typeof window === 'undefined') {
    return null; // Server-side에서는 null 반환
  }
  
  const cookies = document.cookie;
  const accessTokenMatch = cookies.match(/accessToken=([^;]+)/);
  return accessTokenMatch ? decodeURIComponent(accessTokenMatch[1]) : null;
};

// API 응답 타입 정의
export interface UserResponse {
  id: number;
  nickname: string;
  role: string;
  realName: string;
  email: string;
  username: string;
  description: string;
  githubUrl: string;
  linkedinUrl: string;
  blogUrl: string;
  profileImageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface MembersPageResponse {
  userResponses: UserResponse[];
  size: number;
  page: number;
  totalElements: number;
}

export interface GetMembersParams {
  page?: number;
  size?: number;
}

/**
 * 멤버 조회 API 서비스
 */
export const memberService = {
  /**
   * 페이지네이션을 지원하는 멤버 조회
   * GET /user-service/users/page?size=6&page=0
   * @param params 페이지네이션 파라미터
   * @returns 멤버 목록 및 페이지네이션 정보
   */
  getMembers: async (params: GetMembersParams = {}): Promise<MembersPageResponse> => {
    try {
      const { page = 0, size = 6 } = params;
      const url = `${getApiUrl(API_ENDPOINTS.USERS.GET_PAGED)}?size=${size}&page=${page}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-store',
      });

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage = responseData?.message || 
                            responseData?.error || 
                            `멤버 조회 실패 (${response.status})`;
        throw new Error(errorMessage);
      }

      if (!responseData) {
        throw new Error('서버 응답을 받을 수 없습니다.');
      }

      return {
        userResponses: responseData.userResponses || [],
        size: responseData.size || 0,
        page: responseData.page || 0,
        totalElements: responseData.totalElements || 0,
      };
    } catch (error: any) {
      console.error('Error fetching members:', error);
      
      // 네트워크 에러 처리
      if (error.name === 'TypeError' || error.message.includes('fetch')) {
        throw new Error('네트워크 연결을 확인해주세요.');
      }
      
      // 기존 에러 메시지가 있으면 그대로 사용
      throw error;
    }
  },
};

/**
 * 프로필 조회 API 서비스
 */
export const profileService = {
  /**
   * 현재 로그인한 사용자의 프로필 조회
   * GET /user-service/users/profile
   * @returns 사용자 프로필 정보
   */
  getProfile: async (): Promise<UserResponse> => {
    try {
      const url = getApiUrl(API_ENDPOINTS.USERS.PROFILE);
      
      // 쿠키에서 accessToken 추출
      const accessToken = getAccessTokenFromCookies();
      
      // Authorization 헤더 준비
      const headers: HeadersInit = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
      
      // Bearer 토큰이 있으면 Authorization 헤더에 추가
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
        credentials: 'include', // 쿠키도 함께 전송
        cache: 'no-store',
      });

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        // 401 또는 403 에러인 경우 인증 문제
        if (response.status === 401 || response.status === 403) {
          throw new Error('로그인이 필요합니다. 다시 로그인해주세요.');
        }
        
        const errorMessage = responseData?.message || 
                            responseData?.error || 
                            `프로필 조회 실패 (${response.status})`;
        throw new Error(errorMessage);
      }

      if (!responseData) {
        throw new Error('서버 응답을 받을 수 없습니다.');
      }

      return responseData;
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      
      // 네트워크 에러 처리
      if (error.name === 'TypeError' || error.message.includes('fetch')) {
        throw new Error('네트워크 연결을 확인해주세요.');
      }
      
      // 기존 에러 메시지가 있으면 그대로 사용
      throw error;
    }
  },

  /**
   * 프로필 정보 업데이트
   * PATCH /user-service/users
   * @param data 업데이트할 프로필 정보
   * @returns 업데이트된 사용자 프로필 정보
   */
  updateProfile: async (data: Partial<{
    email: string;
    realName: string;
    description: string;
    githubUrl: string;
    linkedinUrl: string;
    blogUrl: string;
    profileImageUrl: string;
  }>): Promise<UserResponse> => {
    try {
      const url = getApiUrl(API_ENDPOINTS.USERS.UPDATE_USER);
      
      // 쿠키에서 accessToken 추출
      const accessToken = getAccessTokenFromCookies();
      
      // Authorization 헤더 준비
      const headers: HeadersInit = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
      
      // Bearer 토큰이 있으면 Authorization 헤더에 추가
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(url, {
        method: 'PATCH',
        headers,
        credentials: 'include', // 쿠키도 함께 전송
        cache: 'no-store',
        body: JSON.stringify(data),
      });

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        // 401 또는 403 에러인 경우 인증 문제
        if (response.status === 401 || response.status === 403) {
          throw new Error('로그인이 필요합니다. 다시 로그인해주세요.');
        }
        
        const errorMessage = responseData?.message || 
                            responseData?.error || 
                            `프로필 업데이트 실패 (${response.status})`;
        throw new Error(errorMessage);
      }

      if (!responseData) {
        throw new Error('서버 응답을 받을 수 없습니다.');
      }

      // 빈 값이나 잘못된 값 정리
      const cleanValue = (value: string | null | undefined): string => {
        if (!value || typeof value !== 'string') return '';
        const trimmed = value.trim();
        if (trimmed === 'string' || trimmed === 'null' || trimmed === 'undefined') return '';
        return trimmed;
      };

      // 응답 데이터 정리
      const cleanedResponse: UserResponse = {
        ...responseData,
        email: cleanValue(responseData.email),
        realName: cleanValue(responseData.realName),
        nickname: cleanValue(responseData.nickname),
        description: cleanValue(responseData.description),
        githubUrl: cleanValue(responseData.githubUrl),
        linkedinUrl: cleanValue(responseData.linkedinUrl),
        blogUrl: cleanValue(responseData.blogUrl),
        profileImageUrl: cleanValue(responseData.profileImageUrl),
      };

      return cleanedResponse;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      
      // 네트워크 에러 처리
      if (error.name === 'TypeError' || error.message.includes('fetch')) {
        throw new Error('네트워크 연결을 확인해주세요.');
      }
      
      // 기존 에러 메시지가 있으면 그대로 사용
      throw error;
    }
  },
};

/**
 * S3 파일 업로드 서비스
 */
export const s3Service = {
  /**
   * S3 presigned URL 요청
   * POST /user-service/api/s3/presigned-url
   * @param fileName 파일 이름
   * @param contentType 파일 타입 (MIME type)
   * @returns presigned URL 및 파일 URL
   */
  getPresignedUrl: async (fileName: string, contentType: string): Promise<{
    presignedUrl: string;
    fileUrl?: string;
  }> => {
    try {
      const url = getApiUrl(API_ENDPOINTS.S3.PRESIGNED_URL);
      
      // 쿠키에서 accessToken 추출
      const accessToken = getAccessTokenFromCookies();
      
      // Authorization 헤더 준비
      const headers: HeadersInit = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
      
      // Bearer 토큰이 있으면 Authorization 헤더에 추가
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify({
          fileName,
          contentType,
          fileType: contentType,
        }),
      });

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage = responseData?.message || 
                            responseData?.error || 
                            `Presigned URL 생성 실패 (${response.status})`;
        throw new Error(errorMessage);
      }

      // responseData가 null이거나 undefined인 경우
      if (!responseData) {
        throw new Error('서버 응답을 받을 수 없습니다.');
      }

      // 응답이 문자열인 경우
      if (typeof responseData === 'string') {
        return {
          presignedUrl: responseData,
          fileUrl: responseData.split('?')[0],
        };
      }

      // 응답이 객체인 경우
      if (typeof responseData === 'object') {
        return {
          presignedUrl: responseData.presignedUrl || responseData.url || '',
          fileUrl: responseData.fileUrl || responseData.presignedUrl?.split('?')[0],
        };
      }

      // 예상치 못한 응답 형식
      throw new Error('서버 응답 형식이 올바르지 않습니다.');
    } catch (error: any) {
      console.error('Error getting presigned URL:', error);
      throw error;
    }
  },

  /**
   * 파일을 S3에 업로드
   * @param file 업로드할 파일
   * @returns 업로드된 파일의 URL
   */
  uploadFile: async (file: File): Promise<string> => {
    try {
      // 1. Presigned URL 요청
      const { presignedUrl, fileUrl } = await s3Service.getPresignedUrl(file.name, file.type);
      
      if (!presignedUrl) {
        throw new Error('Presigned URL을 받을 수 없습니다.');
      }

      // 2. 파일을 S3에 업로드
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error(`파일 업로드 실패 (${uploadResponse.status})`);
      }

      // 3. 업로드된 파일 URL 반환
      return fileUrl || presignedUrl.split('?')[0];
    } catch (error: any) {
      console.error('Error uploading file to S3:', error);
      throw error;
    }
  },
};
