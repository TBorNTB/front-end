// types/services/alarm.ts — API 명세 기준

export enum AlarmType {
  COMMENT_ADDED = 'COMMENT_ADDED',
  COMMENT_REPLY_ADDED = 'COMMENT_REPLY_ADDED',
  POST_LIKED = 'POST_LIKED',
  SIGNUP = 'SIGNUP',
}

export type DomainType = 'NEWS' | 'PROJECT' | 'QNA' | 'DOCUMENT' | 'ARTICLE' | 'GLOBAL';

/** API 응답 알람 (가이드 명세) */
export interface AlarmApi {
  id: number;
  alarmType: AlarmType;
  domainType: DomainType;
  domainId: number;
  actorUsername: string;
  ownerUsername: string;
  message: string;
  seen: boolean;
  createdAt: string;
}

/** 목록 조회 응답 */
export interface AlarmListResponse {
  message: string;
  size: number;
  page: number;
  totalPage: number;
  data: AlarmApi[];
}

/** 미확인 개수 응답 */
export interface AlarmUnreadCountResponse {
  count: number;
}

/** 일괄 요청 Body (읽음 일괄 / 삭제 일괄) */
export interface AlarmBulkRequest {
  alarmIds: number[];
}

/** UI용 알람 (API → 화면 매핑) */
export interface Alarm {
  id: string;
  type: AlarmType;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
  domainType?: string;
  domainId?: string | number;
  relatedUser?: { nickname: string; profileImage?: string };
  relatedPost?: { id: string; title: string };
}

export type AlarmCategory = 'all' | AlarmType;
