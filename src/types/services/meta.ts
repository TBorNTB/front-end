// Core Comment Entity
export interface Comment {
  id: string;
  postId: string;
  postType: 'NEWS' | 'PROJECT' | 'QNA_QUESTION' | 'QNA_ANSWER' | 'DOCUMENT' | 'ARTICLE';
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
  postType: 'NEWS' | 'PROJECT' | 'QNA_QUESTION' | 'QNA_ANSWER' | 'DOCUMENT' | 'ARTICLE' | 'COMMENT';
  userId: string;
  createdAt: string;
}

// Request Types
export interface CommentCreateRequest {
  postId: string;
  postType: 'NEWS' | 'PROJECT' | 'QNA_QUESTION' | 'QNA_ANSWER' | 'DOCUMENT' | 'ARTICLE';
  content: string;
  parentId?: string;
}

export interface CommentUpdateRequest {
  content: string;
}

export interface LikeToggleRequest {
  postId: string;
  postType: 'NEWS' | 'PROJECT' | 'QNA_QUESTION' | 'QNA_ANSWER' | 'DOCUMENT' | 'ARTICLE' | 'COMMENT';
}

export interface CommentFilters {
  postId?: string;
  postType?: 'NEWS' | 'PROJECT' | 'QNA_QUESTION' | 'QNA_ANSWER' | 'DOCUMENT' | 'ARTICLE';
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
