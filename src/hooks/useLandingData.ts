import { useEffect, useState } from 'react';
import { categoryService } from '@/lib/api/services/category-service';
import { CategoryType, CategorySlugs, CategoryDescriptions, CategoryHelpers } from '@/types/services/category';
import { getProjects, getArticles, getCategories, getTopics, type Project, type Article, type CategoryItem } from '@/lib/mock-data';

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
  topics: LandingTopic[]; // Same structure as Topic from mock-data
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
          getProjects(),
          getArticles(),
          getTopics(),
        ]);

        console.log('useLandingData: Loaded data', {
          projects: projectsRes.length,
          articles: articlesRes.length,
          topics: topicsRes?.length || 0
        });
        console.log('Topics data:', topicsRes);

        if (!isMounted) return;

        // topicsRes should already be LandingTopic[] compatible
        setState({
          projects: projectsRes,
          articles: articlesRes,
          topics: topicsRes as LandingTopic[],
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