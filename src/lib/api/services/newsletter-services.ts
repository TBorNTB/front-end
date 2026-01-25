// lib/api/services/newsletter-service.ts
// Newsletter 구독 관련 API 서비스
// API 요청 타입 정의
export type EmailFrequency = 'DAILY' | 'WEEKLY';

export interface SubscribeRequest {
  email: string;
  emailFrequency: EmailFrequency;
  selectedCategories: string[]; // CategoryType enum 값들
  chasingPopularity: boolean;
}

export interface VerifyRequest {
  email: string;
  code: string;
}

export interface CancelVerifyRequest {
  email: string;
}

export interface CancelConfirmRequest {
  email: string;
  code: string;
}

export interface PreferencesSendCodeRequest {
  email: string;
}

export interface PreferencesVerifyRequest {
  email: string;
  code: string;
  emailFrequency: EmailFrequency;
  selectedCategories: string[];
}

// API 응답 타입 정의
export interface NewsletterResponse {
  email: string;
  message: string;
}

export interface NewsletterSubscriberStatusResponse {
  email: string;
  registered: boolean;
  active: boolean;
  emailFrequency: EmailFrequency | null;
  selectedCategories: string[];
  message: string;
}

/**
 * Newsletter 구독 관련 API 서비스
 */
export const newsletterService = {
  /**
   * 뉴스레터 구독 요청 (인증 코드 전송)
   * POST /newsletter-service/api/newsletter/subscribe/verification-code
   * @param data 구독 정보
   * @returns 응답 메시지
   */
  subscribe: async (data: SubscribeRequest): Promise<NewsletterResponse> => {
    try {
      // Next.js API route를 통해 프록시 (CORS 문제 해결)
      const url = '/api/newsletter/subscribe/verification-code';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify(data),
      });

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage = responseData?.message || 
                            responseData?.error || 
                            `구독 요청 실패 (${response.status})`;
        throw new Error(errorMessage);
      }

      if (!responseData) {
        throw new Error('서버 응답을 받을 수 없습니다.');
      }

      return {
        email: responseData.email || data.email,
        message: responseData.message || '인증 코드가 이메일로 전송되었습니다.',
      };
    } catch (error: any) {
      console.error('Error subscribing to newsletter:', error);
      
      // 네트워크 에러 처리
      if (error.name === 'TypeError' || error.message.includes('fetch')) {
        throw new Error('네트워크 연결을 확인해주세요.');
      }
      
      // 기존 에러 메시지가 있으면 그대로 사용
      throw error;
    }
  },

  /**
   * 인증 코드 확인
   * POST /newsletter-service/api/newsletter/subscribers/verify
   * @param data 이메일과 인증 코드
   * @returns 응답 메시지
   */
  verify: async (data: VerifyRequest): Promise<NewsletterResponse> => {
    try {
      // Next.js API route를 통해 프록시 (CORS 문제 해결)
      const url = '/api/newsletter/subscribers/verify';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify(data),
      });

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage = responseData?.message || 
                            responseData?.error || 
                            `인증 코드 확인 실패 (${response.status})`;
        throw new Error(errorMessage);
      }

      if (!responseData) {
        throw new Error('서버 응답을 받을 수 없습니다.');
      }

      return {
        email: responseData.email || data.email,
        message: responseData.message || '뉴스레터 구독이 완료되었습니다!',
      };
    } catch (error: any) {
      console.error('Error verifying newsletter code:', error);
      
      // 네트워크 에러 처리
      if (error.name === 'TypeError' || error.message.includes('fetch')) {
        throw new Error('네트워크 연결을 확인해주세요.');
      }
      
      // 기존 에러 메시지가 있으면 그대로 사용
      throw error;
    }
  },

  /**
   * 구독 해제용 인증 코드 발송
   * POST /newsletter-service/api/newsletter/subscribers/verify/cancel
   */
  cancelSendCode: async (data: CancelVerifyRequest): Promise<NewsletterResponse> => {
    try {
      const url = '/api/newsletter/cancel';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify(data),
      });

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage =
          responseData?.message || responseData?.error || `구독 해제 인증코드 요청 실패 (${response.status})`;
        throw new Error(errorMessage);
      }

      if (!responseData) {
        throw new Error('서버 응답을 받을 수 없습니다.');
      }

      return {
        email: responseData.email || data.email,
        message: responseData.message || '구독 해제용 인증 코드가 이메일로 전송되었습니다.',
      };
    } catch (error: any) {
      console.error('Error sending newsletter cancel verification code:', error);

      if (error.name === 'TypeError' || error.message?.includes?.('fetch')) {
        throw new Error('네트워크 연결을 확인해주세요.');
      }

      throw error;
    }
  },

  /**
   * 구독 해제 인증 코드 검증 및 해제 처리
   * PATCH /newsletter-service/api/newsletter/subscribers/verify/cancel
   */
  cancelConfirm: async (data: CancelConfirmRequest): Promise<NewsletterResponse> => {
    try {
      const url = '/api/newsletter/cancel';

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify(data),
      });

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage =
          responseData?.message || responseData?.error || `구독 해제 인증코드 확인 실패 (${response.status})`;
        throw new Error(errorMessage);
      }

      if (!responseData) {
        throw new Error('서버 응답을 받을 수 없습니다.');
      }

      return {
        email: responseData.email || data.email,
        message: responseData.message || '구독 해제가 완료되었습니다.',
      };
    } catch (error: any) {
      console.error('Error confirming newsletter cancel verification code:', error);

      if (error.name === 'TypeError' || error.message?.includes?.('fetch')) {
        throw new Error('네트워크 연결을 확인해주세요.');
      }

      throw error;
    }
  },

  /**
   * 구독 선호도 수정용 인증 코드 발송
   * POST /newsletter-service/api/newsletter/subscribers/preferences/verification-code
   */
  preferencesSendCode: async (data: PreferencesSendCodeRequest): Promise<NewsletterResponse> => {
    try {
      const url = '/api/newsletter/preferences';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify(data),
      });

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage =
          responseData?.message || responseData?.error || `선호도 수정 인증코드 요청 실패 (${response.status})`;
        throw new Error(errorMessage);
      }

      if (!responseData) {
        throw new Error('서버 응답을 받을 수 없습니다.');
      }

      return {
        email: responseData.email || data.email,
        message: responseData.message || '선호도 수정용 인증 코드가 이메일로 전송되었습니다.',
      };
    } catch (error: any) {
      console.error('Error sending newsletter preferences verification code:', error);

      if (error.name === 'TypeError' || error.message?.includes?.('fetch')) {
        throw new Error('네트워크 연결을 확인해주세요.');
      }

      throw error;
    }
  },

  /**
   * 구독 선호도 수정 인증 코드 검증 + 선호도 저장
   * PATCH /newsletter-service/api/newsletter/subscribers/preferences/verify
   */
  preferencesVerify: async (data: PreferencesVerifyRequest): Promise<NewsletterResponse> => {
    try {
      const url = '/api/newsletter/preferences';

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify(data),
      });

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage =
          responseData?.message || responseData?.error || `선호도 수정 인증코드 확인 실패 (${response.status})`;
        throw new Error(errorMessage);
      }

      if (!responseData) {
        throw new Error('서버 응답을 받을 수 없습니다.');
      }

      return {
        email: responseData.email || data.email,
        message: responseData.message || '선호도 수정이 완료되었습니다.',
      };
    } catch (error: any) {
      console.error('Error verifying newsletter preferences code:', error);

      if (error.name === 'TypeError' || error.message?.includes?.('fetch')) {
        throw new Error('네트워크 연결을 확인해주세요.');
      }

      throw error;
    }
  },

  /**
   * 구독자 상태 조회
   * GET /newsletter-service/api/newsletter/subscribers/status?email=...
   */
  status: async (email: string): Promise<NewsletterSubscriberStatusResponse> => {
    try {
      const url = `/api/newsletter/status?email=${encodeURIComponent(email)}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
        cache: 'no-store',
      });

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage =
          responseData?.message || responseData?.error || `구독 상태 조회 실패 (${response.status})`;
        throw new Error(errorMessage);
      }

      if (!responseData) {
        throw new Error('서버 응답을 받을 수 없습니다.');
      }

      return {
        email: responseData.email ?? email,
        registered: Boolean(responseData.registered),
        active: Boolean(responseData.active),
        emailFrequency: (responseData.emailFrequency ?? null) as EmailFrequency | null,
        selectedCategories: Array.isArray(responseData.selectedCategories)
          ? responseData.selectedCategories
          : [],
        message: responseData.message ?? '',
      };
    } catch (error: any) {
      console.error('Error fetching newsletter subscriber status:', error);

      if (error.name === 'TypeError' || error.message?.includes?.('fetch')) {
        throw new Error('네트워크 연결을 확인해주세요.');
      }

      throw error;
    }
  },
};
