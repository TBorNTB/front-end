// API 데이터 기반 카테고리 타입 (하드코딩 enum 제거)
export type CategoryType = string;

// 하드코딩 enum 대체: 어떤 키를 접근해도 키 문자열을 반환하는 동적 객체
// 예: CategoryType.WEB_HACKING -> 'WEB_HACKING'
export const CategoryType: Record<string, string> = new Proxy(
  {},
  {
    get: (_target, prop) => String(prop),
  }
);

// 서버에서 동적으로 주입/관리 가능한 카테고리 메타 맵
export const CategoryDisplayNames: Record<string, string> = {};
export const CategorySlugs: Record<string, string> = {};
export const CategoryDescriptions: Record<string, string> = {};

// Enhanced Category interface
export interface Category {
  id: string;
  name: string; // Korean display name
  slug: string;
  description: string;
  type: CategoryType; // English enum for database operations
  parentId?: string;
  projectCount: number;
  articleCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Topic interface (same structure, different context)
export interface Topic {
  id: string;
  name: string; // Korean display name
  slug: string;
  description: string;
  type: CategoryType; // English enum for database operations
  categories?: Category[]; // For nested structure if needed
  projectCount: number;
  articleCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Utility types for frontend operations
export type CategoryWithCounts = Category & {
  totalContent: number; // projectCount + articleCount
};

export type TopicWithCounts = Topic & {
  totalContent: number;
};

// Form types for admin/creation interfaces
export interface CreateCategoryRequest {
  name: string;
  description: string;
  type: CategoryType;
  parentId?: string;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  id: string;
}

// Comprehensive CategoryHelpers utility object
export const CategoryHelpers = {
  // Basic getters
  getDisplayName: (type: CategoryType | string): string => {
    return CategoryDisplayNames[type as CategoryType] || String(type);
  },

  getSlug: (type: CategoryType | string): string => {
    const mapped = CategorySlugs[type as CategoryType];
    if (mapped) return mapped;
    return String(type)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/_/g, '-');
  },

  getDescription: (type: CategoryType | string): string => {
    return CategoryDescriptions[type as CategoryType] || '';
  },

  // Reverse lookups
  getTypeBySlug: (slug: string): CategoryType | null => {
    const entry = Object.entries(CategorySlugs).find(([_, value]) => value === slug);
    return entry ? (entry[0] as CategoryType) : (slug as CategoryType);
  },

  getTypeByDisplayName: (displayName: string): CategoryType | null => {
    const entry = Object.entries(CategoryDisplayNames).find(([_, value]) => value === displayName);
    return entry ? (entry[0] as CategoryType) : (displayName as CategoryType);
  },

  // Validation functions
  isValidCategoryType: (value: string): value is CategoryType => {
    return typeof value === 'string' && value.trim().length > 0;
  },

  isValidSlug: (slug: string): boolean => {
    return typeof slug === 'string' && slug.trim().length > 0;
  },

  // Object creation helpers
  createCategoryFromType: (
    type: CategoryType, 
    counts: { projectCount: number; articleCount: number },
    id: string = crypto.randomUUID(),
    options?: {
      parentId?: string;
      createdAt?: Date;
      updatedAt?: Date;
    }
  ): Category => ({
    id,
    name: CategoryHelpers.getDisplayName(type),
    slug: CategoryHelpers.getSlug(type),
    type,
    description: CategoryHelpers.getDescription(type),
    parentId: options?.parentId,
    projectCount: counts.projectCount,
    articleCount: counts.articleCount,
    createdAt: options?.createdAt || new Date(),
    updatedAt: options?.updatedAt || new Date()
  }),

  createTopicFromType: (
    type: CategoryType,
    counts: { projectCount: number; articleCount: number },
    id: string = crypto.randomUUID(),
    options?: {
      categories?: Category[];
      createdAt?: Date;
      updatedAt?: Date;
    }
  ): Topic => ({
    id,
    name: CategoryHelpers.getDisplayName(type),
    slug: CategoryHelpers.getSlug(type),
    type,
    description: CategoryHelpers.getDescription(type),
    projectCount: counts.projectCount,
    articleCount: counts.articleCount,
    createdAt: options?.createdAt || new Date(),
    updatedAt: options?.updatedAt || new Date()
  }),

  // Array operations
  getAllCategoryTypes: (): CategoryType[] => {
    return Object.keys(CategoryDisplayNames) as CategoryType[];
  },

  getAllSlugs: (): string[] => {
    return Object.values(CategorySlugs);
  },

  getAllDisplayNames: (): string[] => {
    return Object.values(CategoryDisplayNames);
  },

