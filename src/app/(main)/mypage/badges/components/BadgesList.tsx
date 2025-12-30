// components/profile/BadgesList.tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  TrendingUp, 
  MessageCircle, 
  Shield, 
  Target, 
  Zap, 
  Trophy,
  Award,
  Star,
  Users
} from 'lucide-react';
import { useState } from 'react';

const badgeCategories = [
  { value: 'all', label: '전체' },
  { value: 'writing', label: '글쓰기' },
  { value: 'community', label: '커뮤니티' },
  { value: 'achievement', label: '성취' },
  { value: 'special', label: '특별' }
];

const userBadges = [
  {
    id: 1,
    name: 'First Article',
    description: '첫 번째 글 작성',
    icon: BookOpen,
    color: 'bg-success/20 text-success border-success/30',
    category: 'writing',
    earned: true,
    earnedDate: '2023.03.20',
    rarity: 'common'
  },
  {
    id: 2,
    name: 'Popular Writer',
    description: '글 조회수 1000회 달성',
    icon: TrendingUp,
    color: 'bg-primary-500/20 text-primary-700 border-primary-300',
    category: 'writing',
    earned: true,
    earnedDate: '2023.06.15',
    rarity: 'rare'
  },
  {
    id: 3,
    name: 'Community Helper',
    description: '댓글 50개 작성',
    icon: MessageCircle,
    color: 'bg-secondary-500/20 text-secondary-700 border-secondary-300',
    category: 'community',
    earned: true,
    earnedDate: '2023.08.30',
    rarity: 'uncommon'
  },
  {
    id: 4,
    name: 'Security Expert',
    description: '보안 관련 글 10개 작성',
    icon: Shield,
    color: 'bg-warning/20 text-warning border-warning/30',
    category: 'achievement',
    earned: false,
    progress: 8,
    total: 10,
    rarity: 'rare'
  },
  {
    id: 5,
    name: 'Quick Learner',
    description: '일주일 연속 접속',
    icon: Zap,
    color: 'bg-purple-500/20 text-purple-700 border-purple-300',
    category: 'achievement',
    earned: true,
    earnedDate: '2023.04.10',
    rarity: 'common'
  },
  {
    id: 6,
    name: 'Mentor',
    description: '신규 회원 멘토링 10회',
    icon: Users,
    color: 'bg-indigo-500/20 text-indigo-700 border-indigo-300',
    category: 'special',
    earned: false,
    progress: 3,
    total: 10,
    rarity: 'legendary'
  },
  {
    id: 7,
    name: 'Hall of Fame',
    description: '월간 베스트 글 선정',
    icon: Trophy,
    color: 'bg-yellow-500/20 text-yellow-700 border-yellow-300',
    category: 'special',
    earned: false,
    progress: 0,
    total: 1,
    rarity: 'legendary'
  }
];

export default function BadgesList() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredBadges = userBadges.filter(badge => 
    selectedCategory === 'all' || badge.category === selectedCategory
  );

  const earnedBadges = userBadges.filter(badge => badge.earned);
  const totalBadges = userBadges.length;

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return <Badge className="bg-gray-100 text-gray-700 border-gray-300 text-xs">일반</Badge>;
      case 'uncommon':
        return <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">흔하지 않음</Badge>;
      case 'rare':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs">희귀</Badge>;
      case 'legendary':
        return <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-xs">전설</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <Award className="h-8 w-8 text-primary-600" />
        <h1 className="text-3xl font-bold text-foreground">활동 배지</h1>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <Trophy className="h-8 w-8 text-warning mx-auto mb-3" />
          <div className="text-2xl font-bold text-foreground mb-1">{earnedBadges.length}</div>
          <div className="text-gray-600 text-sm">획득한 배지</div>
        </div>
        <div className="card text-center">
          <Target className="h-8 w-8 text-primary-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-foreground mb-1">{totalBadges - earnedBadges.length}</div>
          <div className="text-gray-600 text-sm">진행 중인 배지</div>
        </div>
        <div className="card text-center">
          <Star className="h-8 w-8 text-secondary-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-foreground mb-1">{Math.round((earnedBadges.length / totalBadges) * 100)}%</div>
          <div className="text-gray-600 text-sm">달성률</div>
        </div>
      </div>

      {/* Filter */}
      <div className="card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-semibold text-foreground">배지 컬렉션</h2>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2
                     focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            {badgeCategories.map(category => (
              <option key={category.value} value={category.value}>{category.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBadges.map((badge) => {
            const IconComponent = badge.icon;
            return (
              <div
                key={badge.id}
                className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                  badge.earned 
                    ? `${badge.color} shadow-md` 
                    : 'border-gray-200 bg-gray-50 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-full ${badge.earned ? badge.color.replace('/20', '/30') : 'bg-gray-200 text-gray-500'}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  {getRarityBadge(badge.rarity)}
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground">{badge.name}</h3>
                    {badge.earned && (
                      <Badge className="bg-success/20 text-success border-success/30 text-xs">
                        획득
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3">{badge.description}</p>
                  
                  {badge.earned ? (
                    <p className="text-xs text-gray-500">획득일: {badge.earnedDate}</p>
                  ) : (
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-2">
                        <span>진행률</span>
                        <span>{badge.progress}/{badge.total}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(badge.progress! / badge.total!) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {badge.total! - badge.progress!}개 더 필요
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievement Tips */}
      <div className="card">
        <h3 className="text-xl font-semibold text-foreground mb-4">배지 획득 팁</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-primary-50 rounded-lg">
            <h4 className="font-medium text-primary-700 mb-2">글쓰기 배지</h4>
            <p className="text-sm text-gray-600">꾸준히 양질의 보안 관련 글을 작성하여 글쓰기 배지를 획득하세요.</p>
          </div>
          <div className="p-4 bg-secondary-50 rounded-lg">
            <h4 className="font-medium text-secondary-700 mb-2">커뮤니티 배지</h4>
            <p className="text-sm text-gray-600">다른 회원들과 활발히 소통하며 커뮤니티 배지를 모아보세요.</p>
          </div>
          <div className="p-4 bg-warning/10 rounded-lg">
            <h4 className="font-medium text-warning mb-2">성취 배지</h4>
            <p className="text-sm text-gray-600">다양한 활동과 도전을 통해 특별한 성취 배지를 획득하세요.</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-700 mb-2">특별 배지</h4>
            <p className="text-sm text-gray-600">이벤트 참여나 특별한 기여를 통해 희귀한 배지를 얻을 수 있습니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
