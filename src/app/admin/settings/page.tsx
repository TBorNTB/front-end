// src/app/admin/settings/page.tsx - FIXED with proper styling
"use client";

import { useState } from "react";
import { Shield, Save, RefreshCw } from "lucide-react";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">설정</h1>
        <p className="mt-1 text-sm text-gray-600">시스템 설정을 관리하세요</p>
      </div>

      {/* Tab Navigation */}
      <div>
        <nav className="flex space-x-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("general")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "general"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            일반 설정
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "security"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            보안 설정
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
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
      <div className="bg-white rounded-xl border border-primary-200 p-6 shadow-sm">
        {activeTab === "general" && (
          <div>
            <div className="border-b border-gray-200 pb-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900">일반 설정</h3>
              <p className="text-sm text-gray-600 mt-1">사이트의 기본 설정을 관리합니다</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">사이트 이름</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                  defaultValue="SSG Hub" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">사이트 설명</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 h-24 resize-none" 
                  defaultValue="세종대학교 SSG 동아리 허브"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">사이트 URL</label>
                <input 
                  type="url" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                  defaultValue="https://ssg-hub.com" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">연락처 이메일</label>
                <input 
                  type="email" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                  defaultValue="admin@ssg-hub.com" 
                />
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center px-4 py-2 bg-primary-600 text-white shadow-sm hover:bg-primary-500 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      저장
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div>
            <div className="border-b border-gray-200 pb-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900">보안 설정</h3>
              <p className="text-sm text-gray-600 mt-1">시스템 보안 설정을 관리합니다</p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">SSL 인증서</h4>
                    <p className="text-sm text-gray-600">HTTPS 연결이 활성화되어 있습니다</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">활성</span>
              </div>

              <div>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">2단계 인증 필수</span>
                </label>
              </div>

              <div>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">로그인 시도 제한</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div>
            <div className="border-b border-gray-200 pb-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900">알림 설정</h3>
              <p className="text-sm text-gray-600 mt-1">시스템 알림 설정을 관리합니다</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">이메일 알림</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" defaultChecked />
                    <span className="ml-2 text-sm text-gray-700">새로운 회원 가입</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" defaultChecked />
                    <span className="ml-2 text-sm text-gray-700">시스템 오류</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    <span className="ml-2 text-sm text-gray-700">일일 리포트</span>
                  </label>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">브라우저 알림</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" defaultChecked />
                    <span className="ml-2 text-sm text-gray-700">즉시 알림</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    <span className="ml-2 text-sm text-gray-700">중요 알림만</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
