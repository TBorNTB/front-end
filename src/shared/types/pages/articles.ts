/**import { Article } from "../../features/articles/types";
import { Category } from "../category";

export interface ArticlesPageProps {
  // Articles list with pagination
  articles: {
    items: Article[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  };

  // Categories for filtering
  categories: Category[];

  // Search and filter
  filters: {
    categories: string[];
    tags: string[];
    searchQuery: string;
    sortBy: 'latest' | 'popular' | 'trending';
  };
}

export interface ArticleDetailPageProps {
  article: Article & {
    content: string;
    readingTime: number;
    relatedArticles: Article[];
    nextArticle?: Article;
    previousArticle?: Article;
  };
  
  // Comments section
  comments: {
    items: Array<{
      id: string;
      content: string;
      authorName: string;
      authorProfileImageUrl: string;
      createdAt: string;
      likes: number;
      replies?: Array<{
        id: string;
        content: string;
        authorName: string;
        authorProfileImageUrl: string;
        createdAt: string;
        likes: number;
      }>;
    }>;
    totalCount: number;
  };
}

// types/pages/articles.ts
import { Article, Comment } from '../core';

export interface ArticlesPageData {
  articles: Article[];
  pagination: PaginationMeta;
  filters: ArticleFilters;
}

export interface ArticleDetailPageData {
  article: Article;
  relatedArticles: Article[];
  comments: Comment[];
  totalLikes: number;
  isLikedByUser: boolean;
}

export interface ArticleFilters {
  categories: string[];
  tags: string[];
  search?: string;
  dateRange?: DateRange;
}
**/