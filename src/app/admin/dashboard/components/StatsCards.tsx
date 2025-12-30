// src/components/admin/dashboard/StatsCards.tsx - IMPROVED DESIGN
"use client";

import { 
  BarChart3, 
  Users, 
  FolderOpen, 
  FileText,
  TrendingUp,
  TrendingDown
} from "lucide-react";

const statsData = [
  {
    title: "페이지 총 방문",
    value: "8,452",
    unit: "회",
    change: "+15%",
    changeLabel: "지난 주 대비",
    trend: "up",
    icon: BarChart3,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
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
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    title: "새 프로젝트 (7일)",
    value: "3",
    unit: "개",
    change: "-25%",
    changeLabel: "지난 주 대비",
    trend: "down",
    icon: FolderOpen,
    iconBg: "bg-purple-100", 
    iconColor: "text-purple-600",
  },
  {
    title: "새 아티클 (7일)",
    value: "8",
    unit: "개",
    change: "+30%",
    changeLabel: "지난 주 대비",
    trend: "up",
    icon: FileText,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
];

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
        
        return (
          <div
            key={index}
            className={`card hover:shadow-lg transition-all duration-300 border-l-4 ${
              stat.highlight 
                ? 'border-l-primary-500 bg-gradient-to-br from-primary-50/50 to-white' 
                : 'border-l-gray-200'
            }`}
          >
            {/* Header with Icon */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </h3>
                <div className="flex items-baseline space-x-2">
                  <span className={`text-2xl font-bold ${
                    stat.highlight ? 'text-primary-900' : 'text-gray-900'
                  }`}>
                    {stat.value}
                  </span>
                  <span className="text-sm font-medium text-gray-500">
                    {stat.unit}
                  </span>
                </div>
              </div>
              
              {/* Icon Container */}
              <div className={`p-3 rounded-xl ${stat.iconBg} ${
                stat.highlight ? 'ring-2 ring-primary-200' : ''
              }`}>
                <Icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </div>
            
            {/* Change Indicator */}
            <div className="flex items-center justify-between">
              <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                stat.trend === "up" 
                  ? "bg-green-100 text-green-700" 
                  : "bg-red-100 text-red-700"
              }`}>
                <TrendIcon className="h-3 w-3 mr-1" />
                {stat.change}
              </div>
              <span className="text-xs text-gray-500 font-medium">
                {stat.changeLabel}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
