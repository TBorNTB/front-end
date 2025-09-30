"use client";

import { useState } from "react";
import BadgeManagement from "./BadgeManagement";
import BadgeAssignment from "./BadgeAssignment";

type TabType = "badge-management" | "badge-assignment";

export default function CommunityManagement() {
  const [activeTab, setActiveTab] = useState<TabType>("badge-management");

  const tabs = [
    { id: "badge-management" as TabType, label: "뱃지 관리" },
    { id: "badge-assignment" as TabType, label: "뱃지 부여" },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">커뮤니티 관리</h1>
        <p className="text-gray-700 text-lg font-medium">뱃지 시스템으로 커뮤니티 활동을 관리하고 격려하세요</p>
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
        {activeTab === "badge-management" && <BadgeManagement />}
        {activeTab === "badge-assignment" && <BadgeAssignment />}
      </div>
    </div>
  );
}
