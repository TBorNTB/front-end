import { useEffect, useState } from 'react';
import { categoryService } from '@/lib/api/services/category-service';
import { CategoryType, CategorySlugs, CategoryDescriptions, CategoryHelpers } from '@/app/(main)/topics/types/category';
import { getProjects, getArticles, type Project, type Article, getCategories, type CategoryItem } from '@/lib/mock-data';

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
        const [projectsRes, articlesRes, categoriesRes] = await Promise.all([
          getProjects(),
          getArticles(),
          // categoryService already respects mock flag; fallback to mock getter if needed
          categoryService.getCategories().catch(async () => ({ categories: await getCategories() })),
        ]);

        if (!isMounted) return;

        const topics = mapCategoriesToTopics(categoriesRes.categories);

        setState({
          projects: projectsRes,
          articles: articlesRes,
          topics,
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