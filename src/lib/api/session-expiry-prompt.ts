/**
 * 세션(accessToken) 만료 시 사용자에게 "로그인 유지" 여부를 묻기 위한 핸들러.
 * fetchWithRefresh에서 401 발생 시 이 핸들러를 호출하고, true면 재발급 시도, false면 로그아웃 처리.
 */

export type SessionExpiryPromptHandler = () => Promise<boolean>;

let promptHandler: SessionExpiryPromptHandler | null = null;

export function setSessionExpiryPromptHandler(handler: SessionExpiryPromptHandler | null): void {
  promptHandler = handler;
}

/**
 * 401 발생 시 호출. 등록된 핸들러가 있으면 사용자에게 물어보고 결과를 반환하고,
 * 없으면 기본값 true(재발급 시도) 반환.
 */
export async function askUserToKeepSession(): Promise<boolean> {
  if (promptHandler) {
    return promptHandler();
  }
  return true;
}
