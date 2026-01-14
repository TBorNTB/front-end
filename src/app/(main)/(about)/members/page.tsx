// app/members/page.tsx
'use client';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { memberService, UserResponse } from '@/lib/api/services/user-services';
import { getRoleDisplayLabel, getRoleBadgeColor } from '@/lib/role-utils';
import {
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

// 날짜 포맷팅 헬퍼
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
};

export default function MembersPage() {
  const [members, setMembers] = useState<UserResponse[]>([]);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
              <p className="text-gray-600">멤버 정보를 불러오는 중...</p>
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
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
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
                    className="text-sm text-gray-500 hover:text-gray-700 whitespace-nowrap"
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
              <p className="text-gray-600">
                총 <span className="font-semibold text-primary-700">{members.length}</span>명의 멤버
                {(selectedLevels.length > 0 || debouncedSearchTerm) && (
                  <span className="ml-2 text-sm text-gray-500">
                    (필터 적용됨)
                  </span>
                )}
              </p>
            </div>

                {/* Members Grid */}
                {members.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="text-gray-500 text-lg mb-2">검색 결과가 없습니다</div>
                    <p className="text-gray-400">다른 조건으로 검색해보세요</p>
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
                              src={member.profileImageUrl || '/default-avatar.svg'}
                              alt={getDisplayName(member)}
                              width={80}
                              height={80}
                              className="w-20 h-20 rounded-full object-cover border-4 border-gray-200 group-hover:border-primary-300 transition-colors"
                            />
                          </div>
                          <h3 className="font-bold text-lg text-foreground mt-3 group-hover:text-primary-700 transition-colors">
                            {getDisplayName(member)}
                          </h3>
                          <p className="text-gray-600 text-sm">{member.email}</p>
                        </div>

                        {/* Member Info */}
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-center">
                            <Badge className={getRoleBadgeColor(member.role)}>
                              {getRoleDisplayLabel(member.role)}
                            </Badge>
                          </div>

                          {member.description && (
                            <p className="text-gray-600 text-sm line-clamp-2 text-center">{member.description}</p>
                          )}

                          <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>가입일: {formatDate(member.createdAt)}</span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="mt-4">
                          <button className="w-full btn btn-primary btn-sm hover:scale-105">
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
                            <span key={page} className="px-2 text-gray-500">
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
    </div>
  );
}
