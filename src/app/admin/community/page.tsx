// src/app/admin/community/page.tsx - FIXED with proper styling
"use client";

import { useState } from "react";
import { Award, Users, Star, Plus } from "lucide-react";

export default function AdminCommunity() {
  const [activeTab, setActiveTab] = useState("badges");

  return (
    <div className="space-y-6">

      {/* Tab Navigation */}
      <div>
        <nav className="flex space-x-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("badges")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "badges"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            뱃지 관리
          </button>
          <button
            onClick={() => setActiveTab("assignment")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "assignment"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            뱃지 부여
          </button>
        </nav>
      </div>

      {/* Content based on active tab */}
      <div className="bg-white rounded-xl border border-primary-200 p-6 shadow-sm">
        {activeTab === "badges" && (
          <div>
            <div className="border-b border-gray-200 pb-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">뱃지 관리</h3>
                  <p className="text-sm text-gray-700 mt-1">커뮤니티 뱃지를 생성하고 관리합니다</p>
                </div>
                <button className="flex items-center px-4 py-2 bg-primary-600 text-white shadow-sm hover:bg-primary-500 rounded-lg font-medium transition-all duration-200">
                  <Award className="w-4 h-4 mr-2" />
                  새 뱃지 생성
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Badge Cards */}
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-6 text-center">
                <Award className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">첫 번째 프로젝트</h4>
                <p className="text-sm text-gray-700 mb-4">첫 프로젝트를 등록한 회원에게 부여</p>
                <div className="flex justify-center space-x-2">
                  <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs">활성</span>
                  <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs">12명 보유</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6 text-center">
                <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">활발한 참여자</h4>
                <p className="text-sm text-gray-700 mb-4">커뮤니티에 활발히 참여하는 회원</p>
                <div className="flex justify-center space-x-2">
                  <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded-full text-xs">활성</span>
                  <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs">8명 보유</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6 text-center">
                <Star className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">우수 멘토</h4>
                <p className="text-sm text-gray-700 mb-4">후배들을 잘 도와준 선배 회원</p>
                <div className="flex justify-center space-x-2">
                  <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded-full text-xs">활성</span>
                  <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs">3명 보유</span>
                </div>
              </div>

              {/* Add New Badge Card */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 hover:bg-primary-50 transition-colors cursor-pointer">
                <Plus className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                <h4 className="font-medium text-gray-700 mb-2">새 뱃지 추가</h4>
                <p className="text-sm text-gray-700">커뮤니티 뱃지를 만들어보세요</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "assignment" && (
          <div>
            <div className="border-b border-gray-200 pb-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900">뱃지 부여</h3>
              <p className="text-sm text-gray-700 mt-1">회원들에게 뱃지를 수동으로 부여합니다</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="회원 이름 또는 이메일 검색..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option>뱃지 선택</option>
                  <option>첫 번째 프로젝트</option>
                  <option>활발한 참여자</option>
                  <option>우수 멘토</option>
                </select>
                <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
                  부여
                </button>
              </div>
              
              {/* Recent Badge Assignments */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">최근 뱃지 부여 내역</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">김철수에게 첫 번째 프로젝트 뱃지 부여</span>
                    <span className="text-gray-700">10분 전</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">이영희에게 활발한 참여자 뱃지 부여</span>
                    <span className="text-gray-700">1시간 전</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
