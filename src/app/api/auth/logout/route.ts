// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { BASE_URL, API_ENDPOINTS } from '@/lib/endpoints';

export async function POST(request: Request) {
  try {
    // Forward cookies to backend for auth verification
    const cookieHeader = request.headers.get('cookie');
    
    // Always clear local cookies, even if backend call fails
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );

    // Clear all auth-related cookies locally
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    response.cookies.delete('session');

    // Try to logout from backend if we have cookies
    if (cookieHeader) {
      try {
        console.log('Calling backend logout:', `${BASE_URL}${API_ENDPOINTS.USERS.LOGOUT}`);
        
        const backendResponse = await fetch(`${BASE_URL}${API_ENDPOINTS.USERS.LOGOUT}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cookie': cookieHeader,
          },
          // Add timeout to prevent hanging
          signal: AbortSignal.timeout(5000), // 5 second timeout
        });

        if (backendResponse.ok) {
          console.log('Backend logout successful');
        } else {
          console.warn('Backend logout failed:', backendResponse.status);
        }
      } catch (backendError) {
        // Log backend error but don't fail the entire logout
        console.warn('Backend logout error (proceeding with local logout):', backendError);
      }
    }

    return response;

  } catch (error) {
    console.error("Logout API route error:", error);
    
    // Even if everything fails, still clear local cookies
    const response = NextResponse.json(
      { message: 'Logged out successfully (local only)' },
      { status: 200 }
    );

    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    response.cookies.delete('session');

    return response;
  }
}
