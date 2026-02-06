import { NextRequest, NextResponse } from 'next/server';
import { ELASTIC_ENDPOINTS, getElasticApiUrl } from '@/lib/api/endpoints';
import { extractMessageFromPayload, readJsonOrText } from '@/lib/api/route-utils';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Build query parameters for elastic service
    const queryParams = new URLSearchParams();
    
    // Keyword: only append if provided and not empty
    const keyword = searchParams.get('keyword');
    if (keyword && keyword.trim() && keyword.trim() !== ' ') {
      queryParams.append('keyword', keyword.trim());
    }
    
    // Category: append if provided (default to MT for member news)
    const category = searchParams.get('category') || 'MT';
    queryParams.append('category', category);
    
    // Sort type: use postSortType from request, default to LATEST
    const postSortType = searchParams.get('postSortType') || 'LATEST';
    queryParams.append('postSortType', postSortType);
    
    // Size and page: always include
    const size = searchParams.get('size') || '6';
    const page = searchParams.get('page') || '0';
    queryParams.append('size', size);
    queryParams.append('page', page);
    
    // Build URL for elastic service
    const elasticUrl = `${getElasticApiUrl(ELASTIC_ENDPOINTS.ELASTIC.NEWS_SEARCH)}?${queryParams.toString()}`;
    
    // Forward request to elastic service
    const response = await fetch(elasticUrl, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
      credentials: 'include',
      cache: 'no-store',
    });
    
    if (!response.ok) {
      const payload = await readJsonOrText(response);
      const message = extractMessageFromPayload(payload, `API error: ${response.status}`);
      console.error(`Elastic service error: ${response.status} ${response.statusText}`, message);
      
      return NextResponse.json(
        {
          content: [],
          page: parseInt(page),
          size: parseInt(size),
          totalElements: 0,
          totalPages: 0,
          message,
          error: message,
        },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error in news search API route:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        content: [],
        page: 0,
        size: 6,
        totalElements: 0,
        totalPages: 0,
        message,
        error: message,
      },
      { status: 500 }
    );
  }
}

