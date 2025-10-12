// src/app/admin/members/page.tsx
"use client";

import { useState } from "react";
import { Search, Filter, UserPlus } from "lucide-react";

export default function AdminMembers() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">회원 관리</h1>
        <p className="mt-1 text-sm text-gray-600">SSG Hub 회원들을 관리하고 등급을 조정하세요</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("all")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "all"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            전체 회원
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "requests"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            등급 변경 요청
          </button>
          <button
            onClick={() => setActiveTab("grades")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "grades"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            등급 관리
          </button>
        </nav>
      </div>

      {/* Actions Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="회원 검색..."
              className="admin-form-input pl-10 w-64"
            />
          </div>
          <button className="admin-btn-secondary flex items-center px-4 py-2">
            <Filter className="w-4 h-4 mr-2" />
            필터
          </button>
        </div>
        <button className="admin-btn-cta flex items-center px-4 py-2">
          <UserPlus className="w-4 h-4 mr-2" />
          회원 추가
        </button>
      </div>

      {/* Content based on active tab */}
      <div className="admin-card">
        {activeTab === "all" && (
          <div>
            <div className="admin-card-header">
              <h3 className="admin-card-title">전체 회원 목록</h3>
              <p className="admin-card-description">모든 등록된 회원들을 관리합니다</p>
            </div>
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>이름</th>
                    <th>이메일</th>
                    <th>등급</th>
                    <th>가입일</th>
                    <th>상태</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Add member rows here */}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "requests" && (
          <div>
            <div className="admin-card-header">
              <h3 className="admin-card-title">등급 변경 요청</h3>
              <p className="admin-card-description">회원들의 등급 변경 요청을 검토하고 승인합니다</p>
            </div>
            {/* Add grade change requests content */}
          </div>
        )}

        {activeTab === "grades" && (
          <div>
            <div className="admin-card-header">
              <h3 className="admin-card-title">등급 관리</h3>
              <p className="admin-card-description">회원 등급 시스템을 관리합니다</p>
            </div>
            {/* Add grade management content */}
          </div>
        )}
      </div>
    </div>
  );
}
