import { NextResponse } from 'next/server';

import { serverApiClient } from '@/lib/api/client-server';
import { USER_ENDPOINTS } from '@/lib/api/endpoints/user-endpoints';

export async function GET(request: Request) {
  const result = await serverApiClient.request(USER_ENDPOINTS.USER.ACTIVITY_STATS, {
    method: 'GET',
    request,
  });

  if (!result.success) {
    return NextResponse.json(
      { message: result.error ?? 'Failed to fetch activity stats', error: result.error ?? 'Failed to fetch activity stats' },
      { status: result.status || 500 }
    );
  }

  return NextResponse.json(result.data ?? null, { status: 200 });
}
