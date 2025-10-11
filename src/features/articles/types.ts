// Core Article Entity
export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: ArticleCategory;
  author: ArticleAuthor;
  tags: string[];
  thumbnailImage?: string;
  featured: boolean;
  readTime: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  seoTitle?: string;
  seoDescription?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  articleCount: number;
}

export interface ArticleAuthor {
  username: string;
  nickname: string;
  profileImage?: string;
  bio?: string;
}

// Request Types
export interface ArticleCreateRequest {
  title: string;
  content: string;
  excerpt: string;
  categoryId: string;
  tags: string[];
  thumbnailImage?: string;
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
 
}

export interface ArticleUpdateRequest {
  title?: string;
  content?: string;
  excerpt?: string;
  categoryId?: string;
  tags?: string[];
  thumbnailImage?: string;
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export interface ArticleFilters {
  categoryId?: string;
  tags?: string[];
  featured?: boolean;
  author?: string;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'publishedAt' | 'viewCount' | 'likeCount';
  sortDirection?: 'ASC' | 'DESC';
}

// Analytics Types
export interface ArticleAnalytics {
  articleId: string;
  views: DailyStats[];
  likes: DailyStats[];
  comments: DailyStats[];
  totalViews: number;
  totalLikes: number;
  totalComments: number;
}

export interface DailyStats {
  date: string;
  count: number;
}


