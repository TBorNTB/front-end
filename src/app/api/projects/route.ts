import { NextRequest, NextResponse } from 'next/server';
import { getProjectApiUrl } from '@/lib/api/endpoints/project-endpoints';

/**
 * Direct API route to fetch projects from project-service
 * This bypasses Elasticsearch and gets data directly from the database
 */
export async function GET(request: NextRequest) {
  try {
    // Build URL for project service
    const url = getProjectApiUrl('/project-service/projects');
    
    console.log('[/api/projects/list] Fetching from:', url);
    
    // Forward cookies for authentication
    const cookies = request.cookies.toString();
    
    // Forward request to project service
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Cookie': cookies,
      },
      credentials: 'include',
      cache: 'no-store',
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`Project service error: ${response.status} ${response.statusText}`, errorText);
      
      return NextResponse.json(
        {
          projects: [],
          error: `API error: ${response.status}`,
        },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log('[/api/projects/list] Response:', {
      count: Array.isArray(data) ? data.length : data.projects?.length || 0,
    });
    
    // Ensure consistent response format
    const projects = Array.isArray(data) ? data : data.projects || [];
    
    return NextResponse.json({ projects, count: projects.length }, { status: 200 });
  } catch (error) {
    console.error('Error in projects list API route:', error);
    return NextResponse.json(
      {
        projects: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
