import { NextResponse } from 'next/server';
import { BASE_URL } from '@/lib/api/config';
import { USER_ENDPOINTS} from '@/lib/api/endpoints/user-endpoints';

function clearAuthCookies(response: NextResponse, request?: Request) {
  const secure = process.env.NODE_ENV === 'production';
  
  // OAuth 로그인 시 백엔드가 설정한 쿠키의 path를 확인하기 위해 요청 쿠키 파싱
  const cookieHeader = request?.headers.get('cookie') || '';
  const existingCookies = new Map<string, Set<string>>(); // name -> Set of paths
  
  // 요청에 포함된 쿠키들의 path 추출 시도
  cookieHeader.split(';').forEach(cookie => {
    const [name] = cookie.trim().split('=');
    if (name && ['accessToken', 'refreshToken', 'keepSignedIn'].includes(name)) {
      // 브라우저가 보낸 쿠키는 path 정보가 없지만, 
      // 백엔드가 설정한 쿠키는 다양한 path에 있을 수 있음
      if (!existingCookies.has(name)) {
        existingCookies.set(name, new Set());
      }
    }
  });
  
  // Cookies can exist with different Path values (e.g. '/api/auth' if Set-Cookie had no Path).
  // OAuth 로그인 시 백엔드가 설정한 쿠키는 다양한 path에 있을 수 있음
  const paths = [
    '/', 
    '/api', 
    '/api/auth',
    '/user-service',
    '/oauth2',
    '/oauth2/callback',
  ];
  const names = ['accessToken', 'refreshToken', 'keepSignedIn'] as const;

  for (const name of names) {
    // 각 path에서 삭제 시도
    for (const path of paths) {
      // secure와 non-secure 모두 시도 (개발/프로덕션 환경 대응)
      response.cookies.set(name, '', {
        httpOnly: true,
        secure: true, // secure 쿠키 삭제
        sameSite: 'lax' as const,
        path,
        maxAge: 0,
        expires: new Date(0),
      });
      
      response.cookies.set(name, '', {
        httpOnly: true,
        secure: false, // non-secure 쿠키 삭제
        sameSite: 'lax' as const,
        path,
        maxAge: 0,
        expires: new Date(0),
      });
      
      // sameSite: 'none'도 시도 (크로스 사이트 쿠키)
      response.cookies.set(name, '', {
        httpOnly: true,
        secure: true,
        sameSite: 'none' as const,
        path,
        maxAge: 0,
        expires: new Date(0),
      });
    }
    
    // path 없이도 시도 (일부 브라우저/서버에서 path가 다를 수 있음)
    // secure와 non-secure 모두
    response.cookies.set(name, '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax' as const,
      maxAge: 0,
      expires: new Date(0),
    });
    
    response.cookies.set(name, '', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax' as const,
      maxAge: 0,
      expires: new Date(0),
    });
  }
  
  console.log('Cookies cleared for:', names.join(', '), 'across paths:', paths.join(', '));
  console.log('Existing cookies found:', Array.from(existingCookies.keys()));
}

export async function POST(request: Request) {
  console.log('Logout API route called');
  try {
    const cookieHeader = request.headers.get('cookie');
    console.log('Cookies sent to backend:', cookieHeader);

    const backendUrl = `${BASE_URL}${USER_ENDPOINTS.USER.LOGOUT}`;
    console.log('Calling backend:', backendUrl);

    // Extract accessToken from cookie for Authorization header (if backend requires Bearer token)
    const accessToken = cookieHeader?.match(/(?:^|;\s*)accessToken=([^;]+)/)?.[1];
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Add Cookie header if available
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    // Add Authorization header if accessToken exists (some backends prefer Bearer token)
    if (accessToken) {
      const token = decodeURIComponent(accessToken);
      headers['Authorization'] = token.toLowerCase().startsWith('bearer ')
        ? token
        : `Bearer ${token}`;
    }

    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers,
      // Note: credentials is not needed server-side, but we're explicitly forwarding cookies
    });

    console.log('Backend response status:', backendResponse.status);
    console.log('Backend response headers:', Object.fromEntries(backendResponse.headers.entries()));

    // 백엔드가 Set-Cookie로 쿠키를 삭제하려고 시도했는지 확인
    const backendSetCookies = backendResponse.headers.getSetCookie?.() ?? [];
    console.log('Backend Set-Cookie headers:', backendSetCookies);
    
    // 백엔드가 보낸 Set-Cookie 헤더를 파싱하여 쿠키 삭제에 활용
    // 백엔드가 쿠키 삭제를 위해 보낸 헤더는 정확한 path/domain을 포함할 수 있음
    backendSetCookies.forEach((cookieStr) => {
      console.log('Backend Set-Cookie:', cookieStr);
      // 백엔드가 보낸 Set-Cookie 헤더에 path나 domain 정보가 있으면 그대로 사용
    });

    let data: any = { message: 'Logout successful' };
    try {
      const responseText = await backendResponse.text();
      if (responseText) {
        data = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.warn('Failed to parse backend response as JSON:', parseError);
    }

    console.log('Backend response data:', data);

    // Always clear cookies and return success, regardless of backend status
    // This ensures frontend state is cleared even if backend fails
    const response = NextResponse.json(
      { 
        message: 'Logout successful', 
        backendStatus: backendResponse.status,
        ...data 
      }, 
      { status: 200 }
    );

    // 프론트엔드 쿠키 삭제 (요청 정보 전달하여 기존 쿠키 확인)
    clearAuthCookies(response, request);

    // 백엔드가 Set-Cookie로 쿠키 삭제를 시도했다면 그것도 전달
    // (백엔드가 쿠키 삭제를 위해 Set-Cookie를 보낼 수 있음)
    backendSetCookies.forEach((cookie) => {
      response.headers.append('Set-Cookie', cookie);
    });

    console.log('Logout completed, cookies cleared');
    return response;

  } catch (error) {
    console.error('Logout error:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));

    // 백엔드 실패해도 쿠키 삭제하고 성공 반환
    // 프론트엔드 상태는 항상 정리되어야 함
    const response = NextResponse.json({ 
      message: 'Logout completed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 200 });
    clearAuthCookies(response, request);
    return response;
  }
}
