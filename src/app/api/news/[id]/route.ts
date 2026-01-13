import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/api/config';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'News ID is required' },
        { status: 400 }
      );
    }

    // Build URL for project service news API
    const newsUrl = `${getApiUrl(`/project-service/news/${id}`)}`;
    
    // Forward request to project service
    const response = await fetch(newsUrl, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
      credentials: 'include',
      cache: 'no-store',
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`News API error: ${response.status} ${response.statusText}`, errorText);
      
      return NextResponse.json(
        { error: `API error: ${response.status}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error in news detail API route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'News ID is required' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.title || !body.summary || !body.content || !body.category) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
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
    const newsUrl = getApiUrl(`/project-service/news/${id}`);
    
    // Forward request to project service
    const response = await fetch(newsUrl, {
      method: 'PUT',
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
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`News update API error: ${response.status} ${response.statusText}`, errorText);
      
      return NextResponse.json(
        { error: `API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error in news update API route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'News ID is required' },
        { status: 400 }
      );
    }

    // Get access token from cookies
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    // Build URL for project service news API
    const newsUrl = getApiUrl(`/project-service/news/${id}`);
    
    // Forward request to project service
    const response = await fetch(newsUrl, {
      method: 'DELETE',
      headers: {
        'accept': '*/*',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      },
      credentials: 'include',
      cache: 'no-store',
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`News delete API error: ${response.status} ${response.statusText}`, errorText);
      
      return NextResponse.json(
        { error: `API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }
    
    return NextResponse.json({ message: 'News deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error in news delete API route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

