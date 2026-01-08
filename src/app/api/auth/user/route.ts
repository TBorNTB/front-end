// src/app/api/auth/user/route.ts
import { NextResponse } from 'next/server';
import { USER_ENDPOINTS } from '@/lib/api/endpoints/user-endpoints'; 
import { serverApiClient } from '@/lib/api/client-server';

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader?.includes('accessToken')) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    // Parallel profile + role calls
    const [profileRes, roleRes] = await Promise.allSettled([
      serverApiClient.request(USER_ENDPOINTS.USER.PROFILE, { request }),
      serverApiClient.request(USER_ENDPOINTS.USER.ROLE, { request }),
    ]);

    if (profileRes.status === 'rejected' || !profileRes.value?.success) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    try {
      // Fetch profile data
      const profileResponse = await serverApiClient.request(
        `${USER_ENDPOINTS.USER.PROFILE}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          request,
        }
      );

      if (!profileResponse.success) {
        if (profileResponse.status === 401 || profileResponse.status === 403) {
          return NextResponse.json({
            authenticated: false,
            user: null
          }, { status: 200 });
        }

        if (profileResponse.status === 400) {
          return NextResponse.json({
            authenticated: false,
            user: null
          }, { status: 200 });
        }

        console.error(`❌ Profile endpoint error: ${profileResponse.status}`);
        return NextResponse.json({
          authenticated: false,
          user: null,
          error: 'Service unavailable'
        }, { status: 503 });
      }

      const profileData = profileResponse.data as any;
      console.log('✅ Profile data retrieved:', {
        nickname: profileData.nickname,
        role: profileData.role
      });

      // ✅ Fetch role data (optional)
      let roleData = null;
      try {
        const roleResponse = await serverApiClient.request(
          `${USER_ENDPOINTS.USER.ROLE}`,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            request,
          }
        );

        if (roleResponse.success) {
          roleData = roleResponse.data as any;
          console.log('✅ Role data retrieved:', roleData);
        } else {
          console.warn('⚠️ Role endpoint failed, using profile role');
        }
      } catch (roleError) {
        console.warn('⚠️ Role endpoint error, using profile role:', roleError);
      }

      // ✅ Determine role priority: roleData > profileData > default
      const rawRole = roleData?.role || profileData.role;
      //const validatedRole = validateUserRole(rawRole);
      
      console.log('🔐 Role resolution:', {
        fromRoleEndpoint: roleData?.role,
        fromProfile: profileData.role,
        //validated: validatedRole
      });

      // ✅ Combine user data with validated role
      const userData = {
        nickname: profileData.nickname || profileData.username,
        email: profileData.email,
        realName: profileData.realName || profileData.fullName || profileData.nickname,
        profileImageUrl: profileData.profileImageUrl || profileData.profileImage,
       // role: validatedRole, // ✅ Use validated role
        ...profileData // Include other fields
      };

      return NextResponse.json({
        authenticated: true,
        user: userData
      }, { status: 200 });

    } catch (networkError) {
      console.error('❌ Network error calling backend:', networkError);
      return NextResponse.json({
        authenticated: false,
        user: null,
        error: 'Network error'
      }, { status: 503 });
    }

  } catch (error) {
    console.error('Auth check failed:', error);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
