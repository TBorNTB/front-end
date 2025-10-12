// src/app/api/auth/logout/route.ts - Server-side logout
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(_request: NextRequest) {
  try {        
    // List of cookies to clear
    const cookiesToClear = [
      'accessToken',
      'refreshToken', 
      'sessionToken',
      'userId',
      'userRole',
      'authState',
      'keepSignedIn'
    ];

    // Create response
    const response = NextResponse.json(
      { message: '로그아웃되었습니다', success: true },
      { status: 200 }
    );

    // Clear all auth-related cookies
    cookiesToClear.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    });

    console.log('Server logout completed');
    return response;
    
  } catch (error) {
    console.error('Server logout error:', error);
    return NextResponse.json(
      { message: '로그아웃 처리 중 오류가 발생했습니다', success: false },
      { status: 500 }
    );
  }
}
