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
      { message: result.error ?? 'Failed to fetch profile', error: result.error ?? 'Failed to fetch profile' },
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

  // 이메일은 최초 설정 이후 변경 불가: 이미 이메일이 있는 경우, PATCH payload의 email 필드를 무시
  if (body && typeof body === 'object' && !Array.isArray(body)) {
    const record = body as Record<string, unknown>;
    if ('email' in record) {
      const currentProfile = await serverApiClient.request(USER_ENDPOINTS.USER.PROFILE, {
        method: 'GET',
        request,
      });

      const currentEmail =
        currentProfile.success &&
        currentProfile.data &&
        typeof (currentProfile.data as any).email === 'string'
          ? String((currentProfile.data as any).email).trim()
          : '';

      if (currentEmail !== '') {
        delete record.email;
      }
    }
  }

  const result = await serverApiClient.request(USER_ENDPOINTS.USER.UPDATE_USER, {
    method: 'PATCH',
    body,
    request,
  });

  if (!result.success) {
    return NextResponse.json(
      { message: result.error ?? 'Failed to update profile', error: result.error ?? 'Failed to update profile' },
      { status: result.status || 500 }
    );
  }

  return NextResponse.json(result.data ?? null, { status: 200 });
}
