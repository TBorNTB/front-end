// src/app/admin/dashboard/page.tsx - FIXED Dashboard Layout
"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  FileText, 
  MessageSquare, 
  TrendingUp,
  Activity,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";

// Mock data - replace with real API calls
const dashboardStats = [
  {
    title: "페이지 총 방문",
    value: "8,452",
    change: "+15%",
    changeType: "positive",
    icon: TrendingUp,
    color: "blue"
  },
  {
    title: "신규 가입 (7일)",
    value: "12",
    change: "+5%", 
    changeType: "positive",
    icon: Users,
    color: "green"
  },
  {
    title: "새 프로젝트 (7일)",
    value: "3",
    change: "-25%",
    changeType: "negative", 
    icon: FileText,
    color: "purple"
  },
  {
    title: "새 아티클 (7일)",
    value: "8",
    change: "+30%",
    changeType: "positive",
    icon: MessageSquare,
    color: "orange"
  }
];

const recentActivities = [
  {
    id: 1,
    message: "새로운 사용자가 가입했습니다",
    time: "2분 전",
    type: "user",
    icon: Users,
    color: "green"
  },
  {
    id: 2, 
    message: "콘텐츠가 업데이트되었습니다",
    time: "15분 전",
    type: "content",
    icon: FileText,
    color: "blue"
  },
  {
    id: 3,
    message: "새로운 댓글이 등록되었습니다", 
    time: "1시간 전",
    type: "comment",
    icon: MessageSquare,
    color: "orange"
  }
];

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
          <p className="text-gray-600 mt-1">SSG Hub 관리자 대시보드에 오신 것을 환영합니다</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center px-3 py-2 bg-green-100 text-green-800 rounded-lg">
            <CheckCircle className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">시스템 정상</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">지난 주 대비</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${
                stat.color === 'blue' ? 'bg-blue-100' :
                stat.color === 'green' ? 'bg-green-100' :
                stat.color === 'purple' ? 'bg-purple-100' :
                'bg-orange-100'
              }`}>
                <stat.icon className={`h-6 w-6 ${
                  stat.color === 'blue' ? 'text-blue-600' :
                  stat.color === 'green' ? 'text-green-600' :
                  stat.color === 'purple' ? 'text-purple-600' :
                  'text-orange-600'
                }`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">최근 활동</h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  activity.color === 'green' ? 'bg-green-100' :
                  activity.color === 'blue' ? 'bg-blue-100' :
                  'bg-orange-100'
                }`}>
                  <activity.icon className={`h-4 w-4 ${
                    activity.color === 'green' ? 'text-green-600' :
                    activity.color === 'blue' ? 'text-blue-600' :
                    'text-orange-600'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <div className="flex items-center mt-1">
                    <Clock className="h-3 w-3 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              모든 활동 보기 →
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">빠른 작업</h3>
            <Shield className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-blue-600 mr-3" />
                <span className="font-medium text-gray-900">새 사용자 승인</span>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">3개</span>
            </button>
            
            <button className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-green-600 mr-3" />
                <span className="font-medium text-gray-900">콘텐츠 검토</span>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">7개</span>
            </button>
            
            <button className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-orange-600 mr-3" />
                <span className="font-medium text-gray-900">시스템 알림</span>
              </div>
              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">2개</span>
            </button>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">시스템 상태</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="font-medium text-gray-900">웹 서버</span>
            </div>
            <span className="text-sm text-green-600 font-medium">정상</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="font-medium text-gray-900">데이터베이스</span>
            </div>
            <span className="text-sm text-green-600 font-medium">정상</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
              <span className="font-medium text-gray-900">이메일 서비스</span>
            </div>
            <span className="text-sm text-yellow-600 font-medium">점검중</span>
          </div>
        </div>
      </div>
    </div>
  );
}
