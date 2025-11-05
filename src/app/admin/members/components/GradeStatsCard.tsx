"use client";

import useGradeStats from "../hooks/useGradeStats";
import { Users, TrendingUp, TrendingDown } from "lucide-react";

interface GradeStatsCardsProps {
  refreshKey: number;
}

export default function GradeStatsCards({ refreshKey }: GradeStatsCardsProps) {
  const { stats, isLoading, error, refetch } = useGradeStats({ refreshKey });

  const getGradeInfo = (role: string) => {
    const gradeInfo = {
      GUEST: { 
        name: '외부인', 
        description: '제한된 권한을 가진 방문자', 
        color: 'gray',
        initial: '외'
      },
      ASSOCIATE: { 
        name: '준회원', 
        description: '기본 권한을 가진 회원', 
        color: 'blue',
        initial: '준'
      },
      REGULAR: { 
        name: '정회원', 
        description: '모든 기능을 사용할 수 있는 회원', 
        color: 'green',
        initial: '정'
      },
      SENIOR: { 
        name: '선배님', 
        description: '경험과 지식을 가진 선배 회원', 
        color: 'purple',
        initial: '선'
      },
      ADMIN: { 
        name: '운영진', 
        description: '관리 권한을 가진 회원', 
        color: 'orange',
        initial: '운'
      }
    };
    return gradeInfo[role as keyof typeof gradeInfo];
  };

  const getColorClasses = (color: string) => {
    const colorClasses = {
      gray: {
        bg: 'bg-gray-50',
        border: 'border-gray-200 hover:border-gray-300',
        avatarBg: 'bg-gray-100',
        avatarText: 'text-gray-600',
        buttonBg: 'bg-gray-100 hover:bg-gray-200',
        buttonText: 'text-gray-700'
      },
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200 hover:border-blue-300',
        avatarBg: 'bg-blue-100',
        avatarText: 'text-blue-600',
        buttonBg: 'bg-blue-100 hover:bg-blue-200',
        buttonText: 'text-blue-700'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200 hover:border-green-300',
        avatarBg: 'bg-green-100',
        avatarText: 'text-green-600',
        buttonBg: 'bg-green-100 hover:bg-green-200',
        buttonText: 'text-green-700'
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200 hover:border-purple-300',
        avatarBg: 'bg-purple-100',
        avatarText: 'text-purple-600',
        buttonBg: 'bg-purple-100 hover:bg-purple-200',
        buttonText: 'text-purple-700'
      },
      orange: {
        bg: 'bg-orange-50',
        border: 'border-orange-200 hover:border-orange-300',
        avatarBg: 'bg-orange-100',
        avatarText: 'text-orange-600',
        buttonBg: 'bg-orange-100 hover:bg-orange-200',
        buttonText: 'text-orange-700'
      }
    };
    return colorClasses[color as keyof typeof colorClasses] || colorClasses.gray;
  };

  if (error) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">등급 통계를 불러오는 중 오류가 발생했습니다.</p>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h3 className="text-lg font-semibold text-primary-900">등급 관리</h3>
        <p className="text-sm text-gray-600 mt-1">회원 등급 시스템을 관리합니다</p>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse p-6 border-2 border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="h-8 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats?.map((stat: any) => {
            const gradeInfo = getGradeInfo(stat.role);
            const colorClasses = getColorClasses(gradeInfo?.color || 'gray');
            
            return (
              <div 
                key={stat.role} 
                className={`p-6 rounded-lg border-2 hover:shadow-lg transition-all cursor-pointer ${colorClasses.bg} ${colorClasses.border}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses.avatarBg}`}>
                      <span className={`text-sm font-bold ${colorClasses.avatarText}`}>
                        {gradeInfo?.initial}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{gradeInfo?.name}</h4>
                      <p className="text-sm text-gray-500">{gradeInfo?.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-gray-900">총 {stat.count}명</span>
                    {stat.trend && (
                      <div className={`flex items-center text-xs ${
                        stat.trend > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.trend > 0 ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {Math.abs(stat.trend)}%
                      </div>
                    )}
                  </div>
                  <button className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${colorClasses.buttonBg} ${colorClasses.buttonText}`}>
                    관리
                  </button>
                </div>
              </div>
            );
          })}

          {/* Total Summary Card */}
          <div className="p-6 bg-primary-50 border-2 border-primary-200 rounded-lg hover:shadow-lg transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">전체 회원</h4>
                  <p className="text-sm text-gray-500">모든 등급을 포함한 총 회원</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900">
                총 {stats?.reduce((sum: number, stat: any) => sum + stat.count, 0)}명
              </span>
              <button className="px-3 py-1.5 bg-primary-100 text-primary-700 hover:bg-primary-200 rounded-lg text-sm font-medium transition-colors">
                전체보기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
