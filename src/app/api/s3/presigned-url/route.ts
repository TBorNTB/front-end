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

  const result = await serverApiClient.request(USER_ENDPOINTS.S3.PRESIGNED_URL, {
    method: 'POST',
    body,
    request,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error ?? 'Failed to get presigned URL' },
      { status: result.status || 500 }
    );
  }

  return NextResponse.json(result.data ?? null, { status: 200 });
}
