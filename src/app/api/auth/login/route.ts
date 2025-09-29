import { NextResponse } from 'next/server';
import { getApiUrl, API_ENDPOINTS } from '@/lib/api';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const backendResponse = await fetch(getApiUrl(API_ENDPOINTS.LOGIN), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json();

    const response = NextResponse.json(data, {
      status: backendResponse.status,
    });

    // Forward cookies
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
