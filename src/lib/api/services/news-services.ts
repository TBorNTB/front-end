import { getApiUrl } from '../config';
import { fetchWithRefresh } from '@/lib/api/fetch-with-refresh';

// News creation types
export interface CreateNewsRequest {
  title: string;
  summary: string;
  content: string;
  category: string;
  participantIds?: string[];
  tags?: string[];
  thumbnailPath?: string;
}

export interface CreateNewsResponse {
  id: number;
  title: string;
  summary: string;
  content: string;
  category: string;
  thumbnailPath?: string;
  writerId: string;
  writerNickname: string;
  participantIds: string[];
  participantNicknames: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateNewsRequest {
  title: string;
  summary: string;
  content: string;
  category: string;
  participantIds?: string[];
  tags?: string[];
  thumbnailPath?: string;
}

export interface UpdateNewsResponse {
  id: number;
  title: string;
  summary: string;
  content: string;
  category: string;
  thumbnailPath?: string;
  writerId: string;
  writerNickname: string;
  participantIds: string[];
  participantNicknames: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Create a news item
export const createNews = async (data: CreateNewsRequest): Promise<CreateNewsResponse> => {
  const url = getApiUrl('/project-service/news');

  // Only include thumbnailPath if it has a value
  const requestBody: any = {
    title: data.title,
    summary: data.summary,
    content: data.content,
    category: data.category,
    participantIds: data.participantIds || [],
    tags: data.tags || [],
  };

  if (data.thumbnailPath && data.thumbnailPath.trim()) {
    requestBody.thumbnailPath = data.thumbnailPath;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create news: ${response.status} - ${errorText}`);
  }

  return response.json();
};

// Update a news item
export const updateNews = async (
  id: string | number,
  data: UpdateNewsRequest
): Promise<UpdateNewsResponse> => {
  const url = getApiUrl(`/project-service/news/${id}`);

  // Only include thumbnailPath if it has a value
  const requestBody: any = {
    title: data.title,
    summary: data.summary,
    content: data.content,
    category: data.category,
    participantIds: data.participantIds || [],
    tags: data.tags || [],
  };

  if (data.thumbnailPath && data.thumbnailPath.trim()) {
    requestBody.thumbnailPath = data.thumbnailPath;
  }

  const response = await fetchWithRefresh(url, {
    method: 'PUT',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update news: ${response.status} - ${errorText}`);
  }

  return response.json();
};

// Delete a news item
export const deleteNews = async (id: string | number): Promise<void> => {
  const url = getApiUrl(`/project-service/news/${id}`);

  const response = await fetchWithRefresh(url, {
    method: 'DELETE',
    headers: {
      'accept': '*/*',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete news: ${response.status} - ${errorText}`);
  }
};

