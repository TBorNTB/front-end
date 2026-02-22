'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Alarm, AlarmType } from '@/types/services/alarm';
import { Bell, MessageSquare, Reply, Heart, UserPlus, X, Clock, ChevronRight, Loader2, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/core';
import Link from 'next/link';
import { alarmService, mapAlarmApiToAlarm } from '@/lib/api/services/alarm-services';
import { Checkbox } from '@/components/ui/checkbox';

const POPUP_PAGE_SIZE = 5;

type SeenFilter = 'read' | 'unread' | 'all';
const SEEN_FILTER_LABELS: Record<SeenFilter, string> = {
  read: '읽은 알림',
  unread: '미확인',
  all: '전체',
};

const categoryConfig = {
  [AlarmType.COMMENT_ADDED]: {
    label: '댓글',
    icon: MessageSquare,
    color: 'text-blue-600',
    activeColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    activeBgColor: 'bg-blue-100',
    borderColor: 'border-blue-500',
    iconBgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  [AlarmType.COMMENT_REPLY_ADDED]: {
    label: '답글',
    icon: Reply,
    color: 'text-purple-600',
    activeColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
    activeBgColor: 'bg-purple-100',
    borderColor: 'border-purple-500',
    iconBgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  [AlarmType.POST_LIKED]: {
    label: '좋아요',
    icon: Heart,
    color: 'text-red-600',
    activeColor: 'text-red-700',
    bgColor: 'bg-red-50',
    activeBgColor: 'bg-red-100',
    borderColor: 'border-red-500',
    iconBgColor: 'bg-red-100',
    iconColor: 'text-red-600',
  },
  [AlarmType.SIGNUP]: {
    label: '회원가입',
    icon: UserPlus,
    color: 'text-green-600',
    activeColor: 'text-green-700',
    bgColor: 'bg-green-50',
    activeBgColor: 'bg-green-100',
    borderColor: 'border-green-500',
    iconBgColor: 'bg-green-100',
    iconColor: 'text-green-600',
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
  /** 읽음/삭제 후 헤더 뱃지 갱신용 */
  onRefreshUnread?: () => void;
}

export default function AlarmPopup({ isOpen, onClose, onRefreshUnread }: AlarmPopupProps) {
  const { user } = useAuth();
  const [seenFilter, setSeenFilter] = useState<SeenFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<AlarmType | 'all'>('all');
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [page, setPage] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === UserRole.ADMIN;

  const availableCategories: (AlarmType | 'all')[] = isAdmin
    ? ['all', AlarmType.COMMENT_ADDED, AlarmType.COMMENT_REPLY_ADDED, AlarmType.POST_LIKED, AlarmType.SIGNUP]
    : ['all', AlarmType.COMMENT_ADDED, AlarmType.COMMENT_REPLY_ADDED, AlarmType.POST_LIKED];

  const loadAlarms = useCallback(async (p: number) => {
    if (!isOpen) return;
    setIsLoading(true);
    setError(null);
    try {
      const seen = seenFilter === 'read' ? true : seenFilter === 'unread' ? false : undefined;
      const res = await alarmService.getReceivedAlarmsPage({
        page: p,
        size: POPUP_PAGE_SIZE,
        alarmType: selectedCategory === 'all' ? undefined : selectedCategory,
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
  }, [isOpen, selectedCategory, seenFilter]);

  useEffect(() => {
    setPage(0);
    setSelectedIds(new Set());
  }, [selectedCategory, seenFilter]);

  useEffect(() => {
    if (isOpen) loadAlarms(page);
  }, [isOpen, selectedCategory, seenFilter, page, loadAlarms]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [isOpen, onClose]);

  const handleAlarmClick = async (alarm: Alarm) => {
    if (!alarm.isRead) {
      try {
        await alarmService.markAsSeen(Number(alarm.id));
        setAlarms(prev => prev.map(a => (a.id === alarm.id ? { ...a, isRead: true } : a)));
        onRefreshUnread?.();
      } catch (e) {
        console.error('Failed to mark alarm as seen:', e);
      }
    }
    if (alarm.link && alarm.link !== '#') {
      window.location.href = alarm.link;
    }
    onClose();
  };

  const handleDeleteRead = async () => {
    setActionLoading(true);
    try {
      await alarmService.deleteReadAlarms();
      await loadAlarms(page);
      onRefreshUnread?.();
    } catch (e) {
      console.error('Failed to delete read alarms:', e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('모든 알림을 삭제할까요? 되돌릴 수 없습니다.')) return;
    setActionLoading(true);
    try {
      await alarmService.deleteAllAlarms();
      setPage(0);
      await loadAlarms(0);
      setSelectedIds(new Set());
      onRefreshUnread?.();
    } catch (e) {
      console.error('Failed to delete all alarms:', e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.size) return;
    setActionLoading(true);
    try {
      await alarmService.deleteAlarmsBulk(Array.from(selectedIds).map(Number));
      await loadAlarms(page);
      setSelectedIds(new Set());
      onRefreshUnread?.();
    } catch (e) {
      console.error('Failed to delete selected:', e);
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

  const goToPage = (p: number) => {
    if (p < 0 || p >= totalPage) return;
    setPage(p);
    setSelectedIds(new Set());
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      <div
        ref={popupRef}
        className="fixed top-16 right-4 z-50 w-[480px] max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-2xl border border-gray-200 max-h-[calc(100vh-5rem)] flex flex-col md:top-20 md:right-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-secondary-50">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary-500 rounded-lg">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">알림</h2>
            </div>
            <div className="flex items-center space-x-2 flex-wrap justify-end">
              <button
                type="button"
                onClick={handleDeleteRead}
                disabled={actionLoading}
                className="text-sm text-gray-700 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100 font-medium disabled:opacity-50"
              >
                읽은 알림 삭제
              </button>
              <button
                type="button"
                onClick={handleDeleteAll}
                disabled={actionLoading}
                className="text-sm text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 font-medium disabled:opacity-50"
              >
                알림 전체 삭제
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-100 bg-gray-50/50">
            {(['all', 'unread', 'read'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => {
                  setSeenFilter(filter);
                  setPage(0);
                  setSelectedIds(new Set());
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  seenFilter === filter
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {SEEN_FILTER_LABELS[filter]}
              </button>
            ))}
          </div>

          <div className="flex items-center border-b border-gray-200 px-4 overflow-x-auto">
            {availableCategories.map((category) => {
              const isAll = category === 'all';
              const config = isAll
                ? {
                    label: '전체',
                    icon: Bell,
                    color: 'text-gray-600',
                    activeColor: 'text-primary-600',
                    bgColor: 'bg-gray-50',
                    activeBgColor: 'bg-primary-50',
                    borderColor: 'border-primary-500',
                    iconBgColor: 'bg-blue-100',
                    iconColor: 'text-blue-600',
                  }
                : categoryConfig[category];
              const Icon = config.icon;
              const isActive = selectedCategory === category;

              return (
                <button
                  key={isAll ? 'all' : category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? `${config.borderColor} ${config.activeColor} font-semibold ${config.activeBgColor}`
                      : `border-transparent ${config.color} hover:${config.activeBgColor} font-medium hover:${config.activeColor}`
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? config.activeColor : config.color}`} />
                  <span className="text-sm">{config.label}</span>
                </button>
              );
            })}
          </div>

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
            ) : alarms.length === 0 ? (
              <div className="p-12 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-700 font-medium">알림이 없습니다</p>
              </div>
            ) : (
              <>
                <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between gap-2 flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={alarms.length > 0 && selectedIds.size === alarms.length}
                      onCheckedChange={toggleSelectAll}
                    />
                    <span className="text-xs font-medium text-gray-600">전체 선택</span>
                  </label>
                  {selectedIds.size > 0 && (
                    <button
                      type="button"
                      onClick={handleBulkDelete}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      일괄삭제 ({selectedIds.size})
                    </button>
                  )}
                </div>
                <div className="divide-y divide-gray-100">
                  {alarms.map((alarm) => {
                    const config = categoryConfig[alarm.type] ?? categoryConfig[AlarmType.COMMENT_ADDED];
                    const Icon = config.icon;

                    return (
                      <div
                        key={alarm.id}
                        className={`flex items-start gap-2 p-4 transition-all ${
                          !alarm.isRead
                            ? `${config.bgColor} hover:${config.activeBgColor} border-l-4 ${config.borderColor}`
                            : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex-shrink-0 pt-0.5" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedIds.has(alarm.id)}
                            onCheckedChange={() => toggleSelect(alarm.id)}
                          />
                        </div>
                        <Link
                          href={alarm.link || '#'}
                          onClick={(e) => {
                            e.preventDefault();
                            handleAlarmClick(alarm);
                          }}
                          className="flex-1 min-w-0 flex items-start space-x-3"
                        >
                          <div className="flex-shrink-0">
                            {alarm.relatedUser ? (
                              <div className={`w-10 h-10 ${config.iconBgColor} rounded-full flex items-center justify-center text-white text-sm font-medium`}>
                                {alarm.relatedUser.nickname.charAt(0)}
                              </div>
                            ) : (
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${alarm.isRead ? 'bg-gray-100' : config.iconBgColor}`}>
                                <Icon className={`w-5 h-5 ${alarm.isRead ? 'text-gray-400' : config.iconColor}`} />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h4 className={`text-sm font-semibold ${alarm.isRead ? 'text-gray-800' : 'text-gray-900'}`}>
                                {alarm.content}
                              </h4>
                              {!alarm.isRead && (
                                <span
                                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 ml-2 animate-pulse ${
                                    alarm.type === AlarmType.COMMENT_ADDED
                                      ? 'bg-blue-500'
                                      : alarm.type === AlarmType.COMMENT_REPLY_ADDED
                                        ? 'bg-purple-500'
                                        : alarm.type === AlarmType.POST_LIKED
                                          ? 'bg-red-500'
                                          : 'bg-green-500'
                                  }`}
                                />
                              )}
                            </div>

                            <div className="flex items-center space-x-2 text-xs text-gray-600">
                              <Clock className="w-3 h-3" />
                              <span>{formatTimeAgo(alarm.createdAt)}</span>
                            </div>
                          </div>

                          <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
                        </Link>
                      </div>
                    );
                  })}
                </div>
                {totalPage > 1 && (
                  <div className="p-3 border-t border-gray-200 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => goToPage(page - 1)}
                      disabled={page <= 0 || actionLoading}
                      className="px-2 py-1.5 text-xs font-medium border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                      이전
                    </button>
                    <span className="px-2 text-xs text-gray-600">
                      {page + 1} / {totalPage}
                    </span>
                    <button
                      type="button"
                      onClick={() => goToPage(page + 1)}
                      disabled={page >= totalPage - 1 || actionLoading}
                      className="px-2 py-1.5 text-xs font-medium border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                      다음
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="p-4 border-t border-gray-200 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
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
