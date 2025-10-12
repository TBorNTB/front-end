
// types/pages/projects.ts
/**import { Project, PaginationMeta } from '../core';

export interface ProjectsPageProps {
  // Projects list with pagination
  projects: {
    items: Project[];
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

export interface ProjectDetailPageProps {
  project: Project & {
    description: string;
    content: string;
    githubUrl?: string;
    demoUrl?: string;
    startDate: string;
    endDate?: string;
    status: 'in-progress' | 'completed' | 'archived';
    technologies: string[];
  };
  relatedProjects: Project[];
}

export interface ProjectsPageData {
  projects: Project[];
  pagination: PaginationMeta;
  filters: ProjectFilters;
}

export interface ProjectDetailPageData {
  project: Project;
  relatedProjects: Project[];
  comments: Comment[];
  totalLikes: number;
  isLikedByUser: boolean;
}

export interface ProjectFilters {
  categories: string[];
  status: Project['status'][];
  tags: string[];
  search?: string;
}
**/