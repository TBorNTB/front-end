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

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
        
        return (
          <div
            key={index}
            className={`admin-card group hover:scale-105 transition-all duration-300 ${
              stat.highlight 
                ? 'ring-2 ring-blue-200 bg-gradient-to-br from-blue-50 to-white' 
                : ''
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className={`text-sm font-bold mb-2 ${
                  stat.highlight ? 'text-blue-700' : 'text-gray-700'
                }`}>
                  {stat.title}
                </p>
                <div className="flex items-baseline">
                  <span className={`text-3xl font-bold ${
                    stat.highlight ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {stat.value}
                  </span>
                  <span className={`text-sm font-semibold ml-2 ${
                    stat.highlight ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {stat.unit}
                  </span>
                </div>
              </div>
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.bgGradient} ${
                stat.highlight ? 'ring-2 ring-blue-200' : ''
              }`}>
                <Icon className={`w-7 h-7 ${stat.color}`} />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className={`flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                stat.trend === "up" 
                  ? "bg-green-100 text-green-700" 
                  : "bg-red-100 text-red-700"
              }`}>
                <TrendIcon className="w-4 h-4 mr-1" />
                {stat.change}
              </div>
              <span className={`text-xs font-semibold ${
                stat.highlight ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {stat.changeLabel}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
