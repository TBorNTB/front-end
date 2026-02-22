// app/members/page.tsx
'use client';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import TitleBanner from '@/components/layout/TitleBanner';
import { memberService, profileService, UserResponse } from '@/lib/api/services/user-services';
import { getRoleDisplayLabel, getRoleBadgeColor } from '@/lib/role-utils';
import {
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

// 날짜 포맷팅 헬퍼
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '-';
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
};

const normalizeTech = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed.length === 1) return trimmed.toUpperCase();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
};

const parseTechStack = (techStack?: string | null): string[] => {
  if (!techStack) return [];
  return techStack
    .split(',')
    .map((t) => normalizeTech(t))
    .filter(Boolean);
};

const isPlaceholder = (value?: string | null) => {
  if (!value) return true;
  const trimmed = value.trim();
  return trimmed === '' || trimmed === 'string' || trimmed === 'null' || trimmed === 'undefined';
};

const isValidExternalLink = (url?: string | null) => {
  if (isPlaceholder(url)) return false;
  return true;
};

const displayValue = (value?: string | null) => (isPlaceholder(value) ? '-' : value!.trim());

export default function MembersPage() {
  const [members, setMembers] = useState<UserResponse[]>([]);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Profile modal state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileUsername, setProfileUsername] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserResponse | null>(null);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(6);
  const [totalPages, setTotalPages] = useState(0);

  // 검색어 debounce (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(0); // 검색 시 첫 페이지로
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 처음 로드 시 role 목록 API 호출
  useEffect(() => {
    const loadAllRoles = async () => {
      try {
        const roles = await memberService.getAllRoles();
        setAvailableRoles(roles);
      } catch (err) {
        console.error('Failed to load roles:', err);
      }
    };
    loadAllRoles();
  }, []);

  // Load members data (API 필터링)
  const loadMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await memberService.getMembers({
        page: currentPage,
        size: pageSize,
        roles: selectedLevels.length > 0 ? selectedLevels : undefined,
        realName: debouncedSearchTerm || undefined,
      });

      setMembers(response.data);
      setTotalPages(response.totalPage);
    } catch (err: any) {
      console.error('Failed to load members:', err);
      setError(err.message || '멤버 정보를 불러올 수 없습니다.');
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, selectedLevels, debouncedSearchTerm]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleLevelToggle = (level: string) => {
    setSelectedLevels(prev =>
      prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
    setCurrentPage(0); // 필터 변경 시 첫 페이지로
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedLevels([]);
  };

  const closeProfile = () => {
    setIsProfileOpen(false);
  };

  const openProfile = async (username: string) => {
    setIsProfileOpen(true);
    setProfileUsername(username);
    setProfile(null);
    setProfileError(null);
    setProfileLoading(true);

    try {
      const data = await profileService.getProfileByUsername(username);
      setProfile(data);
    } catch (err) {
      setProfile(null);
      setProfileError(err instanceof Error ? err.message : '프로필 조회에 실패했습니다.');
    } finally {
      setProfileLoading(false);
    }
  };

  // 표시용 이름 가져오기
  const getDisplayName = (member: UserResponse) => {
    return member.realName || member.nickname || member.username;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-gray-700">멤버 정보를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
              <p className="text-red-600 mb-2">멤버 정보를 불러올 수 없습니다</p>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary mt-4"
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TitleBanner
        title="Members"
        description="SSG를 만들어가는 멤버들을 만나보세요."
        backgroundImage="/images/BgHeader.png"
      />
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-500/3 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-secondary-500/4 rounded-full blur-2xl"></div>
      </div>

      <div className="relative">
        <section className="section py-12">
          <div className="container">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-primary-700 mb-4">멤버</h1>
              <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                SSG의 뛰어난 구성원들을 만나보세요
              </p>
            </div>

            {/* Filter Bar */}
            <div className="card mb-8">
              {/* Search Row */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-700" />
                  <input
                    type="text"
                    placeholder="이름, 닉네임 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                             focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200
                             transition-all duration-300"
                  />
                </div>
                {(selectedLevels.length > 0 || searchTerm) && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-gray-700 hover:text-primary-600 whitespace-nowrap transition-colors"
                  >
                    초기화
                  </button>
                )}
              </div>

              {/* Level Filter Row */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">등급:</span>
                {availableRoles.map((role) => (
                  <button
                    key={role}
                    onClick={() => handleLevelToggle(role)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors whitespace-nowrap ${
                      selectedLevels.includes(role)
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                    }`}
                  >
                    {getRoleDisplayLabel(role)}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Info */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-700">
                총 <span className="font-semibold text-primary-700">{members.length}</span>명의 멤버
                {(selectedLevels.length > 0 || debouncedSearchTerm) && (
                  <span className="ml-2 text-sm text-gray-700">
                    (필터 적용됨)
                  </span>
                )}
              </p>
            </div>

                {/* Members Grid */}
                {members.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="text-gray-700 text-lg mb-2">검색 결과가 없습니다</div>
                    <p className="text-gray-700">다른 조건으로 검색해보세요</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="card group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                      >
                        {/* Member Header */}
                        <div className="text-center mb-4">
                          <div className="relative inline-block">
                            <ImageWithFallback
                              src={member.profileImageUrl || '/images/placeholder/default-avatar.svg'}
                              alt={getDisplayName(member)}
                              width={80}
                              height={80}
                              className="w-20 h-20 rounded-full object-cover border-4 border-gray-200 group-hover:border-primary-300 transition-colors"
                            />
                          </div>
                          <h3 className="font-bold text-lg text-foreground mt-3 group-hover:text-primary-700 transition-colors">
                            {getDisplayName(member)}
                          </h3>
                          <p className="text-gray-700 text-sm">{member.email}</p>
                        </div>

                        {/* Member Info */}
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-center">
                            <Badge className={getRoleBadgeColor(member.role)}>
                              {getRoleDisplayLabel(member.role)}
                            </Badge>
                          </div>

                          {member.description && (
                            <p className="text-gray-700 text-sm line-clamp-2 text-center">{member.description}</p>
                          )}

                          <div className="flex items-center justify-center gap-1 text-sm text-gray-700">
                            <Calendar className="h-3 w-3" />
                            <span>가입일: {formatDate(member.createdAt)}</span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="mt-4">
                          <button
                            type="button"
                            onClick={() => openProfile(member.username)}
                            className="w-full btn btn-primary btn-sm hover:scale-105 inline-flex items-center justify-center"
                          >
                            프로필 보기
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                      disabled={currentPage === 0}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i).map((page) => {
                        if (
                          page === 0 ||
                          page === totalPages - 1 ||
                          (page >= currentPage - 2 && page <= currentPage + 2)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-4 py-2 rounded-lg border transition-colors ${
                                currentPage === page
                                  ? 'bg-primary-600 text-white border-primary-600'
                                  : 'border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {page + 1}
                            </button>
                          );
                        } else if (
                          page === currentPage - 3 ||
                          page === currentPage + 3
                        ) {
                          return (
                            <span key={page} className="px-2 text-gray-700">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                      disabled={currentPage >= totalPages - 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
          </div>
        </section>
      </div>

      {/* Profile Modal */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="멤버 프로필"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            onClick={closeProfile}
            aria-label="닫기"
          />

          <div className="relative z-10 w-[92vw] max-w-2xl rounded-xl bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">멤버 프로필</h2>
                <p className="text-sm text-gray-700">@{profileUsername ?? '-'}</p>
              </div>
              <button
                type="button"
                className="p-2 rounded-md hover:bg-gray-100"
                onClick={closeProfile}
                aria-label="닫기"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-5 py-5">
              {profileLoading ? (
                <div className="flex items-center justify-center py-10 text-gray-700">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> 로딩중...
                </div>
              ) : profileError ? (
                <div className="py-6">
                  <p className="text-sm text-red-600">{profileError}</p>
                </div>
              ) : !profile ? (
                <div className="py-6">
                  <p className="text-sm text-gray-700">프로필 정보를 찾을 수 없습니다.</p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="shrink-0">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                      <ImageWithFallback
                        src={profile.profileImageUrl || '/images/placeholder/default-avatar.svg'}
                        alt={profile.realName || profile.nickname || profile.username}
                        type="avatar"
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-bold text-foreground">
                        {profile.realName || profile.nickname || profile.username}
                      </h3>
                      <Badge className={getRoleBadgeColor(profile.role)}>
                        {getRoleDisplayLabel(profile.role)}
                      </Badge>
                    </div>

                    <div className="mt-2 text-sm text-gray-700">@{profile.username}</div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg border border-gray-200 px-3 py-2">
                        <div className="text-xs text-gray-700 mb-0.5">ID</div>
                        <div className="text-gray-900">{profile.id}</div>
                      </div>
                      <div className="rounded-lg border border-gray-200 px-3 py-2">
                        <div className="text-xs text-gray-700 mb-0.5">이메일</div>
                        <div className="text-gray-900 break-all">{displayValue(profile.email)}</div>
                      </div>
                      <div className="rounded-lg border border-gray-200 px-3 py-2">
                        <div className="text-xs text-gray-700 mb-0.5">닉네임</div>
                        <div className="text-gray-900">{displayValue(profile.nickname)}</div>
                      </div>
                      <div className="rounded-lg border border-gray-200 px-3 py-2">
                        <div className="text-xs text-gray-700 mb-0.5">실명</div>
                        <div className="text-gray-900">{displayValue(profile.realName)}</div>
                      </div>
                      <div className="rounded-lg border border-gray-200 px-3 py-2">
                        <div className="text-xs text-gray-700 mb-0.5">가입일</div>
                        <div className="text-gray-900">{isPlaceholder(profile.createdAt) ? '-' : formatDateTime(profile.createdAt)}</div>
                      </div>
                      <div className="rounded-lg border border-gray-200 px-3 py-2">
                        <div className="text-xs text-gray-700 mb-0.5">수정일</div>
                        <div className="text-gray-900">{isPlaceholder(profile.updatedAt) ? '-' : formatDateTime(profile.updatedAt)}</div>
                      </div>
                    </div>

                    <div className="mt-2 space-y-1 text-sm text-gray-700">
                      <p>
                        <span className="font-medium text-foreground">소개:</span>{' '}
                        {isPlaceholder(profile.description) ? '-' : profile.description}
                      </p>
                    </div>

                    <div className="mt-4">
                      <div className="text-sm font-medium text-foreground mb-2">기술스택:</div>
                      {parseTechStack(profile.techStack).length === 0 ? (
                        <div className="text-sm text-gray-700">-</div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {parseTechStack(profile.techStack).map((t) => (
                            <Badge key={t} variant="outline" size="sm">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="rounded-lg border border-gray-200 px-3 py-2">
                        <div className="text-xs text-gray-700 mb-0.5">GitHub</div>
                        {isValidExternalLink(profile.githubUrl) ? (
                          <a className="text-sm text-primary-600 underline break-all" href={profile.githubUrl} target="_blank" rel="noreferrer">
                            {profile.githubUrl}
                          </a>
                        ) : (
                          <div className="text-sm text-gray-700">-</div>
                        )}
                      </div>

                      <div className="rounded-lg border border-gray-200 px-3 py-2">
                        <div className="text-xs text-gray-700 mb-0.5">LinkedIn</div>
                        {isValidExternalLink(profile.linkedinUrl) ? (
                          <a className="text-sm text-primary-600 underline break-all" href={profile.linkedinUrl} target="_blank" rel="noreferrer">
                            {profile.linkedinUrl}
                          </a>
                        ) : (
                          <div className="text-sm text-gray-700">-</div>
                        )}
                      </div>

                      <div className="rounded-lg border border-gray-200 px-3 py-2">
                        <div className="text-xs text-gray-700 mb-0.5">Blog</div>
                        {isValidExternalLink(profile.blogUrl) ? (
                          <a className="text-sm text-primary-600 underline break-all" href={profile.blogUrl} target="_blank" rel="noreferrer">
                            {profile.blogUrl}
                          </a>
                        ) : (
                          <div className="text-sm text-gray-700">-</div>
                        )}
                      </div>
                    </div>

                    {!isPlaceholder(profile.profileImageUrl) && (
                      <div className="mt-4 text-sm">
                        <div className="text-xs text-gray-700 mb-1">프로필 이미지 URL</div>
                        <div className="break-all text-gray-700">{profile.profileImageUrl}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
