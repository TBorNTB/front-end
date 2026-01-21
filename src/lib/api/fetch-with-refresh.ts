// src/lib/api/fetch-with-refresh.ts
// 클라이언트용 fetch wrapper
// - 401 에러 시 자동으로 토큰 갱신 후 재시도
// - keepSignedIn 여부는 서버(/api/auth/reissue)에서 판단

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  // 이미 갱신 중이면 기존 Promise 재사용 (중복 호출 방지)
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch('/api/auth/reissue', {
        method: 'POST',
        credentials: 'include',
      });
      return response.ok;
    } catch {
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function fetchWithRefresh(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
  });

  // 401이 아니면 그대로 반환
  if (response.status !== 401) {
    return response;
  }

  // 토큰 갱신 시도
  const refreshed = await tryRefreshToken();

  if (refreshed) {
    // 갱신 성공 → 원래 요청 재시도
    return fetch(url, {
      ...options,
      credentials: 'include',
    });
  }

  // 갱신 실패 → 원래 401 응답 반환
  return response;
}
