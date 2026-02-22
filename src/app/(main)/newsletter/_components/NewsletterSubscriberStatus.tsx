"use client";

import { useMemo, useState } from 'react';
import { Mail, Search, AlertCircle, CheckCircle2, Loader2, XCircle, Pencil, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  newsletterService,
  NewsletterSubscriberStatusResponse,
  EmailFrequency,
} from '@/lib/api/services/newsletter-services';
import { CategoryType, CategoryDisplayNames } from '@/types/services/category';

interface NewsletterSubscriberStatusProps {
  className?: string;
}

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function NewsletterSubscriberStatus({ className = '' }: NewsletterSubscriberStatusProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<NewsletterSubscriberStatusResponse | null>(null);

  const [mode, setMode] = useState<'view' | 'edit' | 'verify'>('view');
  const [editEmailFrequency, setEditEmailFrequency] = useState<EmailFrequency>('DAILY');
  const [editSelectedCategories, setEditSelectedCategories] = useState<string[]>([]);
  const [editChasingPopularity, setEditChasingPopularity] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const categories = useMemo(() => {
    const list = data?.selectedCategories ?? [];
    // backend가 중복 카테고리를 반환하는 케이스가 있어서 UI에서는 dedupe
    return Array.from(new Set(list));
  }, [data?.selectedCategories]);

  const allCategories = useMemo(() => Object.values(CategoryType), []);

  const toggleEditCategory = (category: CategoryType) => {
    setEditSelectedCategories((prev) => {
      if (prev.includes(category)) return prev.filter((c) => c !== category);
      return [...prev, category];
    });
  };

  const handleCheck = async () => {
    if (!email) {
      setError('이메일을 입력해주세요.');
      setData(null);
      return;
    }

    if (!isValidEmail(email)) {
      setError('올바른 이메일 형식을 입력해주세요.');
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);
    setActionError(null);
    setActionSuccess(null);
    setMode('view');

    try {
      const response = await newsletterService.status(email);
      setData(response);
      setEditEmailFrequency((response.emailFrequency ?? 'DAILY') as EmailFrequency);
      setEditSelectedCategories(Array.from(new Set(response.selectedCategories ?? [])));
      setEditChasingPopularity(Boolean(response.chasingPopularity));
      setVerificationCode('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '구독 상태 조회 중 오류가 발생했습니다.';
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const canEdit = Boolean(data?.registered && data?.active);
  const canOpenEdit = Boolean(data?.registered);

  const startEdit = () => {
    if (!data) return;
    if (!data.registered) {
      setActionError(data.message || '등록된 구독자가 없습니다.');
      return;
    }
    if (!data.active) {
      const baseMessage = (data.message || '구독 해제 상태입니다.').trim();
      const guidance = '수정을 원하시면 같은 이메일(계정)로 다시 구독해주세요.';

      setActionError(
        baseMessage.includes('수정을 원하시면')
          ? baseMessage
          : `${baseMessage} ${guidance}`
      );
      return;
    }

    setActionError(null);
    setActionSuccess(null);
    setVerificationCode('');
    setMode('edit');
  };

  const requestPreferencesCode = async () => {
    if (!data) return;

    if (editSelectedCategories.length === 0) {
      setActionError('최소 하나 이상의 카테고리를 선택해주세요.');
      return;
    }

    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await newsletterService.preferencesSendCode({
        email: data.email,
        emailFrequency: editEmailFrequency,
        selectedCategories: editSelectedCategories,
        chasingPopularity: editChasingPopularity,
      });
      setActionSuccess(res.message || '선호도 수정용 인증 코드가 이메일로 전송되었습니다.');
      setMode('verify');
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : '인증 코드 요청 중 오류가 발생했습니다.');
    } finally {
      setActionLoading(false);
    }
  };

  const verifyAndUpdatePreferences = async () => {
    if (!data) return;

    if (!verificationCode) {
      setActionError('인증 코드를 입력해주세요.');
      return;
    }

    if (verificationCode.length < 5) {
      setActionError('인증 코드를 확인해주세요.');
      return;
    }

    if (editSelectedCategories.length === 0) {
      setActionError('최소 하나 이상의 카테고리를 선택해주세요.');
      return;
    }

    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await newsletterService.preferencesVerify({
        email: data.email,
        code: verificationCode,
      });

      setActionSuccess(res.message || '선호도 수정이 완료되었습니다.');

      // 최신 상태로 다시 조회해서 화면 반영
      const updated = await newsletterService.status(data.email);
      setData(updated);
      setEditEmailFrequency((updated.emailFrequency ?? 'DAILY') as EmailFrequency);
      setEditSelectedCategories(Array.from(new Set(updated.selectedCategories ?? [])));
      setEditChasingPopularity(Boolean(updated.chasingPopularity));
      setMode('view');
      setVerificationCode('');
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : '선호도 수정 중 오류가 발생했습니다.');
    } finally {
      setActionLoading(false);
    }
  };

  const statusBadge = (() => {
    if (!data) return null;

    if (!data.registered) {
      return (
        <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
          <XCircle className="h-4 w-4" />
          미등록
        </div>
      );
    }

    if (data.active) {
      return (
        <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
          <CheckCircle2 className="h-4 w-4" />
          구독 중
        </div>
      );
    }

    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
        <AlertCircle className="h-4 w-4" />
        구독 해제 상태
      </div>
    );
  })();

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      <div className="bg-white rounded-lg shadow-lg border border-primary-100 p-6 md:p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
            <Search className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-primary-800 mb-2">구독 상태 확인</h2>
          <p className="text-gray-700">이메일이 구독되어 있는지 확인할 수 있어요</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {actionError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{actionError}</p>
          </div>
        )}

        {actionSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{actionSuccess}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="status-email" className="block text-sm font-medium text-gray-700 mb-2">
              이메일 주소 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <Input
                id="status-email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCheck();
                }}
              />
              <Button onClick={handleCheck} disabled={loading} className="shrink-0">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    조회 중
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    조회
                  </>
                )}
              </Button>
            </div>
          </div>

          {data && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-700">이메일</p>
                  <p className="text-base font-semibold text-gray-900 break-all">{data.email}</p>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  {statusBadge}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!canOpenEdit || actionLoading}
                    onClick={startEdit}
                    title={!canOpenEdit ? '등록된 구독자만 수정할 수 있어요' : '선호도 수정'}
                  >
                    <Pencil className="w-4 h-4" />
                    수정
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-md bg-white border border-gray-200 p-3">
                  <p className="text-xs font-semibold text-gray-700">수신 빈도</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {data.emailFrequency ?? '-'}
                  </p>
                </div>

                <div className="rounded-md bg-white border border-gray-200 p-3">
                  <p className="text-xs font-semibold text-gray-700">활성 상태</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {data.registered ? (data.active ? 'ACTIVE' : 'INACTIVE') : '-'}
                  </p>
                </div>

                <div className="rounded-md bg-white border border-gray-200 p-3">
                  <p className="text-xs font-semibold text-gray-700">인기 콘텐츠 추적</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {data.registered ? (data.chasingPopularity ? 'ON' : 'OFF') : '-'}
                  </p>
                </div>

                <div className="rounded-md bg-white border border-gray-200 p-3 md:col-span-2">
                  <p className="text-xs font-semibold text-gray-700">선택 카테고리</p>
                  {categories.length === 0 ? (
                    <p className="text-sm text-gray-700 mt-1">-</p>
                  ) : (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {categories.map((c) => (
                        <span
                          key={c}
                          className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-800"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-md bg-white border border-gray-200 p-3 md:col-span-2">
                  <p className="text-xs font-semibold text-gray-700">메시지</p>
                  <p className="text-sm text-gray-800 mt-1">{data.message || '-'}</p>
                </div>
              </div>

              {!data.registered && (
                <div className="mt-4 text-sm text-gray-700">
                  아직 구독자가 아닙니다. 아래 구독 폼에서 바로 구독할 수 있어요.
                </div>
              )}

              {mode !== 'view' && (
                <div className="mt-6 rounded-lg border border-primary-100 bg-white p-4">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">구독 선호도 수정</p>
                      <p className="text-xs text-gray-700">
                        수정하려면 이메일로 받은 인증 코드가 필요합니다
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={actionLoading}
                      onClick={() => {
                        setMode('view');
                        setActionError(null);
                        setActionSuccess(null);
                        setVerificationCode('');
                        setEditEmailFrequency((data.emailFrequency ?? 'DAILY') as EmailFrequency);
                        setEditSelectedCategories(Array.from(new Set(data.selectedCategories ?? [])));
                        setEditChasingPopularity(Boolean(data.chasingPopularity));
                      }}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      닫기
                    </Button>
                  </div>

                  {/* Frequency */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">이메일 수신 빈도</p>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="pref-frequency"
                          value="DAILY"
                          checked={editEmailFrequency === 'DAILY'}
                          onChange={() => setEditEmailFrequency('DAILY')}
                          disabled={actionLoading}
                          className="w-4 h-4 text-primary-600 focus:ring-primary-500 cursor-pointer"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-primary-600">매일</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="pref-frequency"
                          value="WEEKLY"
                          checked={editEmailFrequency === 'WEEKLY'}
                          onChange={() => setEditEmailFrequency('WEEKLY')}
                          disabled={actionLoading}
                          className="w-4 h-4 text-primary-600 focus:ring-primary-500 cursor-pointer"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-primary-600">매주</span>
                      </label>
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">관심 카테고리</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {allCategories.map((category) => {
                        const isSelected = editSelectedCategories.includes(category);
                        return (
                          <label
                            key={category}
                            className={`
                              flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition-all
                              ${isSelected
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50/50'
                              }
                            `}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleEditCategory(category)}
                              disabled={actionLoading}
                            />
                            <span className="text-xs text-gray-700 font-medium">
                              {CategoryDisplayNames[category]}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    {editSelectedCategories.length === 0 && (
                      <p className="text-xs text-red-500 mt-2">최소 하나 이상의 카테고리를 선택해주세요.</p>
                    )}
                  </div>

                  {/* Chasing Popularity */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">인기 콘텐츠 추적</p>
                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all">
                      <Checkbox
                        checked={editChasingPopularity}
                        onCheckedChange={(checked) => setEditChasingPopularity(checked === true)}
                        disabled={actionLoading}
                      />
                      <div>
                        <p className="text-sm text-gray-800 font-medium">인기 콘텐츠를 우선 추천받기</p>
                        <p className="text-xs text-gray-700">트렌딩/인기 주제를 우선적으로 받아볼 수 있어요</p>
                      </div>
                    </label>
                  </div>

                  {mode === 'edit' && (
                    <Button
                      onClick={requestPreferencesCode}
                      disabled={actionLoading || editSelectedCategories.length === 0}
                      className="w-full"
                    >
                      {actionLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          처리 중...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4" />
                          인증 코드 받기
                        </>
                      )}
                    </Button>
                  )}

                  {mode === 'verify' && (
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="pref-code" className="block text-sm font-medium text-gray-700 mb-2">
                          인증 코드 <span className="text-red-500">*</span>
                        </label>
                        <Input
                          id="pref-code"
                          type="text"
                          placeholder="인증 코드 입력"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.trim())}
                          disabled={actionLoading}
                          className="w-full text-center text-xl tracking-widest font-mono"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') verifyAndUpdatePreferences();
                          }}
                        />
                        <p className="text-xs text-gray-700 mt-2 text-center">
                          {data.email}로 전송된 인증 코드를 입력해주세요
                        </p>
                      </div>

                      <Button
                        onClick={verifyAndUpdatePreferences}
                        disabled={actionLoading || verificationCode.length === 0 || editSelectedCategories.length === 0}
                        className="w-full"
                      >
                        {actionLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            확인 중...
                          </>
                        ) : (
                          '저장'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
