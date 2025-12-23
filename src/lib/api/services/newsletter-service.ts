// src/lib/api/services/newsletter-service.ts
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

// API 응답 타입 정의
export interface NewsletterResponse {
  email: string;
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
      const url = '/api/newsletter/subscribe';

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
      const url = '/api/newsletter/verify';

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
};

