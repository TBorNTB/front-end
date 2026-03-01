import { NextResponse } from 'next/server';

import { serverApiClient } from '@/lib/api/client-server';
import { USER_ENDPOINTS } from '@/lib/api/endpoints/user-endpoints';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  let body: { roomName?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: 'Invalid JSON body', error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  const endpoint = USER_ENDPOINTS.CHAT.UPDATE_ROOM_NAME.replace(
    '{roomId}',
    encodeURIComponent(roomId)
  );

  const result = await serverApiClient.request(endpoint, {
    method: 'PUT',
    body: { roomName: body.roomName ?? '' },
    request,
  });

  if (!result.success) {
    return NextResponse.json(
      {
        message: result.error ?? 'Failed to update room name',
        error: result.error ?? 'Failed to update room name',
      },
      { status: result.status || 500 }
    );
  }

  return new NextResponse(null, { status: 204 });
}
