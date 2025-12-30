// src/components/admin/AdminSidebar.tsx - MOBILE FRIENDLY with split text
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  MessageSquare,
  Settings,
  ExternalLink
} from "lucide-react";
import Image from 'next/image';


const navigation = [
  {
    name: "대시보드",
    mobileText: "대시보드",
    href: "/admin/dashboard", 
    icon: LayoutDashboard,
  },
  {
    name: "회원 관리",
    mobileText: ["회원", "관리"],
    href: "/admin/members",
    icon: Users,
  },
  {
    name: "콘텐츠 관리", 
    mobileText: ["콘텐츠", "관리"],
    href: "/admin/content",
    icon: FileText,
  },
  {
    name: "커뮤니티 관리",
    mobileText: ["커뮤니티", "관리"],
    href: "/admin/community",
    icon: MessageSquare,
  },
  {
    name: "설정",
    mobileText: "설정",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const handleViewPublicSite = () => {
    window.open('/', '_blank');
  };

  return (
    <div className="admin-sidebar flex flex-col h-full">
      {/* Header - Shows full on desktop, compact on mobile */}
      <div className="flex-shrink-0 border-b border-primary-800">
        {/* Desktop header */}
        <div className="hidden md:flex items-center h-18 px-5">
          <div className="flex items-center gap-2 p-2.5 font-bold">
            <Image src="/logo-white.svg" alt="SSG Logo" width={36} height={36} className="filter" />
          </div>
          <span className="ml-2.5 text-lg font-bold text-primary-100">ADMIN</span>
        </div>
        
        {/* Mobile header - Just icon */}
        <div className="md:hidden flex justify-center py-4.5">
          <div className="flex items-center gap-2 p-2.5 font-bold">
            <Image src="/logo-white.svg" alt="SSG Logo" width={36} height={36} className="filter" />
          </div>
        </div>
      </div>

      {/* Navigation - Responsive icons/text with mobile-friendly layout */}
      <nav className="flex-1 py-5">
        <div className="space-y-1.5">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center transition-all duration-200
                  md:mx-2.5 md:px-3.5 md:py-3 md:rounded-lg md:flex-row md:justify-start
                  mx-1 px-1 py-2 flex-col justify-center text-center
                  text-sm font-medium
                  ${
                    isActive 
                      ? 'bg-secondary-400 text-primary-900 md:border-r-4 md:border-gray-800' 
                      : 'text-primary-100 hover:bg-primary-700 hover:text-primary-50'
                  }
                `}
                title={item.name}
              >
                <item.icon className={`
                  h-5.5 w-5.5 transition-colors
                  md:mr-3.5 mr-0 mb-1 md:mb-0
                  // Icon color
                  ${
                    isActive 
                      ? 'text-primary-900' 
                      : 'text-primary-300 group-hover:text-primary-50'
                  }
                `} />
                
                {/* Desktop text - single line */}
                <span className={`
                  hidden md:block text-sm font-medium
                  ${isActive ? 'text-primary-900' : 'text-primary-200 group-hover:text-primary-50'}                `}>
                  {item.name}
                </span>

                {/* Mobile text - split into lines */}
                <div className={`
                  md:hidden flex flex-col items-center text-xs font-medium leading-tight
                  ${isActive ? 'text-primary-900' : 'text-primary-200 group-hover:text-primary-50'}
                `}>
                  {Array.isArray(item.mobileText) ? (
                    item.mobileText.map((text, index) => (
                      <span key={index}>{text}</span>
                    ))
                  ) : (
                    <span>{item.mobileText}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Public Site Link Section - Mobile friendly */}
      <div className="flex-shrink-0 border-t border-primary-800">
        {/* Desktop version */}
        <div className="hidden md:block">
          <div className="px-5 py-3.5">
            <button
              onClick={handleViewPublicSite}
              className="group flex items-center w-full px-3.5 py-2.5 text-sm font-medium text-primary-200 hover:text-primary-50 hover:bg-primary-700 rounded-lg transition-colors cursor-pointer"
            >
              <ExternalLink className="h-4.5 w-4.5 mr-3 text-primary-300 group-hover:text-primary-50 transition-colors" />
              메인 사이트 보기
            </button>
          </div>
        </div>

        {/* Mobile version - Icon with text below */}
        <div className="md:hidden">
          <div className="flex justify-center py-2">
            <button
              onClick={handleViewPublicSite}
              className="group flex flex-col items-center justify-center px-2 py-2 rounded-lg text-primary-200 hover:text-primary-50 hover:bg-primary-700 transition-colors text-center"
              title="공개 사이트 보기 (새 탭)"
            >
              <ExternalLink className="h-5 w-5 text-primary-300 group-hover:text-primary-50 transition-colors mb-1" />
              <div className="flex flex-col items-center text-xs text-primary-200 group-hover:text-primary-50 transition-colors leading-tight">
                <span>공개</span>
                <span>사이트</span>
              </div>
            </button>
          </div>
        </div>

        {/* Version Info - Desktop only */}
        <div className="hidden md:block px-5 py-2.5 text-xs text-primary-400 text-center border-t border-primary-800">
          SSG Hub Admin v1.0
        </div>
      </div>
    </div>
  );
}
