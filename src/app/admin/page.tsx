// src/app/admin/page.tsx
"use client";

import { BarChart3, Users, FolderOpen, FileText, TrendingUp, TrendingDown } from "lucide-react";

const statsData = [
  {
    title: "페이지 총 방문",
    value: "8,452",
    unit: "회",
    change: "+15%",
    changeLabel: "지난 주 대비",
    trend: "up",
    icon: BarChart3,
    color: "text-blue-600",
    bgGradient: "from-blue-50 to-blue-100",
    highlight: true,
  },
  {
    title: "신규 가입 (7일)",
    value: "12",
    unit: "명", 
    change: "+5%",
    changeLabel: "지난 주 대비",
    trend: "up",
    icon: Users,
    color: "text-green-600",
    bgGradient: "from-green-50 to-green-100",
  },
  {
    title: "새 프로젝트 (7일)",
    value: "3",
    unit: "개",
    change: "-25%",
    changeLabel: "지난 주 대비", 
    trend: "down",
    icon: FolderOpen,
    color: "text-purple-600",
    bgGradient: "from-purple-50 to-purple-100",
  },
  {
    title: "새 아티클 (7일)",
    value: "8",
    unit: "개",
    change: "+30%",
    changeLabel: "지난 주 대비",
    trend: "up", 
    icon: FileText,
    color: "text-orange-600",
    bgGradient: "from-orange-50 to-orange-100",
  },
];

export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
        <p className="mt-1 text-sm text-gray-600">SSG Hub 관리자 대시보드에 오신 것을 환영합니다</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
          
          return (
            <div key={index} className={`admin-stat-card ${stat.highlight ? 'ring-2 ring-blue-200' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="admin-stat-label">{stat.title}</p>
                  <div className="flex items-baseline mt-2">
                    <span className="admin-stat-value">{stat.value}</span>
                    <span className="text-sm text-gray-500 ml-1">{stat.unit}</span>
                  </div>
                  <div className={`admin-stat-change mt-2 flex items-center ${stat.trend === 'up' ? 'positive' : 'negative'}`}>
                    <TrendIcon className="w-3 h-3 mr-1" />
                    <span>{stat.change}</span>
                    <span className="text-gray-500 ml-1">{stat.changeLabel}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.bgGradient}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">최근 활동</h3>
          </div>
          {/* Add recent activity content */}
        </div>
        
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">빠른 작업</h3>
          </div>
          {/* Add quick actions content */}
        </div>
      </div>
    </div>
  );
}
