import { NextResponse } from 'next/server';

import { serverApiClient } from '@/lib/api/client-server';
import { USER_ENDPOINTS } from '@/lib/api/endpoints/user-endpoints';

export async function POST(request: Request) {
  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ message: '요청 본문이 올바르지 않습니다.' }, { status: 400 });
  }

  const { requestRole } = body as { requestRole?: unknown };
  if (typeof requestRole !== 'string' || requestRole.trim() === '') {
    return NextResponse.json({ message: 'requestRole 값이 필요합니다.' }, { status: 400 });
  }

  const result = await serverApiClient.request<string>(USER_ENDPOINTS.USER.ROLE_REQUEST, {
    method: 'POST',
    body: { requestRole: requestRole.trim() },
    request,
  });

  if (!result.success) {
    return NextResponse.json(
      { message: result.error ?? '권한 요청에 실패했습니다.', error: result.error ?? '권한 요청에 실패했습니다.' },
      { status: result.status || 500 }
    );
  }

  return NextResponse.json(result.data ?? 'OK', { status: 200 });
}
