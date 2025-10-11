"use client";

import { useState } from "react";
import GradeChangeRequests from "./GradeChangeRequests";
import GradeChangeRequestsTable from "./GradeChangeRequestsTable";
import AllMembers from "./AllMembers";
import GradeManagement from "./GradeManagement";

type TabType = "grade-requests" | "all-members" | "grade-management";

export default function MemberManagement() {
  const [activeTab, setActiveTab] = useState<TabType>("grade-requests");

  const tabs = [
    { id: "grade-requests" as TabType, label: "등급 변경 요청" },
    { id: "all-members" as TabType, label: "전체 회원" },
    { id: "grade-management" as TabType, label: "등급 관리" },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">회원 관리</h1>
        <p className="text-gray-600 text-lg">SSG Hub 회원들을 관리하고 등급을 조정하세요</p>
      </div>
      
      {/* 탭 네비게이션 */}
      <div className="admin-tabs mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

          {/* 탭 콘텐츠 */}
          <div className="admin-card-elevated">
            {activeTab === "grade-requests" && <GradeChangeRequestsTable />}
            {activeTab === "all-members" && <AllMembers />}
            {activeTab === "grade-management" && <GradeManagement />}
          </div>
    </div>
  );
}
