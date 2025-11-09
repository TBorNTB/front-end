// src/app/admin/content/page.tsx
"use client";

import { useState } from "react";
import { 
  FolderOpen, 
  Tag, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  BookOpen,
} from "lucide-react";

// Import complex components - REMOVED ArticleManagement
import ProjectManagement from "./components/ProjectManagement";
import CSKnowledgeManagement from "./components/CSKnowledgeManagement";

// UPDATED: Removed "articles" from TabType
type TabType = "overview" | "projects" | "cs-knowledge" | "categories";

// Mock data for categories (inline management)
const mockCategories = [
  { id: 1, name: "웹 해킹", slug: "web-hacking", projectCount: 5, articleCount: 12, color: "bg-red-100 text-red-800" },
  { id: 2, name: "리버싱", slug: "reversing", projectCount: 3, articleCount: 8, color: "bg-purple-100 text-purple-800" },
  { id: 3, name: "웹 개발", slug: "web-development", projectCount: 4, articleCount: 6, color: "bg-blue-100 text-blue-800" },
  { id: 4, name: "모바일 보안", slug: "mobile-security", projectCount: 1, articleCount: 3, color: "bg-green-100 text-green-800" },
  { id: 5, name: "네트워크", slug: "network", projectCount: 2, articleCount: 5, color: "bg-indigo-100 text-indigo-800" },
  { id: 6, name: "알고리즘", slug: "algorithm", projectCount: 6, articleCount: 15, color: "bg-yellow-100 text-yellow-800" },
];

// Inline Category Management Component
function InlineCategoryManagement() {
  const [isCreating, setIsCreating] = useState(false);
  const [_editingId, setEditingId] = useState<number | null>(null);
  const [newCategory, setNewCategory] = useState({ name: "", slug: "", color: "bg-blue-100 text-blue-800" });

  const colorOptions = [
    { value: "bg-red-100 text-red-800", label: "빨강", preview: "bg-red-100" },
    { value: "bg-blue-100 text-blue-800", label: "파랑", preview: "bg-blue-100" },
    { value: "bg-green-100 text-green-800", label: "초록", preview: "bg-green-100" },
    { value: "bg-yellow-100 text-yellow-800", label: "노랑", preview: "bg-yellow-100" },
    { value: "bg-purple-100 text-purple-800", label: "보라", preview: "bg-purple-100" },
    { value: "bg-indigo-100 text-indigo-800", label: "남색", preview: "bg-indigo-100" },
  ];

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s]/g, '')
      .replace(/\s+/g, '-');
  };

  const handleCreate = () => {
    if (newCategory.name.trim()) {
      console.log("새 카테고리 생성:", newCategory);
      setNewCategory({ name: "", slug: "", color: "bg-blue-100 text-blue-800" });
      setIsCreating(false);
    }
  };

  const handleNameChange = (name: string) => {
    setNewCategory({ 
      ...newCategory, 
      name, 
      slug: generateSlug(name) 
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="admin-card-title">카테고리 관리</h3>
          <p className="admin-card-description">콘텐츠 카테고리를 생성하고 관리합니다</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="admin-btn-cta flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          새 카테고리
        </button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h4 className="text-lg font-semibold text-gray-900">새 카테고리 추가</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="admin-form-group">
              <label className="admin-form-label">카테고리 이름</label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="카테고리 이름을 입력하세요"
                className="admin-form-input"
              />
            </div>
            
            <div className="admin-form-group">
              <label className="admin-form-label">URL Slug</label>
              <input
                type="text"
                value={newCategory.slug}
                onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                placeholder="url-slug"
                className="admin-form-input"
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">색상 테마</label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setNewCategory({ ...newCategory, color: color.value })}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-colors ${
                    newCategory.color === color.value 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full ${color.preview}`}></div>
                  <span className="text-sm">{color.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setIsCreating(false);
                setNewCategory({ name: "", slug: "", color: "bg-blue-100 text-blue-800" });
              }}
              className="admin-btn-secondary"
            >
              취소
            </button>
            <button onClick={handleCreate} className="admin-btn-cta">
              생성
            </button>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockCategories.map((category) => (
          <div key={category.id} className="admin-card hover:shadow-lg">
            <div className="flex justify-between items-start mb-3">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${category.color}`}>
                {category.name}
              </div>
              <div className="flex space-x-1">
                <button 
                  onClick={() => setEditingId(category.id)}
                  className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">/{category.slug}</p>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center text-gray-600">
                <FolderOpen className="w-4 h-4 mr-1 text-primary-500" />
                <span>{category.projectCount}개 프로젝트</span>
              </div>
              {/* REMOVED: Article count display */}
            </div>
          </div>
        ))}

        {/* Add Category Card */}
        <div 
          onClick={() => setIsCreating(true)}
          className="admin-card border-2 border-dashed border-gray-300 hover:border-primary-400 cursor-pointer flex flex-col items-center justify-center py-8 transition-colors"
        >
          <Plus className="w-8 h-8 text-gray-400 mb-2" />
          <span className="text-gray-600 font-medium">새 카테고리 추가</span>
        </div>
      </div>
    </div>
  );
}