  // Data transformation helpers
  addTotalContent: <T extends { projectCount: number; articleCount: number }>(
    item: T
  ): T & { totalContent: number } => ({
    ...item,
    totalContent: item.projectCount + item.articleCount
  }),

  sortByTotalContent: <T extends { projectCount: number; articleCount: number }>(
    items: T[],
    order: 'asc' | 'desc' = 'desc'
  ): T[] => {
    return [...items].sort((a, b) => {
      const totalA = a.projectCount + a.articleCount;
      const totalB = b.projectCount + b.articleCount;
      return order === 'desc' ? totalB - totalA : totalA - totalB;
    });
  },

  sortByName: <T extends { name: string }>(
    items: T[],
    order: 'asc' | 'desc' = 'asc'
  ): T[] => {
    return [...items].sort((a, b) => {
      return order === 'asc' 
        ? a.name.localeCompare(b.name, 'ko') 
        : b.name.localeCompare(a.name, 'ko');
    });
  },

  // Filter helpers
  filterByContentCount: <T extends { projectCount: number; articleCount: number }>(
    items: T[],
    minCount: number = 0
  ): T[] => {
    return items.filter(item => (item.projectCount + item.articleCount) >= minCount);
  },

  filterByType: <T extends { type: CategoryType }>(
    items: T[],
    types: CategoryType[]
  ): T[] => {
    return items.filter(item => types.includes(item.type));
  },

  // Search functionality
  searchByName: <T extends { name: string; description?: string }>(
    items: T[],
    query: string
  ): T[] => {
    const lowercaseQuery = query.toLowerCase().trim();
    if (!lowercaseQuery) return items;

    return items.filter(item => 
      item.name.toLowerCase().includes(lowercaseQuery) ||
      (item.description && item.description.toLowerCase().includes(lowercaseQuery))
    );
  },

  // Grouping helpers
  groupByType: <T extends { type: CategoryType }>(
    items: T[]
  ): Record<CategoryType, T[]> => {
    const grouped = {} as Record<CategoryType, T[]>;

    // Group items
    items.forEach(item => {
      if (!grouped[item.type]) {
        grouped[item.type] = [];
      }
      grouped[item.type].push(item);
    });

    return grouped;
  },

  // Statistics helpers
  getTotalStats: <T extends { projectCount: number; articleCount: number }>(
    items: T[]
  ): { totalProjects: number; totalArticles: number; totalContent: number } => {
    return items.reduce(
      (acc, item) => ({
        totalProjects: acc.totalProjects + item.projectCount,
        totalArticles: acc.totalArticles + item.articleCount,
        totalContent: acc.totalContent + item.projectCount + item.articleCount
      }),
      { totalProjects: 0, totalArticles: 0, totalContent: 0 }
    );
  },

  getStatsPerType: <T extends { type: CategoryType; projectCount: number; articleCount: number }>(
    items: T[]
  ): Record<CategoryType, { projects: number; articles: number; total: number }> => {
    const stats = {} as Record<CategoryType, { projects: number; articles: number; total: number }>;

    // Calculate stats
    items.forEach(item => {
      if (!stats[item.type]) {
        stats[item.type] = { projects: 0, articles: 0, total: 0 };
      }
      stats[item.type].projects += item.projectCount;
      stats[item.type].articles += item.articleCount;
      stats[item.type].total += item.projectCount + item.articleCount;
    });

    return stats;
  },

  // URL and routing helpers
  getCategoryUrl: (slug: string, basePath: string = '/topics'): string => {
    return `${basePath}?category=${slug}`;
  },

  getTopicUrl: (slug: string, basePath: string = '/topics'): string => {
    return `${basePath}/${slug}`;
  },

  // Data conversion helpers
  categoryToTopic: (category: Category): Topic => ({
    ...category,
    categories: undefined // Remove categories property when converting
  }),

  topicToCategory: (topic: Topic): Category => {
    const { ...categoryData } = topic;
    return categoryData;
  },

  // Bulk operations
  createMultipleFromTypes: (
    typesWithCounts: Array<{
      type: CategoryType;
      projectCount: number;
      articleCount: number;
      parentId?: string;
    }>
  ): Category[] => {
    return typesWithCounts.map(({ type, projectCount, articleCount, parentId }) =>
      CategoryHelpers.createCategoryFromType(
        type,
        { projectCount, articleCount },
        crypto.randomUUID(),
        { parentId }
      )
    );
  }
};

// Export utility functions for backward compatibility
export const {
  getDisplayName,
  getSlug,
  getDescription,
  getTypeBySlug,
  isValidCategoryType,
  createCategoryFromType,
  createTopicFromType,
  getAllCategoryTypes
} = CategoryHelpers;
