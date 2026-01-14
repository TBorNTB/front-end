// src/app/admin/dashboard/page.tsx - UPDATED with component separation
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StatsCards from "./components/StatsCards";
import WeeklyVisitorsChart from "./components/WeeklyVisitorsChart";
import PopularPosts from "./components/PopularPosts";
import { 
  Shield,
  AlertCircle,
  RefreshCw,
  Users,
  ChevronRight,
  Loader2
} from "lucide-react";
import { getApiUrl } from "@/lib/api/config";
import { USER_ENDPOINTS } from "@/lib/api/endpoints/user-endpoints";
import { UserRoleDisplay } from "@/types/core";

interface RoleChangeRequest {
  roleChange: {
    id: number;
    realName: string;
    email: string;
    previousRole: string;
    requestedRole: string;
    requestStatus: string;
    processedBy: string | null;
    requestedAt: string;
    processedAt: string | null;
  };
}

// 역할에 따른 색상 및 스타일 매핑
const getRoleChangeStyle = (requestedRole: string) => {
  const styleMap: Record<string, {
    bgColor: string;
    borderColor: string;
    avatarBg: string;
    avatarText: string;
  }> = {
    'ASSOCIATE': {
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      avatarBg: "bg-blue-100",
      avatarText: "text-blue-700"
    },
    'REGULAR': {
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      avatarBg: "bg-green-100",
      avatarText: "text-green-700"
    },
    'SENIOR': {
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      avatarBg: "bg-purple-100",
      avatarText: "text-purple-700"
    },
    'ADMIN': {
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      avatarBg: "bg-orange-100",
      avatarText: "text-orange-700"
    },
  };
  
  return styleMap[requestedRole] || {
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    avatarBg: "bg-yellow-100",
    avatarText: "text-yellow-700"
  };
};

