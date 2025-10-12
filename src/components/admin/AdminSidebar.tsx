// src/components/admin/AdminSidebar.tsx 
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

const navigation = [
  {
    name: "대시보드",
    href: "/admin/dashboard", 
    icon: LayoutDashboard,
  },
  {
    name: "회원 관리",
    href: "/admin/members",
    icon: Users,
  },
  {
    name: "콘텐츠 관리",
    href: "/admin/content",
    icon: FileText,
  },
  {
    name: "커뮤니티 관리",
    href: "/admin/community",
    icon: MessageSquare,
  },
  {
    name: "설정",
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
          <Link href={"/"} className="flex items-center gap-2 p-2.5 font-bold">
            <img src={"/logo-white.svg"} alt="SSG Logo" className="filter w-9 h-9" />
          </Link>
          <span className="ml-2.5 text-lg font-bold text-primary-100">ADMIN</span>
        </div>
        
        {/* Mobile header - Just icon */}
        <div className="md:hidden flex justify-center py-4.5">
          <Link href={"/"} className="flex items-center gap-2 p-2.5 font-bold">
            <img src={"/logo-white.svg"} alt="SSG Logo" className="filter w-9 h-9" />
          </Link>
        </div>
      </div>

      {/* Navigation - Responsive icons/text with medium sizing */}
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
                  md:mx-2.5 md:px-3.5 md:py-3 md:rounded-lg
                  mx-0 px-0 py-3.5 justify-center md:justify-start
                  text-sm font-medium
                  ${
                    isActive 
                      ? 'bg-secondary-400 text-gray-800 border-r-3 border-secondary-300' 
                      : 'text-primary-100 hover:bg-primary-700 hover:text-primary-50'
                  }
                `}
                title={item.name}
              >
                <item.icon className={`
                  h-5.5 w-5.5 transition-colors
                  md:mr-3.5 mr-0
                  ${
                    isActive 
                      ? 'text-gray-800' 
                      : 'text-primary-300 group-hover:text-primary-50'
                  }
                `} />
                <span className="hidden md:block text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Public Site Link Section - Medium sizing */}
      <div className="flex-shrink-0 border-t border-primary-800">
        {/* Desktop version */}
        <div className="hidden md:block">
          <div className="px-5 py-3.5">
            <button
              onClick={handleViewPublicSite}
              className="group flex items-center w-full px-3.5 py-2.5 text-sm font-medium text-primary-200 hover:text-primary-50 hover:bg-primary-700 rounded-lg transition-colors cursor-pointer"
            >
              <ExternalLink className="h-4.5 w-4.5 mr-3 text-primary-300 group-hover:text-primary-50 transition-colors" />
              공개 사이트 보기
            </button>
          </div>
        </div>

        {/* Mobile version - Icon only with medium sizing */}
        <div className="md:hidden">
          <div className="flex justify-center py-3.5">
            <button
              onClick={handleViewPublicSite}
              className="group flex items-center justify-center w-11 h-11 rounded-lg text-primary-200 hover:text-primary-50 hover:bg-primary-700 transition-colors"
              title="공개 사이트 보기 (새 탭)"
            >
              <ExternalLink className="h-5.5 w-5.5 text-primary-300 group-hover:text-primary-50 transition-colors" />
            </button>
          </div>
        </div>

        {/* Version Info - Desktop only with medium padding */}
        <div className="hidden md:block px-5 py-2.5 text-xs text-primary-400 text-center border-t border-primary-800">
          SSG Hub Admin v1.0
        </div>
      </div>
    </div>
  );
}
