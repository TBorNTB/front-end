import { NextResponse } from 'next/server';

import { serverApiClient } from '@/lib/api/client-server';
import { USER_ENDPOINTS } from '@/lib/api/endpoints/user-endpoints';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;

  const endpoint = USER_ENDPOINTS.CHAT.LEAVE_ROOM.replace(
    '{roomId}',
    encodeURIComponent(roomId)
  );

  const result = await serverApiClient.request(endpoint, { method: 'DELETE', request });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error ?? 'Failed to leave chat room' },
      { status: result.status || 500 }
    );
  }

  return NextResponse.json(result.data ?? null, { status: 200 });
}
