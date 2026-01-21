import { NextRequest, NextResponse } from 'next/server';
import { ELASTIC_ENDPOINTS, getElasticApiUrl } from '@/lib/api/endpoints';

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
    
    // Category: append if provided
    const category = searchParams.get('category');
    if (category && category.trim()) {
      queryParams.append('category', category.trim());
    }
    
    // Sort type: use sortType from request, default to LATEST
    const sortType = searchParams.get('sortType') || 'LATEST';
    queryParams.append('sortType', sortType);
    
    // Size and page: always include
    const size = searchParams.get('size') || '5';
    const page = searchParams.get('page') || '0';
    queryParams.append('size', size);
    queryParams.append('page', page);
    
    // Build URL for elastic service
    const elasticUrl = `${getElasticApiUrl(ELASTIC_ENDPOINTS.ELASTIC.ARTICLE_SEARCH)}?${queryParams.toString()}`;
    
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
      console.error(`CS Knowledge API error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        {
          content: [],
          page: parseInt(page) || 0,
          size: parseInt(size) || 5,
          totalElements: 0,
          totalPages: 0,
        },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching CS knowledge:', error);
    return NextResponse.json(
      {
        content: [],
        page: 0,
        size: 5,
        totalElements: 0,
        totalPages: 0,
      },
      { status: 500 }
    );
  }
}

