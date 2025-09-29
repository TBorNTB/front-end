import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    
    // Get all cookies to forward to backend
    const allCookies = cookieStore.getAll();
    const cookieString = allCookies
      .map(({ name, value }) => `${name}=${value}`)
      .join('; ');

    // Forward logout request to backend with cookies
    const backendResponse = await fetch('http://3.37.124.162:8000/user-service/users/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cookie': cookieString, // Forward all cookies to backend
      },
    });

    // Whether backend logout succeeds or not, clear local cookies
    const response = NextResponse.json(
      { 
        message: 'Logged out successfully',
        backendLogout: backendResponse.ok 
      },
      { status: 200 }
    );

    // Delete the accessToken cookie locally
    response.cookies.delete('accessToken');
    
    // If there are other auth-related cookies, delete them too
    response.cookies.delete('refreshToken');
    response.cookies.delete('session');

    return response;

  } catch (error) {
    console.error("Logout API route error:", error);
    
    // Even if backend logout fails, clear local cookies
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
