'use client';

import { useState, useRef, useEffect } from 'react';
import { Alarm, AlarmType, AlarmCategory } from '@/types/alarm';
import { Bell, MessageSquare, Reply, Heart, UserPlus, X, Clock, Trash2, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/core';
import Link from 'next/link';
import { alarmService, AlarmResponse } from '@/lib/api/services/alarm-service';

// API 응답을 Alarm 인터페이스로 변환
const mapAlarmResponseToAlarm = (response: AlarmResponse): Alarm => {
  return {
    id: response.id,
    type: response.alarmType,
    title: response.title,
    // message가 있으면 message를 우선 사용, 없으면 content 사용
    content: response.message || response.content || '',
    isRead: response.isRead,
    createdAt: response.createdAt,
    link: response.link,
    relatedUser: response.relatedUser,
    relatedPost: response.relatedPost,
  };
};

// Mock data - API 실패 시 fallback
const mockAlarms: Alarm[] = [
  {
    id: '1',
    type: AlarmType.COMMENT_ADDED,
    title: '새로운 댓글이 달렸습니다',
    content: '김민수님이 "보안 프로젝트 진행 중" 게시글에 댓글을 남겼습니다.',
    isRead: false,
    createdAt: '2024-01-15T10:30:00Z',
    link: '/CSblog/post/123',
    relatedUser: {
      nickname: '김민수',
      profileImage: undefined,
    },
    relatedPost: {
      id: '123',
      title: '보안 프로젝트 진행 중',
    },
  },
  {
    id: '2',
    type: AlarmType.COMMENT_REPLY_ADDED,
    title: '댓글에 답글이 달렸습니다',
    content: '이영희님이 당신의 댓글에 답글을 남겼습니다.',
    isRead: false,
    createdAt: '2024-01-15T09:15:00Z',
    link: '/CSblog/post/123#comment-456',
    relatedUser: {
      nickname: '이영희',
    },
  },
  {
    id: '3',
    type: AlarmType.POST_LIKED,
    title: '게시글에 좋아요가 눌렸습니다',
    content: '박지훈님 외 3명이 "Next.js 보안 가이드" 게시글에 좋아요를 눌렀습니다.',
    isRead: true,
    createdAt: '2024-01-14T16:45:00Z',
    link: '/CSblog/post/456',
    relatedPost: {
      id: '456',
      title: 'Next.js 보안 가이드',
    },
  },
  {
    id: '4',
    type: AlarmType.COMMENT_ADDED,
    title: '새로운 댓글이 달렸습니다',
    content: '최수진님이 "프로젝트 회고" 게시글에 댓글을 남겼습니다.',
    isRead: true,
    createdAt: '2024-01-14T14:20:00Z',
    link: '/projects/789',
    relatedUser: {
      nickname: '최수진',
    },
    relatedPost: {
      id: '789',
      title: '프로젝트 회고',
    },
  },
  {
    id: '5',
    type: AlarmType.SIGNUP,
    title: '새로운 회원이 가입했습니다',
    content: '홍길동님이 회원가입을 완료했습니다.',
    isRead: false,
    createdAt: '2024-01-14T11:00:00Z',
    link: '/admin/members',
    relatedUser: {
      nickname: '홍길동',
    },
  },
];

const categoryConfig = {
  all: {
    label: '전체',
    icon: Bell,
  },
  [AlarmType.COMMENT_ADDED]: {
    label: '댓글',
    icon: MessageSquare,
  },
  [AlarmType.COMMENT_REPLY_ADDED]: {
    label: '답글',
    icon: Reply,
  },
  [AlarmType.POST_LIKED]: {
    label: '좋아요',
    icon: Heart,
  },
  [AlarmType.SIGNUP]: {
    label: '회원가입',
    icon: UserPlus,
  },
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return '방금 전';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`;
  
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

interface AlarmPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AlarmPopup({ isOpen, onClose }: AlarmPopupProps) {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<AlarmType>(AlarmType.COMMENT_ADDED);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [allAlarms, setAllAlarms] = useState<Alarm[]>([]); // 전체 알람 (읽지 않은 개수 계산용)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === UserRole.ADMIN;

  // 전체 알람 로드 (읽지 않은 개수 계산용)
  useEffect(() => {
    if (!isOpen) return;

    const loadAllAlarms = async () => {
      try {
        // 각 카테고리별로 알람을 로드하여 읽지 않은 개수 계산
        const categories: AlarmType[] = isAdmin
          ? [AlarmType.COMMENT_ADDED, AlarmType.COMMENT_REPLY_ADDED, AlarmType.POST_LIKED, AlarmType.SIGNUP]
          : [AlarmType.COMMENT_ADDED, AlarmType.COMMENT_REPLY_ADDED, AlarmType.POST_LIKED];
        
        const allAlarmsPromises = categories.map(category => 
          alarmService.getReceivedAlarms(category).then(response => 
            response.map(mapAlarmResponseToAlarm)
          )
        );
        
        const allAlarmsArrays = await Promise.all(allAlarmsPromises);
        const flattened = allAlarmsArrays.flat();
        setAllAlarms(flattened);
      } catch (err) {
        console.error('Failed to load all alarms for counts:', err);
      }
    };

    loadAllAlarms();
  }, [isOpen, isAdmin]);

  // 선택된 카테고리의 알람 데이터 로드
  useEffect(() => {
    if (!isOpen) return;

    const loadAlarms = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await alarmService.getReceivedAlarms(selectedCategory);
        const mappedAlarms = response.map(mapAlarmResponseToAlarm);
        setAlarms(mappedAlarms);
      } catch (err) {
        console.error('Failed to load alarms:', err);
        setError('알람을 불러오는데 실패했습니다.');
        // Fallback to mock data for development
        setAlarms(mockAlarms.filter(a => a.type === selectedCategory));
      } finally {
        setIsLoading(false);
      }
    };

    loadAlarms();
  }, [isOpen, selectedCategory]);

  // 카테고리별 알람 필터링 (API에서 이미 필터링된 데이터를 받음)
  const filteredAlarms = alarms;

  // 읽지 않은 알람 개수 (전체 알람 기준)
  const unreadCounts = {
    [AlarmType.COMMENT_ADDED]: allAlarms.filter(a => a.type === AlarmType.COMMENT_ADDED && !a.isRead).length,
    [AlarmType.COMMENT_REPLY_ADDED]: allAlarms.filter(a => a.type === AlarmType.COMMENT_REPLY_ADDED && !a.isRead).length,
    [AlarmType.POST_LIKED]: allAlarms.filter(a => a.type === AlarmType.POST_LIKED && !a.isRead).length,
    [AlarmType.SIGNUP]: allAlarms.filter(a => a.type === AlarmType.SIGNUP && !a.isRead).length,
  };

  // 사용 가능한 카테고리 목록 (전체 제거)
  const availableCategories: AlarmType[] = isAdmin
    ? [AlarmType.COMMENT_ADDED, AlarmType.COMMENT_REPLY_ADDED, AlarmType.POST_LIKED, AlarmType.SIGNUP]
    : [AlarmType.COMMENT_ADDED, AlarmType.COMMENT_REPLY_ADDED, AlarmType.POST_LIKED];

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      
      {/* Popup */}
      <div className="fixed top-16 right-4 z-50 w-[480px] max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-2xl border border-gray-200 max-h-[calc(100vh-5rem)] flex flex-col md:top-20 md:right-4">
        <div ref={popupRef} className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">알림</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  // 삭제 기능 구현
                  console.log('Delete all');
                }}
                className="text-sm text-gray-700 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100 font-medium"
              >
                삭제하기
              </button>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center border-b border-gray-200 px-4 overflow-x-auto">
            {availableCategories.map((category) => {
              const config = categoryConfig[category];
              const Icon = config.icon;
              const isActive = selectedCategory === category;
              const unreadCount = unreadCounts[category];

              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-primary-500 text-primary-600 font-semibold'
                      : 'border-transparent text-gray-700 hover:text-gray-900 font-medium'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{config.label}</span>
                  {unreadCount > 0 && (
                    <span className="text-xs font-semibold px-1.5 py-0.5 bg-red-500 text-white rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Alarm List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
                <p className="text-gray-700 font-medium">알림을 불러오는 중...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-red-600 mb-2 font-semibold">{error}</p>
                <p className="text-gray-700 text-sm font-medium">알림을 불러오는데 실패했습니다.</p>
              </div>
            ) : filteredAlarms.length === 0 ? (
              <div className="p-12 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-700 font-medium">알림이 없습니다</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredAlarms.map((alarm) => {
                  const config = categoryConfig[alarm.type];
                  const Icon = config.icon;

                  return (
                    <Link
                      key={alarm.id}
                      href={alarm.link || '#'}
                      onClick={onClose}
                      className={`block p-4 hover:bg-gray-50 transition-colors ${
                        !alarm.isRead ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Profile Picture or Icon */}
                        <div className="flex-shrink-0">
                          {alarm.relatedUser ? (
                            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {alarm.relatedUser.nickname.charAt(0)}
                            </div>
                          ) : (
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              alarm.isRead ? 'bg-gray-100' : 'bg-primary-100'
                            }`}>
                              <Icon className={`w-5 h-5 ${
                                alarm.isRead ? 'text-gray-400' : 'text-primary-600'
                              }`} />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className={`text-sm font-semibold ${
                              alarm.isRead ? 'text-gray-800' : 'text-gray-900'
                            }`}>
                              {alarm.title}
                            </h4>
                            {!alarm.isRead && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5 ml-2"></span>
                            )}
                          </div>
                          
                          <p className={`text-sm mb-2 line-clamp-2 font-medium ${
                            alarm.isRead ? 'text-gray-700' : 'text-gray-900'
                          }`}>
                            {alarm.content}
                          </p>

                          {alarm.relatedPost && (
                            <p className="text-xs text-gray-700 mb-2 font-medium">
                              {alarm.relatedPost.title}
                            </p>
                          )}

                          <div className="flex items-center space-x-2 text-xs text-gray-600">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimeAgo(alarm.createdAt)}</span>
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer - 전체 보기 링크 */}
          <div className="p-4 border-t border-gray-200 text-center">
            <Link
              href="/mypage/alarms"
              onClick={onClose}
              className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
            >
              전체 알림 보기
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

