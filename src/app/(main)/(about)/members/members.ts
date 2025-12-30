/*import { UserProfile, UserRole, UserStats } from "../../features/users/types";
import { Article } from "../../features/articles/types";
import { Project } from "../../features/projects/types";

export interface MembersPageProps {
  // Members list with pagination
  members: {
    items: Array<UserProfile>;
    totalCount: number;
    currentPage: number;
    totalPages: number;
  };

  // Filters
  filters: {
    roles: UserRole[];
    searchQuery: string;
    sortBy: 'newest' | 'activity' | 'contributions';
  };

  // Stats
  statistics: {
    totalMembers: number;
    activeMembers: number;
    newMembersThisMonth: number;
  };
}

export interface MemberDetailPageProps {
  member: UserProfile & {
    stats: UserStats;
    recentProjects: Project[];
    recentArticles: Article[];
    activities: Array<{
      type: 'project' | 'article' | 'comment' | 'like';
      content: string;
      timestamp: string;
      reference: {
        id: string;
        title: string;
        url: string;
      };
    }>;
  };
}*/