// 이름의 첫 글자 추출
const getInitial = (name: string): string => {
  return name ? name.charAt(0) : "?";
};

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const router = useRouter();
  
  const [roleChangeRequests, setRoleChangeRequests] = useState<RoleChangeRequest[]>([]);
  const [allRoleChangeRequests, setAllRoleChangeRequests] = useState<RoleChangeRequest[]>([]);
  const [roleChangeLoading, setRoleChangeLoading] = useState(true);
  const [roleChangeError, setRoleChangeError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [roleChangePage, setRoleChangePage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // 등급 변경 요청 조회
  useEffect(() => {
    const fetchRoleChangeRequests = async () => {
      try {
        setRoleChangeLoading(true);
        setRoleChangeError(null);

        // 쿠키에서 accessToken 가져오기
        const getAccessToken = (): string | null => {
          if (typeof document === 'undefined') return null;
          const cookies = document.cookie.split(';');
          for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'accessToken') {
              return decodeURIComponent(value);
            }
          }
          return null;
        };

        const accessToken = getAccessToken();
        const headers: HeadersInit = {
          'accept': 'application/json',
        };

        // 토큰이 있으면 Authorization 헤더 추가
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const response = await fetch(
          getApiUrl(USER_ENDPOINTS.USER.ROLE_ALL),
          {
            method: 'GET',
            headers,
            credentials: 'include',
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
          });
          throw new Error(`Failed to fetch role change requests: ${response.status} ${response.statusText}`);
        }

        const data: RoleChangeRequest[] = await response.json();
        
        // 데이터가 배열인지 확인
        if (!Array.isArray(data)) {
          console.warn('Unexpected response format:', data);
          setRoleChangeRequests([]);
          return;
        }

        // PENDING 상태만 필터링 (대시보드에서는 대기 중인 요청만 표시)
        const pendingRequests = data.filter(
          item => item.roleChange && item.roleChange.requestStatus === 'PENDING'
        );
        
        // 전체 목록 저장 (개수 표시용)
        setAllRoleChangeRequests(pendingRequests);
        
        // 페이지네이션 처리 (5개씩)
        const pageSize = 5;
        const startIndex = roleChangePage * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedRequests = pendingRequests.slice(startIndex, endIndex);
        
        setRoleChangeRequests(paginatedRequests);
      } catch (err) {
        console.error('Error fetching role change requests:', err);
        const errorMessage = err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.';
        setRoleChangeError(errorMessage);
        setRoleChangeRequests([]);
      } finally {
        setRoleChangeLoading(false);
      }
    };

    fetchRoleChangeRequests();
  }, [roleChangePage]);

  // 등급 변경 요청 승인/거절 처리
  const handleRoleChangeAction = async (requestId: number, approved: boolean) => {
    try {
      setProcessingIds(prev => new Set(prev).add(requestId));

      // 쿠키에서 accessToken 가져오기
      const getAccessToken = (): string | null => {
        if (typeof document === 'undefined') return null;
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'accessToken') {
            return decodeURIComponent(value);
          }
        }
        return null;
      };

      const accessToken = getAccessToken();
      const headers: HeadersInit = {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      };

      // 토큰이 있으면 Authorization 헤더 추가
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const endpoint = USER_ENDPOINTS.USER.ROLE_MANAGE.replace(':id', requestId.toString());
      const response = await fetch(
        getApiUrl(endpoint),
        {
          method: 'PATCH',
          headers,
          credentials: 'include',
          body: JSON.stringify({ approved }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        throw new Error(`Failed to ${approved ? 'approve' : 'reject'} role change request: ${response.status}`);
      }

      // 성공 시 전체 목록과 현재 페이지 목록에서 제거
      setAllRoleChangeRequests(prev => 
        prev.filter(item => item.roleChange.id !== requestId)
      );
      setRoleChangeRequests(prev => {
        const filtered = prev.filter(item => item.roleChange.id !== requestId);
        // 현재 페이지에 아이템이 없고 이전 페이지가 있으면 이전 페이지로 이동
        if (filtered.length === 0 && roleChangePage > 0) {
          setRoleChangePage(prev => prev - 1);
        }
        return filtered;
      });

      // 성공 메시지 (선택사항)
      console.log(`등급 변경 요청이 ${approved ? '승인' : '거부'}되었습니다.`);
    } catch (err) {
      console.error(`Error ${approved ? 'approving' : 'rejecting'} role change request:`, err);
      alert(`등급 변경 요청 ${approved ? '승인' : '거부'} 중 오류가 발생했습니다.`);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

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

        {/* Right Column - Quick Actions */}
        <div className="space-y-6">
          {/* Grade Change Requests - Separate Card */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-primary-900">등급 변경 요청</h3>
              <div className="flex items-center space-x-2">
                {roleChangeLoading ? (
                  <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                ) : (
                  <>
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                      {allRoleChangeRequests.length}개 대기중
                    </span>
                    <Users className="h-5 w-5 text-primary-400" />
                  </>
                )}
              </div>
            </div>
            
            {roleChangeLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              </div>
            ) : roleChangeError ? (
              <div className="text-center py-8 text-sm text-red-600">{roleChangeError}</div>
            ) : roleChangeRequests.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">대기 중인 등급 변경 요청이 없습니다.</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {roleChangeRequests.map((item) => {
                    const request = item.roleChange;
                    const style = getRoleChangeStyle(request.requestedRole);
                    const previousRoleLabel = UserRoleDisplay[request.previousRole as keyof typeof UserRoleDisplay] || request.previousRole;
                    const requestedRoleLabel = UserRoleDisplay[request.requestedRole as keyof typeof UserRoleDisplay] || request.requestedRole;
                    
                    return (
                      <div key={request.id} className={`flex items-center justify-between p-3 ${style.bgColor} border ${style.borderColor} rounded-lg`}>
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 ${style.avatarBg} rounded-full flex items-center justify-center`}>
                            <span className={`text-sm font-bold ${style.avatarText}`}>
                              {getInitial(request.realName)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{request.realName}</p>
                            <p className="text-xs text-gray-500">
                              {previousRoleLabel} → {requestedRoleLabel} 요청
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleRoleChangeAction(request.id, true)}
                            disabled={processingIds.has(request.id)}
                            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            {processingIds.has(request.id) ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                처리중
                              </>
                            ) : (
                              '승인'
                            )}
                          </button>
                          <button 
                            onClick={() => handleRoleChangeAction(request.id, false)}
                            disabled={processingIds.has(request.id)}
                            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            {processingIds.has(request.id) ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                처리중
                              </>
                            ) : (
                              '거부'
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* 페이지네이션 */}
                {Math.ceil(allRoleChangeRequests.length / 5) > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      {roleChangePage + 1} / {Math.ceil(allRoleChangeRequests.length / 5)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setRoleChangePage(prev => Math.max(0, prev - 1))}
                        disabled={roleChangePage === 0}
                        className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        이전
                      </button>
                      <button
                        onClick={() => setRoleChangePage(prev => Math.min(Math.ceil(allRoleChangeRequests.length / 5) - 1, prev + 1))}
                        disabled={roleChangePage >= Math.ceil(allRoleChangeRequests.length / 5) - 1}
                        className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        다음
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => router.push('/admin/members?tab=requests')}
                    className="w-full flex items-center justify-center space-x-2 text-sm text-primary-600 hover:text-primary-700 font-medium py-2 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <span>모든 등급 요청 보기 ({allRoleChangeRequests.length}개)</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}
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
