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
export interface ChatRoomMemberResponse {
  username: string;
  nickname: string;
  realName: string;
  thumbnailUrl?: string | null;
}

export interface ChatRoomResponse {
  roomId: string;
  roomName: string;
  lastMessageAt: string;
  memberCount: number;
  unreadCount: number;
  lastMessage: string;
  lastMessageImageUrl?: string | null;
  lastSenderUsername: string;
  lastSenderNickname: string;
  lastSenderRealName: string;
  lastSenderThumbnailUrl?: string | null;
  members: ChatRoomMemberResponse[];
}

export interface ChatRoomsCursorPage {
  items: ChatRoomResponse[];
  cursorAt?: string | null;
  cursorRoomId?: string | null;
  nextCursorAt?: string | null;
  nextCursorRoomId?: string | null;
}

export interface CreateChatRoomResponse {
  roomId: string;
  roomName: string;
}

export interface CreateGroupChatRequest {
  roomName: string;
  friendsUsername: string[];
}

// Chat history types
export interface ChatHistoryItem {
  message: string;
  senderNickname: string;
  senderUsername: string;
  senderThumbnailUrl?: string | null;
  createdAt: string;
  imageUrl?: string | null;
}

export interface ChatHistoryResponse {
  items: ChatHistoryItem[];
  cursorId: number;
  nextCursorId: number;
}

export interface LeaveChatRoomResponse {
  roomId: string;
  content: string;
}

export interface MarkRoomReadResponse {
  roomId: string;
  unreadCount: number;
  lastReadMessageId: number;
}

// Get chat rooms for the current user (cursor pagination)
// GET /user-service/chat/rooms?size=5&cursorAt=...&cursorRoomId=...
export const getChatRooms = async (
  params: { size?: number; cursorAt?: string; cursorRoomId?: string } = {}
): Promise<ChatRoomsCursorPage> => {
  const { size = 5, cursorAt, cursorRoomId } = params;
  const urlObj = new URL(getApiUrl(USER_ENDPOINTS.CHAT.GET_ROOMS));
  urlObj.searchParams.set('size', String(size));
  if (cursorAt) urlObj.searchParams.set('cursorAt', cursorAt);
  if (cursorRoomId) urlObj.searchParams.set('cursorRoomId', cursorRoomId);

  const token = getAccessToken();

  const response = await fetch(urlObj.toString(), {
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

  const data = (await response.json().catch(() => null)) as any;

  return {
    items: Array.isArray(data?.items) ? data.items : [],
    cursorAt: typeof data?.cursorAt === 'string' ? data.cursorAt : null,
    cursorRoomId: typeof data?.cursorRoomId === 'string' ? data.cursorRoomId : null,
    nextCursorAt: typeof data?.nextCursorAt === 'string' ? data.nextCursorAt : null,
    nextCursorRoomId: typeof data?.nextCursorRoomId === 'string' ? data.nextCursorRoomId : null,
  };
};

// Create group chat room
export const createGroupChat = async (data: CreateGroupChatRequest): Promise<CreateChatRoomResponse> => {
  // 최신 스펙: POST /user-service/chat/rooms
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
    throw new Error(`Failed to create group chat room: ${response.status} - ${errorText}`);
  }

  return response.json();
};

// Get chat messages in a room (cursor pagination)
// GET /user-service/chat/rooms/{roomId}/chat?size=10&cursorId=...
export const getRoomChatHistory = async (
  roomId: string,
  params: { cursorId?: number; size?: number } = {}
): Promise<ChatHistoryResponse> => {
  const { cursorId, size = 10 } = params;
  const endpoint = USER_ENDPOINTS.CHAT.GET_ROOM_CHAT.replace('{roomId}', encodeURIComponent(roomId));
  const urlObj = new URL(getApiUrl(endpoint));
  urlObj.searchParams.set('size', String(size));
  if (cursorId !== undefined) {
    urlObj.searchParams.set('cursorId', String(cursorId));
  }

  const token = getAccessToken();
  const response = await fetch(urlObj.toString(), {
    method: 'GET',
    headers: {
      accept: 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    credentials: 'include',
  });

  const data = (await response.json().catch(() => null)) as any;
  if (!response.ok) {
    const errorText = typeof data === 'string' ? data : JSON.stringify(data);
    throw new Error(`Failed to fetch chat history: ${response.status} - ${errorText}`);
  }

  return {
    items: Array.isArray(data?.items) ? data.items : [],
    cursorId: typeof data?.cursorId === 'number' ? data.cursorId : 0,
    nextCursorId: typeof data?.nextCursorId === 'number' ? data.nextCursorId : 0,
  };
};

// Leave chat room
// DELETE /user-service/chat/room/{roomId}
export const leaveChatRoom = async (roomId: string): Promise<LeaveChatRoomResponse> => {
  const endpoint = USER_ENDPOINTS.CHAT.LEAVE_ROOM.replace('{roomId}', encodeURIComponent(roomId));
  const url = getApiUrl(endpoint);
  const token = getAccessToken();

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      accept: 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    credentials: 'include',
  });

  const data = (await response.json().catch(() => null)) as any;
  if (!response.ok) {
    const errorText = typeof data === 'string' ? data : JSON.stringify(data);
    throw new Error(`Failed to leave chat room: ${response.status} - ${errorText}`);
  }

  return {
    roomId: data?.roomId ?? roomId,
    content: data?.content ?? '채팅방을 나갔습니다.',
  };
};

// Mark chat room as read
// PUT /user-service/chat/rooms/{roomId}/read
export const markChatRoomAsRead = async (roomId: string): Promise<MarkRoomReadResponse> => {
  const endpoint = USER_ENDPOINTS.CHAT.READ_ROOM.replace('{roomId}', encodeURIComponent(roomId));
  const url = getApiUrl(endpoint);
  const token = getAccessToken();

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      accept: 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    credentials: 'include',
  });

  const data = (await response.json().catch(() => null)) as any;
  if (!response.ok) {
    const errorText = typeof data === 'string' ? data : JSON.stringify(data);
    throw new Error(`Failed to mark room as read: ${response.status} - ${errorText}`);
  }

  return {
    roomId: data?.roomId ?? roomId,
    unreadCount: typeof data?.unreadCount === 'number' ? data.unreadCount : 0,
    lastReadMessageId: typeof data?.lastReadMessageId === 'number' ? data.lastReadMessageId : 0,
  };
};

