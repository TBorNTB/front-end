// src/app/api/auth/user/route.ts - FIXED VERSION (Handle 400 errors)
import { NextResponse } from 'next/server';
import { BASE_URL, API_ENDPOINTS } from '@/lib/endpoints';

export async function GET(request: Request) {
  try {
    // Forward cookies to backend for auth verification
    const cookieHeader = request.headers.get('cookie');
    
    if (!cookieHeader) {
      // ✅ SILENT: Don't log when no cookies (user not logged in)
      return NextResponse.json({
        authenticated: false,
        user: null
      }, { status: 200 });
    }

    // Check if there are any auth-related cookies
    const hasAuthCookies = cookieHeader.includes('accessToken') || 
                          cookieHeader.includes('refreshToken') || 
                          cookieHeader.includes('sessionToken');
    
    if (!hasAuthCookies) {
      // ✅ SILENT: User not logged in, no need to call backend
      return NextResponse.json({
        authenticated: false,
        user: null
      }, { status: 200 });
    }

    const profileResponse = await fetch(`${BASE_URL}${API_ENDPOINTS.USERS.PROFILE}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cookie': cookieHeader
      },
    });

    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log('✅ Profile data retrieved successfully');
      
      const roleResponse = await fetch(`${BASE_URL}${API_ENDPOINTS.USERS.ROLE}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cookie': cookieHeader
        },
      });

      let roleData = null;
      if (roleResponse.ok) {
        roleData = await roleResponse.json();
        console.log('✅ Role data retrieved successfully');
      } else {
        console.warn('⚠️ Role endpoint failed but profile worked');
      }

      // Combine the data
      let userData;
      if (roleData) {
        userData = {
          ...profileData,
          role: roleData.role || roleData
        };
      } else {
        userData = profileData;
      }

      return NextResponse.json({
        authenticated: true,
        user: userData
      });
    } else {
      // ✅ HANDLE BOTH 401 AND 400: Both mean "not authenticated"
      if (profileResponse.status === 401 || profileResponse.status === 400) {
        return NextResponse.json({
          authenticated: false,
          user: null
        }, { status: 200 });
      }
      
      // ✅ Only log actual server errors (500, 503, etc.)
      console.error('❌ Profile endpoint server error:', profileResponse.status);
      return NextResponse.json({
        authenticated: false,
        user: null,
        error: 'Server error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error("❌ Auth check error:", error);
    return NextResponse.json({
      authenticated: false,
      user: null,
      error: 'Network error'
    }, { status: 500 });
  }
}
