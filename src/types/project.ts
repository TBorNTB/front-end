import { Category } from "./category";
import { User } from "./user";

export type ProjectC = {
  id: string;
  projectTitle: string;
  projectSummary: string;
  collaborators: User[];
  projectThumbNailUrl: string;
  categories: Category[];
  tags: string[];
};
