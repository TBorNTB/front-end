// app/mypage/layout.tsx
'use client';

import { useState, useEffect } from 'react';
<<<<<<< HEAD
=======
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
>>>>>>> aebe966a022d56dd3e46f8da60a71fa1d06f9b71
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Settings, Award, Activity, Bell } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
<<<<<<< HEAD
import { profileService, UserResponse } from '@/lib/api/services/user-service';
=======
import { profileService, UserResponse } from '@/lib/api/services/user';
>>>>>>> aebe966a022d56dd3e46f8da60a71fa1d06f9b71

const menuItems = [
  { 
    id: 'mypage', 
    label: '내 프로필', 
    icon: User, 
    href: '/mypage', 
  },
{ 
    id: 'activity', 
    label: '나의 활동', 
    icon: Activity, 
    href: '/mypage/activity',
  },
    { 
    id: 'badges', 
    label: '활동 배지', 
    icon: Award, 
    href: '/mypage/badges',
  },
    { 
    id: 'alarms', 
    label: '알림', 
    icon: Bell, 
    href: '/mypage/alarms',
  },
    { 
    id: 'settings', 
    label: '계정 설정', 
    icon: Settings, 
    href: '/mypage/settings',
  },
];

export default function MyPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const profileData = await profileService.getProfile();
        setProfile(profileData);
      } catch (err) {
        console.error('Failed to load profile:', err);
        // 에러가 발생해도 레이아웃은 계속 표시
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

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

  // 프로필 정보 표시용 변수
  const displayName = profile?.realName || profile?.nickname || profile?.username || '사용자';
  const displayEmail = profile?.email || 'API 연결이 필요합니다';
  const displayRole = profile?.role || 'Member';
  const displayAvatar = isValidImageUrl(profile?.profileImageUrl) || '/default-avatar.png';

  // 통계 정보는 API 응답에 없으므로 -1로 표시
  const stats = {
    projects: -1,
    articles: -1,
    badges: -1,
  };

  return (
    <div className="min-h-screen bg-background text-foreground">      
      {/* Background Effects using SSG Theme Colors */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-500/3 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-secondary-500/4 rounded-full blur-2xl"></div>
      </div>

      <div className="relative">
        <section className="section py-8">
          <div className="container">
            {/* Page Title */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-primary-700 mb-2">마이페이지</h1>
              <p className="text-gray-700">개인 정보와 활동 내역을 관리하세요</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Sidebar */}
              <aside className="lg:w-80 flex-shrink-0">
                <div className="card p-0 overflow-hidden">
                  {/* User Info Header */}
                  <div className="p-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
                    <div className="flex items-center space-x-4">
                      {isLoading ? (
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                          <User className="h-8 w-8" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/30">
                          <ImageWithFallback
                            src={displayAvatar}
                            alt={displayName}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-xl truncate">{displayName}</h3>
                        <p className="text-primary-100 text-sm truncate">{displayEmail}</p>
                        <p className="text-primary-200 text-xs mt-1">{displayRole}</p>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Menu */}
                  <nav className="p-4">
                    <div className="space-y-2">
                      {menuItems.map((item) => {
                        const IconComponent = item.icon;
                        const isActive = pathname === item.href;
                        
                        return (
                          <Link
                            key={item.id}
                            href={item.href}
                            className={`flex items-start space-x-3 p-4 rounded-lg transition-all duration-300 group ${
                              isActive
                                ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500 shadow-sm'
                                : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'
                            }`}
                          >
                            <IconComponent className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                              isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-500'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className={`font-semibold ${
                                isActive ? 'text-primary-700' : 'text-foreground'
                              }`}>
                                {item.label}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </nav>

                  {/* Activity Stats Section */}
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700 mb-3">나의 활동</p>
                      <div className="flex justify-around">
                        <div className="text-center">
                          <div className="text-xl font-bold text-primary-700">
                            {stats.projects === -1 ? '-' : stats.projects}
                          </div>
                          <div className="text-xs text-gray-600">프로젝트</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-secondary-700">
                            {stats.articles === -1 ? '-' : stats.articles}
                          </div>
                          <div className="text-xs text-gray-600">CS지식 글</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-warning">
                            {stats.badges === -1 ? '-' : stats.badges}
                          </div>
                          <div className="text-xs text-gray-600">획득 배지</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Main Content Area */}
              <main className="flex-1 min-w-0">
                <div className="card">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </section>
      </div>      
    </div>
  );
}
