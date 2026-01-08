// app/members/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { 
  Search, 
  Calendar,
  MapPin,
  Loader2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { memberService, UserResponse } from '@/lib/api/services/user-services';

// Types for member data
interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
  level: 'ASSOCIATE' | 'REGULAR' | 'SENIOR' | 'ADMIN';
  avatar?: string;
  bio?: string;
  location?: string;
  joinDate: string;
  skills: string[];
  projects: number;
  articles: number;
  badges: number;
  isOnline?: boolean;
  lastActive?: string;
}

// API 응답을 Member 형식으로 변환하는 헬퍼 함수
const transformUserToMember = (user: UserResponse): Member => {
  // role을 기반으로 level 매핑 (API 응답의 role 필드 사용)
  const roleToLevelMap: Record<string, 'ASSOCIATE' | 'REGULAR' | 'SENIOR' | 'ADMIN'> = {
    'ASSOCIATE': 'ASSOCIATE',
    'REGULAR': 'REGULAR',
    'SENIOR': 'SENIOR',
    'ADMIN': 'ADMIN',
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  return {
    id: user.id,
    name: user.realName || user.nickname || user.username,
    email: user.email,
    role: user.role || 'Member',
    level: roleToLevelMap[user.role] || 'ASSOCIATE',
    avatar: user.profileImageUrl || undefined,
    bio: user.description || undefined,
    location: '', // API 응답에 없으므로 빈 문자열
    joinDate: formatDate(user.createdAt),
    skills: [], // API 응답에 없으므로 빈 배열 (필터는 클라이언트에서 처리)
    projects: 0, // API 응답에 없으므로 0
    articles: 0, // API 응답에 없으므로 0
    badges: 0, // API 응답에 없으므로 0
  };
};

// Updated member levels with your UserRole system
const memberLevels = [
  { key: 'ASSOCIATE', label: '준회원' },
  { key: 'REGULAR', label: '정회원' },
  { key: 'SENIOR', label: '선배님' },
  { key: 'ADMIN', label: '운영진' }
];

const skillOptions = [
  'React', 'TypeScript', 'Next.js', 'Python', 'Java', 'Spring', 
  'Node.js', 'Vue.js', 'Angular', 'Docker', 'Kubernetes', 'AWS',
  'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Wireshark', 'Burp Suite'
];

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
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

        const transformedMembers = response.userResponses.map(transformUserToMember);
        setMembers(transformedMembers);
        setTotalElements(response.totalElements);
        setTotalPages(Math.ceil(response.totalElements / pageSize));
      } catch (err: any) {
        console.error('Failed to load members:', err);
        setError(err.message || '멤버 정보를 불러올 수 없습니다.');
        // 에러 발생 시 빈 배열로 설정
        setMembers([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadMembers();
  }, [currentPage, pageSize]);

  // Filter members based on search term, levels, and skills
  // Note: 현재는 클라이언트 사이드 필터링만 지원합니다.
  // 서버 사이드 필터링이 필요한 경우 API를 수정해야 합니다.
  useEffect(() => {
    let filtered = members;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.bio?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Level filter
    if (selectedLevels.length > 0) {
      filtered = filtered.filter(member => selectedLevels.includes(member.level));
    }

    // Skills filter
    if (selectedSkills.length > 0) {
      filtered = filtered.filter(member =>
        selectedSkills.some(skill => member.skills.includes(skill))
      );
    }

    setFilteredMembers(filtered);
  }, [members, searchTerm, selectedLevels, selectedSkills]);

  const handleLevelToggle = (level: string) => {
    setSelectedLevels(prev =>
      prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedLevels([]);
    setSelectedSkills([]);
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'ASSOCIATE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'REGULAR':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'SENIOR':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ADMIN':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLevelLabel = (level: string) => {
    const levelObj = memberLevels.find(l => l.key === level);
    return levelObj?.label || level;
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

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Sidebar - Filters */}
              <aside className="lg:w-80 flex-shrink-0">
                <div className="card sticky top-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-primary-700">필터 옵션</h2>
                    {(selectedLevels.length > 0 || selectedSkills.length > 0 || searchTerm) && (
                      <button
                        onClick={clearAllFilters}
                        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                      >
                        <X className="h-4 w-4" />
                        초기화
                      </button>
                    )}
                  </div>

                  {/* Search */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      멤버 검색
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input
                        type="text"
                        placeholder="이름, 역할 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg
                                 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200
                                 transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Level Filter */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">회원 등급</h3>
                    <div className="space-y-2">
                      {memberLevels.map((level) => (
                        <label key={level.key} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedLevels.includes(level.key)}
                            onChange={() => handleLevelToggle(level.key)}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <span className="text-gray-700 font-medium">{level.label}</span>
                          <span className="text-sm text-gray-500">
                            ({members.filter(m => m.level === level.key).length})
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Skills Filter */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">기술 스택</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {skillOptions.map((skill) => (
                        <label key={skill} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedSkills.includes(skill)}
                            onChange={() => handleSkillToggle(skill)}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <span className="text-gray-700">{skill}</span>
                          <span className="text-sm text-gray-500">
                            ({members.filter(m => m.skills.includes(skill)).length})
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>

              {/* Main Content */}
              <main className="flex-1">
                {/* Results Header */}
                <div className="flex items-center justify-between mb-8">
                  <p className="text-gray-600">
                    총 <span className="font-semibold text-primary-700">{totalElements}</span>명의 멤버
                    {filteredMembers.length !== totalElements && (
                      <span className="ml-2 text-sm text-gray-500">
                        (현재 페이지: {filteredMembers.length}명)
                      </span>
                    )}
                  </p>
                  
                  {/* Active Filters */}
                  {(selectedLevels.length > 0 || selectedSkills.length > 0) && (
                    <div className="flex flex-wrap gap-2">
                      {selectedLevels.map((level) => (
                        <Badge
                          key={level}
                          className="bg-primary-100 text-primary-800 border-primary-200 cursor-pointer hover:bg-primary-200"
                          onClick={() => handleLevelToggle(level)}
                        >
                          {getLevelLabel(level)}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                      {selectedSkills.map((skill) => (
                        <Badge
                          key={skill}
                          className="bg-secondary-100 text-secondary-800 border-secondary-200 cursor-pointer hover:bg-secondary-200"
                          onClick={() => handleSkillToggle(skill)}
                        >
                          {skill}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  )}
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
                              src={member.avatar || '/default-avatar.png'}
                              alt={member.name}
                              width={80}
                              height={80}
                              className="w-20 h-20 rounded-full object-cover border-4 border-gray-200 group-hover:border-primary-300 transition-colors"
                            />
                            {member.isOnline && (
                              <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                            )}
                          </div>
                          <h3 className="font-bold text-lg text-foreground mt-3 group-hover:text-primary-700 transition-colors">
                            {member.name}
                          </h3>
                          <p className="text-gray-600 text-sm">{member.email}</p>
                        </div>

                        {/* Member Info */}
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between">
                            <Badge className={getLevelBadgeColor(member.level)}>
                              {getLevelLabel(member.level)}
                            </Badge>
                            {!member.isOnline && member.lastActive && (
                              <span className="text-xs text-gray-500">{member.lastActive}</span>
                            )}
                          </div>

                          <p className="font-medium text-gray-900">{member.role}</p>
                          
                          {member.bio && (
                            <p className="text-gray-600 text-sm line-clamp-2">{member.bio}</p>
                          )}

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{member.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{member.joinDate}</span>
                            </div>
                          </div>
                        </div>

                        {/* Skills */}
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {member.skills.slice(0, 3).map((skill, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs bg-gray-50 text-gray-700 border-gray-300"
                              >
                                {skill}
                              </Badge>
                            ))}
                            {member.skills.length > 3 && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-gray-50 text-gray-700 border-gray-300"
                              >
                                +{member.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex justify-around text-center pt-4 border-t border-gray-200">
                          <div>
                            <div className="text-lg font-bold text-primary-700">{member.projects}</div>
                            <div className="text-xs text-gray-600">프로젝트</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-secondary-700">{member.articles}</div>
                            <div className="text-xs text-gray-600">아티클</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-warning">{member.badges}</div>
                            <div className="text-xs text-gray-600">배지</div>
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
                        // 현재 페이지 주변 2페이지씩만 표시
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
              </main>
            </div>
          </div>
        </section>
      </div>      
    </div>
  );
}
