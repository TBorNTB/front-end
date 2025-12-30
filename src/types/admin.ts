/**import { Article } from "../../features/articles/types";
import { Project } from "../project";
import { UserProfile, UserStats, UserRole } from "../user";

// Role change request types
export interface RoleChangeRequest {
  id: string;
  user_id: string;
  current_role: UserRole;
  requested_role: UserRole;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  reviewer_comments?: string;
  user: UserProfile;
}

export interface RoleChangeAction {
  type: 'APPROVE' | 'REJECT';
  request_id: string;
  comments?: string;
  admin_id: string;
}

// Enhanced admin dashboard with role management
export interface AdminDashboardPageProps {
  // Overview stats
  statistics: {
    totalUsers: number;
    activeUsers: number;
    totalProjects: number;
    totalArticles: number;
    newUsersThisMonth: number;
    newProjectsThisMonth: number;
    newArticlesThisMonth: number;
    pendingRoleRequests: number; // New stat
    roleChangesThisMonth: number; // New stat
  };

  // Recent activity with role changes
  recentActivity: Array<{
    type: 'user_joined' | 'project_created' | 'article_published' | 'website_views' | 'role_requested' | 'role_changed';
    content: string;
    timestamp: string;
    user: {
      id: string;
      name: string;
      profileImageUrl: string;
    };
    metadata?: {
      old_role?: UserRole;
      new_role?: UserRole;
      requested_role?: UserRole;
    };
  }>;

  // Content management
  content: {
    recentProjects: Project[];
    recentArticles: Article[];
    pendingApprovals: Array<{
      type: 'project' | 'article' | 'user' | 'role_change';
      id: string;
      title: string;
      submittedBy: string;
      submittedAt: string;
      priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    }>;
  };

  // User management with role requests
  users: {
    recentUsers: UserProfile[];
    userStats: UserStats[];
    roleChangeRequests: RoleChangeRequest[]; // New section
  };

  // Role management section
  roleManagement: {
    pendingRequests: RoleChangeRequest[];
    recentApprovals: Array<{
      request: RoleChangeRequest;
      approved_by: UserProfile;
      approved_at: string;
    }>;
    roleDistribution: Array<{
      role: UserRole;
      count: number;
      percentage: number;
    }>;
  };
}

// Enhanced settings with role management policies
export interface AdminSettingsPageProps {
  settings: {
    general: {
      siteName: string;
      siteDescription: string;
      maintenanceMode: boolean;
      allowRegistration: boolean;
    };
    email: {
      provider: string;
      fromEmail: string;
      replyToEmail: string;
      templates: Array<{
        name: string;
        subject: string;
        lastModified: string;
      }>;
    };
    security: {
      sessionTimeout: number;
      maxLoginAttempts: number;
      passwordPolicy: {
        minLength: number;
        requireNumbers: boolean;
        requireSpecialChars: boolean;
        requireUppercase: boolean;
      };
    };
    features: {
      enableProjects: boolean;
      enableArticles: boolean;
      enableComments: boolean;
      enableUserProfiles: boolean;
    };
    // New role management settings
    roleManagement: {
      autoApproveRoles: UserRole[]; // Roles that can be auto-approved
      requireApprovalForRoles: UserRole[]; // Roles that require admin approval
      maxRoleRequestsPerUser: number;
      roleRequestCooldownDays: number;
      allowSelfRoleRequest: boolean;
      notifyAdminsOnRoleRequest: boolean;
      roleChangeNotificationTemplate: string;
    };
  };
}

// New dedicated role management page
export interface AdminRoleManagementPageProps {
  // Pending requests section
  pendingRequests: {
    requests: RoleChangeRequest[];
    total: number;
    pagination: {
      current: number;
      total: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };

  // User role overview
  userRoles: {
    users: Array<UserProfile & {
      role_history: Array<{
        role: UserRole;
        changed_at: string;
        changed_by: string;
        reason?: string;
      }>;
      pending_requests: RoleChangeRequest[];
    }>;
    filters: {
      role?: UserRole;
      search?: string;
      sort: 'name' | 'role' | 'join_date' | 'last_active';
      order: 'asc' | 'desc';
    };
  };

  // Role statistics and analytics
  analytics: {
    roleDistribution: Array<{
      role: UserRole;
      count: number;
      percentage: number;
      trend: 'increasing' | 'decreasing' | 'stable';
    }>;
    requestTrends: Array<{
      month: string;
      requests: number;
      approvals: number;
      rejections: number;
    }>;
    topRequestedRoles: Array<{
      role: UserRole;
      requests: number;
      approval_rate: number;
    }>;
  };

  // Quick actions
  quickActions: {
    bulkRoleUpdate: {
      selectedUsers: string[];
      targetRole: UserRole;
      reason: string;
    };
    massApproval: {
      requestIds: string[];
      comments?: string;
    };
  };
}

// Role change form interfaces
export interface RoleChangeFormData {
  user_id: string;
  requested_role: UserRole;
  reason: string;
  justification?: string;
  attachments?: File[];
}

export interface RoleApprovalFormData {
  request_id: string;
  action: 'APPROVE' | 'REJECT';
  comments?: string;
  conditions?: string[];
  effective_date?: string;
}
*/