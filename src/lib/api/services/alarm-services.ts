// lib/api/services/alarm-service.ts
import { getApiUrl } from '@/lib/api/config';
import { USER_ENDPOINTS } from '@/lib/api/endpoints';
import { AlarmType } from '@/types/services/alarm';
import { fetchWithRefresh } from '@/lib/api/fetch-with-refresh';

export interface AlarmResponse {
  id: string;
  alarmType: AlarmType;
  title: string;
  content?: string;
  message?: string; // API 응답의 message 필드
  isRead: boolean;
  createdAt: string;
  link?: string;
  domainType?: string; // 예: 'PROJECT', 'ARTICLE', 'NEWS', 'CSKNOWLEDGE'
  domainId?: string | number; // 해당 도메인의 ID
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
      const params = new URLSearchParams();
      if (alarmType) params.append('alarmType', alarmType);
      const url = params.size
        ? `${getApiUrl(USER_ENDPOINTS.ALARM.RECEIVED)}?${params.toString()}`
        : getApiUrl(USER_ENDPOINTS.ALARM.RECEIVED);

      const response = await fetchWithRefresh(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
        cache: 'no-store',
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.warn('[alarmService.getReceivedAlarms] Authentication failed');
          return [];
        }
        console.warn(`[alarmService.getReceivedAlarms] Failed to fetch alarms: ${response.status}`);
        return [];
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn('[alarmService.getReceivedAlarms] Error:', error instanceof Error ? error.message : String(error));
      return [];
    }
  },

  /**
   * 알람 읽음 처리
   * @param alarmId 알람 ID
   */
  markAsSeen: async (alarmId: string): Promise<void> => {
    try {
      const url = getApiUrl(USER_ENDPOINTS.ALARM.MARK_AS_SEEN.replace('{alarmId}', alarmId));

      const response = await fetchWithRefresh(url, {
        method: 'POST',
        headers: {
          'Accept': '*/*',
        },
        credentials: 'include',
        cache: 'no-store',
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.warn('[alarmService.markAsSeen] Authentication failed');
          return;
        }
        console.warn(`[alarmService.markAsSeen] Failed to mark alarm as seen: ${response.status}`);
      }
    } catch (error) {
      console.warn('[alarmService.markAsSeen] Error:', error instanceof Error ? error.message : String(error));
    }
  },
};

