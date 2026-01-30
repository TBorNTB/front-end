import { NextResponse } from 'next/server';
import { BASE_URL } from '@/lib/api/config';
import { USER_ENDPOINTS} from '@/lib/api/endpoints/user-endpoints';

function clearAuthCookies(response: NextResponse) {
  const secure = process.env.NODE_ENV === 'production';
  const commonOptions = {
    httpOnly: true,
    secure,
    sameSite: 'lax' as const,
    expires: new Date(0),
  };

  // Cookies can exist with different Path values (e.g. '/api/auth' if Set-Cookie had no Path).
  // Expire across common paths to avoid leftover cookies that keep /api/auth/* authenticated.
  const paths = ['/', '/api', '/api/auth'];
  const names = ['accessToken', 'refreshToken', 'keepSignedIn'] as const;

  for (const name of names) {
    for (const path of paths) {
      response.cookies.set(name, '', { ...commonOptions, path });
    }
  }
}

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

    clearAuthCookies(response);

    console.log('Logout completed, cookies cleared');
    return response;

  } catch (error) {
    console.error('Logout error:', error);

    // 백엔드 실패해도 쿠키 삭제하고 성공 반환
    const response = NextResponse.json({ message: 'Logout completed' }, { status: 200 });
    clearAuthCookies(response);
    return response;
  }
}
