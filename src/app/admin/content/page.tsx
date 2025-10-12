// src/app/admin/content/page.tsx
"use client";

import { useState } from "react";
import { FileText, FolderOpen, Tag, Search } from "lucide-react";

export default function AdminContent() {
  const [activeTab, setActiveTab] = useState("articles");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">콘텐츠 관리</h1>
        <p className="mt-1 text-sm text-gray-600">아티클, 프로젝트 및 카테고리를 관리하세요</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("articles")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "articles"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            아티클 관리
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "projects"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            프로젝트 관리
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "categories"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            카테고리 관리
          </button>
        </nav>
      </div>

      {/* Content based on active tab */}
      <div className="admin-card">
        {activeTab === "articles" && (
          <div>
            <div className="admin-card-header">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="admin-card-title">아티클 관리</h3>
                  <p className="admin-card-description">등록된 아티클을 관리하고 승인하세요</p>
                </div>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="아티클 검색..."
                      className="admin-form-input pl-10 w-64"
                    />
                  </div>
                  <button className="admin-btn-cta flex items-center px-4 py-2">
                    <FileText className="w-4 h-4 mr-2" />
                    새 아티클
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>제목</th>
                    <th>작성자</th>
                    <th>카테고리</th>
                    <th>작성일</th>
                    <th>상태</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Add article rows here */}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "projects" && (
          <div>
            <div className="admin-card-header">
              <h3 className="admin-card-title">프로젝트 관리</h3>
              <p className="admin-card-description">등록된 프로젝트를 관리하고 승인하세요</p>
            </div>
            {/* Project management content */}
          </div>
        )}

        {activeTab === "categories" && (
          <div>
            <div className="admin-card-header">
              <h3 className="admin-card-title">카테고리 관리</h3>
              <p className="admin-card-description">콘텐츠 카테고리를 생성하고 관리합니다</p>
            </div>
            {/* Category management content */}
          </div>
        )}
      </div>
    </div>
  );
}
