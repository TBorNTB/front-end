'use client';

import { useState, useEffect, useCallback } from 'react';
import { alarmService } from '@/lib/api/services/alarm-services';
import { useAuth } from '@/context/AuthContext';

const POLL_INTERVAL_MS = 60_000; // 1분

export function useAlarmUnreadCount() {
  const { isAuthenticated } = useAuth();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setCount(0);
      return;
    }
    try {
      const n = await alarmService.getUnreadCount();
      setCount(n);
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

  return { count, refresh };
}
