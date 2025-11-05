import { NextResponse } from 'next/server';
import { BASE_URL, API_ENDPOINTS } from '@/lib/api/services/user-service';

export async function POST(request: Request) {
  try {
    // ✅ Forward cookies to backend for logout
    const cookieHeader = request.headers.get('cookie');

    const backendResponse = await fetch(`${BASE_URL}${API_ENDPOINTS.USERS.LOGOUT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(cookieHeader && { 'Cookie': cookieHeader }),
      },
    });

    const data = await backendResponse.json().catch(() => ({}));

    const response = NextResponse.json(data, {
      status: backendResponse.status,
    });

    // ✅ Forward cookie clearing headers
    const setCookieHeaders = backendResponse.headers.getSetCookie?.() || 
                           backendResponse.headers.get('set-cookie');
    
    if (setCookieHeaders) {
      if (Array.isArray(setCookieHeaders)) {
        setCookieHeaders.forEach(cookie => {
          response.headers.append('set-cookie', cookie);
        });
      } else {
        response.headers.set('set-cookie', setCookieHeaders);
      }
    }

    return response;

  } catch (error) {
    console.error("Logout API route error:", error);
    return NextResponse.json(
      { message: 'Logout completed' },
      { status: 200 }
    );
  }
}
