// src/components/admin/AdminHeader.tsx - MEDIUM SIZE VERSION
"use client";

import { useAuth } from "@/context/AuthContext";
import { Bell, ChevronDown, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";

import toast from "react-hot-toast";
import { useEffect, useRef, useState } from "react";


// Page title mapping
const getPageTitle = (pathname: string) => {
  const titles: Record<string, string> = {
    '/admin/dashboard': '관리자 대시보드',
    '/admin/members': '회원 관리',
    '/admin/content': '콘텐츠 관리',
    '/admin/community': '커뮤니티 관리',
    '/admin/settings': '설정',
  };
  
  return titles[pathname] || '관리자';
};

const getPageDescription = (pathname: string) => {
  const descriptions: Record<string, string> = {
    '/admin/dashboard': 'SSG Hub 관리자 대시보드의 모든 활동 한눈에보기',
    '/admin/members': '회원 정보, 권한, 등급 및 활동 내역 관리',
    '/admin/content': '아티클, 프로젝트, 카테고리 등 콘텐츠 관리',
    '/admin/community': '커뮤니티 활동, 뱃지 시스템, 상호작용 관리',
    '/admin/settings': '시스템 설정과 구성을 관리',
  };
  
  return descriptions[pathname] || '';
};

export default function AdminHeader() {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    console.log(" logout clicked");
    setIsUserMenuOpen(false);
    toast.success('로그아웃되었습니다.');
    await logout();
  };
  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = user?.nickname || user?.full_name || "관리자";
  const displayEmail = user?.email || "admin@ssg.kr";
  const userInitial = displayName?.charAt(0)?.toUpperCase() || "A";

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-18 px-7">
        {/* Left: Site Navigation */}
        <div className="flex items-center space-x-5">
         {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {pageTitle}
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            {getPageDescription(pathname)}
          </p>
        </div>
        </div>

        {/* Right: Notifications & User Menu */}
        <div className="flex items-center space-x-5">
          {/* Notifications */}
          <button className="p-2.5 text-gray-400 hover:text-gray-600 relative rounded-lg hover:bg-gray-100 transition-colors">
            <Bell className="h-5.5 w-5.5" />
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              <span className="w-2 h-2 bg-white rounded-full"></span>
            </span>
          </button>
         {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {userInitial}
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">{displayName}</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute top-full right-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                      {userInitial}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{displayName}</p>
                      <p className="text-sm text-gray-600">{displayEmail}</p>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    권한: 운영진
                  </div>
                </div>
                
                <div className="py-1">        
                  <button
                  onClick={handleLogout}
                  className="flex items-center w-full text-left px-5 py-3 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
                >
                  <LogOut className="h-4.5 w-4.5 mr-3 text-red-400 rotate-180" />
                  로그아웃
                </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}


