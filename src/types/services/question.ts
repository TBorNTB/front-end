export type QuestionSearchStatus = 'ALL' | 'ANSWERED' | 'UNANSWERED' | 'ACCEPTED';

export type SortDirection = 'ASC' | 'DESC';

export interface OffsetSearchResponse<T> {
  message: string;
  page: number;
  totalPage: number;
  data: T[];
}

export interface QuestionSearchItem {
  id: number;
  title: string;
  description: string;
  username: string;
  nickname: string;
  realName: string;
  categories: string[];
  status: string;
  answerCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionDetail {
  id: number;
  title: string;
  description: string;
  content: string;
  username: string;
  nickname: string;
  realName: string;
  categories: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionUpsertRequest {
  title: string;
  categories: string[];
  description: string;
  content: string;
}

export interface AnswerItem {
  id: number;
  questionId: number;
  content: string;
  username: string;
  nickname: string;
  realName: string;
  accepted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnswerUpsertRequest {
  content: string;
}

export interface QuestionOffsetSearchParams {
  page: number;
  size: number;
  sortBy?: string;
  sortDirection?: SortDirection;
  status?: QuestionSearchStatus;
  categoryNames?: string[];
  keyword?: string;
}
