// src/app/admin/community/page.tsx
"use client";

import { useState } from "react";
import { Award, Users, MessageSquare, Star } from "lucide-react";

export default function AdminCommunity() {
  const [activeTab, setActiveTab] = useState("badges");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">커뮤니티 관리</h1>
        <p className="mt-1 text-sm text-gray-600">뱃지 시스템으로 커뮤니티 활동을 관리하고 격려하세요</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("badges")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "badges"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            뱃지 관리
          </button>
          <button
            onClick={() => setActiveTab("assignment")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "assignment"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            뱃지 부여
          </button>
        </nav>
      </div>

      {/* Content based on active tab */}
      <div className="admin-card">
        {activeTab === "badges" && (
          <div>
            <div className="admin-card-header">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="admin-card-title">뱃지 관리</h3>
                  <p className="admin-card-description">커뮤니티 뱃지를 생성하고 관리합니다</p>
                </div>
                <button className="admin-btn-cta flex items-center px-4 py-2">
                  <Award className="w-4 h-4 mr-2" />
                  새 뱃지 생성
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Badge cards will go here */}
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900">첫 번째 프로젝트</h4>
                <p className="text-sm text-gray-600 mt-1">첫 프로젝트를 등록한 회원에게 부여</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "assignment" && (
          <div>
            <div className="admin-card-header">
              <h3 className="admin-card-title">뱃지 부여</h3>
              <p className="admin-card-description">회원들에게 뱃지를 수동으로 부여합니다</p>
            </div>
            {/* Badge assignment content */}
          </div>
        )}
      </div>
    </div>
  );
}
