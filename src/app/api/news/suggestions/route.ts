import { NextRequest, NextResponse } from 'next/server';
import { ELASTIC_ENDPOINTS, getElasticApiUrl } from '@/lib/api/endpoints';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    
    if (!query || !query.trim()) {
      return NextResponse.json([], { status: 200 });
    }
    
    // Build URL for elastic service suggestion API
    const elasticUrl = `${getElasticApiUrl(ELASTIC_ENDPOINTS.ELASTIC.NEWS_SUGGESTION)}?query=${encodeURIComponent(query.trim())}`;
    
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
      console.error(`Elastic service suggestion error: ${response.status} ${response.statusText}`);
      return NextResponse.json([], { status: 200 });
    }
    
    const data = await response.json();
    
    // Ensure it's an array and limit to 5 items
    const suggestions = Array.isArray(data) ? data.slice(0, 5) : [];
    
    return NextResponse.json(suggestions, { status: 200 });
  } catch (error) {
    console.error('Error in news suggestions API route:', error);
    return NextResponse.json([], { status: 200 });
  }
}

