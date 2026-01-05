// src/types/landing-types.ts
export interface FeaturedProject {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  technologies: string[];
  thumbnailImage: string;
  viewText: string;
  likes?: number;
  views?: number;
}

export interface ProjectCardData {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string;
  collaborators: { profileImage: string }[];
  likes: number;
  views?: number;
  techStacks?: string[];
}

export interface ArticleCardData {
  id: string;
  title: string;
  description: string;
  author: {
    name: string;
    profileImage: string;
  };
  category: string;
  thumbnailImage: string;
  likes: number;
  views: number;
  tags?: string[];
}
