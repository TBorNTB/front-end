"use client";

import StatsCards from "./StatsCards";
import WeeklyVisitorsChart from "./WeeklyVisitorsChart";
import GradeChangeRequests from "./GradeChangeRequests";
import QuickLinks from "./QuickLinks";
import PopularPosts from "./PopularPosts";

export default function Dashboard() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">대시보드</h1>
        <p className="text-gray-700 text-lg font-medium">SSG Hub 관리자 대시보드에 오신 것을 환영합니다</p>
      </div>
      
      {/* 통계 카드들 */}
      <StatsCards />
      
      {/* 차트와 위젯들 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2">
          <WeeklyVisitorsChart />
        </div>
        <div className="space-y-6">
          <GradeChangeRequests />
          <QuickLinks />
        </div>
      </div>
      
      {/* 인기 게시물 */}
      <div className="mt-8">
        <PopularPosts />
      </div>
    </div>
  );
}
