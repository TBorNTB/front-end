import { NextResponse } from 'next/server';
import { BASE_URL } from '@/lib/api/config';
import { USER_ENDPOINTS} from '@/lib/api/endpoints/user-endpoints';

export async function POST(request: Request) {
  console.log('Logout API route called');
  try {
    const cookieHeader = request.headers.get('cookie');
    console.log('Cookies sent to backend:', cookieHeader);

    const backendUrl = `${BASE_URL}${USER_ENDPOINTS.USER.LOGOUT}`;
    console.log('Calling backend:', backendUrl);

    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
    });

    console.log('Backend response status:', backendResponse.status);

    const data = await backendResponse.json().catch(() => ({ message: 'Logout successful' }));
    console.log('Backend response data:', data);

    // Always clear cookies and return success, regardless of backend status
    const response = NextResponse.json(
      { message: 'Logout successful', ...data }, 
      { status: 200 }
    );

    // 모든 인증 관련 쿠키 삭제
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    response.cookies.delete('keepSignedIn');

    console.log('Logout completed, cookies cleared');
    return response;

  } catch (error) {
    console.error('Logout error:', error);

    // 백엔드 실패해도 쿠키 삭제하고 성공 반환
    const response = NextResponse.json({ message: 'Logout completed' }, { status: 200 });
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    response.cookies.delete('keepSignedIn');
    return response;
  }
}
