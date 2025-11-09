// app/profile/activity/components/ActivityContent.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Grid, 
  List,
  Eye,
  ThumbsUp,
  MessageCircle,
  Calendar,
  User,
  BookOpen,
  Code,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

// Types for activities
interface ActivityItem {
  id: number;
  type: 'project' | 'CSnote' | 'like' | 'comment';
  title: string;
  description?: string;
  image?: string;
  date: string;
  views?: number;
  likes?: number;
  comments?: number;
  status?: 'active' | 'completed' | 'draft';
  tags?: string[];
  author?: string;
}

// Mock data - replace with actual API call
const mockActivities: ActivityItem[] = [
  {
    id: 1,
    type: 'project',
    title: 'SSG 온라인 플랫폼 개발',
    description: 'Next.js와 TypeScript를 활용한 보안 스터디 그룹 플랫폼 개발 프로젝트',
    image: '/api/placeholder/300/200',
    date: '2024.10.15',
    status: 'active',
    tags: ['Next.js', 'TypeScript', 'Web Development'],
    views: 1250,
    likes: 45
  },
  {
    id: 2,
    type: 'project',
    title: '실시간 투표 앱 개발',
    description: 'React와 Socket.io를 이용한 실시간 투표 애플리케이션',
    image: '/api/placeholder/300/200',
    date: '2024.09.20',
    status: 'completed',
    tags: ['React', 'Socket.io', 'Real-time'],
    views: 892,
    likes: 32
  },
  {
    id: 3,
    type: 'CSnote',
    title: 'Advanced SQL Injection Techniques in 2024',
    description: 'SQL 인젝션 공격의 최신 동향과 고급 기법들을 분석하고, 효과적인 방어 방법을 제시합니다.',
    date: '2024.10.12',
    views: 342,
    likes: 23,
    comments: 5,
    tags: ['Security', 'SQL', 'Web Security']
  },
  {
    id: 4,
    type: 'CSnote',
    title: 'CTF WriteUp: HackTheBox - Pilgrimage',
    description: 'HackTheBox의 Pilgrimage 머신 해결 과정을 상세히 분석하고, 학습 포인트를 정리했습니다.',
    date: '2024.10.08',
    views: 156,
    likes: 18,
    comments: 8,
    tags: ['CTF', 'HackTheBox', 'Pentesting']
  },
  {
    id: 5,
    type: 'like',
    title: '악성코드 분석 실전 가이드',
    author: '이준호',
    date: '2024.10.05',
    tags: ['Malware', 'Analysis']
  },
  {
    id: 6,
    type: 'comment',
    title: 'OSINT를 활용한 디지털 포렌식',
    author: '최수진',
    date: '2024.10.02',
    tags: ['OSINT', 'Digital Forensics']
  }
];

const activityTabs = [
  { key: 'project', label: '참여한 프로젝트', count: 0 },
  { key: 'CSnote', label: '작성한 CS지식', count: 0 },
  { key: 'like', label: '좋아요 누른 글', count: 0 },
  { key: 'comment', label: '작성한 댓글', count: 0 }
];

