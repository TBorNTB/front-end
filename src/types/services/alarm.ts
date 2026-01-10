// types/alarm.ts
export enum AlarmType {
  COMMENT_ADDED = 'COMMENT_ADDED',
  COMMENT_REPLY_ADDED = 'COMMENT_REPLY_ADDED',
  POST_LIKED = 'POST_LIKED',
  SIGNUP = 'SIGNUP', // Admin only
}

export interface Alarm {
  id: string;
  type: AlarmType;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  link?: string; // 알람 클릭 시 이동할 링크
  relatedUser?: {
    nickname: string;
    profileImage?: string;
  };
  relatedPost?: {
    id: string;
    title: string;
  };
}

export type AlarmCategory = 'all' | AlarmType;

