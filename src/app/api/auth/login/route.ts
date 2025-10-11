//src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { BASE_URL, API_ENDPOINTS } from '@/lib/endpoints'; // Updated import

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

    // Forward all Set-Cookie headers (including HttpOnly cookies)
    const setCookieHeader = backendResponse.headers.get('set-cookie');
    if (setCookieHeader) {
      response.headers.set('set-cookie', setCookieHeader);
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
