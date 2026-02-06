import { NextResponse } from 'next/server';

import { serverApiClient } from '@/lib/api/client-server';
import { USER_ENDPOINTS } from '@/lib/api/endpoints/user-endpoints';

export async function GET(request: Request) {
  const url = new URL(request.url);

  const params = new URLSearchParams();
  const size = url.searchParams.get('size');
  const cursorAt = url.searchParams.get('cursorAt');
  const cursorRoomId = url.searchParams.get('cursorRoomId');

  if (size) params.set('size', size);
  if (cursorAt) params.set('cursorAt', cursorAt);
  if (cursorRoomId) params.set('cursorRoomId', cursorRoomId);

  const endpoint = params.size
    ? `${USER_ENDPOINTS.CHAT.GET_ROOMS}?${params.toString()}`
    : USER_ENDPOINTS.CHAT.GET_ROOMS;

  const result = await serverApiClient.request(endpoint, { method: 'GET', request });

  if (!result.success) {
    return NextResponse.json(
      { message: result.error ?? 'Failed to fetch chat rooms', error: result.error ?? 'Failed to fetch chat rooms' },
      { status: result.status || 500 }
    );
  }

  return NextResponse.json(result.data ?? null, { status: 200 });
}

export async function POST(request: Request) {
  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const result = await serverApiClient.request(USER_ENDPOINTS.CHAT.CREATE_ROOM, {
    method: 'POST',
    body,
    request,
  });

  if (!result.success) {
    return NextResponse.json(
      { message: result.error ?? 'Failed to create chat room', error: result.error ?? 'Failed to create chat room' },
      { status: result.status || 500 }
    );
  }

  return NextResponse.json(result.data ?? null, { status: 200 });
}
