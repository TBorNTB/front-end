// app/members/page.tsx
'use client';

import { Metadata } from 'next';
import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { 
  Search, 
  Filter, 
  User,
  Mail,
  Calendar,
  Code,
  Shield,
  Award,
  MapPin,
  Loader2,
  AlertCircle,
  X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

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

// Mock member data with updated levels
const mockMembers: Member[] = [
  {
    id: 1,
    name: '김민준',
    email: 'song54@gmail.com',
    role: 'Security Researcher',
    level: 'SENIOR',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    bio: '웹 보안과 침투 테스팅 전문가',
    location: '서울',
    joinDate: '2023.03.15',
    skills: ['React', 'TypeScript', 'Next.js'],
    projects: 5,
    articles: 12,
    badges: 8,
    isOnline: true
  },
  {
    id: 2,
    name: '박지원',
    email: 'jiwon.park@gmail.com',
    role: 'Frontend Developer',
    level: 'REGULAR',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    bio: 'React 기반 프론트엔드 개발자',
    location: '부산',
    joinDate: '2023.06.20',
    skills: ['React', 'TypeScript', 'Next.js'],
    projects: 3,
    articles: 8,
    badges: 5,
    isOnline: false,
    lastActive: '2시간 전'
  },
  {
    id: 3,
    name: '이수현',
    email: 'suhyun.lee@gmail.com',
    role: 'Backend Developer',
    level: 'REGULAR',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    bio: 'Node.js와 Python 백엔드 개발',
    location: '대구',
    joinDate: '2023.08.10',
    skills: ['Python', 'Node.js', 'Docker'],
    projects: 4,
    articles: 6,
    badges: 4,
    isOnline: true
  },
  {
    id: 4,
    name: '최민서',
    email: 'minseo.choi@gmail.com',
    role: 'Security Analyst',
    level: 'ASSOCIATE',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b05b?w=400&h=400&fit=crop&crop=face',
    bio: '보안 분석 및 취약점 연구',
    location: '광주',
    joinDate: '2024.01.05',
    skills: ['Python', 'Wireshark', 'Burp Suite'],
    projects: 2,
    articles: 4,
    badges: 2,
    isOnline: false,
    lastActive: '1일 전'
  },
  {
    id: 5,
    name: '강태현',
    email: 'taehyun.kang@gmail.com',
    role: 'Full Stack Developer',
    level: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=400&h=400&fit=crop&crop=face',
    bio: '풀스택 개발 및 아키텍처 설계',
    location: '인천',
    joinDate: '2022.09.12',
    skills: ['React', 'Node.js', 'PostgreSQL'],
    projects: 8,
    articles: 15,
    badges: 12,
    isOnline: true
  },
  {
    id: 6,
    name: '윤하영',
    email: 'hayoung.yoon@gmail.com',
    role: 'DevOps Engineer',
    level: 'SENIOR',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
    bio: 'CI/CD 파이프라인 및 인프라 관리',
    location: '울산',
    joinDate: '2023.02.28',
    skills: ['Docker', 'Kubernetes', 'AWS'],
    projects: 6,
    articles: 9,
    badges: 7,
    isOnline: false,
    lastActive: '30분 전'
  }
];

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

  // Load members data
  useEffect(() => {
    const loadMembers = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setMembers(mockMembers);
        setFilteredMembers(mockMembers);
      } catch (err) {
        setError('멤버 정보를 불러올 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadMembers();
  }, []);

  // Filter members based on search term, levels, and skills
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
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-gray-600">멤버 정보를 불러오는 중...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
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
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
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
                    총 <span className="font-semibold text-primary-700">{filteredMembers.length}</span>명의 멤버
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
              </main>
            </div>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
}
