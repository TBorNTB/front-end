// Core Comment Entity
export interface Comment {
  id: string;
  postId: string;
  postType: 'PROJECT' | 'ARTICLE';
  author: CommentAuthor;
  content: string;
  parentId?: string;
  children: Comment[];
  likeCount: number;
  isLiked: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommentAuthor {
  username: string;
  nickname: string;
  profileImage?: string;
}

// Core Like Entity
export interface Like {
  id: string;
  postId: string;
  postType: 'PROJECT' | 'ARTICLE' | 'COMMENT';
  userId: string;
  createdAt: string;
}

// Request Types
export interface CommentCreateRequest {
  postId: string;
  postType: 'PROJECT' | 'ARTICLE';
  content: string;
  parentId?: string;
}

export interface CommentUpdateRequest {
  content: string;
}

export interface LikeToggleRequest {
  postId: string;
  postType: 'PROJECT' | 'ARTICLE' | 'COMMENT';
}

export interface CommentFilters {
  postId?: string;
  postType?: 'PROJECT' | 'ARTICLE';
  parentId?: string;
  author?: string;
  page?: number;
  size?: number;
  sortBy?: 'createdAt' | 'likeCount';
  sortDirection?: 'ASC' | 'DESC';
}

// Response Types
export interface CommentResponse {
  comment: Comment;
  replies: Comment[];
  totalReplies: number;
}

export interface LikeStatus {
  isLiked: boolean;
  likeCount: number;
}
