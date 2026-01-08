'use client';

import { useState, useEffect } from 'react';
import { Alarm, AlarmType } from '@/types/services/alarm';
import { Bell, MessageSquare, Reply, Heart, UserPlus, ChevronRight, Clock, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/core';
import { alarmService, AlarmResponse } from '@/lib/api/services/alarm-services';

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

const categoryConfig = {
  [AlarmType.COMMENT_ADDED]: {
    label: '댓글',
    icon: MessageSquare,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    activeBgColor: 'bg-blue-100',
  },
  [AlarmType.COMMENT_REPLY_ADDED]: {
    label: '답글',
    icon: Reply,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    activeBgColor: 'bg-purple-100',
  },
  [AlarmType.POST_LIKED]: {
    label: '좋아요',
    icon: Heart,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    activeBgColor: 'bg-red-100',
  },
  [AlarmType.SIGNUP]: {
    label: '회원가입',
    icon: UserPlus,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    activeBgColor: 'bg-green-100',
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

export default function AlarmsPage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<AlarmType>(AlarmType.COMMENT_ADDED);
  const [selectedAlarm, setSelectedAlarm] = useState<Alarm | null>(null);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [allAlarms, setAllAlarms] = useState<Alarm[]>([]); // 전체 알람 (읽지 않은 개수 계산용)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.role === UserRole.ADMIN;

  // 전체 알람 로드 (읽지 않은 개수 계산용)
  useEffect(() => {
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
  }, [isAdmin]);

  // 선택된 카테고리의 알람 데이터 로드
  useEffect(() => {
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
        setAlarms([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAlarms();
  }, [selectedCategory]);

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

  const handleAlarmClick = (alarm: Alarm) => {
    setSelectedAlarm(alarm);
    // 실제로는 여기서 읽음 처리 API 호출
  };

  const handleBackToList = () => {
    setSelectedAlarm(null);
  };

  return (
    <div className="min-h-[600px]">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">알림</h2>
        <p className="text-gray-600 text-sm">새로운 활동 알림을 확인하세요</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* 왼쪽: 카테고리 탭 */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg border border-gray-200 p-2">
            <nav className="space-y-1">
              {availableCategories.map((category) => {
                const config = categoryConfig[category];
                const Icon = config.icon;
                const isActive = selectedCategory === category;
                const unreadCount = unreadCounts[category];

                return (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setSelectedAlarm(null);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? `${config.activeBgColor} ${config.color} font-medium`
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-5 h-5 ${isActive ? config.color : 'text-gray-400'}`} />
                      <span>{config.label}</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white text-gray-700' : 'bg-red-500 text-white'
                      }`}>
                        {unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* 오른쪽: 알람 목록 또는 상세 */}
        <main className="flex-1 min-w-0">
          {selectedAlarm ? (
            /* 알람 상세 보기 */
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <button
                onClick={handleBackToList}
                className="mb-4 text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-1"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                <span>목록으로</span>
              </button>

              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${
                    categoryConfig[selectedAlarm.type].bgColor
                  }`}>
                    {(() => {
                      const Icon = categoryConfig[selectedAlarm.type].icon;
                      return <Icon className={`w-6 h-6 ${categoryConfig[selectedAlarm.type].color}`} />;
                    })()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {selectedAlarm.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                      <Clock className="w-4 h-4" />
                      <span>{formatTimeAgo(selectedAlarm.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {selectedAlarm.content}
                  </p>

                  {selectedAlarm.relatedUser && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">관련 사용자</p>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {selectedAlarm.relatedUser.nickname.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">
                          {selectedAlarm.relatedUser.nickname}
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedAlarm.relatedPost && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">관련 게시글</p>
                      <p className="font-medium text-gray-900">
                        {selectedAlarm.relatedPost.title}
                      </p>
                    </div>
                  )}

                  {selectedAlarm.link && (
                    <a
                      href={selectedAlarm.link}
                      className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      <span>게시글 보기</span>
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* 알람 목록 */
            <div className="bg-white rounded-lg border border-gray-200">
              {filteredAlarms.length === 0 ? (
                <div className="p-12 text-center">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">알림이 없습니다</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredAlarms.map((alarm) => {
                    const config = categoryConfig[alarm.type];
                    const Icon = config.icon;

                    return (
                      <button
                        key={alarm.id}
                        onClick={() => handleAlarmClick(alarm)}
                        className={`w-full p-4 hover:bg-gray-50 transition-colors text-left ${
                          !alarm.isRead ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          <div className={`p-2 rounded-lg flex-shrink-0 ${
                            alarm.isRead ? 'bg-gray-100' : config.bgColor
                          }`}>
                            <Icon className={`w-5 h-5 ${
                              alarm.isRead ? 'text-gray-400' : config.color
                            }`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h4 className={`font-medium ${
                                alarm.isRead ? 'text-gray-600' : 'text-gray-900'
                              }`}>
                                {alarm.title}
                              </h4>
                              {!alarm.isRead && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5 ml-2"></span>
                              )}
                            </div>
                            <p className={`text-sm mb-2 line-clamp-2 ${
                              alarm.isRead ? 'text-gray-500' : 'text-gray-700'
                            }`}>
                              {alarm.content}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-gray-400">
                              <Clock className="w-3 h-3" />
                              <span>{formatTimeAgo(alarm.createdAt)}</span>
                            </div>
                          </div>

                          <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

