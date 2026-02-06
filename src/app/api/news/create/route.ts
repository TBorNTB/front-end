import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/api/config';
import { cookies } from 'next/headers';
import { nextErrorFromBackendResponse } from '@/lib/api/route-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.summary || !body.content || !body.category) {
      return NextResponse.json(
        { message: '필수 필드가 누락되었습니다.', error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // Get access token from cookies
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    // Build request body (only include thumbnailPath if it has a value)
    const requestBody: any = {
      title: body.title,
      summary: body.summary,
      content: body.content,
      category: body.category,
      participantIds: body.participantIds || [],
      tags: body.tags || [],
    };

    if (body.thumbnailPath && body.thumbnailPath.trim()) {
      requestBody.thumbnailPath = body.thumbnailPath;
    }

    // Build URL for project service news API
    const newsUrl = getApiUrl('/project-service/news');
    
    // Forward request to project service
    const response = await fetch(newsUrl, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      },
      credentials: 'include',
      cache: 'no-store',
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      console.error(`News create API error: ${response.status} ${response.statusText}`);
      return nextErrorFromBackendResponse(response, '뉴스 생성에 실패했습니다.');
    }
    
    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in news create API route:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unknown error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

