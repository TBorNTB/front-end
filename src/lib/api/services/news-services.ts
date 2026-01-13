import { getApiUrl } from '../config';

// Get access token from cookies
const getAccessToken = (): string | null => {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'accessToken') {
      return decodeURIComponent(value);
    }
  }
  return null;
};

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
  const token = getAccessToken();

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
      ...(token && { 'Authorization': `Bearer ${token}` }),
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
  const token = getAccessToken();

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
    method: 'PUT',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
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
  const token = getAccessToken();

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'accept': '*/*',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete news: ${response.status} - ${errorText}`);
  }
};

