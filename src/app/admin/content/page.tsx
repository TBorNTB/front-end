// src/app/admin/content/page.tsx - FIXED with proper styling
"use client";

import { useState } from "react";
import { 
  FileText, 
  FolderOpen, 
  Tag, 
  Search, 
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal
} from "lucide-react";

export default function AdminContent() {
  const [activeTab, setActiveTab] = useState("articles");

  // Mock data for demonstration
  const mockArticles = [
    { id: 1, title: "React 최신 동향", author: "김철수", category: "Frontend", date: "2024-01-15", status: "published" },
    { id: 2, title: "TypeScript 심화 가이드", author: "이영희", category: "Development", date: "2024-01-14", status: "draft" },
    { id: 3, title: "SSG 프로젝트 소개", author: "박민수", category: "SSG", date: "2024-01-13", status: "pending" },
  ];

  const mockProjects = [
    { id: 1, title: "SSG Hub 웹사이트", author: "김철수", category: "웹개발", date: "2024-01-10", status: "active" },
    { id: 2, title: "모바일 앱 프로토타입", author: "이영희", category: "앱개발", date: "2024-01-08", status: "completed" },
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      published: "bg-green-100 text-green-800",
      draft: "bg-gray-100 text-gray-800", 
      pending: "bg-yellow-100 text-yellow-800",
      active: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800"
    };
    
    const labels = {
      published: "게시됨",
      draft: "초안",
      pending: "검토중", 
      active: "진행중",
      completed: "완료"
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">콘텐츠 관리</h1>
        <p className="mt-1 text-sm text-gray-600">아티클, 프로젝트 및 카테고리를 관리하세요</p>
      </div>

      {/* Tab Navigation */}
      <div>
        <nav className="flex space-x-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("articles")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "articles"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            아티클 관리
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "projects"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            프로젝트 관리
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
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
      <div className="bg-white rounded-xl border border-primary-200 p-6 shadow-sm">
        {activeTab === "articles" && (
          <div>
            <div className="border-b border-gray-200 pb-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">아티클 관리</h3>
                  <p className="text-sm text-gray-600 mt-1">등록된 아티클을 관리하고 승인하세요</p>
                </div>
                <div className="flex space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="아티클 검색..."
                      className="pl-10 pr-3 py-2 w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <button className="flex items-center px-4 py-2 bg-primary-600 text-white shadow-sm hover:bg-primary-500 rounded-lg font-medium transition-all duration-200">
                    <FileText className="w-4 h-4 mr-2" />
                    새 아티클
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white rounded-lg overflow-hidden">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">제목</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">작성자</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">카테고리</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">작성일</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">상태</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {mockArticles.map((article, _index) => (
                    <tr key={article.id} className="hover:bg-gray-100">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-t border-gray-100">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-gray-400 mr-2" />
                          {article.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-t border-gray-100">{article.author}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-t border-gray-100">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {article.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-t border-gray-100">{article.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-t border-gray-100">
                        {getStatusBadge(article.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-800 p-1">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-800 p-1">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-800 p-1">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "projects" && (
          <div>
            <div className="border-b border-gray-200 pb-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">프로젝트 관리</h3>
                  <p className="text-sm text-gray-600 mt-1">등록된 프로젝트를 관리하고 승인하세요</p>
                </div>
                <button className="flex items-center px-4 py-2 bg-primary-600 text-white shadow-sm hover:bg-primary-500 rounded-lg font-medium transition-all duration-200">
                  <FolderOpen className="w-4 h-4 mr-2" />
                  새 프로젝트
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockProjects.map((project) => (
                <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <FolderOpen className="h-6 w-6 text-blue-500" />
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{project.title}</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>작성자: {project.author}</p>
                    <p>카테고리: {project.category}</p>
                    <p>등록일: {project.date}</p>
                  </div>
                  <div className="mt-3">
                    {getStatusBadge(project.status)}
                  </div>
                </div>
              ))}
              
              {/* Add New Project Card */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary-400 hover:bg-primary-50 transition-colors cursor-pointer text-center">
                <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">새 프로젝트 추가</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "categories" && (
          <div>
            <div className="border-b border-gray-200 pb-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">카테고리 관리</h3>
                  <p className="text-sm text-gray-600 mt-1">콘텐츠 카테고리를 생성하고 관리합니다</p>
                </div>
                <button className="flex items-center px-4 py-2 bg-primary-600 text-white shadow-sm hover:bg-primary-500 rounded-lg font-medium transition-all duration-200">
                  <Tag className="w-4 h-4 mr-2" />
                  새 카테고리
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Cards */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 text-center">
                <Tag className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">Frontend</h4>
                <p className="text-sm text-gray-600 mb-2">React, Vue, Angular 관련</p>
                <span className="text-xs text-blue-700">12개 아티클</span>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4 text-center">
                <Tag className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">Backend</h4>
                <p className="text-sm text-gray-600 mb-2">Node.js, Python, Java</p>
                <span className="text-xs text-green-700">8개 아티클</span>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4 text-center">
                <Tag className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">SSG</h4>
                <p className="text-sm text-gray-600 mb-2">동아리 관련 콘텐츠</p>
                <span className="text-xs text-purple-700">15개 아티클</span>
              </div>

              {/* Add New Category Card */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary-400 hover:bg-primary-50 transition-colors cursor-pointer text-center">
                <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <h4 className="font-medium text-gray-600 mb-1">새 카테고리</h4>
                <p className="text-sm text-gray-500">카테고리를 추가하세요</p>
              </div>
            </div>

            {/* Category Management Actions */}
            <div className="mt-8 bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">카테고리 설정</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">기본 카테고리</span>
                  <select className="px-3 py-1 border border-gray-300 rounded-md text-sm">
                    <option>Frontend</option>
                    <option>Backend</option>
                    <option>SSG</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">카테고리 자동 승인</span>
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" defaultChecked />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
