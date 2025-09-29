export type User = {
  id: string;
  name: string;
  nickname: string;
  profileImageUrl: string;
};

export type UserDetail = {
  id: string;
  name: string;
  profileImageUrl: string;
  projectCount: number;
  articleCount: number;
};

export type UserProfile = {
  name: string;
  nickname: string;
  email: string;
  description: string;
  techstack: string[];
  profileImageUrl: string;
  githubUrl?: string;
};
