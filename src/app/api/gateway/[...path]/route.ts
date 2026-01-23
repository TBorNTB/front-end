import { NextResponse } from 'next/server';

import { BASE_URL } from '@/lib/api/config';
import { ENABLE_API_LOGGING } from '@/lib/api/env';

const ALLOWED_PREFIXES = new Set([
  'user-service',
  'project-service',
  'newsletter-service',
  'elastic-service',
]);

function extractAccessTokenFromCookieHeader(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)accessToken=([^;]+)/);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

function buildBackendUrl(request: Request, pathParts: string[]): string {
  const incomingUrl = new URL(request.url);
  const backendPath = `/${pathParts.join('/')}`;
  const backendUrl = new URL(`${BASE_URL}${backendPath}`);

  // preserve query string
  backendUrl.search = incomingUrl.search;
  return backendUrl.toString();
}

async function handleProxy(request: Request, pathParts: string[]) {
  if (!pathParts.length) {
    return NextResponse.json({ error: 'Missing path' }, { status: 400 });
  }

  const servicePrefix = pathParts[0];
  if (!ALLOWED_PREFIXES.has(servicePrefix)) {
    return NextResponse.json(
      { error: `Disallowed service prefix: ${servicePrefix}` },
      { status: 400 }
    );
  }

  const cookieHeader = request.headers.get('cookie');
  const accessToken = extractAccessTokenFromCookieHeader(cookieHeader);

  const backendUrl = buildBackendUrl(request, pathParts);

  // Forward a small set of headers. (Avoid forwarding host/origin, etc.)
  const headers = new Headers();
  const accept = request.headers.get('accept');
  const contentType = request.headers.get('content-type');
  const contentLength = request.headers.get('content-length');

  if (accept) headers.set('accept', accept);
  if (contentType) headers.set('content-type', contentType);
  if (accessToken) {
    const token = accessToken.trim();
    const authorizationValue = token.toLowerCase().startsWith('bearer ')
      ? token
      : `Bearer ${token}`;
    headers.set('authorization', authorizationValue);
  } else if (cookieHeader) {
    // Fallback: some backends may still accept cookie-based auth.
    headers.set('cookie', cookieHeader);
  }

  const method = request.method.toUpperCase();

  let body: ArrayBuffer | undefined;
  if (method !== 'GET' && method !== 'HEAD') {
    // Some backends can misbehave if we forward an explicit empty body for DELETE.
    // Only forward the body when the request likely contains one.
    const hasBody = Boolean(
      (contentType && contentType.trim().length > 0) ||
      (contentLength && contentLength !== '0')
    );

    if (hasBody) {
      body = await request.arrayBuffer();
    }
  }

  const backendResponse = await fetch(backendUrl, {
    method,
    headers,
    body,
    cache: 'no-store',
  });

  const responseBody = await backendResponse.arrayBuffer();

  if (ENABLE_API_LOGGING && !backendResponse.ok) {
    const isCsKnowledge = pathParts[0] === 'project-service' && pathParts[1] === 'cs-knowledge';
    const shouldLog = isCsKnowledge || backendResponse.status >= 500;

    if (shouldLog) {
      const preview = (() => {
        try {
          const text = new TextDecoder().decode(responseBody);
          const trimmed = text.trim();
          return trimmed.length > 500 ? `${trimmed.slice(0, 500)}…` : trimmed;
        } catch {
          return '';
        }
      })();

      console.warn('[api/gateway] backend error', {
        method,
        backendUrl,
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        hasAccessToken: Boolean(accessToken),
        accessTokenLooksBearerPrefixed: accessToken ? accessToken.trim().toLowerCase().startsWith('bearer ') : false,
        forwardedAuthorization: headers.has('authorization'),
        forwardedCookie: headers.has('cookie'),
        responsePreview: preview || undefined,
      });
    }
  }

  const responseHeaders = new Headers();
  const respContentType = backendResponse.headers.get('content-type');
  if (respContentType) responseHeaders.set('content-type', respContentType);

  // Forward Set-Cookie if backend uses it (rare here, but safe)
  const setCookies = backendResponse.headers.getSetCookie?.() ?? [];
  for (const cookie of setCookies) {
    responseHeaders.append('set-cookie', cookie);
  }

  return new NextResponse(responseBody, {
    status: backendResponse.status,
    headers: responseHeaders,
  });
}

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleProxy(request, path);
}

export async function POST(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleProxy(request, path);
}

export async function PUT(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleProxy(request, path);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleProxy(request, path);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleProxy(request, path);
}
