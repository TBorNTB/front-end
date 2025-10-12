// src/app/admin/settings/page.tsx
"use client";

import { useState } from "react";
import { Settings, Globe, Shield, Bell, Database } from "lucide-react";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">설정</h1>
        <p className="mt-1 text-sm text-gray-600">시스템 설정을 관리하세요</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("general")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "general"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            일반 설정
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "security"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            보안 설정
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "notifications"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            알림 설정
          </button>
        </nav>
      </div>

      {/* Content based on active tab */}
      <div className="admin-card">
        {activeTab === "general" && (
          <div>
            <div className="admin-card-header">
              <h3 className="admin-card-title">일반 설정</h3>
              <p className="admin-card-description">사이트의 기본 설정을 관리합니다</p>
            </div>
            <div className="space-y-6">
              <div className="admin-form-group">
                <label className="admin-form-label">사이트 이름</label>
                <input type="text" className="admin-form-input" defaultValue="SSG Hub" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">사이트 설명</label>
                <textarea className="admin-form-textarea" defaultValue="세종대학교 SSG 동아리 허브"></textarea>
              </div>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div>
            <div className="admin-card-header">
              <h3 className="admin-card-title">보안 설정</h3>
              <p className="admin-card-description">시스템 보안 설정을 관리합니다</p>
            </div>
            {/* Security settings content */}
          </div>
        )}

        {activeTab === "notifications" && (
          <div>
            <div className="admin-card-header">
              <h3 className="admin-card-title">알림 설정</h3>
              <p className="admin-card-description">시스템 알림 설정을 관리합니다</p>
            </div>
            {/* Notification settings content */}
          </div>
        )}
      </div>
    </div>
  );
}
