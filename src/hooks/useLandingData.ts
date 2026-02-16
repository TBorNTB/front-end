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
}

interface LandingDataState {
  projects: Project[];
  articles: Article[];
  topics: LandingTopic[];
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
    };
  });
};

// Fetch latest projects from API
const fetchLatestProjects = async (): Promise<Project[]> => {
  try {
    const response = await fetch('/api/projects/search?projectSortType=LATEST&size=5&page=0', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch latest projects:', response.status);
      return [];
    }

    const data = await response.json();
    // Transform API response to Project format
    return (data.content || []).map((item: any) => ({
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
      // Include owner and collaborators information
      owner: item.owner || null,
      collaborators: item.collaborators || [],
    }));
  } catch (error) {
    console.error('Error fetching latest projects:', error);
    return [];
  }
};

// Fetch latest CS knowledge articles from API
const fetchLatestArticles = async (): Promise<Article[]> => {
  try {
    const response = await fetch('/api/articles/search?sortType=LATEST&page=0&size=10', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch latest articles:', response.status);
      return [];
    }

    const data = await response.json();
    // Transform CS Knowledge API response to Article format
    // CS Knowledge API returns items with title, content, category, writer, etc.
    return (data.content || []).map((item: any) => ({
      topicSlug: (item.category || '').toLowerCase().replace('_', '-'),
      id: String(item.id),
      content: {
        title: item.title || '',
        summary: item.description || item.content?.substring(0, 150) || item.content || '', // 요약: description 우선
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
    }));
  } catch (error) {
    console.error('Error fetching latest articles:', error);
    return [];
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
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        console.log('useLandingData: Starting load...');
        const [projectsRes, articlesRes, topicsRes] = await Promise.all([
          fetchLatestProjects(),
          fetchLatestArticles(),
          fetchCategoriesForTopics(),
        ]);

        console.log('useLandingData: Loaded data', {
          projects: projectsRes.length,
          articles: articlesRes.length,
          topics: topicsRes?.length || 0
        });
        console.log('Topics data:', topicsRes);

        if (!isMounted) return;

        setState({
          projects: projectsRes,
          articles: articlesRes,
          topics: topicsRes,
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