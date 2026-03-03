import { CategoryType } from'./category';

// 프로젝트 상태 한글 변환 및 색상 매핑
export const getProjectStatusKorean = (status: string) => {
  switch (status) {
    case 'PLANNING':
    case ProjectStatus.PLANNING:
      return '기획중';
    case 'IN_PROGRESS':
    case ProjectStatus.IN_PROGRESS:
      return '진행중';
    case 'COMPLETED':
    case ProjectStatus.COMPLETED:
      return '완료';
    default:
      return '알수없음';
  }
};

export const getProjectStatusColor = (status: string) => {
  switch (status) {
    case 'PLANNING':
    case ProjectStatus.PLANNING:
      return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'IN_PROGRESS':
    case ProjectStatus.IN_PROGRESS:
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'COMPLETED':
    case ProjectStatus.COMPLETED:
      return 'bg-green-100 text-green-700 border-green-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

// Enums for project-related constants
export enum ProjectStatus {
  PLANNING = '기획중',
  IN_PROGRESS = '진행중',
  COMPLETED = '완료',
}

export enum DocumentType {
  README = 'README',
  SPECIFICATION = 'SPECIFICATION',
  GUIDE = 'GUIDE',
  REFERENCE = 'REFERENCE',
  REPORT = 'REPORT'
}

export enum CollaboratorRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  CONTRIBUTOR = 'CONTRIBUTOR',
  VIEWER = 'VIEWER'
}

export enum SubGoalStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Core interfaces
export interface ProjectCategory {
  id: string;
  projectId: string;
  categoryType: CategoryType;
  createdAt: Date;
}

export interface ProjectTechStack {
  id: string;
  projectId: string;
  name: string;
  version?: string;
  description?: string;
  iconUrl?: string;
  category: 'LANGUAGE' | 'FRAMEWORK' | 'DATABASE' | 'TOOL' | 'PLATFORM' | 'OTHER';
  createdAt: Date;
}

export interface Collaborator {
  id: string;
  projectId: string;
  userId: string;
  username: string;
  displayName?: string;
  email?: string;
  avatarUrl?: string;
  role: CollaboratorRole;
  joinedAt: Date;
  lastActiveAt?: Date;
}

export interface SubGoal {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: SubGoalStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimatedHours?: number;
  actualHours?: number;
  assigneeId?: string;
  assigneeName?: string;
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectDocument {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  type: DocumentType;
  version: string;
  authorId: string;
  authorName: string;
  isPublic: boolean;
  downloadCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Main Project interface
export interface Project {
  id: string;
  title: string;
  description?: string;
  username: string;
  projectStatus: ProjectStatus;
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Related entities
  projectCategories: ProjectCategory[];
  projectTechStacks: ProjectTechStack[];
  collaborators: Collaborator[];
  subGoals: SubGoal[];
  documents: ProjectDocument[];
}

// Utility types for different contexts
export interface ProjectSummary {
  id: string;
  title: string;
  description?: string;
  username: string;
  projectStatus: ProjectStatus;
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Computed fields
  categoryCount: number;
  techStackCount: number;
  collaboratorCount: number;
  completedGoals: number;
  totalGoals: number;
  documentCount: number;
  progressPercentage: number;
}

export interface ProjectCard {
  id: string;
  title: string;
  description?: string;
  username: string;
  projectStatus: ProjectStatus;
  thumbnailUrl?: string;
  createdAt: Date;
  
  // Simplified related data for cards
  primaryCategory?: CategoryType;
  topTechStacks: string[];
  collaboratorCount: number;
  completionRate: number;
}

export interface ProjectDetail extends Project {
  // Additional computed properties for detail view
  statusHistory?: Array<{
    status: ProjectStatus;
    changedAt: Date;
    changedBy: string;
  }>;
  metrics?: {
    totalHours: number;
    estimatedHours: number;
    efficiency: number;
    completionRate: number;
  };
}

// Form interfaces
export interface CreateProjectRequest {
  title: string;
  description: string;
  thumbnail: string;
  content: string;
  projectStatus: ProjectStatus;
  categories: string[];
  collaborators: string[];
  techStacks: string[];
  subGoals: string[];
  startedAt: string;
  endedAt: string;
  thumbnailKey: string | null;
  contentImageKeys: string[];
}

export interface UpdateProjectRequest {
  id: string;
  title?: string;
  description?: string;
  projectStatus?: ProjectStatus;
  thumbnailUrl?: string;
}

export interface AddCollaboratorRequest {
  projectId: string;
  username: string;
  role: CollaboratorRole;
}

export interface CreateSubGoalRequest {
  projectId: string;
  title: string;
  description?: string;
  priority: SubGoal['priority'];
  estimatedHours?: number;
  assigneeId?: string;
  dueDate?: Date;
}

export interface UploadDocumentRequest {
  projectId: string;
  title: string;
  description?: string;
  type: DocumentType;
  file: File;
  isPublic?: boolean;
}

// Filter and query types
export interface ProjectFilters {
  status?: ProjectStatus[];
  categories?: CategoryType[];
  username?: string;
  techStacks?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  collaboratorRole?: CollaboratorRole;
  hasDocuments?: boolean;
  minProgress?: number;
  maxProgress?: number;
}

export interface ProjectSortOptions {
  field: 'title' | 'createdAt' | 'updatedAt' | 'status' | 'progress';
  order: 'asc' | 'desc';
}

export interface ProjectSearchParams {
  query?: string;
  filters?: ProjectFilters;
  sort?: ProjectSortOptions;
  page?: number;
  limit?: number;
}

// Response types
export interface ProjectListResponse {
  projects: ProjectSummary[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ProjectStatsResponse {
  totalProjects: number;
  projectsByStatus: Record<ProjectStatus, number>;
  projectsByCategory: Record<CategoryType, number>;
  averageCompletion: number;
  activeCollaborators: number;
  totalDocuments: number;
}

// API Response Types (matching backend API structure)
export interface SubGoalDto {
  id: number;
  content: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryDto {
  id: number;
  name: string;
  description: string;
}

export interface TechStackDto {
  id: number;
  name: string;
}

export interface OwnerProfile {
  username: string;
  nickname: string;
  realName: string;
  profileImageUrl: string;
}

export interface CollaboratorProfile {
  username: string;
  nickname: string;
  realName: string;
  profileImageUrl: string;
}

export interface CollaboratorDto {
  id: number;
  profile: CollaboratorProfile;
}

export interface DocumentDto {
  id: number;
  title: string;
  content: string;
  description: string;
  thumbnailUrl: string;
  createdAt: string;
  updatedAt: string;
  projectId: number;
}

export interface ProjectDetailResponse {
  id: number;
  parentProjectId?: number | null;
  title: string;
  description: string;
  ownerProfile: OwnerProfile;
  projectStatus: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  endedAt?: string;
  thumbnailUrl: string;
  content: string;
  contentJson?: string; // Keep for backward compatibility
  subGoalDtos: SubGoalDto[];
  categories: CategoryDto[];
  techStackDtos: TechStackDto[];
  collaborators: CollaboratorDto[];
  documentDtos: DocumentDto[];
  /** 채팅방 ID (프로젝트 생성 시 자동 생성된 방). 이 값이 있으면 이름 검색 없이 이 ID로만 연다. */
  chatRoomId?: string | null;
}