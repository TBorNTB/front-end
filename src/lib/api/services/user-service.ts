'use client'; // Client-only (remove getAccessTokenFromCookies)

// User 관련 API 서비스 함수
import { apiClient } from '@/lib/api/client';
import { USER_ENDPOINTS, getUserApiUrl } from '@/lib/api/endpoints/user-endpoints';

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

// ✅ Shared fetch logic (DRY!)
const createFetchRequest = (url: string, accessToken: string | null = null, options: RequestInit = {}) => ({
  method: options.method || 'GET',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
  },
  credentials: 'include' as const,
  cache: 'no-store' as const,
  ...options,
});

// ✅ Generic error handler (DRY!)
const handleApiError = (error: unknown, context: string): never => {
  const err = error as Error;
  
  // Network errors
  if (err.name === 'TypeError' || err.message.includes('fetch')) {
    throw new Error('네트워크 연결을 확인해주세요.');
  }
  
  // Preserve original message
  throw new Error(err.message || `${context} 실패`);
};

// ✅ Types (extract to types.ts)
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

// ✅ userService (apiClient - simple)
export const userService = {
  sendVerificationCode: (payload: { email: string }, request?: Request) =>
    apiClient.post(USER_ENDPOINTS.USER.SEND_VERIFICATION_CODE, payload, request, { requireAuth: false }),

  resetPassword: (payload: { email: string; randomCode: string; newPassword: string }, request?: Request) =>
    apiClient.post(USER_ENDPOINTS.USER.RESET_PASSWORD, payload, request, { requireAuth: false }),
} as const;

// ✅ memberService
export const memberService = {
  getMembers: async (params: GetMembersParams = {}): Promise<MembersPageResponse> => {
    const { page = 0, size = 6 } = params;
    const url = `${getUserApiUrl(USER_ENDPOINTS.USER.GET_PAGED)}?size=${size}&page=${page}`;

    const response = await fetch(url, createFetchRequest(url));
    const data = await response.json().catch(() => null as never);

    if (!response.ok) {
      throw new Error(data?.message || data?.error || `멤버 조회 실패 (${response.status})`);
    }

    return {
      userResponses: data.userResponses || [],
      size: data.size || 0,
      page: data.page || 0,
      totalElements: data.totalElements || 0,
    };
  },
};

// ✅ profileService (DRY!)
export const profileService = {
  getProfile: async (): Promise<UserResponse> => {
    const url = getUserApiUrl(USER_ENDPOINTS.USER.PROFILE);
    const accessToken = getAccessTokenFromCookies(); // Keep your helper!

    const response = await fetch(url, createFetchRequest(url, accessToken));
    const data = await response.json().catch(() => null as never);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('로그인이 필요합니다. 다시 로그인해주세요.');
      }
      throw new Error(data?.message || data?.error || `프로필 조회 실패 (${response.status})`);
    }

    return data;
  },

  updateProfile: async (data: Partial<UserResponse>): Promise<UserResponse> => {
    const url = getUserApiUrl(USER_ENDPOINTS.USER.UPDATE_USER);
    const accessToken = getAccessTokenFromCookies();

    const response = await fetch(url, {
      ...createFetchRequest(url, accessToken, { method: 'PATCH' }),
      body: JSON.stringify(data),
    });

    const responseData = await response.json().catch(() => null as never);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('로그인이 필요합니다. 다시 로그인해주세요.');
      }
      throw new Error(responseData?.message || `프로필 업데이트 실패 (${response.status})`);
    }

    return cleanUserResponse(responseData); // ✅ Shared cleaner
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
      const url = getUserApiUrl(USER_ENDPOINTS.S3.PRESIGNED_URL);
      
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

// ✅ Shared utilities
const getAccessTokenFromCookies = (): string | null => {
  if (typeof window === 'undefined') return null;
  const match = document.cookie.match(/accessToken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};

const cleanUserResponse = (data: any): UserResponse => {
  const cleanValue = (value: any): string => {
    if (!value || typeof value !== 'string') return '';
    const trimmed = value.trim();
    if (['string', 'null', 'undefined'].includes(trimmed)) return '';
    return trimmed;
  };

  return {
    ...data,
    email: cleanValue(data.email),
    realName: cleanValue(data.realName),
    nickname: cleanValue(data.nickname),
    description: cleanValue(data.description),
    githubUrl: cleanValue(data.githubUrl),
    linkedinUrl: cleanValue(data.linkedinUrl),
    blogUrl: cleanValue(data.blogUrl),
    profileImageUrl: cleanValue(data.profileImageUrl),
  };
};
