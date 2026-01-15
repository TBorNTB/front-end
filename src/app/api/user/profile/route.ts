import { NextResponse } from 'next/server';

import { serverApiClient } from '@/lib/api/client-server';
import { USER_ENDPOINTS } from '@/lib/api/endpoints/user-endpoints';

export async function GET(request: Request) {
  const result = await serverApiClient.request(USER_ENDPOINTS.USER.PROFILE, {
    method: 'GET',
    request,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error ?? 'Failed to fetch profile' },
      { status: result.status || 500 }
    );
  }

  return NextResponse.json(result.data ?? null, { status: 200 });
}

export async function PATCH(request: Request) {
  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const result = await serverApiClient.request(USER_ENDPOINTS.USER.UPDATE_USER, {
    method: 'PATCH',
    body,
    request,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error ?? 'Failed to update profile' },
      { status: result.status || 500 }
    );
  }

  return NextResponse.json(result.data ?? null, { status: 200 });
}
