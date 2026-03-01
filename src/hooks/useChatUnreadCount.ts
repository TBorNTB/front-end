'use client';

import { useState, useEffect, useCallback } from 'react';
import { getChatRooms } from '@/lib/api/services/chat-services';
import { useAuth } from '@/context/AuthContext';

const POLL_INTERVAL_MS = 60_000; // 1분
const ROOMS_PAGE_SIZE = 100; // 미읽음 합산용으로 가져올 방 개수

export function useChatUnreadCount() {
  const { isAuthenticated } = useAuth();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setCount(0);
      return;
    }
    try {
      const res = await getChatRooms({ size: ROOMS_PAGE_SIZE });
      const total = (res.items || []).reduce(
        (sum, room) => sum + (typeof room.unreadCount === 'number' ? room.unreadCount : 0),
        0
      );
      setCount(total);
    } catch {
      setCount(0);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
    if (!isAuthenticated) return;
    const t = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(t);
  }, [isAuthenticated, refresh]);

  // 채팅방 읽음 처리 시 배지 갱신
  useEffect(() => {
    if (!isAuthenticated) return;
    const handler = () => refresh();
    window.addEventListener('chat:roomRead', handler);
    return () => window.removeEventListener('chat:roomRead', handler);
  }, [isAuthenticated, refresh]);

  return { count, refresh };
}
