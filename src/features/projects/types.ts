// Core Project Entity
/*export interface Project {
  id: string;
  title: string;
  description: string;
  content?: string;
  category: ProjectCategory;
  status: PostStatus;
  owner: ProjectOwner;
  collaborators: ProjectCollaborator[];
  technologies: string[];
  thumbnailImage?: string;
  images: string[];
  githubUrl?: string;
  demoUrl?: string;
  documentUrl?: string;
  featured: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
}

export interface ProjectOwner {
  username: string;
  nickname: string;
  profileImage?: string;
}

export interface ProjectCollaborator {
  username: string;
  nickname: string;
  profileImage?: string;
  role: 'OWNER' | 'COLLABORATOR';
  joinedAt: string;
}

// Request Types
export interface ProjectCreateRequest {
  title: string;
  description: string;
  content?: string;
  categoryId: string;
  technologies: string[];
  githubUrl?: string;
  demoUrl?: string;
  documentUrl?: string;
  thumbnailImage?: string;
  images: string[];
  collaborators: string[]; // usernames
}

export interface ProjectUpdateRequest {
  title?: string;
  description?: string;
  content?: string;
  categoryId?: string;
  technologies?: string[];
  githubUrl?: string;
  demoUrl?: string;
  documentUrl?: string;
  thumbnailImage?: string;
  images?: string[];
  status?: PostStatus;
  featured?: boolean;
}

export interface ProjectFilters {
  categoryId?: string;
  technologies?: string[];
  status?: PostStatus;
  featured?: boolean;
  owner?: string;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'viewCount' | 'likeCount';
  sortDirection?: 'ASC' | 'DESC';
}

// features/projects/types.ts ✅ Project entities in their feature
import { BaseEntity, UserReference, ProjectStatus } from '@/shared/types/core';

export interface Project extends BaseEntity {
  title: string;
  description: string;
  category: string;
  status: ProjectStatus;    // Using enum instead of string literal
  owner: UserReference;
  collaborators: UserReference[];
  image_url?: string;       // snake_case to match DB
  repository_url?: string;  // snake_case to match DB
  demo_url?: string;        // snake_case to match DB
  tags: string[];
  is_public: boolean;       // snake_case to match DB
}
*/