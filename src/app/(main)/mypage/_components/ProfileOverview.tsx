// app/profile/ProfileContent.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { Badge } from '@/components/ui/badge';
import { 
  Edit3, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Eye,
  Heart,
  MessageCircle,
  BookOpen,
  ThumbsUp as Like,
  Award,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { profileService, UserResponse } from '@/lib/api/services/user-service';
import { useAuth } from '@/context/AuthContext';

// 날짜 포맷팅 헬퍼 함수
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
};

const recentActivity = [
  {
    id: 1,
    type: 'article',
    title: 'Advanced SQL Injection Techniques in 2024',
    date: '2024.10.15',
    views: 342,
    likes: 23
  },
  {
    id: 2,
    type: 'comment',
    title: 'CTF WriteUp: HackTheBox - Pilgrimage',
    date: '2024.10.12',
    action: '댓글 작성'
  },
  {
    id: 3,
    type: 'badge',
    title: 'Security Expert 배지 획득',
    date: '2024.10.10',
    action: '배지 획득'
  }
];

export default function ProfileContent() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 로그인 상태 확인
    if (!isAuthenticated) {
      setError('로그인이 필요합니다. 로그인 페이지로 이동합니다...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      setIsLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const profileData = await profileService.getProfile();
        setProfile(profileData);
      } catch (err: any) {
        console.error('Failed to load profile:', err);
        const errorMessage = err.message || '프로필 정보를 불러올 수 없습니다.';
        setError(errorMessage);
        
        // 인증 에러인 경우 로그인 페이지로 리다이렉트
        if (errorMessage.includes('로그인') || errorMessage.includes('인증')) {
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">프로필 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-2">{error || '프로필 정보를 불러올 수 없습니다'}</p>
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

  // API 응답에 없는 필드들은 기본값으로 처리
  const displayName = profile.realName || profile.nickname || profile.username || '사용자';
  const displayEmail = profile.email || 'API 연결이 필요합니다';
  const displayPhone = 'API 연결이 필요합니다'; // API 응답에 없음
  const displayLocation = 'API 연결이 필요합니다'; // API 응답에 없음
  const displayBio = profile.description || '';
  const displayRole = profile.role || 'Member';
  const displayJoinDate = profile.createdAt ? formatDate(profile.createdAt) : 'API 연결이 필요합니다';
  const displayAvatar = profile.profileImageUrl || '/default-avatar.png';

  // 통계 정보는 API 응답에 없으므로 -1로 표시
  const stats = {
    articlesWritten: -1,
    totalViews: -1,
    totalLikes: -1,
    commentsReceived: -1,
    badgesEarned: -1,
  };

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex flex-col items-center lg:items-start">
            <div className="relative">
              <ImageWithFallback
                src={displayAvatar}
                alt={displayName}
                width={120}
                height={120}
                className="w-30 h-30 rounded-full object-cover border-4 border-primary-200"
              />
              <button className="absolute bottom-2 right-2 btn btn-primary btn-sm rounded-full p-2">
                <Edit3 className="h-4 w-4" />
              </button>
            </div>
            <Link href="/mypage/settings" className="btn btn-primary mt-4">
              프로필 편집
            </Link>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{displayName}</h1>
              <Badge className="bg-primary-500/20 text-primary-700 border-primary-400/50">
                {displayRole}
              </Badge>
            </div>
            
            {displayBio && (
              <p className="text-gray-700 mb-6 leading-relaxed">{displayBio}</p>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary-600" />
                <span>{displayEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary-600" />
                <span>{displayPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary-600" />
                <span>{displayLocation}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary-600" />
                <span>가입일: {displayJoinDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div className="card text-center">
          <BookOpen className="h-6 w-6 text-primary-600 mx-auto mb-2" />
          <div className="text-lg font-bold text-foreground mb-1">
            {stats.articlesWritten === -1 ? '-' : stats.articlesWritten}
          </div>
          <div className="text-gray-600 text-xs">작성한 글</div>
        </div>
        <div className="card text-center">
          <Eye className="h-6 w-6 text-secondary-600 mx-auto mb-2" />
          <div className="text-lg font-bold text-foreground mb-1">
            {stats.totalViews === -1 ? '-' : stats.totalViews.toLocaleString()}
          </div>
          <div className="text-gray-600 text-xs">총 조회수</div>
        </div>
        <div className="card text-center">
          <Like className="h-6 w-6 text-error mx-auto mb-2" />
          <div className="text-lg font-bold text-foreground mb-1">
            {stats.totalLikes === -1 ? '-' : stats.totalLikes}
          </div>
          <div className="text-gray-600 text-xs">받은 좋아요</div>
        </div>
        <div className="card text-center">
          <MessageCircle className="h-6 w-6 text-warning mx-auto mb-2" />
          <div className="text-lg font-bold text-foreground mb-1">
            {stats.commentsReceived === -1 ? '-' : stats.commentsReceived}
          </div>
          <div className="text-gray-600 text-xs">받은 댓글</div>
        </div>
        <div className="card text-center">
          <Award className="h-6 w-6 text-purple-600 mx-auto mb-2" />
          <div className="text-lg font-bold text-foreground mb-1">
            {stats.badgesEarned === -1 ? '-' : stats.badgesEarned}
          </div>
          <div className="text-gray-600 text-xs">획득 배지</div>
        </div>
      </div>

      {/* Recent Activity Preview */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-foreground">최근 활동</h2>
          <Link href="/mypage/activity" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
            전체보기 →
          </Link>
        </div>
        <div className="space-y-4">
          <div className="text-center py-8 text-gray-500">
            API 연결이 필요합니다
          </div>
        </div>
      </div>
    </div>
  );
}
