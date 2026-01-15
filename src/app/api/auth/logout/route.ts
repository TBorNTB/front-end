import { NextResponse } from 'next/server';
import { BASE_URL } from '@/lib/api/config';
import { USER_ENDPOINTS} from '@/lib/api/endpoints/user-endpoints';

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie');

    const backendResponse = await fetch(`${BASE_URL}${USER_ENDPOINTS.USER.LOGOUT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
    });

    const data = await backendResponse.json().catch(() => ({ message: 'Logout successful' }));

    const response = NextResponse.json(data, {
      status: backendResponse.status,
    });

    // 모든 인증 관련 쿠키 삭제
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    response.cookies.delete('keepSignedIn');

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
