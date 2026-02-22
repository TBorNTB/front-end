'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Alarm, AlarmType } from '@/types/services/alarm';
import { Bell, MessageSquare, Reply, Heart, UserPlus, ChevronRight, Clock, Loader2, CheckCheck, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { alarmService, mapAlarmApiToAlarm } from '@/lib/api/services/alarm-services';
import { useAlarmUnreadCount } from '@/hooks/useAlarmUnreadCount';
import { Checkbox } from '@/components/ui/checkbox';

const PAGE_SIZE = 5;

type SeenFilter = 'read' | 'unread' | 'all';
const SEEN_FILTER_LABELS: Record<SeenFilter, string> = {
  read: '읽은 알림',
  unread: '미확인 알림',
  all: '전체',
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
  const router = useRouter();
  const { user } = useAuth();
  const { count: unreadCount, refresh: refreshUnreadCount } = useAlarmUnreadCount();
  const [seenFilter, setSeenFilter] = useState<SeenFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<AlarmType | 'all'>('all');
  const [selectedAlarm, setSelectedAlarm] = useState<Alarm | null>(null);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [page, setPage] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState(false);

  const availableCategories: (AlarmType | 'all')[] = ['all', AlarmType.COMMENT_ADDED, AlarmType.COMMENT_REPLY_ADDED, AlarmType.POST_LIKED];

  const loadAlarms = useCallback(async (p: number, category: AlarmType | 'all', filter: SeenFilter) => {
    setIsLoading(true);
    setError(null);
    try {
      const seen = filter === 'read' ? true : filter === 'unread' ? false : undefined;
      const res = await alarmService.getReceivedAlarmsPage({
        page: p,
        size: PAGE_SIZE,
        alarmType: category === 'all' ? undefined : category,
        seen,
      });
      setAlarms(res.data.map(mapAlarmApiToAlarm));
      setTotalPage(res.totalPage);
    } catch (err) {
      console.error('Failed to load alarms:', err);
      setError('알람을 불러오는데 실패했습니다.');
      setAlarms([]);
      setTotalPage(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlarms(0, selectedCategory, seenFilter);
    setPage(0);
    setSelectedIds(new Set());
  }, [selectedCategory, seenFilter, loadAlarms]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadAlarms(newPage, selectedCategory, seenFilter);
    setSelectedIds(new Set());
  };

  const handleAlarmClick = async (alarm: Alarm, e: React.MouseEvent) => {
    e.preventDefault();
    const hasLink = alarm.link && alarm.link !== '#';
    if (!alarm.isRead) {
      try {
        await alarmService.markAsSeen(Number(alarm.id));
        setAlarms(prev => prev.map(a => (a.id === alarm.id ? { ...a, isRead: true } : a)));
        refreshUnreadCount();
      } catch (err) {
        console.error('Failed to mark alarm as seen:', err);
      }
    }
    if (hasLink) {
      router.push(alarm.link!);
      return;
    }
    setSelectedAlarm(alarm);
  };

  const handleBackToList = () => setSelectedAlarm(null);

  const handleMarkAllAsSeen = async () => {
    setActionLoading(true);
    try {
      await alarmService.markAllAsSeen();
      await loadAlarms(page, selectedCategory, seenFilter);
      refreshUnreadCount();
    } catch (e) {
      console.error('Failed to mark all as seen:', e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkMarkAsSeen = async () => {
    if (!selectedIds.size) return;
    setActionLoading(true);
    try {
      await alarmService.markAsSeenBulk(Array.from(selectedIds).map(Number));
      await loadAlarms(page, selectedCategory, seenFilter);
      setSelectedIds(new Set());
      refreshUnreadCount();
    } catch (e) {
      console.error('Failed to mark selected as seen:', e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.size) return;
    setActionLoading(true);
    try {
      await alarmService.deleteAlarmsBulk(Array.from(selectedIds).map(Number));
      await loadAlarms(page, selectedCategory, seenFilter);
      setSelectedIds(new Set());
      setSelectedAlarm(null);
      refreshUnreadCount();
    } catch (e) {
      console.error('Failed to delete selected:', e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteReadAlarms = async () => {
    setActionLoading(true);
    try {
      await alarmService.deleteReadAlarms();
      await loadAlarms(page, selectedCategory, seenFilter);
      refreshUnreadCount();
    } catch (e) {
      console.error('Failed to delete read alarms:', e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAllAlarms = async () => {
    if (!confirm('모든 알림을 삭제할까요? 이 작업은 되돌릴 수 없습니다.')) return;
    setActionLoading(true);
    try {
      await alarmService.deleteAllAlarms();
      setPage(0);
      await loadAlarms(0, selectedCategory, seenFilter);
      setSelectedAlarm(null);
      setSelectedIds(new Set());
      refreshUnreadCount();
    } catch (e) {
      console.error('Failed to delete all alarms:', e);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === alarms.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(alarms.map(a => a.id)));
  };

  const hasUnread = alarms.some(a => !a.isRead);
  const selectedCount = selectedIds.size;

  return (
    <div className="min-h-[600px]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">알림</h2>
          <p className="text-gray-600 text-sm">
            {unreadCount > 0 ? `미확인 알림 ${unreadCount}건` : '새로운 활동 알림을 확인하세요'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleMarkAllAsSeen}
            disabled={actionLoading || !hasUnread}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
          >
            <CheckCheck className="w-4 h-4" />
            모두 읽음
          </button>
          <button
            type="button"
            onClick={handleDeleteReadAlarms}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            읽은 알림 삭제
          </button>
          <button
            type="button"
            onClick={handleDeleteAllAlarms}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            알림 전체 삭제
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(['all', 'unread', 'read'] as const).map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => {
              setSeenFilter(filter);
              setPage(0);
              setSelectedAlarm(null);
              setSelectedIds(new Set());
            }}
            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
              seenFilter === filter
                ? 'bg-primary-50 border-primary-500 text-primary-700'
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {SEEN_FILTER_LABELS[filter]}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg border border-gray-200 p-2">
            <nav className="space-y-1">
              {availableCategories.map((category) => {
                const isAll = category === 'all';
                const config = isAll
                  ? { label: '전체', icon: Bell, color: 'text-gray-600', bgColor: 'bg-gray-50', activeBgColor: 'bg-gray-100' }
                  : categoryConfig[category];
                const Icon = config.icon;
                const isActive = selectedCategory === category;

                return (
                  <button
                    key={isAll ? 'all' : category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setSelectedAlarm(null);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive ? `${config.activeBgColor} ${config.color} font-medium` : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-5 h-5 ${isActive ? config.color : 'text-gray-400'}`} />
                      <span>{config.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          {selectedAlarm ? (
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
                  <div className={`p-3 rounded-lg ${categoryConfig[selectedAlarm.type]?.bgColor ?? 'bg-gray-100'}`}>
                    {(() => {
                      const Icon = categoryConfig[selectedAlarm.type]?.icon ?? Bell;
                      return <Icon className={`w-6 h-6 ${categoryConfig[selectedAlarm.type]?.color ?? 'text-gray-600'}`} />;
                    })()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{selectedAlarm.content}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                      <Clock className="w-4 h-4" />
                      <span>{formatTimeAgo(selectedAlarm.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  {selectedAlarm.relatedUser && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">관련 사용자</p>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {selectedAlarm.relatedUser.nickname.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{selectedAlarm.relatedUser.nickname}</span>
                      </div>
                    </div>
                  )}

                  {selectedAlarm.link && selectedAlarm.link !== '#' && (
                    <Link
                      href={selectedAlarm.link}
                      className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      <span>게시글 보기</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200">
              {alarms.length > 0 && (
                <div className="p-3 border-b border-gray-200 flex items-center gap-4 flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={alarms.length > 0 && selectedIds.size === alarms.length}
                      onCheckedChange={toggleSelectAll}
                    />
                    <span className="text-sm font-medium">전체 선택</span>
                  </label>
                  {selectedCount > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={handleBulkMarkAsSeen}
                        disabled={actionLoading}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        선택 읽음 ({selectedCount})
                      </button>
                      <button
                        type="button"
                        onClick={handleBulkDelete}
                        disabled={actionLoading}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        선택 삭제
                      </button>
                    </>
                  )}
                </div>
              )}

              {isLoading ? (
                <div className="p-12 text-center">
                  <Loader2 className="w-10 h-10 text-gray-400 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-600">알림을 불러오는 중...</p>
                </div>
              ) : error ? (
                <div className="p-12 text-center">
                  <p className="text-red-600">{error}</p>
                </div>
              ) : alarms.length === 0 ? (
                <div className="p-12 text-center">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">알림이 없습니다</p>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-gray-200">
                    {alarms.map((alarm) => {
                      const config = categoryConfig[alarm.type] ?? { icon: Bell, bgColor: 'bg-gray-50', color: 'text-gray-600' };
                      const Icon = config.icon;

                      return (
                        <div
                          key={alarm.id}
                          className={`flex items-start gap-3 p-4 text-left ${
                            !alarm.isRead
                              ? 'bg-blue-50/50 hover:bg-blue-100/50 border-l-4 border-blue-500'
                              : 'bg-white hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex-shrink-0 pt-0.5">
                            <Checkbox
                              checked={selectedIds.has(alarm.id)}
                              onCheckedChange={() => toggleSelect(alarm.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <Link
                            href={alarm.link || '#'}
                            onClick={(e) => handleAlarmClick(alarm, e)}
                            className="flex-1 min-w-0 flex items-start gap-4"
                          >
                            <div className={`p-2 rounded-lg flex-shrink-0 ${alarm.isRead ? 'bg-gray-100' : config.bgColor}`}>
                              <Icon className={`w-5 h-5 ${alarm.isRead ? 'text-gray-400' : config.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-1">
                                <h4 className={`font-medium ${alarm.isRead ? 'text-gray-600' : 'text-gray-900 font-semibold'}`}>
                                  {alarm.content}
                                </h4>
                                {!alarm.isRead && (
                                  <span className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 mt-1.5 ml-2 animate-pulse" />
                                )}
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-gray-400">
                                <Clock className="w-3 h-3" />
                                <span>{formatTimeAgo(alarm.createdAt)}</span>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
                          </Link>
                        </div>
                      );
                    })}
                  </div>

                  {totalPage > 1 && (
                    <div className="p-4 border-t border-gray-200 flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page <= 0}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                      >
                        이전
                      </button>
                      <span className="px-3 py-1.5 text-sm text-gray-600">
                        {page + 1} / {totalPage}
                      </span>
                      <button
                        type="button"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page >= totalPage - 1}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                      >
                        다음
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
