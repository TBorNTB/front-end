// src/app/api/auth/login/route.ts
// 로그인 API route
// - keepSignedIn을 쿠키로 저장 (서버에서 토큰 갱신 여부 판단용)
import { NextResponse } from 'next/server';
import { BASE_URL } from '@/lib/api/config';
import { USER_ENDPOINTS } from '@/lib/api/endpoints/user-endpoints';

async function readBackendPayload(res: Response): Promise<{ json: any | null; text: string | null }> {
  try {
    const json = await res.clone().json();
    return { json, text: null };
  } catch {
    try {
      const text = await res.clone().text();
      return { json: null, text };
    } catch {
      return { json: null, text: null };
    }
  }
}

function looksLikeBearerTokenRequired(payload: { json: any | null; text: string | null }, status: number): boolean {
  // Some backends incorrectly use 400 for missing Authorization.
  if (status !== 400 && status !== 401 && status !== 403) return false;
  const message =
    (payload.json && (payload.json.message || payload.json.error || payload.json.detail)) ||
    payload.text ||
    '';
  const normalized = String(message).toLowerCase();
  return (
    normalized.includes('authorization') ||
    normalized.includes('bearer') ||
    normalized.includes('토큰')
  );
}

function toHttpsIfPossible(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:') {
      parsed.protocol = 'https:';
      return parsed.toString();
    }
  } catch {
    // ignore
  }
  return url;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { keepSignedIn } = body;

    const primaryUrl = `${BASE_URL}${USER_ENDPOINTS.USER.LOGIN}`;
    const fallbackUrl = `${BASE_URL}/user-service/users/auth/login`;

    const doLogin = (url: string) =>
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      });

    const candidates = Array.from(new Set([
      primaryUrl,
      toHttpsIfPossible(primaryUrl),
      fallbackUrl,
      toHttpsIfPossible(fallbackUrl),
    ]));

    let backendResponse: Response | null = null;
    let payload: { json: any | null; text: string | null } = { json: null, text: null };

    for (let i = 0; i < candidates.length; i++) {
      const url = candidates[i];
      backendResponse = await doLogin(url);
      payload = await readBackendPayload(backendResponse);

      // Success → stop.
      if (backendResponse.ok) break;

      // If backend says it needs Bearer token for "login", try the next candidate URL.
      const shouldRetry = looksLikeBearerTokenRequired(payload, backendResponse.status);
      if (!shouldRetry) break;
    }

    // Should never be null, but keep TS happy.
    if (!backendResponse) {
      return NextResponse.json({ message: 'Login request failed' }, { status: 500 });
    }

    const data = payload.json ?? (payload.text ? { message: payload.text } : null);
    const response = NextResponse.json(data ?? { message: 'OK' }, { status: backendResponse.status });

    // If we set our own auth cookies from the JSON body, do NOT also forward backend Set-Cookie.
    // Forwarding Set-Cookie without a normalized Path can create duplicate cookies (e.g. Path=/api/auth)
    // that survive logout.
    const willSetAuthCookiesFromBody = Boolean(backendResponse.ok && (data as any)?.accessToken);
    if (!willSetAuthCookiesFromBody) {
      // Common pattern: accessToken/refreshToken are httpOnly Set-Cookie, not JSON body.
      const setCookieHeaders = backendResponse.headers.getSetCookie?.() ?? [];
      setCookieHeaders.forEach((cookie) => {
        response.headers.append('Set-Cookie', cookie);
      });
    }

    // 백엔드가 토큰을 body로 보내줌 → 쿠키로 설정
    if (backendResponse.ok) {
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
      };

      // Always persist keepSignedIn for the refresh flow.
      response.cookies.set('keepSignedIn', keepSignedIn ? 'true' : 'false', {
        ...cookieOptions,
        maxAge: keepSignedIn ? 60 * 60 * 24 * 30 : undefined,
      });

      if (willSetAuthCookiesFromBody) {
        response.cookies.set('accessToken', (data as any).accessToken, {
          ...cookieOptions,
          maxAge: 60 * 60,
        });

        if ((data as any).refreshToken) {
          response.cookies.set('refreshToken', (data as any).refreshToken, {
            ...cookieOptions,
            maxAge: 60 * 60 * 24 * 7,
          });
        }
      }
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
