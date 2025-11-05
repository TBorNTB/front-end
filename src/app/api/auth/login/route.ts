//src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { BASE_URL, API_ENDPOINTS } from '@/lib/api/services/user-service'; 

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Call the backend login API
    const backendResponse = await fetch(`${BASE_URL}${API_ENDPOINTS.USERS.LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json();

    // Create response
    const response = NextResponse.json(data, {
      status: backendResponse.status,
    });

    // ✅ FIX: Properly forward ALL Set-Cookie headers
    const setCookieHeaders = backendResponse.headers.getSetCookie?.() || 
                           backendResponse.headers.get('set-cookie');
    
    if (setCookieHeaders) {
      if (Array.isArray(setCookieHeaders)) {
        // ✅ Multiple cookies - set each one separately
        setCookieHeaders.forEach(cookie => {
          response.headers.append('set-cookie', cookie);
        });
      } else {
        // ✅ Single cookie string
        response.headers.set('set-cookie', setCookieHeaders);
      }
    }

    return response;

  } catch (error) {
    console.error("Login API route error:", error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
