// app/profile/ProfileContent.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { Badge } from '@/components/ui/badge';
import { 
  Edit3, 
  Mail, 
  Calendar,
  Eye,
  MessageCircle,
  BookOpen,
  ThumbsUp as Like,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { profileService, s3Service, UserResponse } from '@/lib/api/services/user-services';
import { useAuth } from '@/context/AuthContext';
import { validateImageFile } from '@/lib/form-utils';
import { getRoleDisplayLabel } from '@/lib/role-utils';

// 날짜 포맷팅 헬퍼 함수
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
};

export default function ProfileContent() {
  const router = useRouter();
  const { isAuthenticated, user: _user } = useAuth();
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activityStats, setActivityStats] = useState<{
    totalPostCount: number;
    totalViewCount: number;
    totalLikeCount: number;
    totalCommentCount: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 로그인 상태 확인
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 프로필 정보와 활동 통계를 병렬로 로드
        const [profileData, statsData] = await Promise.all([
          profileService.getProfile(),
          profileService.getActivityStats().catch((err) => {
            console.warn('Failed to load activity stats:', err);
            return null; // 활동 통계 실패해도 프로필은 표시
          })
        ]);
        
        setProfile(profileData);
        setActivityStats(statsData);
      } catch (err: any) {
        console.error('Failed to load profile:', err);
        const errorMessage = err.message || '프로필 정보를 불러올 수 없습니다.';
        setError(errorMessage);
        
        // 인증 에러인 경우 로그인 페이지로 리다이렉트
        if (errorMessage.includes('로그인') || errorMessage.includes('인증') || err.response?.status === 401 || err.response?.status === 403) {
          router.push('/login');
          return;
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

  // URL 유효성 검사 함수
  const isValidImageUrl = (url: string | null | undefined): string | null => {
    if (!url || typeof url !== 'string') return null;
    if (url.trim() === '' || url === 'string' || url === 'null' || url === 'undefined') return null;
    // 상대 경로는 유효함
    if (url.startsWith('/')) return url;
    // 절대 URL 검사
    try {
      new URL(url);
      return url;
    } catch {
      return null;
    }
  };

  // 프로필 정보 표시
  const displayName = profile.realName || profile.nickname || profile.username || '사용자';
  const displayEmail = profile.email || '';
  const displayBio = profile.description || '';
  const displayRole = profile.role || 'GUEST';
  const displayJoinDate = profile.createdAt ? formatDate(profile.createdAt) : '';
  const displayAvatar = isValidImageUrl(profile.profileImageUrl) || '/images/placeholder/default-avatar.svg';
  const displayRoleLabel = getRoleDisplayLabel(displayRole);
  const techStacks = (profile.techStack || '')
    .split(',')
    .map((s) => {
      const trimmed = s.trim();
      if (!trimmed) return '';
      const lowered = trimmed.toLowerCase();
      return lowered.charAt(0).toUpperCase() + lowered.slice(1);
    })
    .filter(Boolean);

  // 통계 정보
  const stats = {
    articlesWritten: activityStats?.totalPostCount ?? 0,
    totalViews: activityStats?.totalViewCount ?? 0,
    totalLikes: activityStats?.totalLikeCount ?? 0,
    commentsReceived: activityStats?.totalCommentCount ?? 0,
    badgesEarned: -1, // 배지 정보는 별도 API 필요
  };

  // 이미지 클릭 핸들러
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // 파일 선택 핸들러
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 유효성 검사
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast.error(validation.error || '유효하지 않은 파일입니다.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // S3에 파일 업로드
      const uploadedUrl = await s3Service.uploadFile(file);
      
      // 프로필 업데이트
      const updatedProfile = await profileService.updateProfile({
        profileImageUrl: uploadedUrl,
      });
      
      // 프로필 상태 업데이트
      setProfile(updatedProfile);
      
      // 성공 메시지 표시
      toast.success('프로필 이미지가 성공적으로 변경되었습니다!', {
        duration: 2000,
        icon: '✅',
      });
      
      // 페이지 새로고침하여 최신 데이터 반영
      setTimeout(() => {
        router.refresh();
      }, 500);
    } catch (err: any) {
      console.error('Failed to upload profile image:', err);
      const errorMessage = err.message || '이미지 업로드에 실패했습니다.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      // 파일 input 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex flex-col items-center lg:items-start">
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />
              <div 
                onClick={handleImageClick}
                className="relative cursor-pointer group"
              >
                <ImageWithFallback
                  src={displayAvatar}
                  alt={displayName}
                  width={120}
                  height={120}
                  className="w-30 h-30 rounded-full object-cover border-4 border-primary-200 group-hover:border-primary-400 transition-all duration-300"
                />
                {isUploading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                ) : (
                  <button 
                    className="absolute bottom-2 right-2 btn btn-primary btn-sm rounded-full p-2 shadow-lg hover:scale-110 transition-transform"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImageClick();
                    }}
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <Link href="/mypage/settings" className="btn btn-primary mt-4">
              프로필 편집
            </Link>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl font-bold text-foreground">{displayName}</h1>
              <Badge className="bg-primary-500/20 text-primary-700 border-primary-400/50 px-3 py-1">
                {displayRoleLabel}
              </Badge>
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-1">기술스택:</div>
              {techStacks.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {techStacks.slice(0, 8).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {techStacks.length > 8 && (
                    <Badge variant="outline" className="text-xs">
                      +{techStacks.length - 8}
                    </Badge>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-400">-</div>
              )}
            </div>
            
            {/* 닉네임과 실명 표시 */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              {profile.nickname && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">닉네임:</span>
                  <span className="text-gray-700 font-medium">@{profile.nickname}</span>
                </div>
              )}
              {profile.realName && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">실명:</span>
                  <span className="text-gray-700 font-medium">{profile.realName}</span>
                </div>
              )}
            </div>
            
            {/* 자기소개 */}
            {displayBio && (
              <p className="text-gray-700 mb-6 leading-relaxed">{displayBio}</p>
            )}
            
            {/* 연락처 및 링크 정보 */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">연락처 및 링크</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-600">
                {displayEmail && (
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-primary-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 mb-0.5">이메일</div>
                      <span className="break-all text-sm">{displayEmail}</span>
                    </div>
                  </div>
                )}
                {displayJoinDate && (
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-primary-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-0.5">가입일</div>
                      <span className="text-sm">{displayJoinDate}</span>
                    </div>
                  </div>
                )}
                {profile.githubUrl && (
                  <div className="flex items-start gap-2">
                    <svg className="h-4 w-4 text-gray-700 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 mb-0.5">GitHub</div>
                      <a 
                        href={profile.githubUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 underline break-all text-sm"
                      >
                        {profile.githubUrl}
                      </a>
                    </div>
                  </div>
                )}
                {profile.blogUrl && (
                  <div className="flex items-start gap-2">
                    <svg className="h-4 w-4 text-gray-700 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 mb-0.5">Blog</div>
                      <a 
                        href={profile.blogUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 underline break-all text-sm"
                      >
                        {profile.blogUrl}
                      </a>
                    </div>
                  </div>
                )}
                {profile.linkedinUrl && (
                  <div className="flex items-start gap-2">
                    <svg className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 mb-0.5">LinkedIn</div>
                      <a 
                        href={profile.linkedinUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 underline break-all text-sm"
                      >
                        {profile.linkedinUrl}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card text-center hover:shadow-lg transition-shadow bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
          <BookOpen className="h-8 w-8 text-primary-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-primary-700 mb-1">
            {stats.articlesWritten.toLocaleString()}
          </div>
          <div className="text-gray-600 text-sm font-medium">작성한 글</div>
        </div>
        <div className="card text-center hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <Eye className="h-8 w-8 text-blue-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-blue-700 mb-1">
            {stats.totalViews.toLocaleString()}
          </div>
          <div className="text-gray-600 text-sm font-medium">총 조회수</div>
        </div>
        <div className="card text-center hover:shadow-lg transition-shadow bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <Like className="h-8 w-8 text-red-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-red-700 mb-1">
            {stats.totalLikes.toLocaleString()}
          </div>
          <div className="text-gray-600 text-sm font-medium">받은 좋아요</div>
        </div>
        <div className="card text-center hover:shadow-lg transition-shadow bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <MessageCircle className="h-8 w-8 text-amber-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-amber-700 mb-1">
            {stats.commentsReceived.toLocaleString()}
          </div>
          <div className="text-gray-600 text-sm font-medium">받은 댓글</div>
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
