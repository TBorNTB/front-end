import { NextResponse } from 'next/server';

import { BASE_URL } from '@/lib/api/config';
import { ARTICLE_ENDPOINTS } from '@/lib/api/endpoints/article-endpoints';

function extractAccessTokenFromCookieHeader(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)accessToken=([^;]+)/);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const cookieHeader = request.headers.get('cookie');
    const accessToken = extractAccessTokenFromCookieHeader(cookieHeader);

    if (!accessToken) {
      return NextResponse.json(
        { message: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const token = accessToken.trim();
    const authorizationValue = token.toLowerCase().startsWith('bearer ')
      ? token
      : `Bearer ${token}`;

    const endpoint = ARTICLE_ENDPOINTS.ARTICLE.DELETE.replace(':id', encodeURIComponent(id));
    const backendUrl = `${BASE_URL}${endpoint}`;

    const backendResponse = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        accept: '*/*',
        authorization: authorizationValue,
      },
      cache: 'no-store',
    });

    // No content
    if (backendResponse.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const buffer = await backendResponse.arrayBuffer();

    const headers = new Headers();
    const contentType = backendResponse.headers.get('content-type');
    if (contentType) headers.set('content-type', contentType);

    // If backend returns empty body for non-204, keep it empty.
    const body = buffer.byteLength > 0 ? buffer : null;

    return new NextResponse(body, {
      status: backendResponse.status,
      headers,
    });
  } catch (error) {
    console.error('[api/cs-knowledge/:id] DELETE error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
