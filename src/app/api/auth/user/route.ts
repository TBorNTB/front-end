// src/app/api/auth/user/route.ts - DEBUG VERSION
import { NextResponse } from 'next/server';
import { BASE_URL, API_ENDPOINTS } from '@/lib/endpoints';

export async function GET(request: Request) {
  try {
    // Forward cookies to backend for auth verification
    const cookieHeader = request.headers.get('cookie');
    
    if (!cookieHeader) {
      console.log('No cookies found, returning 401');
      return NextResponse.json({
        authenticated: false,
        user: null
      }, { status: 401 });
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
      console.log('Profile data from backend:', JSON.stringify(profileData, null, 2));
      
      const roleResponse = await fetch(`${BASE_URL}${API_ENDPOINTS.USERS.ROLE}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cookie': cookieHeader
        },
      });

      console.log('Role response status:', roleResponse.status);

      let roleData = null;
      if (roleResponse.ok) {
        roleData = await roleResponse.json();
        console.log('Role data from backend:', JSON.stringify(roleData, null, 2));
      } else {
        const roleError = await roleResponse.text();
        console.log('Role endpoint error:', roleError);
      }

      // Try to combine the data
      let userData;
      if (roleData) {
        userData = {
          ...profileData,
          role: roleData.role || roleData // Backend might return { role: "SENIOR" } or just "SENIOR"
        };
      } else {
        // If role endpoint fails, use profile data as-is
        userData = profileData;
      }

      console.log('Final combined user data:', JSON.stringify(userData, null, 2));

      return NextResponse.json({
        authenticated: true,
        user: userData
      });
    } else {
      const profileError = await profileResponse.text();
      console.log('Profile endpoint error:', profileError);
      
      return NextResponse.json({
        authenticated: false,
        user: null,
        debug: {
          profileStatus: profileResponse.status,
          profileError: profileError
        }
      }, { status: 401 });
    }

  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({
      authenticated: false,
      user: null,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
