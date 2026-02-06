import { NextResponse } from 'next/server';

import { serverApiClient } from '@/lib/api/client-server';
import { USER_ENDPOINTS } from '@/lib/api/endpoints/user-endpoints';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  const url = new URL(request.url);

  const query = new URLSearchParams();
  const size = url.searchParams.get('size');
  const cursorId = url.searchParams.get('cursorId');

  if (size) query.set('size', size);
  if (cursorId) query.set('cursorId', cursorId);

  const backendPath = USER_ENDPOINTS.CHAT.GET_ROOM_CHAT.replace(
    '{roomId}',
    encodeURIComponent(roomId)
  );

  const endpoint = query.size ? `${backendPath}?${query.toString()}` : backendPath;

  const result = await serverApiClient.request(endpoint, { method: 'GET', request });

  if (!result.success) {
    return NextResponse.json(
      { message: result.error ?? 'Failed to fetch chat history', error: result.error ?? 'Failed to fetch chat history' },
      { status: result.status || 500 }
    );
  }

  return NextResponse.json(result.data ?? null, { status: 200 });
}
