import { NextRequest, NextResponse } from 'next/server';
import { ELASTIC_ENDPOINTS, getElasticApiUrl } from '@/lib/api/endpoints';
import { extractMessageFromPayload, readJsonOrText } from '@/lib/api/route-utils';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Build query parameters for elastic service
    const queryParams = new URLSearchParams();
    
    // Query: only append if provided and not empty
    const query = searchParams.get('query');
    if (query && query.trim() && query.trim() !== ' ') {
      queryParams.append('query', query.trim());
    }
    
    // Project status: accept both projectStatus/status and comma-separated values
    const rawStatuses = [
      ...searchParams.getAll('projectStatus'),
      ...searchParams.getAll('status'),
    ];

    const normalizedStatuses = rawStatuses
      .flatMap(value => value.split(','))
      .map(value => value.trim())
      .filter(Boolean);

    normalizedStatuses.forEach(status => {
      // Keep both keys for compatibility with elastic-service versions
      queryParams.append('projectStatus', status);
      queryParams.append('status', status);
    });
    
    // Categories: append each separately if provided
    const categories = searchParams.getAll('categories');
    categories.forEach(cat => {
      if (cat && cat.trim()) {
        queryParams.append('categories', cat.trim());
      }
    });
    
    // Sort type: use projectSortType from request, default to LATEST
    const projectSortType = searchParams.get('projectSortType') || 'LATEST';
    queryParams.append('postSortType', projectSortType);
    
    // Size and page: always include
    const size = searchParams.get('size') || '12';
    const page = searchParams.get('page') || '0';
    queryParams.append('size', size);
    queryParams.append('page', page);
    
    // Build URL for elastic service
    const elasticUrl = `${getElasticApiUrl(ELASTIC_ENDPOINTS.ELASTIC.PROJECT_SEARCH)}?${queryParams.toString()}`;
    
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
    console.error('Error in projects search API route:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        content: [],
        page: 0,
        size: 12,
        totalElements: 0,
        totalPages: 0,
        message,
        error: message,
      },
      { status: 500 }
    );
  }
}

