export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId?: string;
  projectCount: number;
  articleCount: number;
}

export interface Topic {
  id: string;
  name: string;
  slug: string;
  description: string;
  categories: Category[];
}