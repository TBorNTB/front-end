// lib/api/services/alarm-services.ts
import { getApiUrl } from '@/lib/api/config';
import { USER_ENDPOINTS } from '@/lib/api/endpoints';
import type { AlarmType } from '@/types/services/alarm';
import type { AlarmApi, AlarmListResponse, AlarmUnreadCountResponse, AlarmBulkRequest, Alarm } from '@/types/services/alarm';
import { fetchWithRefresh } from '@/lib/api/fetch-with-refresh';

/** domainType + domainId로 링크 생성 */
export function generateAlarmLink(domainType?: string, domainId?: number | string): string {
  if (!domainType || domainId == null) return '#';
  const id = String(domainId);
  switch (domainType.toUpperCase()) {
    case 'PROJECT':
      return `/projects/${id}`;
    case 'ARTICLE':
    case 'CSKNOWLEDGE':
    case 'DOCUMENT':
      return `/community/news/${id}`;
    case 'NEWS':
      return `/community/news/${id}`;
    case 'QNA':
      return `/community/qna/${id}`;
    default:
      return '#';
  }
}

/** API 알람 → UI Alarm */
export function mapAlarmApiToAlarm(api: AlarmApi): Alarm {
  return {
    id: String(api.id),
    type: api.alarmType,
    title: api.message.slice(0, 50) + (api.message.length > 50 ? '…' : ''),
    content: api.message,
    isRead: api.seen,
    createdAt: api.createdAt,
    link: generateAlarmLink(api.domainType, api.domainId),
    domainType: api.domainType,
    domainId: api.domainId,
    relatedUser: api.actorUsername ? { nickname: api.actorUsername } : undefined,
  };
}

export interface AlarmListParams {
  page?: number;
  size?: number;
  alarmType?: AlarmType;
  seen?: boolean;
}

export const alarmService = {
  /**
   * 알람 목록 조회 (페이지네이션) — 목록 화면용
   */
  getReceivedAlarmsPage: async (params: AlarmListParams = {}): Promise<AlarmListResponse> => {
    const { page = 0, size = 20, alarmType, seen } = params;
    const searchParams = new URLSearchParams();
    searchParams.set('page', String(page));
    searchParams.set('size', String(size));
    if (alarmType != null) searchParams.set('alarmType', alarmType);
    if (seen != null) searchParams.set('seen', String(seen));

    const url = `${getApiUrl(USER_ENDPOINTS.ALARM.RECEIVED_PAGE)}?${searchParams.toString()}`;
    const response = await fetchWithRefresh(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) throw new Error('Authentication failed');
      throw new Error(`Failed to fetch alarms: ${response.status}`);
    }

    return response.json();
  },

  /**
   * 미확인 알람 개수 — 뱃지용
   */
  getUnreadCount: async (): Promise<number> => {
    const url = getApiUrl(USER_ENDPOINTS.ALARM.UNREAD_COUNT);
    const response = await fetchWithRefresh(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) return 0;
      throw new Error(`Failed to fetch unread count: ${response.status}`);
    }

    const data: AlarmUnreadCountResponse = await response.json();
    return data.count ?? 0;
  },

  /**
   * 알람 단건 읽음 처리
   */
  markAsSeen: async (alarmId: number): Promise<void> => {
    const url = getApiUrl(USER_ENDPOINTS.ALARM.MARK_AS_SEEN.replace('{alarmId}', String(alarmId)));
    const response = await fetchWithRefresh(url, {
      method: 'POST',
      headers: { Accept: '*/*' },
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) throw new Error('Authentication failed');
      if (response.status === 404) throw new Error('Alarm not found');
      throw new Error(`Failed to mark as seen: ${response.status}`);
    }
  },

  /**
   * 알람 일괄 읽음 처리
   */
  markAsSeenBulk: async (alarmIds: number[]): Promise<void> => {
    if (!alarmIds.length) throw new Error('alarmIds cannot be empty');
    const body: AlarmBulkRequest = { alarmIds };
    const url = getApiUrl(USER_ENDPOINTS.ALARM.SEEN_BULK);
    const response = await fetchWithRefresh(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: '*/*' },
      credentials: 'include',
      cache: 'no-store',
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 400) throw new Error('Invalid request');
      if (response.status === 401 || response.status === 403) throw new Error('Authentication failed');
      throw new Error(`Failed to mark as seen bulk: ${response.status}`);
    }
  },

  /**
   * 전체 알람 읽음 처리
   */
  markAllAsSeen: async (): Promise<void> => {
    const url = getApiUrl(USER_ENDPOINTS.ALARM.SEEN_ALL);
    const response = await fetchWithRefresh(url, {
      method: 'POST',
      headers: { Accept: '*/*' },
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) throw new Error('Authentication failed');
      throw new Error(`Failed to mark all as seen: ${response.status}`);
    }
  },

  /**
   * 알람 단건 삭제
   */
  deleteAlarm: async (alarmId: number): Promise<void> => {
    const url = getApiUrl(USER_ENDPOINTS.ALARM.DELETE_ONE.replace('{alarmId}', String(alarmId)));
    const response = await fetchWithRefresh(url, {
      method: 'DELETE',
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok && response.status !== 204) {
      if (response.status === 401 || response.status === 403) throw new Error('Authentication failed');
      if (response.status === 404) throw new Error('Alarm not found');
      throw new Error(`Failed to delete alarm: ${response.status}`);
    }
  },

  /**
   * 알람 일괄 삭제
   */
  deleteAlarmsBulk: async (alarmIds: number[]): Promise<void> => {
    if (!alarmIds.length) throw new Error('alarmIds cannot be empty');
    const body: AlarmBulkRequest = { alarmIds };
    const url = getApiUrl(USER_ENDPOINTS.ALARM.DELETE_BULK);
    const response = await fetchWithRefresh(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      cache: 'no-store',
      body: JSON.stringify(body),
    });

    if (!response.ok && response.status !== 204) {
      if (response.status === 400) throw new Error('Invalid request');
      if (response.status === 401 || response.status === 403) throw new Error('Authentication failed');
      throw new Error(`Failed to delete alarms bulk: ${response.status}`);
    }
  },

  /**
   * 읽은 알람 전체 삭제
   */
  deleteReadAlarms: async (): Promise<void> => {
    const url = getApiUrl(USER_ENDPOINTS.ALARM.DELETE_READ);
    const response = await fetchWithRefresh(url, {
      method: 'DELETE',
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok && response.status !== 204) {
      if (response.status === 401 || response.status === 403) throw new Error('Authentication failed');
      throw new Error(`Failed to delete read alarms: ${response.status}`);
    }
  },

  /**
   * 알람 전체 삭제 (모든 페이지 조회 후 일괄 삭제)
   * @param fetchSize 한 번에 조회할 개수 (기본 100)
   * @param bulkChunkSize 일괄 삭제 시 한 번에 보낼 ID 개수 (기본 50)
   */
  deleteAllAlarms: async (fetchSize = 100, bulkChunkSize = 50): Promise<void> => {
    const allIds: number[] = [];
    let page = 0;
    let totalPage = 1;

    while (page < totalPage) {
      const res = await alarmService.getReceivedAlarmsPage({ page, size: fetchSize });
      totalPage = res.totalPage;
      allIds.push(...res.data.map((a) => a.id));
      page += 1;
    }

    if (allIds.length === 0) return;

    for (let i = 0; i < allIds.length; i += bulkChunkSize) {
      const chunk = allIds.slice(i, i + bulkChunkSize);
      await alarmService.deleteAlarmsBulk(chunk);
    }
  },
};
