// Base enum for database operations (English constants)
export enum CategoryType {
  SYSTEM_HACKING = 'SYSTEM_HACKING',
  WEB_HACKING = 'WEB_HACKING',
  DIGITAL_FORENSICS = 'DIGITAL_FORENSICS',
  REVERSING = 'REVERSING',
  CRYPTOGRAPHY = 'CRYPTOGRAPHY',
  NETWORK_SECURITY = 'NETWORK_SECURITY',
  IOT_SECURITY = 'IOT_SECURITY'
}

// Korean display names mapping
export const CategoryDisplayNames: Record<CategoryType, string> = {
  [CategoryType.SYSTEM_HACKING]: '시스템 해킹',
  [CategoryType.WEB_HACKING]: '웹 해킹',
  [CategoryType.DIGITAL_FORENSICS]: '디지털 포렌식',
  [CategoryType.REVERSING]: '리버싱',
  [CategoryType.CRYPTOGRAPHY]: '암호학',
  [CategoryType.NETWORK_SECURITY]: '네트워크 보안',
  [CategoryType.IOT_SECURITY]: 'IoT보안'
} as const;

// Slug mapping for URL generation
export const CategorySlugs: Record<CategoryType, string> = {
  [CategoryType.SYSTEM_HACKING]: 'system-hacking',
  [CategoryType.WEB_HACKING]: 'web-hacking',
  [CategoryType.DIGITAL_FORENSICS]: 'digital-forensics',
  [CategoryType.REVERSING]: 'reversing',
  [CategoryType.CRYPTOGRAPHY]: 'cryptography',
  [CategoryType.NETWORK_SECURITY]: 'network-security',
  [CategoryType.IOT_SECURITY]: 'iot-security'
} as const;

// Category descriptions mapping
export const CategoryDescriptions: Record<CategoryType, string> = {
  [CategoryType.WEB_HACKING]: 'SQL Injection, XSS, CSRF 등 웹 애플리케이션 보안 취약점 분석 및 대응',
  [CategoryType.REVERSING]: '바이너리 분석, 역공학 기술을 통한 소프트웨어 구조 분석 및 이해',
  [CategoryType.SYSTEM_HACKING]: 'Buffer Overflow, ROP 등 시스템 레벨 취약점 분석 및 익스플로잇 개발',
  [CategoryType.DIGITAL_FORENSICS]: '디지털 증거 수집 및 분석, 사고 대응을 위한 포렌식 기법',
  [CategoryType.NETWORK_SECURITY]: '네트워크 트래픽 분석, 침입 탐지 및 방화벽 보안 기술',
  [CategoryType.IOT_SECURITY]: '스마트 기기의 보안 취약점을 분석 및 대응',
  [CategoryType.CRYPTOGRAPHY]: '현대 암호학 이론, 암호 시스템 분석 및 보안 프로토콜 구현'
} as const;

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
  getDisplayName: (type: CategoryType): string => {
    return CategoryDisplayNames[type];
  },

  getSlug: (type: CategoryType): string => {
    return CategorySlugs[type];
  },

  getDescription: (type: CategoryType): string => {
    return CategoryDescriptions[type];
  },

  // Reverse lookups
  getTypeBySlug: (slug: string): CategoryType | null => {
    const entry = Object.entries(CategorySlugs).find(([_, value]) => value === slug);
    return entry ? (entry[0] as CategoryType) : null;
  },

  getTypeByDisplayName: (displayName: string): CategoryType | null => {
    const entry = Object.entries(CategoryDisplayNames).find(([_, value]) => value === displayName);
    return entry ? (entry[0] as CategoryType) : null;
  },

  // Validation functions
  isValidCategoryType: (value: string): value is CategoryType => {
    return Object.values(CategoryType).includes(value as CategoryType);
  },

  isValidSlug: (slug: string): boolean => {
    return Object.values(CategorySlugs).includes(slug);
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
    categories: options?.categories,
    projectCount: counts.projectCount,
    articleCount: counts.articleCount,
    createdAt: options?.createdAt || new Date(),
    updatedAt: options?.updatedAt || new Date()
  }),

  // Array operations
  getAllCategoryTypes: (): CategoryType[] => {
    return Object.values(CategoryType);
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
    
    // Initialize all groups
    Object.values(CategoryType).forEach(type => {
      grouped[type] = [];
    });

    // Group items
    items.forEach(item => {
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
    
    // Initialize stats for all types
    Object.values(CategoryType).forEach(type => {
      stats[type] = { projects: 0, articles: 0, total: 0 };
    });

    // Calculate stats
    items.forEach(item => {
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
    const { categories, ...categoryData } = topic;
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
