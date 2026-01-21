"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Loader2 } from "lucide-react";
import { getApiUrl } from "@/lib/api/config";
import { USER_ENDPOINTS } from "@/lib/api/endpoints/user-endpoints";

const days = ["월", "화", "수", "목", "금", "토", "일"];

interface WeeklyDataResponse {
  weeklyData: number[][];
}

// 지난주 날짜 범위 계산 함수
const getLastWeekRange = () => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 (일요일) ~ 6 (토요일)
  
  // 지난주 일요일 계산
  const lastSunday = new Date(today);
  lastSunday.setDate(today.getDate() - dayOfWeek - 7);
  lastSunday.setHours(0, 0, 0, 0);
  
  // 지난주 토요일 계산
  const lastSaturday = new Date(lastSunday);
  lastSaturday.setDate(lastSunday.getDate() + 6);
  lastSaturday.setHours(23, 59, 59, 999);
  
  return { start: lastSunday, end: lastSaturday };
};

// 날짜 포맷팅 함수
const formatDate = (date: Date): string => {
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

export default function WeeklyVisitorsChart() {
  const [weeklyData, setWeeklyData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastWeekRange, setLastWeekRange] = useState<{ start: Date; end: Date } | null>(null);

  useEffect(() => {
    const range = getLastWeekRange();
    setLastWeekRange(range);
    
    const fetchWeeklyData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const url = getApiUrl(USER_ENDPOINTS.VIEW.WEEKLY_COUNT);
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch weekly data: ${response.status}`);
        }

        const data: WeeklyDataResponse = await response.json();
        
        // API 응답이 [[0], [1], ...] 형태이므로 평탄화
        const flattenedData = data.weeklyData.flat();
        
        // 데이터가 7개가 아니면 0으로 채움
        const paddedData = [...flattenedData];
        while (paddedData.length < 7) {
          paddedData.push(0);
        }
        
        setWeeklyData(paddedData.slice(0, 7));
      } catch (err) {
        console.error('Error fetching weekly visitor data:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        // 에러 시 기본값 설정
        setWeeklyData([0, 0, 0, 0, 0, 0, 0]);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyData();
  }, []);

  // 최대값 계산 (차트 높이 계산용)
  const maxValue = Math.max(...weeklyData, 1);
  const totalVisitors = weeklyData.reduce((sum, val) => sum + val, 0);

  // 추세 계산 (이전 주 대비)
  const trend = weeklyData.length >= 2 
    ? weeklyData.slice(0, 3).reduce((sum, val) => sum + val, 0) < 
      weeklyData.slice(4, 7).reduce((sum, val) => sum + val, 0)
      ? 'up' : 'down'
    : 'stable';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">주간 방문자 수</h3>
          {lastWeekRange && (
            <p className="text-xs text-gray-500 mt-1">
              지난주 ({formatDate(lastWeekRange.start)} ~ {formatDate(lastWeekRange.end)})
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {loading ? (
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <>
              {trend === 'up' && (
                <div className="flex items-center text-green-600">
                  <TrendingUp className="w-5 h-5 mr-1" />
                  <span className="text-sm font-medium">상승 추세</span>
                </div>
              )}
              {trend === 'down' && (
                <div className="flex items-center text-red-600">
                  <TrendingUp className="w-5 h-5 mr-1 rotate-180" />
                  <span className="text-sm font-medium">하락 추세</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* 차트 영역 */}
      <div className="h-64 bg-gray-50 rounded-lg p-4 flex items-end justify-between gap-2">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-700 text-sm">차트 데이터를 불러오는 중...</p>
            </div>
          </div>
        ) : error ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        ) : (
          <>
            {weeklyData.map((value, index) => {
              const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
              return (
                <div key={index} className="flex-1 flex flex-col items-center justify-end h-full">
                  {/* 막대 그래프 */}
                  <div
                    className="w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t transition-all duration-500 ease-out hover:from-primary-600 hover:to-primary-500 relative group"
                    style={{ height: `${height}%`, minHeight: value > 0 ? '4px' : '0' }}
                  >
                    {/* 호버 시 값 표시 */}
                    {value > 0 && (
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {value.toLocaleString()}명
                      </div>
                    )}
                  </div>
                  {/* 요일 라벨 */}
                  <span className="text-xs text-gray-600 mt-2 font-medium">{days[index]}</span>
                </div>
              );
            })}
          </>
        )}
      </div>
      
      {/* 통계 정보 */}
      {!loading && !error && (
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium">총 방문자:</span>{' '}
            <span className="text-gray-900 font-semibold">{totalVisitors.toLocaleString()}명</span>
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">일평균:</span>{' '}
            <span className="text-gray-900 font-semibold">
              {Math.round(totalVisitors / 7).toLocaleString()}명
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
