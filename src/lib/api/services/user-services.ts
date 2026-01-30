'use client'; // Client-only (remove getAccessTokenFromCookies)

// User 관련 API 서비스 함수
import { apiClient } from '@/lib/api/client';
import { USER_ENDPOINTS, getUserApiUrl } from '@/lib/api/endpoints/user-endpoints';
import { fetchWithRefresh } from '@/lib/api/fetch-with-refresh';

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
  message: string;
  data: UserResponse[];
  size: number;
  page: number;
  totalPage: number;
}

export interface GetMembersParams {
  page?: number;
  size?: number;
  roles?: string[];
  realName?: string;
  nickname?: string;
}

// Cursor-based pagination types
export interface CursorUserResponse {
  id: number;
  username: string;
  realName: string;
  nickname: string;
  profileImageUrl: string;
  email: string;
}

export interface CursorUsersResponse {
  hasNext: boolean;
  content: CursorUserResponse[];
  nextCursorId: number;
}

export interface GetCursorUsersParams {
  cursorId?: number;
  size?: number;
  direction?: 'ASC' | 'DESC';
}

export interface GetCursorUsersByNameParams {
  cursorId?: number;
  size?: number;
  direction?: 'ASC' | 'DESC';
  nickname?: string;
  realName?: string;
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
    try {
      const { page = 0, size = 6, roles, realName, nickname } = params;

      // 필터가 있으면 roles 엔드포인트 사용, 없으면 기본 page 엔드포인트
      const hasFilters = (roles && roles.length > 0) || realName || nickname;
      const baseUrl = hasFilters
        ? getUserApiUrl(USER_ENDPOINTS.USER.GET_BY_ROLES)
        : getUserApiUrl(USER_ENDPOINTS.USER.GET_PAGED);

      const queryParams = new URLSearchParams();
      queryParams.set('page', String(page));
      queryParams.set('size', String(size));
      queryParams.set('sortDirection', 'ASC');
      queryParams.set('sortBy', 'id');

      if (roles && roles.length > 0) {
        roles.forEach(role => queryParams.append('roles', role));
      }
      if (realName) {
        queryParams.set('realName', realName);
      }
      if (nickname) {
        queryParams.set('nickname', nickname);
      }

      const url = `${baseUrl}?${queryParams.toString()}`;

      const response = await fetch(url, createFetchRequest(url));
      const data = await response.json().catch(() => null as never);

      if (!response.ok) {
        console.warn(`[memberService.getMembers] ${data?.message || data?.error || `멤버 조회 실패 (${response.status})`}`);
        return {
          message: '',
          data: [],
          size: 0,
          page: 0,
          totalPage: 0,
        };
      }

      return {
        message: data.message || '',
        data: data.data || [],
        size: data.size || 0,
        page: data.page || 0,
        totalPage: data.totalPage || 0,
      };
    } catch (error) {
      console.warn('[memberService.getMembers] Error:', error instanceof Error ? error.message : String(error));
      return {
        message: '',
        data: [],
        size: 0,
        page: 0,
        totalPage: 0,
      };
    }
  },

  getAllRoles: async (): Promise<string[]> => {
    try {
      const url = getUserApiUrl(USER_ENDPOINTS.USER.GET_ALL_ROLES);
      const response = await fetch(url, createFetchRequest(url));
      const data = await response.json().catch(() => []);

      if (!response.ok) {
        console.warn('[memberService.getAllRoles] Role 목록 조회 실패');
        return [];
      }

      return data;
    } catch (error) {
      console.warn('[memberService.getAllRoles] Error:', error instanceof Error ? error.message : String(error));
      return [];
    }
  },

  getMembersByCursor: async (params: GetCursorUsersParams = {}): Promise<CursorUsersResponse> => {
    try {
      const { cursorId = 0, size = 20, direction = 'ASC' } = params;
      const url = `${getUserApiUrl(USER_ENDPOINTS.USER.SEARCH_CURSOR)}?cursorId=${cursorId}&size=${size}&direction=${direction}`;

      const response = await fetch(url, createFetchRequest(url));
      const data = await response.json().catch(() => null as never);

      if (!response.ok) {
        console.warn(`[memberService.getMembersByCursor] ${data?.message || data?.error || `멤버 조회 실패 (${response.status})`}`);
        return {
          hasNext: false,
          content: [],
          nextCursorId: 0,
        };
      }

      return {
        hasNext: data.hasNext || false,
        content: data.content || [],
        nextCursorId: data.nextCursorId || 0,
      };
    } catch (error) {
      console.warn('[memberService.getMembersByCursor] Error:', error instanceof Error ? error.message : String(error));
      return {
        hasNext: false,
        content: [],
        nextCursorId: 0,
      };
    }
  },

  getMembersByCursorByName: async (params: GetCursorUsersByNameParams = {}): Promise<CursorUsersResponse> => {
    try {
      const { cursorId = 0, size = 7, direction = 'ASC', nickname, realName } = params;
      const queryParams = new URLSearchParams();
      queryParams.append('cursorId', cursorId.toString());
      queryParams.append('size', size.toString());
      queryParams.append('direction', direction);
      
      if (nickname) {
        queryParams.append('nickname', nickname);
      }
      if (realName) {
        queryParams.append('realName', realName);
      }
      
      const url = `${getUserApiUrl(USER_ENDPOINTS.USER.SEARCH_CURSOR_BY_NAME)}?${queryParams.toString()}`;

      const response = await fetch(url, createFetchRequest(url));
      const data = await response.json().catch(() => null as never);

      if (!response.ok) {
        console.warn(`[memberService.getMembersByCursorByName] ${data?.message || data?.error || `멤버 검색 실패 (${response.status})`}`);
        return {
          hasNext: false,
          content: [],
          nextCursorId: 0,
        };
      }

      return {
        hasNext: data.hasNext || false,
        content: data.content || [],
        nextCursorId: data.nextCursorId || 0,
      };
    } catch (error) {
      console.warn('[memberService.getMembersByCursorByName] Error:', error instanceof Error ? error.message : String(error));
      return {
        hasNext: false,
        content: [],
        nextCursorId: 0,
      };
    }
  },
};

