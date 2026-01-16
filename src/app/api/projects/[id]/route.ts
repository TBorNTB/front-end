import { NextRequest, NextResponse } from 'next/server';
import { PROJECT_ENDPOINTS, getProjectApiUrl } from '@/lib/api/endpoints/project-endpoints';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 실제 프로젝트 서비스 API 호출
    const endpoint = PROJECT_ENDPOINTS.PROJECT.GET_BY_ID.replace(':id', String(id));
    const url = getProjectApiUrl(endpoint);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`Project API error: ${response.status} ${response.statusText}`, errorText);
      
      return NextResponse.json(
        { message: '프로젝트를 찾을 수 없습니다.' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { message: '프로젝트를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
