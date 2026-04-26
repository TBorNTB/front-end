import { useEffect, useState } from 'react';
import { categoryService, type CategoryItem } from '@/lib/api/services/category-services';
import { CategoryType, CategorySlugs, CategoryDescriptions, CategoryHelpers } from '@/types/services/category';

type Project = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  projectStatus: 'IN_PROGRESS' | 'COMPLETED' | 'PLANNING' | 'ARCHIVED';
  projectCategories: string[];
  projectTechStacks: string[];
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  viewCount: number;
  owner?: { username?: string; nickname?: string; realname?: string; profileImageUrl?: string } | null;
  collaborators?: Array<{ username?: string; nickname?: string; realname?: string; profileImageUrl?: string }>;
};

type Article = {
  topicSlug: string;
  id: string;
  content: {
    title: string;
    summary: string;
    content: string;
    category: string;
  };
  thumbnailUrl: string;
  writerId: string;
  writer?: {
    username?: string;
    nickname?: string;
    realname?: string;
    profileImageUrl?: string;
  };
  participantIds: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  viewCount: number;
};

export interface LandingTopic {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: CategoryType;
  projectCount: number;
  articleCount: number;
  iconUrl?: string;
}

export interface ProjectsPageResponse {
  content: Project[];
  totalElements: number;
  totalPages: number;
}

export interface ArticlesPageResponse {
  content: Article[];
  totalElements: number;
  totalPages: number;
}

interface LandingDataState {
  projects: Project[];
  articles: Article[];
  topics: LandingTopic[];
  totalProjectElements: number;
  totalArticleElements: number;
  loading: boolean;
  error: string | null;
}

const mapCategoriesToTopics = (categories: CategoryItem[]): LandingTopic[] => {
  return categories.map((cat) => {
    const type = CategoryHelpers.getTypeByDisplayName(cat.name) || CategoryType.WEB_HACKING;
    const slug = CategorySlugs[type];
    return {
      id: `topic-${cat.id}`,
      name: cat.name,
      slug,
      description: cat.description || CategoryDescriptions[type],
      type,
      projectCount: 0,
      articleCount: 0,
      iconUrl: cat.iconUrl,
    };
  });
};

const PAGE_SIZE_PROJECTS = 10;
const PAGE_SIZE_ARTICLES = 9;

function mapProjectFromApi(item: any): Project {
  return {
    id: String(item.id),
    title: item.title || '',
    description: item.description || '',
    thumbnailUrl: item.thumbnailUrl || '',
    projectStatus: item.projectStatus || 'PLANNING',
    projectCategories: item.projectCategories || [],
    projectTechStacks: item.projectTechStacks || [],
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
    likeCount: item.likeCount || 0,
    viewCount: item.viewCount || 0,
    owner: item.owner || null,
    collaborators: item.collaborators || [],
  };
}

/** Fetch projects with pagination (page 0-based). Exported for "load more" on landing. */
export const fetchProjectsPage = async (page: number, size: number = PAGE_SIZE_PROJECTS): Promise<ProjectsPageResponse> => {
  try {
    const response = await fetch(
      `/api/projects/search?projectSortType=LATEST&size=${size}&page=${page}`,
      { method: 'GET', headers: { 'accept': 'application/json' } }
    );
    if (!response.ok) {
      console.error('Failed to fetch projects:', response.status);
      return { content: [], totalElements: 0, totalPages: 0 };
    }
    const data = await response.json();
    const content = (data.content || []).map(mapProjectFromApi);
    return {
      content,
      totalElements: data.totalElements ?? 0,
      totalPages: data.totalPages ?? 0,
    };
  } catch (error) {
    console.error('Error fetching projects page:', error);
    return { content: [], totalElements: 0, totalPages: 0 };
  }
};

function mapArticleFromApi(item: any): Article {
  return {
    topicSlug: (item.category || '').toLowerCase().replace('_', '-'),
    id: String(item.id),
    content: {
      title: item.title || '',
      summary: item.description || item.content?.substring(0, 150) || item.content || '',
      content: item.content || '',
      category: item.category || '',
    },
    thumbnailUrl: item.thumbnailUrl || '',
    writerId: item.writer?.username || item.writer?.nickname || '',
    writer: item.writer ? {
      username: item.writer.username,
      nickname: item.writer.nickname,
      realname: item.writer.realname,
      profileImageUrl: item.writer.profileImageUrl,
    } : undefined,
    participantIds: [],
    tags: [],
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || item.createdAt || new Date().toISOString(),
    likeCount: item.likeCount || 0,
    viewCount: item.viewCount || 0,
  };
}

/** Fetch articles with pagination (page 0-based). Exported for "load more" on landing. */
export const fetchArticlesPage = async (page: number, size: number = PAGE_SIZE_ARTICLES): Promise<ArticlesPageResponse> => {
  try {
    const response = await fetch(
      `/api/articles/search?sortType=LATEST&page=${page}&size=${size}`,
      { method: 'GET', headers: { 'accept': 'application/json' } }
    );
    if (!response.ok) {
      console.error('Failed to fetch articles:', response.status);
      return { content: [], totalElements: 0, totalPages: 0 };
    }
    const data = await response.json();
    const content = (data.content || []).map(mapArticleFromApi);
    return {
      content,
      totalElements: data.totalElements ?? 0,
      totalPages: data.totalPages ?? 0,
    };
  } catch (error) {
    console.error('Error fetching articles page:', error);
    return { content: [], totalElements: 0, totalPages: 0 };
  }
};

// Fetch categories from API and transform to LandingTopic format
const fetchCategoriesForTopics = async (): Promise<LandingTopic[]> => {
  try {
    const response = await categoryService.getCategories();
    return response.categories.map((cat) => {
      const type = CategoryHelpers.getTypeByDisplayName(cat.name) || CategoryType.WEB_HACKING;
      const slug = CategorySlugs[type];
      return {
        id: `topic-${cat.id}`,
        name: cat.name,
        slug,
        description: cat.description || CategoryDescriptions[type],
        type,
        projectCount: 0,
        articleCount: 0,
        iconUrl: cat.iconUrl,
      };
    });
  } catch (error) {
    console.error('Error fetching categories for topics:', error);
    return [];
  }
};

export const useLandingData = (): LandingDataState => {
  const [state, setState] = useState<LandingDataState>({
    projects: [],
    articles: [],
    topics: [],
    totalProjectElements: 0,
    totalArticleElements: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const [projectsRes, articlesRes, topicsRes] = await Promise.all([
          fetchProjectsPage(0, PAGE_SIZE_PROJECTS),
          fetchArticlesPage(0, PAGE_SIZE_ARTICLES),
          fetchCategoriesForTopics(),
        ]);

        if (!isMounted) return;

        setState({
          projects: projectsRes.content,
          articles: articlesRes.content,
          topics: topicsRes,
          totalProjectElements: projectsRes.totalElements,
          totalArticleElements: articlesRes.totalElements,
          loading: false,
          error: null,
        });
      } catch (error) {
        if (!isMounted) return;
        console.error('Landing data load failed:', error);
        setState((prev) => ({ ...prev, loading: false, error: '데이터를 불러오는 중 오류가 발생했습니다.' }));
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
};