// ✅ profileService (DRY!)
export const profileService = {
  getProfile: async (): Promise<UserResponse> => {
    try {
      const response = await fetchWithRefresh('/api/user/profile', {
        method: 'GET',
        headers: { accept: 'application/json' },
      });

      const data = await response.json().catch(() => null as never);

      if (!response.ok) {
        const errorMsg = response.status === 401 || response.status === 403
          ? '로그인이 필요합니다. 다시 로그인해주세요.'
          : data?.message || data?.error || `프로필 조회 실패 (${response.status})`;
        
        console.warn('[profileService.getProfile]', errorMsg);
        throw new Error(errorMsg);
      }

      return data;
    } catch (error) {
      console.warn('[profileService.getProfile] Error:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  },

  updateProfile: async (data: Partial<UserResponse>): Promise<UserResponse> => {
    try {
      const response = await fetchWithRefresh('/api/user/profile', {
        method: 'PATCH',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json().catch(() => null as never);

      if (!response.ok) {
        const errorMsg = response.status === 401 || response.status === 403
          ? '로그인이 필요합니다. 다시 로그인해주세요.'
          : responseData?.message || `프로필 업데이트 실패 (${response.status})`;
        
        console.warn('[profileService.updateProfile]', errorMsg);
        throw new Error(errorMsg);
      }

      return cleanUserResponse(responseData);
    } catch (error) {
      console.warn('[profileService.updateProfile] Error:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  },

  /**
   * 프로필 이미지 직접 업로드
   * POST /user-service/profile/upload (multipart/form-data)
   * @param file 업로드할 이미지 파일
   * @returns 업데이트된 사용자 정보 (profileImageUrl 포함)
   */
  uploadProfileImage: async (file: File): Promise<UserResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetchWithRefresh('/api/gateway/user-service/profile/upload', {
      method: 'POST',
      headers: {
        accept: 'application/json',
      },
      body: formData,
    });

    const responseData = await response.json().catch(() => null as never);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('로그인이 필요합니다. 다시 로그인해주세요.');
      }
      throw new Error(responseData?.message || `프로필 이미지 업로드 실패 (${response.status})`);
    }

    return cleanUserResponse(responseData);
  },

  getActivityStats: async (): Promise<{
    totalPostCount: number;
    totalViewCount: number;
    totalLikeCount: number;
    totalCommentCount: number;
  }> => {
    try {
      const response = await fetchWithRefresh('/api/user/activity/stats', {
        method: 'GET',
        headers: { accept: 'application/json' },
      });

      const data = await response.json().catch(() => null as never);

      if (!response.ok) {
        const errorMsg = response.status === 401 || response.status === 403
          ? '로그인이 필요합니다.'
          : data?.message || data?.error || `활동 통계 조회 실패 (${response.status})`;
        
        console.warn('[profileService.getActivityStats]', errorMsg);
        throw new Error(errorMsg);
      }

      return {
        totalPostCount: data.totalPostCount || 0,
        totalViewCount: data.totalViewCount || 0,
        totalLikeCount: data.totalLikeCount || 0,
        totalCommentCount: data.totalCommentCount || 0,
      };
    } catch (error) {
      console.warn('[profileService.getActivityStats] Error:', error instanceof Error ? error.message : String(error));
      return {
        totalPostCount: 0,
        totalViewCount: 0,
        totalLikeCount: 0,
        totalCommentCount: 0,
      };
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
      const response = await fetchWithRefresh('/api/s3/presigned-url', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
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
        console.warn('[s3Service.getPresignedUrl]', errorMessage);
        throw new Error(errorMessage);
      }

      // responseData가 null이거나 undefined인 경우
      if (!responseData) {
        console.warn('[s3Service.getPresignedUrl] 서버 응답을 받을 수 없습니다.');
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
      console.warn('[s3Service.getPresignedUrl] 서버 응답 형식이 올바르지 않습니다.');
      throw new Error('서버 응답 형식이 올바르지 않습니다.');
    } catch (error) {
      console.error('[s3Service.getPresignedUrl] Error:', error instanceof Error ? error.message : String(error));
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
        console.warn('[s3Service.uploadFile] Presigned URL을 받을 수 없습니다.');
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
        console.warn(`[s3Service.uploadFile] 파일 업로드 실패 (${uploadResponse.status})`);
        throw new Error(`파일 업로드 실패 (${uploadResponse.status})`);
      }

      // 3. 업로드된 파일 URL 반환
      return fileUrl || presignedUrl.split('?')[0];
    } catch (error) {
      console.error('[s3Service.uploadFile] Error:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  },
};

// View count response type
export interface ViewCountResponse {
  viewCount: number;
}


// Like count response type
export interface LikeCountResponse {
  likedCount: number;
}


// Fetch view count for a post
export const fetchViewCount = async (id: string | number, postType: string = 'PROJECT'): Promise<ViewCountResponse> => {
  try {
    const endpoint = USER_ENDPOINTS.VIEW.COUNT.replace(':id', String(id));
    const url = getUserApiUrl(`${endpoint}?postType=${postType}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.warn(`[fetchViewCount] Non-OK response (${response.status})`, { id, postType, error: errorText });
      return { viewCount: 0 };
    }

    return response.json();
  } catch (error) {
    console.warn('[fetchViewCount] Error:', error instanceof Error ? error.message : String(error));
    return { viewCount: 0 };
  }
};

// Increment view count for a post
export const incrementViewCount = async (id: string | number, postType: string = 'PROJECT'): Promise<ViewCountResponse> => {
  try {
    const endpoint = USER_ENDPOINTS.VIEW.INCREMENT.replace(':id', String(id));
    const url = getUserApiUrl(`${endpoint}?postType=${postType}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.warn(`[incrementViewCount] Non-OK response (${response.status})`, { id, postType, error: errorText });
      return { viewCount: 0 };
    }

    return response.json();
  } catch (error) {
    console.warn('[incrementViewCount] Error:', error instanceof Error ? error.message : String(error));
    return { viewCount: 0 };
  }
};


// Fetch like count for a post
export const fetchLikeCount = async (id: string | number, postType: string = 'PROJECT'): Promise<LikeCountResponse> => {
  try {
    const endpoint = USER_ENDPOINTS.LIKE.COUNT.replace(':id', String(id));
    const url = getUserApiUrl(`${endpoint}?postType=${postType}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.warn(`[fetchLikeCount] Non-OK response (${response.status})`, { id, postType, error: errorText });
      return { likedCount: 0 };
    }

    return response.json();
  } catch (error) {
    console.warn('[fetchLikeCount] Error:', error instanceof Error ? error.message : String(error));
    return { likedCount: 0 };
  }
};

// Like status response type
export interface LikeStatusResponse {
  likeCount: number;
  status: 'LIKED' | 'NOT_LIKED';
}

// Fetch like status for current user
export const fetchLikeStatus = async (id: string | number, postType: string = 'PROJECT'): Promise<LikeStatusResponse> => {
  try {
    const endpoint = USER_ENDPOINTS.LIKE.STATUS.replace(':id', String(id));
    const url = getUserApiUrl(`${endpoint}?postType=${postType}`);

    const response = await fetchWithRefresh(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      // 401이나 403이면 로그인하지 않은 상태로 간주
      if (response.status === 401 || response.status === 403) {
        return { likeCount: 0, status: 'NOT_LIKED' };
      }
      const errorText = await response.text().catch(() => '');
      console.warn(`[fetchLikeStatus] Non-OK response (${response.status})`, { id, postType, error: errorText });
      return { likeCount: 0, status: 'NOT_LIKED' };
    }

    return response.json();
  } catch (error) {
    console.warn('[fetchLikeStatus] Error:', error instanceof Error ? error.message : String(error));
    return { likeCount: 0, status: 'NOT_LIKED' };
  }
};

// Toggle like (like/unlike)
export const toggleLike = async (id: string | number, postType: string = 'PROJECT'): Promise<LikeStatusResponse> => {
  try {
    const endpoint = USER_ENDPOINTS.LIKE.TOGGLE.replace(':id', String(id));
    const url = getUserApiUrl(`${endpoint}?postType=${postType}`);

    const response = await fetchWithRefresh(url, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
      },
      credentials: 'include',
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error('로그인이 필요합니다.');
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.warn(`[toggleLike] Non-OK response (${response.status})`, { id, postType, error: errorText });
      throw new Error(`Failed to toggle like: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.warn('[toggleLike] Error:', error instanceof Error ? error.message : String(error));
    throw error;
  }
};

// Comment types
export interface Comment {
  id: number;
  postType: 'PROJECT' | 'NEWS' | 'ARTICLE';
  postId: number;
  username: string;
  content: string;
  parentId: number;
  depth: number;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
}


export interface CommentListResponse {
  hasNext: boolean;
  content: Comment[];
  nextCursorId: number;
}


export interface CreateCommentRequest {
  content: string;
}


export interface UpdateCommentRequest {
  content: string;
}


// Fetch comments for a post
export const fetchComments = async (
  postId: string | number,
  postType: string = 'PROJECT',
  cursorId: number = 0,
  size: number = 10,
  direction: 'ASC' | 'DESC' = 'DESC'
): Promise<CommentListResponse> => {
  const endpoint = USER_ENDPOINTS.COMMENT.GET_LIST.replace(':postId', String(postId));
  const url = getUserApiUrl(`${endpoint}?postType=${postType}&cursorId=${cursorId}&size=${size}&direction=${direction}`);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.warn(`[fetchComments] Non-OK response (${response.status})`, {
        postId,
        postType,
        cursorId,
        size,
        direction,
        url,
        error: errorText || 'No response body'
      });
      
      // Return empty response instead of throwing to prevent UI crashes
      return {
        content: [],
        nextCursorId: 0,
        hasNext: false
      };
    }

    return response.json();
  } catch (error) {
    console.warn(`[fetchComments] Network or parsing error`, {
      postId,
      postType,
      error: error instanceof Error ? error.message : String(error)
    });
    
    // Return empty response on any error
    return {
      content: [],
      nextCursorId: 0,
      hasNext: false
    };
  }
};


// Create a comment
export const createComment = async (
  postId: string | number,
  postType: string = 'PROJECT',
  data: CreateCommentRequest
): Promise<Comment> => {
  try {
    const endpoint = USER_ENDPOINTS.COMMENT.CREATE.replace(':postId', String(postId));
    const url = getUserApiUrl(`${endpoint}?postType=${postType}`);

    const response = await fetchWithRefresh(url, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error('로그인이 필요합니다.');
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.warn(`[createComment] Non-OK response (${response.status})`, { postId, postType, error: errorText });
      throw new Error(`Failed to create comment: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.warn('[createComment] Error:', error instanceof Error ? error.message : String(error));
    throw error;
  }
};


// Create a reply (대댓글)
export const createReply = async (
  postId: string | number,
  parentId: number,
  postType: string = 'PROJECT',
  data: CreateCommentRequest
): Promise<Comment> => {
  try {
    const endpoint = USER_ENDPOINTS.COMMENT.CREATE_REPLY
      .replace(':postId', String(postId))
      .replace(':parentId', String(parentId));
    const url = getUserApiUrl(`${endpoint}?postType=${postType}`);

    const response = await fetchWithRefresh(url, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error('로그인이 필요합니다.');
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.warn(`[createReply] Non-OK response (${response.status})`, { postId, parentId, postType, error: errorText });
      throw new Error(`Failed to create reply: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.warn('[createReply] Error:', error instanceof Error ? error.message : String(error));
    throw error;
  }
};


// Update a comment
export const updateComment = async (
  commentId: number,
  data: UpdateCommentRequest
): Promise<Comment> => {
  try {
    const endpoint = USER_ENDPOINTS.COMMENT.UPDATE.replace(':commentId', String(commentId));
    const url = getUserApiUrl(endpoint);

    const response = await fetchWithRefresh(url, {
      method: 'PATCH',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error('로그인이 필요합니다.');
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.warn(`[updateComment] Non-OK response (${response.status})`, { commentId, error: errorText });
      throw new Error(`Failed to update comment: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.warn('[updateComment] Error:', error instanceof Error ? error.message : String(error));
    throw error;
  }
};


// Delete a comment
export const deleteComment = async (commentId: number): Promise<void> => {
  try {
    const endpoint = USER_ENDPOINTS.COMMENT.DELETE.replace(':commentId', String(commentId));
    const url = getUserApiUrl(endpoint);

    const response = await fetchWithRefresh(url, {
      method: 'DELETE',
      headers: {
        'accept': '*/*',
      },
      credentials: 'include',
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error('로그인이 필요합니다.');
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.warn(`[deleteComment] Non-OK response (${response.status})`, { commentId, error: errorText });
      throw new Error(`Failed to delete comment: ${response.status}`);
    }
  } catch (error) {
    console.warn('[deleteComment] Error:', error instanceof Error ? error.message : String(error));
    throw error;
  }
};


// Fetch replies for a comment
export const fetchReplies = async (
  commentId: number,
  cursorId: number = 0,
  size: number = 10,
  direction: 'ASC' | 'DESC' = 'DESC'
): Promise<CommentListResponse> => {
  try {
    const endpoint = USER_ENDPOINTS.COMMENT.GET_REPLIES.replace(':commentId', String(commentId));
    const url = getUserApiUrl(`${endpoint}?cursorId=${cursorId}&size=${size}&direction=${direction}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.warn(`[fetchReplies] Non-OK response (${response.status})`, { commentId, error: errorText });
      return {
        content: [],
        nextCursorId: 0,
        hasNext: false
      };
    }

    return response.json();
  } catch (error) {
    console.warn('[fetchReplies] Error:', error instanceof Error ? error.message : String(error));
    return {
      content: [],
      nextCursorId: 0,
      hasNext: false
    };
  }
};


// User list types
export interface User {
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


export interface UserListResponse {
  message: string;
  size: number;
  page: number;
  totalPage: number;
  data: User[];
}


// Fetch users list (paginated)
export const fetchUsers = async (
  page: number = 0,
  size: number = 100,
  sortDirection: 'ASC' | 'DESC' = 'ASC',
  sortBy: string = 'createdAt'
): Promise<UserListResponse> => {
  try {
    const url = getUserApiUrl(
      `${USER_ENDPOINTS.USER.GET_PAGED}?page=${page}&size=${size}&sortDirection=${sortDirection}&sortBy=${sortBy}`
    );

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.warn(`[fetchUsers] Non-OK response (${response.status})`, { page, size, error: errorText });
      return {
        message: '',
        size: 0,
        page: 0,
        totalPage: 0,
        data: []
      };
    }

    return response.json();
  } catch (error) {
    console.warn('[fetchUsers] Error:', error instanceof Error ? error.message : String(error));
    return {
      message: '',
      size: 0,
      page: 0,
      totalPage: 0,
      data: []
    };
  }
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