export default function ActivityContent() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('최신순');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load activities data
  useEffect(() => {
    const loadActivities = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setActivities(mockActivities);
      } catch (_err) {
        setError('활동 내역을 불러올 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadActivities();
  }, []);

  // Filter activities based on active tab and search
  const filteredActivities = activities.filter(activity => {
    const matchesTab = activeTab === 'all' || activity.type === activeTab;
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  // Calculate counts for tabs
  const tabsWithCounts = activityTabs.map(tab => ({
    ...tab,
    count: tab.key === 'all' ? activities.length : activities.filter(a => a.type === tab.key).length
  }));

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <Code className="h-5 w-5" />;
      case 'CSnote':
        return <BookOpen className="h-5 w-5" />;
      case 'like':
        return <ThumbsUp className="h-5 w-5" />;
      case 'comment':
        return <MessageCircle className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'project':
        return 'bg-primary-500/20 text-primary-700';
      case 'CSnote':
        return 'bg-secondary-500/20 text-secondary-700';
      case 'like':
        return 'bg-error/20 text-error';
      case 'comment':
        return 'bg-warning/20 text-warning';
      default:
        return 'bg-gray-500/20 text-gray-700';
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    switch (status) {
      case 'active':
        return <Badge className="bg-success/20 text-success border-success/30 text-xs">진행중</Badge>;
      case 'completed':
        return <Badge className="bg-primary-500/20 text-primary-700 border-primary-300 text-xs">완료</Badge>;
      case 'draft':
        return <Badge className="bg-gray-500/20 text-gray-700 border-gray-300 text-xs">임시저장</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">활동 내역을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-2">활동 내역을 불러올 수 없습니다</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-primary mt-4"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary-700 mb-2">나의 활동</h1>
        <p className="text-gray-600">참여한 프로젝트와 작성한 콘텐츠를 확인하세요</p>
      </div>

      {/* Activity Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabsWithCounts.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-300 ${
                activeTab === tab.key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                activeTab === tab.key
                  ? 'bg-primary-100 text-primary-600'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="활동 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm
                       focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200
                       transition-all duration-300"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                     focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            <option value="최신순">최신순</option>
            <option value="인기순">인기순</option>
            <option value="조회순">조회순</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors duration-200 ${
              viewMode === 'grid'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors duration-200 ${
              viewMode === 'list'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Activities Content */}
      {filteredActivities.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-gray-500 text-lg mb-2">활동 내역이 없습니다</div>
          <p className="text-gray-400">새로운 프로젝트에 참여하거나 글을 작성해보세요!</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className={`group cursor-pointer transition-all duration-300 hover:shadow-lg ${
                viewMode === 'grid' 
                  ? 'card p-0 overflow-hidden hover:scale-[1.02]' 
                  : 'card flex items-center gap-4 p-4'
              }`}
            >
              {viewMode === 'grid' ? (
                // Grid View
                <>
                  {activity.image && (
                    <div className="relative h-48 overflow-hidden">
                      <ImageWithFallback
                        src={activity.image}
                        alt={activity.title}
                        width={300}
                        height={200}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      
                      <div className="absolute top-3 left-3">
                        <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                          {getActivityIcon(activity.type)}
                        </div>
                      </div>
                      
                      {activity.status && (
                        <div className="absolute top-3 right-3">
                          {getStatusBadge(activity.status)}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="p-6">
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary-700 transition-colors">
                      {activity.title}
                    </h3>
                    
                    {activity.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {activity.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{activity.date}</span>
                      </div>
                      {activity.author && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{activity.author}</span>
                        </div>
                      )}
                    </div>
                    
                    {(activity.views || activity.likes || activity.comments) && (
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                        {activity.views && (
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{activity.views}</span>
                          </div>
                        )}
                        {activity.likes && (
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            <span>{activity.likes}</span>
                          </div>
                        )}
                        {activity.comments && (
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            <span>{activity.comments}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {activity.tags && (
                      <div className="flex flex-wrap gap-1">
                        {activity.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-300">
                            {tag}
                          </Badge>
                        ))}
                        {activity.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-300">
                            +{activity.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                // List View
                <>
                  <div className={`p-3 rounded-full ${getActivityColor(activity.type)} flex-shrink-0`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground truncate">{activity.title}</h3>
                      {activity.status && getStatusBadge(activity.status)}
                    </div>
                    
                    {activity.description && (
                      <p className="text-gray-600 text-sm mb-2 line-clamp-1">{activity.description}</p>
                    )}
                    
                    {activity.tags && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {activity.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-300">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right text-sm text-gray-500 flex-shrink-0">
                    <div className="flex items-center gap-1 mb-1">
                      <Calendar className="h-3 w-3" />
                      <span>{activity.date}</span>
                    </div>
                    {(activity.views || activity.likes) && (
                      <div className="flex items-center gap-3 text-xs">
                        {activity.views && (
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{activity.views}</span>
                          </div>
                        )}
                        {activity.likes && (
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            <span>{activity.likes}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
