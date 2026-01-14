import { NextResponse } from 'next/server';
import { BASE_URL } from '@/lib/api/config';
import { USER_ENDPOINTS} from '@/lib/api/endpoints/user-endpoints';

export async function POST(request: Request) {
  try {
    // ✅ Forward cookies to backend for logout
    const cookieHeader = request.headers.get('cookie');

    console.log('🔓 Logging out user...');
    
    const backendResponse = await fetch(`${BASE_URL}${USER_ENDPOINTS.USER.LOGOUT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(cookieHeader && { 'Cookie': cookieHeader }),
      },
      credentials: 'include', //Send cookies to backend
    });

    console.log('📡 Logout Response Status:', backendResponse.status);

    // Parse response (backend might return empty body)
    const data = await backendResponse.json().catch(() => ({ message: 'Logout successful' }));

    const response = NextResponse.json(data, {
      status: backendResponse.status,
    });

    // ✅ Clear cookies (프론트에서 직접 삭제)
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');

    console.log('✅ Logout successful, cookies cleared');
    return response;

  } catch (error) {
    console.error("❌ Logout API route error:", error);

    // ✅ Even if backend fails, clear cookies and return success
    const response = NextResponse.json(
      { message: 'Logout completed' },
      { status: 200 }
    );
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    return response;
  }
}
