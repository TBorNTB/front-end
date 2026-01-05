// src/lib/hooks/useCurrentUser.ts
'use client';
import useSWR from 'swr'; 
import { profileService, type UserResponse } from '@/lib/api/services/user-service';

export function useCurrentUser() {
  const { data, error, isLoading } = useSWR<UserResponse>(
    '/api/auth/user', // Your route handler!
    () => profileService.getProfile()
  );
  return { user: data, error, isLoading };
}
