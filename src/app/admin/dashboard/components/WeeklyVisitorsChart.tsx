"use client";

import { TrendingUp } from "lucide-react";

const days = ["월", "화", "수", "목", "금", "토", "일"];

export default function WeeklyVisitorsChart() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">주간 방문자 수</h3>
        <div className="flex items-center text-green-600">
          <TrendingUp className="w-5 h-5 mr-1" />
          <span className="text-sm font-medium">상승 추세</span>
        </div>
      </div>
      
      {/* 차트 영역 */}
      <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-700 text-sm">차트 데이터를 불러오는 중...</p>
        </div>
      </div>
      
      {/* X축 라벨 */}
      <div className="flex justify-between mt-4">
        {days.map((day) => (
          <span key={day} className="text-sm text-gray-700">
            {day}
          </span>
        ))}
      </div>
    </div>
  );
}
