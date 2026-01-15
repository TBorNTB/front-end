import { NextResponse } from 'next/server';

import { serverApiClient } from '@/lib/api/client-server';
import { USER_ENDPOINTS } from '@/lib/api/endpoints/user-endpoints';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;

  const endpoint = USER_ENDPOINTS.CHAT.READ_ROOM.replace(
    '{roomId}',
    encodeURIComponent(roomId)
  );

  const result = await serverApiClient.request(endpoint, { method: 'PUT', request });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error ?? 'Failed to mark room as read' },
      { status: result.status || 500 }
    );
  }

  return NextResponse.json(result.data ?? null, { status: 200 });
}
