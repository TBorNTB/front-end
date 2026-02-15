"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchWithRefresh } from '@/lib/api/fetch-with-refresh';
import { AuthUser, mapUserToAuthUser } from '@/app/(auth)/types/auth';
import { Loader2 } from 'lucide-react';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loadUser } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('인증 처리 중...');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        console.log('OAuth callback page loaded');
        
        // URL 파라미터 확인 (에러가 있는지)
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (error) {
          console.error('OAuth error:', error, errorDescription);
          setStatus('error');
          setMessage(`인증 실패: ${errorDescription || error}`);
          
          setTimeout(() => {
            router.push('/login');
          }, 3000);
          return;
        }

        // 백엔드에서 쿠키를 설정했는지 확인하기 위해 사용자 정보 가져오기 시도
        console.log('Fetching user profile after OAuth...');
        
        const response = await fetchWithRefresh('/api/auth/user', {
          method: 'GET',
          cache: 'no-store',
        });

        if (!response.ok) {
          // 인증 실패 - 쿠키가 설정되지 않았거나 만료됨
          console.error('Failed to fetch user profile:', response.status);
          setStatus('error');
          setMessage('인증에 실패했습니다. 다시 시도해주세요.');
          
          setTimeout(() => {
            router.push('/login');
          }, 3000);
          return;
        }

        const data = await response.json();
        console.log('User profile data:', data);

        if (data.authenticated && data.user) {
          // 사용자 정보 매핑
          const authUser = mapUserToAuthUser(data.user);
          console.log('Mapped auth user:', authUser);
          
          // 로그인 상태로 설정
          login(authUser, true);
          
          setStatus('success');
          setMessage('로그인 성공! 홈페이지로 이동합니다...');
          
          // 홈페이지로 리다이렉트
          setTimeout(() => {
            router.push('/');
          }, 1000);
        } else {
          // 사용자 정보가 없음
          console.error('User data not found in response');
          setStatus('error');
          setMessage('사용자 정보를 가져올 수 없습니다.');
          
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage('인증 처리 중 오류가 발생했습니다.');
        
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    };

    handleOAuthCallback();
  }, [searchParams, router, login]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-background">
      <div className="flex flex-col items-center justify-center space-y-4">
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
            <p className="text-lg font-medium text-gray-700">{message}</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-medium text-green-600">{message}</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-lg font-medium text-red-600">{message}</p>
            <p className="text-sm text-gray-500">잠시 후 로그인 페이지로 이동합니다...</p>
          </>
        )}
      </div>
    </div>
  );
}

