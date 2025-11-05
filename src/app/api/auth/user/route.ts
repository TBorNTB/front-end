// src/app/api/auth/user/route.ts 
import { NextResponse } from 'next/server';
import { BASE_URL, API_ENDPOINTS } from '@/lib/api/services/user-service';

export async function GET(request: Request) {
  try {
    // ✅ Forward cookies to backend for auth verification
    const cookieHeader = request.headers.get('cookie');
    
    if (!cookieHeader) {
      // ✅ SILENT: Don't log when no cookies (user not logged in)
      return NextResponse.json({
        authenticated: false,
        user: null
      }, { status: 200 });
    }

    // ✅ Check if there are any auth-related cookies
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

    // ✅ Make backend API calls with proper error handling
    try {
      // Fetch profile data
      const profileResponse = await fetch(`${BASE_URL}${API_ENDPOINTS.USERS.PROFILE}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cookie': cookieHeader,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });

      if (!profileResponse.ok) {
        // ✅ Handle authentication failures (401, 403) silently
        if (profileResponse.status === 401 || profileResponse.status === 403) {
          return NextResponse.json({
            authenticated: false,
            user: null
          }, { status: 200 });
        }

        // ✅ Handle bad request (expired tokens, etc.)
        if (profileResponse.status === 400) {
          return NextResponse.json({
            authenticated: false,
            user: null
          }, { status: 200 });
        }

        // ✅ Log server errors only
        console.error(`❌ Profile endpoint error: ${profileResponse.status}`);
        return NextResponse.json({
          authenticated: false,
          user: null,
          error: 'Service unavailable'
        }, { status: 503 });
      }

      // ✅ Extract user data from response body
      const profileData = await profileResponse.json();
      console.log('✅ Profile data retrieved successfully');

      // ✅ Fetch role data (optional - handle failure gracefully)
      let roleData = null;
      try {
        const roleResponse = await fetch(`${BASE_URL}${API_ENDPOINTS.USERS.ROLE}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cookie': cookieHeader,
            'Content-Type': 'application/json'
          },
          cache: 'no-store'
        });

        if (roleResponse.ok) {
          roleData = await roleResponse.json();
          console.log('✅ Role data retrieved successfully');
        } else {
          console.warn('⚠️ Role endpoint failed but profile worked - using profile role');
        }
      } catch (roleError) {
        const roleErrorMessage = roleError instanceof Error ? roleError.message : String(roleError);
        console.warn('⚠️ Role endpoint network error - using profile role:', roleErrorMessage);
      }

      // ✅ Combine user data from response bodies (not tokens)
      const userData = {
        // Profile data from response body
        nickname: profileData.nickname || profileData.username,
        email: profileData.email,
        realName: profileData.realName || profileData.fullName || profileData.nickname,
        profileImageUrl: profileData.profileImageUrl || profileData.profileImage,
        
        // Role from role endpoint or profile fallback
        role: roleData?.role || profileData.role || 'GUEST',
        
        // Additional profile fields from response
        ...profileData
      };

      // ✅ Return user data extracted from API response bodies
      return NextResponse.json({
        authenticated: true,
        user: userData
      }, { status: 200 });

    } catch (networkError) {
      // ✅ Handle network/timeout errors
      const networkErrorMessage = networkError instanceof Error ? networkError.message : String(networkError);
      console.error('❌ Network error calling backend:', networkErrorMessage);
      return NextResponse.json({
        authenticated: false,
        user: null,
        error: 'Network error'
      }, { status: 503 });
    }

  } catch (error) {
    // ✅ Handle unexpected errors
    console.error("❌ Auth check unexpected error:", error);
    return NextResponse.json({
      authenticated: false,
      user: null,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
