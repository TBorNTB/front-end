'use client';

import { useRef, useEffect, useState } from 'react';
import { setSessionExpiryPromptHandler } from '@/lib/api/session-expiry-prompt';
import { useAuth } from '@/context/AuthContext';

export default function SessionExpiryModal() {
  const [visible, setVisible] = useState(false);
  const resolveRef = useRef<((keep: boolean) => void) | null>(null);
  const { logout } = useAuth();

  useEffect(() => {
    const handler = () => {
      setVisible(true);
      return new Promise<boolean>((resolve) => {
        resolveRef.current = (keep: boolean) => {
          resolveRef.current = null;
          resolve(keep);
        };
      });
    };
    setSessionExpiryPromptHandler(handler);
    return () => setSessionExpiryPromptHandler(null);
  }, []);

  const handleKeepSession = () => {
    resolveRef.current?.(true);
    setVisible(false);
  };

  const handleLogout = async () => {
    resolveRef.current?.(false);
    setVisible(false);
    await logout();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          로그인 상태가 만료되었습니다
        </h3>
        <p className="text-gray-600 text-sm">
          로그인 상태를 유지하시겠습니까? 유지하시면 자동으로 다시 로그인됩니다.
        </p>
        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            로그아웃
          </button>
          <button
            type="button"
            onClick={handleKeepSession}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
          >
            로그인 유지
          </button>
        </div>
      </div>
    </div>
  );
}
