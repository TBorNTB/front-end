import { NextRequest, NextResponse } from 'next/server';
import { BASE_URL } from '@/lib/api/config';

/**
 * 저자의 다른 글 조회 (CS 지식 username별 목록)
 * GET /api/articles/by-user/[username]?size=4&page=0
 * 백엔드: elastic-service/api/elastic/csknowledge/user/:username
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await context.params;
    const searchParams = request.nextUrl.searchParams;
    const size = searchParams.get('size') || '10';
    const page = searchParams.get('page') || '0';

    if (!username || !username.trim()) {
      return NextResponse.json(
        { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 },
        { status: 200 }
      );
    }

    const backendPath = `/elastic-service/api/elastic/csknowledge/user/${encodeURIComponent(username.trim())}`;
    const url = `${BASE_URL}${backendPath}?size=${size}&page=${page}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`Articles by user API error: ${response.status} ${response.statusText} for username=${username}`);
      return NextResponse.json(
        {
          content: [],
          page: parseInt(page, 10) || 0,
          size: parseInt(size, 10) || 10,
          totalElements: 0,
          totalPages: 0,
        },
        { status: 200 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in articles by-user API:', error);
    return NextResponse.json(
      {
        content: [],
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0,
      },
      { status: 200 }
    );
  }
}
