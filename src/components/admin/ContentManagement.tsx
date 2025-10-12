"use client";

import { useState } from "react";
import CategoryManagement from "./CategoryManagement";
import ProjectManagement from "./ProjectManagement";
import ArticleManagement from "./ArticleManagement";
import CSKnowledgeManagement from "./CSKnowledgeManagement";

type TabType = "category" | "project" | "article" | "cs-knowledge";

export default function ContentManagement() {
  const [activeTab, setActiveTab] = useState<TabType>("category");

  const tabs = [
    { id: "category" as TabType, label: "카테고리 관리" },
    { id: "project" as TabType, label: "프로젝트 관리" },
    { id: "article" as TabType, label: "아티클 관리" },
    { id: "cs-knowledge" as TabType, label: "CS지식 관리" },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">콘텐츠 관리</h1>
        <p className="text-gray-700 text-lg font-medium">카테고리, 프로젝트, 아티클, CS지식을 체계적으로 관리하세요</p>
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
        {activeTab === "category" && <CategoryManagement />}
        {activeTab === "project" && <ProjectManagement />}
        {activeTab === "article" && <ArticleManagement />}
        {activeTab === "cs-knowledge" && <CSKnowledgeManagement />}
      </div>
    </div>
  );
}
