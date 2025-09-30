"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  MessageSquare,
  Settings
} from "lucide-react";

const menuItems = [
  {
    name: "대시보드",
    href: "/admin",
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

  return (
    <div className="admin-sidebar fixed left-0 top-0 w-64 h-screen">
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white admin-text-gradient">SSG Admin</h1>
      </div>
      
      <nav className="mt-4 px-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-5 h-5 mr-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
