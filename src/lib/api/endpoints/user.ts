// src/lib/user-service.ts
import { BASE_URL } from '@/lib/api/config'; // <-- use the shared gateway base URL

// Feature-specific endpoints matching microservices
export const USER_ENDPOINTS = {

  // User-service endpoints
  USER: {
    //user endpoints
    LOGIN: '/user-service/users/login',
    SIGNUP: '/user-service/users',
    LOGOUT: '/user-service/users/logout',
    ROLE: '/user-service/users/role/one',
    PROFILE: '/user-service/users/profile',

    //admin endpoints
    GET_ALL: '/user-service/users',
    GET_PAGED: '/user-service/users/page',
    DELETE_USER: '/user-service/users',
    UPDATE_USER: '/user-service/users',
    CONFIRM_USER: '/user-service/users/{username}/confirm',
    GRANT_ADMIN: '/user-service/users/{grantedUsername}/admin',
    SEND_VERIFICATION_CODE: '/user-service/users/auth/verification-code',                                     
    RESET_PASSWORD: '/user-service/users/auth/reset-password', 
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

  // Alarm endpoints
  ALARM: {
    RECEIVED: '/user-service/alarm/received',
  },

  // View & Like endpoints
  VIEW: {
    COUNT: '/user-service/api/view/:id/count',
  },
  LIKE: {
    COUNT: '/user-service/api/like/:id/count',
  },

  // Comment endpoints
  COMMENT: {
    CREATE: '/user-service/api/comment/:postId',
    UPDATE: '/user-service/api/comment/:commentId',
    DELETE: '/user-service/api/comment/:commentId',
    GET_LIST: '/user-service/api/comment/:postId',
    CREATE_REPLY: '/user-service/api/comment/:postId/reply/:parentId',
    GET_REPLIES: '/user-service/api/comment/:commentId/replies',
  },

} as const;

// ✅ Helper function with environment logging
export const getUserApiUrl = (endpoint: string) => {
  const url = `${BASE_URL}${endpoint}`;

  if (process.env.NODE_ENV === 'development') {
    // Avoid noisy logs in production
    console.log(`🔗 API Request: ${url}`);
  }

  return url;
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
  const endpoint = USER_ENDPOINTS.VIEW.COUNT.replace(':id', String(id));
  const url = getUserApiUrl(`${endpoint}?postType=${postType}`);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch view count: ${response.status} - ${errorText}`);
  }

  return response.json();
};

// Fetch like count for a post
export const fetchLikeCount = async (id: string | number, postType: string = 'PROJECT'): Promise<LikeCountResponse> => {
  const endpoint = USER_ENDPOINTS.LIKE.COUNT.replace(':id', String(id));
  const url = getUserApiUrl(`${endpoint}?postType=${postType}`);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch like count: ${response.status} - ${errorText}`);
  }

  return response.json();
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

// Get access token from cookies
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

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch comments: ${response.status} - ${errorText}`);
  }

  return response.json();
};

// Create a comment
export const createComment = async (
  postId: string | number,
  postType: string = 'PROJECT',
  data: CreateCommentRequest
): Promise<Comment> => {
  const endpoint = USER_ENDPOINTS.COMMENT.CREATE.replace(':postId', String(postId));
  const url = getUserApiUrl(`${endpoint}?postType=${postType}`);
  const token = getAccessToken();

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create comment: ${response.status} - ${errorText}`);
  }

  return response.json();
};

// Create a reply (대댓글)
export const createReply = async (
  postId: string | number,
  parentId: number,
  postType: string = 'PROJECT',
  data: CreateCommentRequest
): Promise<Comment> => {
  const endpoint = USER_ENDPOINTS.COMMENT.CREATE_REPLY
    .replace(':postId', String(postId))
    .replace(':parentId', String(parentId));
  const url = getUserApiUrl(`${endpoint}?postType=${postType}`);
  const token = getAccessToken();

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create reply: ${response.status} - ${errorText}`);
  }

  return response.json();
};

// Update a comment
export const updateComment = async (
  commentId: number,
  data: UpdateCommentRequest
): Promise<Comment> => {
  const endpoint = USER_ENDPOINTS.COMMENT.UPDATE.replace(':commentId', String(commentId));
  const url = getUserApiUrl(endpoint);
  const token = getAccessToken();

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update comment: ${response.status} - ${errorText}`);
  }

  return response.json();
};

// Delete a comment
export const deleteComment = async (commentId: number): Promise<void> => {
  const endpoint = USER_ENDPOINTS.COMMENT.DELETE.replace(':commentId', String(commentId));
  const url = getUserApiUrl(endpoint);
  const token = getAccessToken();

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'accept': '*/*',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete comment: ${response.status} - ${errorText}`);
  }
};

// Fetch replies for a comment
export const fetchReplies = async (
  commentId: number,
  cursorId: number = 0,
  size: number = 10,
  direction: 'ASC' | 'DESC' = 'DESC'
): Promise<CommentListResponse> => {
  const endpoint = USER_ENDPOINTS.COMMENT.GET_REPLIES.replace(':commentId', String(commentId));
  const url = getUserApiUrl(`${endpoint}?cursorId=${cursorId}&size=${size}&direction=${direction}`);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch replies: ${response.status} - ${errorText}`);
  }

  return response.json();
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
    const errorText = await response.text();
    throw new Error(`Failed to fetch users: ${response.status} - ${errorText}`);
  }

  return response.json();
};