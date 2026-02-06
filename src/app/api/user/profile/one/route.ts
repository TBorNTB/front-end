import { NextResponse } from 'next/server';

import { serverApiClient } from '@/lib/api/client-server';
import { USER_ENDPOINTS } from '@/lib/api/endpoints/user-endpoints';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const username = url.searchParams.get('username');

  if (!username) {
    return NextResponse.json(
      { message: 'username is required', error: 'username is required' },
      { status: 400 }
    );
  }

  const endpoint = `${USER_ENDPOINTS.USER.PROFILE_ONE}?username=${encodeURIComponent(username)}`;

  const result = await serverApiClient.request(endpoint, {
    method: 'GET',
    request,
    requireAuth: false,
  });

  if (!result.success) {
    return NextResponse.json(
      { message: result.error ?? 'Failed to fetch profile', error: result.error ?? 'Failed to fetch profile' },
      { status: result.status || 500 }
    );
  }

  return NextResponse.json(result.data ?? null, { status: 200 });
}
