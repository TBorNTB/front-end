// src/components/admin/dashboard/StatsCards.tsx - IMPROVED DESIGN
"use client";

import { useState, useEffect } from "react";
import { 
  BarChart3, 
  Users, 
  FolderOpen, 
  FileText,
  Loader2,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { getApiUrl } from "@/lib/api/config";
import { USER_ENDPOINTS } from "@/lib/api/endpoints/user-endpoints";

interface ViewCountResponse {
  viewCount: number;
}

// 날짜를 YYYY-MM-DD 형식으로 변환
const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 오늘 기준 최근 7일 계산 (오늘 포함 7일)
const getRecent7DaysRange = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6); // 오늘 포함 7일
  
  return { start: sevenDaysAgo, end: today };
};

// 그 이전 7일 계산 (7일 전 ~ 13일 전)
const getPrevious7DaysRange = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7); // 7일 전
  
  const thirteenDaysAgo = new Date(sevenDaysAgo);
  thirteenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // 13일 전 (이전 기간 시작)
  
  return { start: thirteenDaysAgo, end: sevenDaysAgo };
};


const otherStatsData = [
  {
    title: "신규 가입 (7일)",
    value: "12",
    unit: "명",
    change: "+5%",
    changeLabel: "지난 주 대비",
    trend: "up" as const,
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
    trend: "down" as const,
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
    trend: "up" as const,
    icon: FileText,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
];

export default function StatsCards() {
  const [recentViews, setRecentViews] = useState<number | null>(null);
  const [previousViews, setPreviousViews] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ recent: string; previous: string } | null>(null);

  useEffect(() => {
    const fetchViewCounts = async () => {
      try {
        setLoading(true);
        setError(null);

        const recentRange = getRecent7DaysRange();
        const previousRange = getPrevious7DaysRange();

        // 날짜 범위 저장 (제목 표시용)
        setDateRange({
          recent: `${formatDateForAPI(recentRange.start)} ~ ${formatDateForAPI(recentRange.end)}`,
          previous: `${formatDateForAPI(previousRange.start)} ~ ${formatDateForAPI(previousRange.end)}`,
        });

        // 최근 7일과 이전 7일 데이터를 병렬로 가져오기
        const [recentResponse, previousResponse] = await Promise.all([
          fetch(
            `${getApiUrl(USER_ENDPOINTS.VIEW.DAILY_COUNT_BETWEEN)}?startDate=${formatDateForAPI(recentRange.start)}&endDate=${formatDateForAPI(recentRange.end)}`,
            {
              method: 'GET',
              headers: {
                'accept': 'application/json',
              },
              credentials: 'include',
            }
          ),
          fetch(
            `${getApiUrl(USER_ENDPOINTS.VIEW.DAILY_COUNT_BETWEEN)}?startDate=${formatDateForAPI(previousRange.start)}&endDate=${formatDateForAPI(previousRange.end)}`,
            {
              method: 'GET',
              headers: {
                'accept': 'application/json',
              },
              credentials: 'include',
            }
          ),
        ]);

        if (!recentResponse.ok || !previousResponse.ok) {
          throw new Error('Failed to fetch view counts');
        }

        const recentData: ViewCountResponse = await recentResponse.json();
        const previousData: ViewCountResponse = await previousResponse.json();

        setRecentViews(recentData.viewCount);
        setPreviousViews(previousData.viewCount);
      } catch (err) {
        console.error('Error fetching view counts:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        setRecentViews(0);
        setPreviousViews(0);
      } finally {
        setLoading(false);
      }
    };

    fetchViewCounts();
  }, []);

  // 변화율 계산
  const calculateChange = (): { change: string; trend: 'up' | 'down' | 'stable' } => {
    if (recentViews === null || previousViews === null || previousViews === 0) {
      return { change: "0%", trend: "stable" };
    }

    const changePercent = ((recentViews - previousViews) / previousViews) * 100;
    const formattedChange = changePercent >= 0 
      ? `+${changePercent.toFixed(1)}%` 
      : `${changePercent.toFixed(1)}%`;
    
    return {
      change: formattedChange,
      trend: changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'stable'
    };
  };

  const changeData = calculateChange();
  const formattedValue = loading 
    ? "..." 
    : recentViews !== null 
      ? recentViews.toLocaleString() 
      : "0";

  const statsData = [
    {
      title: "페이지 총 방문 (최근 7일)",
      value: formattedValue,
      unit: "회",
      change: changeData.change,
      changeLabel: "이전 7일 대비",
      trend: changeData.trend,
      icon: BarChart3,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      highlight: true,
      loading,
      dateRange: dateRange?.recent,
    },
    ...otherStatsData,
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trend === "up" ? TrendingUp : stat.trend === "down" ? TrendingDown : TrendingUp;
        
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
                {stat.dateRange && (
                  <p className="text-xs text-gray-400 mb-1">
                    {stat.dateRange}
                  </p>
                )}
                <div className="flex items-baseline space-x-2">
                  {stat.loading ? (
                    <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
                  ) : (
                    <>
                      <span className={`text-2xl font-bold ${
                        stat.highlight ? 'text-primary-900' : 'text-gray-900'
                      }`}>
                        {stat.value}
                      </span>
                      <span className="text-sm font-medium text-gray-500">
                        {stat.unit}
                      </span>
                    </>
                  )}
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
            {!stat.loading && stat.change && (
              <div className="flex items-center justify-between">
                <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  stat.trend === "up" 
                    ? "bg-green-100 text-green-700" 
                    : stat.trend === "down"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-700"
                }`}>
                  {stat.trend !== "stable" && <TrendIcon className="h-3 w-3 mr-1" />}
                  {stat.change}
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  {stat.changeLabel}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
