// useCurrentUser (SWR-gated variant)
import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';
import { profileService, type UserResponse } from '@/lib/api/services/user-service';

export function useCurrentUser() {
  const { isAuthenticated } = useAuth();
  const { data, error, isLoading, mutate } = useSWR<UserResponse>(
    isAuthenticated ? '/api/auth/user' : null,
    () => profileService.getProfile()
  );
  return { user: data ?? null, error, isLoading, refresh: () => mutate() };
}