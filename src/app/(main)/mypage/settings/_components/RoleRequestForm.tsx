'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';

import { profileService, roleService, UserResponse } from '@/lib/api/services/user-services';
import { UserRole, UserRoleDescription, UserRoleDisplay } from '@/types/core';

const REQUESTABLE_ROLES: UserRole[] = [
  UserRole.ASSOCIATE_MEMBER,
  UserRole.FULL_MEMBER,
  UserRole.SENIOR,
  UserRole.ADMIN,
];

export default function RoleRequestForm() {
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.ADMIN);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await profileService.getProfile();
        setProfile(data);

        const currentRole = (data.role as UserRole) || UserRole.GUEST;
        const defaultRole = REQUESTABLE_ROLES.includes(UserRole.ADMIN)
          ? UserRole.ADMIN
          : REQUESTABLE_ROLES[0];

        // 현재 역할과 같은 값은 피해서 기본 선택
        setSelectedRole(currentRole === defaultRole ? (REQUESTABLE_ROLES[0] ?? UserRole.ADMIN) : defaultRole);
      } catch (e: any) {
        setError(e?.message || '프로필 정보를 불러올 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const currentRole = useMemo(() => {
    const raw = profile?.role;
    if (!raw) return UserRole.GUEST;
    const values = Object.values(UserRole) as string[];
    return (values.includes(raw) ? raw : UserRole.GUEST) as UserRole;
  }, [profile?.role]);

  const options = useMemo(() => {
    return REQUESTABLE_ROLES.filter((role) => role !== currentRole);
  }, [currentRole]);

  const handleSubmit = async () => {
    if (!selectedRole) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const message = await roleService.requestRole(selectedRole);
      toast.success(message || '권한 요청이 접수되었습니다.');
    } catch (e: any) {
      const msg = e?.message || '권한 요청에 실패했습니다.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-700">계정 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-2">{error || '정보를 불러올 수 없습니다.'}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary mt-4">
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">권한 요청</h1>
          <p className="text-gray-700 mt-2">원하는 사용자 권한을 요청할 수 있습니다.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="h-5 w-5 text-primary-600" />
          <h2 className="text-xl font-semibold text-foreground">요청할 권한 선택</h2>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-700">현재 권한</div>
            <div className="text-base font-semibold text-gray-900 mt-1">{UserRoleDisplay[currentRole] || currentRole}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">요청 권한</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white
                         focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200
                         transition-all duration-300"
            >
              {options.length === 0 ? (
                <option value={selectedRole}>
                  요청 가능한 권한이 없습니다
                </option>
              ) : (
                options.map((role) => (
                  <option key={role} value={role}>
                    {UserRoleDisplay[role]} ({role})
                  </option>
                ))
              )}
            </select>
            <p className="text-xs text-gray-700 mt-2">{UserRoleDescription[selectedRole] || ''}</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || options.length === 0}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700
                         transition-colors font-medium flex items-center gap-2
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  요청 중...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  권한 요청하기
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-gray-700">
            권한 요청은 운영진 승인 절차가 필요할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
