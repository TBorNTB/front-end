import { Category } from "./category";

export type Article = {
  id: string;
  title: string;
  categories: Category[];
  tags: string[];
  description: string;
  authorName: string;
  thumbnailUrl: string;
  authorProfileImageUrl: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
};
