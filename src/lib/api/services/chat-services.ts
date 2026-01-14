'use client';

import { getApiUrl } from '@/lib/api/config';
import { USER_ENDPOINTS } from '@/lib/api/endpoints/user-endpoints';

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

// Chat room types
export interface ChatRoomResponse {
  roomId: string;
  roomName: string | null;
}

export interface CreateOneOnOneChatRequest {
  friendUsername: string;
}

export interface CreateGroupChatRequest {
  roomName: string;
  friendsUsername: string[];
}

// Get all chat rooms for the current user
export const getChatRooms = async (): Promise<ChatRoomResponse[]> => {
  const url = getApiUrl(USER_ENDPOINTS.CHAT.GET_ROOMS);
  const token = getAccessToken();

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch chat rooms: ${response.status} - ${errorText}`);
  }

  return response.json();
};

// Create 1:1 chat room
export const createOneOnOneChat = async (data: CreateOneOnOneChatRequest): Promise<ChatRoomResponse> => {
  const url = getApiUrl(USER_ENDPOINTS.CHAT.CREATE_ROOM);
  const token = getAccessToken();

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create chat room: ${response.status} - ${errorText}`);
  }

  return response.json();
};

// Create group chat room
export const createGroupChat = async (data: CreateGroupChatRequest): Promise<ChatRoomResponse> => {
  const url = getApiUrl(USER_ENDPOINTS.CHAT.CREATE_GROUP_ROOM);
  const token = getAccessToken();

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create group chat room: ${response.status} - ${errorText}`);
  }

  return response.json();
};

