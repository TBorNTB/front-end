import { NextResponse } from 'next/server';
import { BASE_URL, API_ENDPOINTS } from '@/lib/api/config';

export async function POST(request: Request) {
  try {
    // ✅ Forward cookies to backend for logout
    const cookieHeader = request.headers.get('cookie');

    console.log('🔓 Logging out user...');
    
    const backendResponse = await fetch(`${BASE_URL}${API_ENDPOINTS.USERS.LOGOUT}`, {
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

    // ✅ Forward cookie clearing headers from backend
    const setCookieHeaders = backendResponse.headers.getSetCookie?.() || 
                           backendResponse.headers.get('set-cookie');
    
    if (setCookieHeaders) {
      if (Array.isArray(setCookieHeaders)) {
        // Multiple cookies (accessToken, refreshToken, etc.)
        setCookieHeaders.forEach(cookie => {
          response.headers.append('set-cookie', cookie);
        });
        console.log('🍪 Cleared', setCookieHeaders.length, 'cookies');
      } else {
        response.headers.set('set-cookie', setCookieHeaders);
        console.log('🍪 Cleared cookies');
      }
    }

    console.log('✅ Logout successful');
    return response;

  } catch (error) {
    console.error("❌ Logout API route error:", error);
    
    // ✅ Even if backend fails, return success to clear frontend state
    // This ensures users can always log out locally
    return NextResponse.json(
      { message: 'Logout completed' },
      { status: 200 }
    );
  }
}
