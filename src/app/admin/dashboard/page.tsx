// src/app/admin/dashboard/page.tsx - UPDATED with component separation
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StatsCards from "./components/StatsCards";
import WeeklyVisitorsChart from "./components/WeeklyVisitorsChart";
import PopularPosts from "./components/PopularPosts";
import { 
  Activity,
  Shield,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Users,
  FileText,
  FolderOpen,
  ExternalLink,
  ChevronRight
} from "lucide-react";

// Enhanced Recent Activities with better data
const recentActivities = [
  {
    id: 1,
    message: "김철수님이 새로 가입했습니다",
    time: "2분 전",
    type: "user",
    icon: CheckCircle,
    color: "green"
  },
  {
    id: 2, 
    message: "React 최신 동향 아티클이 게시되었습니다",
    time: "15분 전",
    type: "content",
    icon: TrendingUp,
    color: "blue"
  },
  {
    id: 3,
    message: "프로젝트에 새로운 댓글이 등록되었습니다", 
    time: "1시간 전",
    type: "comment",
    icon: Activity,
    color: "orange"
  },
  {
    id: 4,
    message: "이영희님의 등급 변경이 요청되었습니다",
    time: "2시간 전", 
    type: "grade",
    icon: AlertCircle,
    color: "purple"
  }
];

// Grade Change Requests (limited for dashboard)
const gradeChangeRequests = [
  {
    id: 1,
    name: "김철수",
    initial: "김",
    fromGrade: "초급",
    toGrade: "중급",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    avatarBg: "bg-yellow-100",
    avatarText: "text-yellow-700"
  },
  {
    id: 2,
    name: "이영희",
    initial: "이", 
    fromGrade: "중급",
    toGrade: "고급",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    avatarBg: "bg-blue-100",
    avatarText: "text-blue-700"
  }
];

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setLastUpdated(new Date());
    
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="text-sm text-gray-500">대시보드를 로딩 중입니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Last Updated & Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-primary-900">
            마지막 업데이트: {lastUpdated.toLocaleTimeString('ko-KR')}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>새로고침</span>
        </button>
      </div>

      {/* Stats Cards - Keep as separate component */}
      <StatsCards />

      {/* Three Column Layout - Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Chart & Popular Posts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly Visitors Chart - Keep as separate component */}
          <WeeklyVisitorsChart />
          
          {/* Popular Posts - Now using component */}
          <PopularPosts />
        </div>

        {/* Right Column - Quick Actions & Activities */}
        <div className="space-y-6">
                    {/* Grade Change Requests - Separate Card */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-primary-900">등급 변경 요청</h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">4개 대기중</span>
                <Users className="h-5 w-5 text-primary-400" />
              </div>
            </div>
            
            <div className="space-y-3">
              {gradeChangeRequests.map((request) => (
                <div key={request.id} className={`flex items-center justify-between p-3 ${request.bgColor} border ${request.borderColor} rounded-lg`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${request.avatarBg} rounded-full flex items-center justify-center`}>
                      <span className={`text-sm font-bold ${request.avatarText}`}>{request.initial}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{request.name}</p>
                      <p className="text-xs text-gray-500">{request.fromGrade} → {request.toGrade} 요청</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors">
                      승인
                    </button>
                    <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
                      거부
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100">
              <button 
                onClick={() => router.push('/admin/members?tab=grade-requests')}
                className="w-full flex items-center justify-center space-x-2 text-sm text-primary-600 hover:text-primary-700 font-medium py-2 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <span>모든 등급 요청 보기 (4개)</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Recent Activities Card */}
          <div className="card">
            {/* Recent Activities - Inline */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-primary-900">최근 활동</h3>
                <Activity className="h-5 w-5 text-primary-400" />
              </div>
              
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${
                      activity.color === 'green' ? 'bg-green-100' :
                      activity.color === 'blue' ? 'bg-blue-100' :
                      activity.color === 'orange' ? 'bg-orange-100' :
                      'bg-purple-100'
                    }`}>
                      <activity.icon className={`h-4 w-4 ${
                        activity.color === 'green' ? 'text-green-600' :
                        activity.color === 'blue' ? 'text-blue-600' :
                        activity.color === 'orange' ? 'text-orange-600' :
                        'text-purple-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 leading-relaxed">
                        {activity.message}
                      </p>
                      <div className="flex items-center mt-1">
                        <Clock className="h-3 w-3 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <button className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium py-2 hover:bg-primary-50 rounded-lg transition-colors">
                  모든 활동 보기 →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Status - Enhanced */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-primary-900">시스템 상태</h3>
          <Shield className="h-5 w-5 text-primary-400" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
              <span className="font-medium text-gray-900">웹 서버</span>
            </div>
            <span className="text-sm text-green-600 font-medium">정상</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
              <span className="font-medium text-gray-900">데이터베이스</span>
            </div>
            <span className="text-sm text-green-600 font-medium">정상</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
              <span className="font-medium text-gray-900">이메일 서비스</span>
            </div>
            <span className="text-sm text-yellow-600 font-medium">점검중</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
              <span className="font-medium text-gray-900">CDN</span>
            </div>
            <span className="text-sm text-blue-600 font-medium">정상</span>
          </div>
        </div>
      </div>
    </div>
  );
}
