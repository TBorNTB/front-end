// src/lib/api/services/alarm-service.ts
import { BASE_URL, API_ENDPOINTS } from '@/lib/api/config';
import { AlarmType } from '@/types/alarm';

// Get access token from cookies
const getAccessToken = (): string | null => {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'accessToken') {
      return decodeURIComponent(value);
    }
  }
  return null;
};

export interface AlarmResponse {
  id: string;
  alarmType: AlarmType;
  title: string;
  content?: string;
  message?: string; // API 응답의 message 필드
  isRead: boolean;
  createdAt: string;
  link?: string;
  relatedUser?: {
    nickname: string;
    profileImage?: string;
  };
  relatedPost?: {
    id: string;
    title: string;
  };
}

export const alarmService = {
  /**
   * 받은 알람 목록 조회
   * @param alarmType 알람 타입 (선택적)
   * @returns 알람 목록
   */
  getReceivedAlarms: async (alarmType?: AlarmType): Promise<AlarmResponse[]> => {
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const url = new URL(`${BASE_URL}${API_ENDPOINTS.ALARM.RECEIVED}`);
      if (alarmType) {
        url.searchParams.append('alarmType', alarmType);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        cache: 'no-store',
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Authentication failed');
        }
        throw new Error(`Failed to fetch alarms: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching alarms:', error);
      throw error;
    }
  },
};

