// app/members/page.tsx
'use client';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { memberService, UserResponse } from '@/lib/api/services/user-services';
import {
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';

// 회원 등급 정의
const memberLevels = [
  { key: 'GUEST', label: '게스트' },
  { key: 'ASSOCIATE_MEMBER', label: '준회원' },
  { key: 'FULL_MEMBER', label: '정회원' },
  { key: 'SENIOR', label: '선배님' },
  { key: 'ADMIN', label: '운영진' }
];

// 날짜 포맷팅 헬퍼
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
};

export default function MembersPage() {
  const [members, setMembers] = useState<UserResponse[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<UserResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(6);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Load members data
  useEffect(() => {
    const loadMembers = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await memberService.getMembers({
          page: currentPage,
          size: pageSize,
        });

        setMembers(response.data);
        setTotalElements(response.data.length);
        setTotalPages(response.totalPage);
      } catch (err: any) {
        console.error('Failed to load members:', err);
        setError(err.message || '멤버 정보를 불러올 수 없습니다.');
        setMembers([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadMembers();
  }, [currentPage, pageSize]);

  // Filter members
  useEffect(() => {
    let filtered = members;

    // Search filter
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(member =>
        member.realName?.toLowerCase().includes(query) ||
        member.nickname?.toLowerCase().includes(query) ||
        member.username?.toLowerCase().includes(query) ||
        member.description?.toLowerCase().includes(query)
      );
    }

    // Level filter
    if (selectedLevels.length > 0) {
      filtered = filtered.filter(member => selectedLevels.includes(member.role));
    }

    setFilteredMembers(filtered);
  }, [members, searchTerm, selectedLevels]);

  const handleLevelToggle = (level: string) => {
    setSelectedLevels(prev =>
      prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedLevels([]);
  };

  const getLevelBadgeColor = (role: string) => {
    switch (role) {
      case 'GUEST':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'ASSOCIATE_MEMBER':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'FULL_MEMBER':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'SENIOR':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ADMIN':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLevelLabel = (role: string) => {
    const levelObj = memberLevels.find(l => l.key === role);
    return levelObj?.label || role;
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
                SSG를 만들어나가는 뛰어난 동료들을 만나보세요
              </p>
            </div>

            {/* Filter Bar */}
            <div className="card mb-8">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
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

                {/* Level Filter */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">등급:</span>
                  {memberLevels.map((level) => (
                    <button
                      key={level.key}
                      onClick={() => handleLevelToggle(level.key)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                        selectedLevels.includes(level.key)
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>

                {/* Clear Filters */}
                {(selectedLevels.length > 0 || searchTerm) && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    <X className="h-4 w-4" />
                    초기화
                  </button>
                )}
              </div>
            </div>

            {/* Results Info */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                총 <span className="font-semibold text-primary-700">{totalElements}</span>명의 멤버
                {filteredMembers.length !== totalElements && (
                  <span className="ml-2 text-sm text-gray-500">
                    (필터 결과: {filteredMembers.length}명)
                  </span>
                )}
              </p>
            </div>

                {/* Members Grid */}
                {filteredMembers.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="text-gray-500 text-lg mb-2">검색 결과가 없습니다</div>
                    <p className="text-gray-400">다른 조건으로 검색해보세요</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMembers.map((member) => (
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
                            <Badge className={getLevelBadgeColor(member.role)}>
                              {getLevelLabel(member.role)}
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