// Main Content Management Component
export default function AdminContent() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // UPDATED: Removed articles tab from tabs array
  const tabs = [
    { id: "overview" as TabType, label: "개요", icon: Eye, color: "text-primary-600" },
    { id: "projects" as TabType, label: "프로젝트 관리", icon: FolderOpen, color: "text-green-600" },
    { id: "cs-knowledge" as TabType, label: "CS 지식", icon: BookOpen, color: "text-purple-600" },
    { id: "categories" as TabType, label: "카테고리 관리", icon: Tag, color: "text-orange-600" },
  ];

  // UPDATED: Removed article-related statistics, keeping only 3 stats
  const stats = [
    { label: "전체 프로젝트", value: "42", change: "+5", trend: "up", icon: FolderOpen, color: "bg-green-500" },
    { label: "CS 지식", value: "89", change: "+8", trend: "up", icon: BookOpen, color: "bg-purple-500" },
    { label: "카테고리", value: "6", change: "+1", trend: "up", icon: Tag, color: "bg-orange-500" },
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="admin-stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="admin-stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="admin-stat-label">{stat.label}</p>
                <p className="admin-stat-value">{stat.value}</p>
                <div className="admin-stat-change positive">
                  <span>{stat.change} 지난 달 대비</span>
                </div>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions - REMOVED article-related action */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">빠른 작업</h3>
          <p className="admin-card-description">자주 사용하는 기능들에 빠르게 접근하세요</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setActiveTab("projects")}
            className="flex flex-col items-center p-6 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
          >
            <FolderOpen className="w-8 h-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-green-900">프로젝트 승인</span>
            <span className="text-sm text-green-600 mt-1">2개 대기중</span>
          </button>
          
          <button 
            onClick={() => setActiveTab("cs-knowledge")}
            className="flex flex-col items-center p-6 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
          >
            <BookOpen className="w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-purple-900">CS 지식 관리</span>
            <span className="text-sm text-purple-600 mt-1">최근 업데이트</span>
          </button>
          
          <button 
            onClick={() => setActiveTab("categories")}
            className="flex flex-col items-center p-6 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group"
          >
            <Tag className="w-8 h-8 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-orange-900">카테고리 정리</span>
            <span className="text-sm text-orange-600 mt-1">6개 카테고리</span>
          </button>
        </div>
      </div>

      {/* Recent Activity - REMOVED article activity */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">최근 활동</h3>
          <p className="admin-card-description">최근 콘텐츠 변경사항을 확인하세요</p>
        </div>
        <div className="space-y-3">
          {[
            { type: "project", title: "SSG Hub 개발", author: "이영희", time: "4시간 전", status: "검토중" },
            { type: "cs", title: "알고리즘 복잡도", author: "박민수", time: "6시간 전", status: "업데이트됨" },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.type === 'project' ? 'bg-green-100 text-green-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  {activity.type === 'project' ? <FolderOpen className="w-4 h-4" /> :
                   <BookOpen className="w-4 h-4" />}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-600">{activity.author} • {activity.time}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                activity.status === '승인됨' ? 'bg-green-100 text-green-800' :
                activity.status === '검토중' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {activity.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">콘텐츠 관리</h1>
        <p className="admin-page-subtitle">프로젝트, CS지식, 카테고리를 체계적으로 관리하세요</p>
      </div>

      {/* Enhanced Tab Navigation */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`admin-tab flex items-center space-x-2 whitespace-nowrap ${
                activeTab === tab.id ? 'active' : ''
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? tab.color : 'text-gray-400'}`} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content - REMOVED articles case */}
      <div className="tab-content">
        {activeTab === "overview" && renderOverview()}
        {activeTab === "projects" && <ProjectManagement />}
        {activeTab === "cs-knowledge" && <CSKnowledgeManagement />}
        {activeTab === "categories" && <InlineCategoryManagement />}
      </div>
    </div>
  );
}
