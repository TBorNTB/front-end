// src/app/admin/members/page.tsx - FIXED with proper styling
"use client";

import { useState } from "react";
import { Search, Filter, UserPlus, MoreHorizontal, CheckCircle, XCircle, Clock } from "lucide-react";

export default function AdminMembers() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">회원 관리</h1>
        <p className="mt-1 text-sm text-gray-600">SSG Hub 회원들을 관리하고 등급을 조정하세요</p>
      </div>

      {/* Tab Navigation */}
      <div>
        <nav className="flex space-x-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("all")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "all"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            전체 회원
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "requests"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            등급 변경 요청
          </button>
          <button
            onClick={() => setActiveTab("grades")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
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
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="회원 검색..."
              className="w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
          </div>
          <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            필터
          </button>
        </div>
        <button className="flex items-center px-4 py-2 bg-primary-600 text-white shadow-sm hover:bg-primary-500 rounded-lg font-medium transition-all duration-200">
          <UserPlus className="w-4 h-4 mr-2" />
          회원 추가
        </button>
      </div>

      {/* Content based on active tab */}
      <div className="bg-white rounded-xl border border-primary-200 p-6 shadow-sm">
        {activeTab === "all" && (
          <div>
            <div className="border-b border-gray-200 pb-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900">전체 회원 목록</h3>
              <p className="text-sm text-gray-600 mt-1">모든 등록된 회원들을 관리합니다</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white rounded-lg overflow-hidden">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">이름</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">이메일</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">등급</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">가입일</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">상태</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">관리</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-100">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-t border-gray-100">김철수</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-t border-gray-100">kim@example.com</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-t border-gray-100">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">정회원</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-t border-gray-100">2024-01-15</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-t border-gray-100">
                      <span className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                        활성
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-t border-gray-100">
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "requests" && (
          <div>
            <div className="border-b border-gray-200 pb-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900">등급 변경 요청</h3>
              <p className="text-sm text-gray-600 mt-1">회원들의 등급 변경 요청을 검토하고 승인합니다</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-yellow-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">김민수</p>
                    <p className="text-sm text-gray-600">준회원 → 정회원 요청</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">승인</button>
                  <button className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700">거부</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "grades" && (
          <div>
            <div className="border-b border-gray-200 pb-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900">등급 관리</h3>
              <p className="text-sm text-gray-600 mt-1">회원 등급 시스템을 관리합니다</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">준회원</h4>
                <p className="text-sm text-gray-600">기본 권한을 가진 회원</p>
                <p className="text-xs text-gray-500 mt-2">총 15명</p>
              </div>
              <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">정회원</h4>
                <p className="text-sm text-blue-700">모든 기능을 사용할 수 있는 회원</p>
                <p className="text-xs text-blue-600 mt-2">총 28명</p>
              </div>
              <div className="p-4 border border-purple-200 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">운영진</h4>
                <p className="text-sm text-purple-700">관리 권한을 가진 회원</p>
                <p className="text-xs text-purple-600 mt-2">총 5명</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
