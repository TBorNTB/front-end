// src/app/admin/content/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { 
  FolderOpen, 
  Tag, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  BookOpen,
  Newspaper,
} from "lucide-react";

// Import complex components - REMOVED ArticleManagement
import ProjectManagement from "./components/ProjectManagement";
import CSKnowledgeManagement from "./components/CSKnowledgeManagement";
import NewsManagement from "./components/NewsManagement";
import { fetchMetaCount } from "@/lib/api/services/meta-services";
import { fetchCategories } from "@/lib/api/services/project-services";
import { categoryService } from "@/lib/api/services/category-services";
import toast from "react-hot-toast";

// UPDATED: Removed "articles" from TabType
type TabType = "overview" | "projects" | "cs-knowledge" | "news" | "categories";

type ApiCategory = {
  id: number;
  name: string;
  description: string;
};

const badgeColors = [
  "bg-red-100 text-red-800",
  "bg-blue-100 text-blue-800",
  "bg-green-100 text-green-800",
  "bg-yellow-100 text-yellow-800",
  "bg-purple-100 text-purple-800",
  "bg-indigo-100 text-indigo-800",
] as const;

// Inline Category Management Component
function InlineCategoryManagement() {
  const [isCreating, setIsCreating] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });

  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const [editTarget, setEditTarget] = useState<ApiCategory | null>(null);
  const [editForm, setEditForm] = useState({ nextName: "", description: "" });
  const [deleteTarget, setDeleteTarget] = useState<ApiCategory | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await categoryService.getCategories();
        if (cancelled) return;
        setCategories(data.categories || []);
      } catch (err) {
        if (cancelled) return;
        setCategories([]);
        setError(err instanceof Error ? err.message : "카테고리를 불러오지 못했습니다.");
      } finally {
        if (cancelled) return;
        setIsLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const reload = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await categoryService.getCategories();
      setCategories(data.categories || []);
    } catch (err) {
      setCategories([]);
      setError(err instanceof Error ? err.message : "카테고리를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    const name = newCategory.name.trim();
    const description = newCategory.description.trim();

    if (!name) {
      toast.error("카테고리 이름을 입력해주세요.");
      return;
    }

    setIsMutating(true);

    try {
      await categoryService.createCategory({ name, description });
      toast.success("카테고리가 생성되었습니다.");
      setNewCategory({ name: "", description: "" });
      setIsCreating(false);
      await reload();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "카테고리 생성에 실패했습니다.");
    } finally {
      setIsMutating(false);
    }
  };

  const openEdit = (category: ApiCategory) => {
    setEditTarget(category);
    setEditForm({
      nextName: category.name,
      description: category.description || "",
    });
  };

  const handleUpdate = async () => {
    if (!editTarget) return;

    const prevName = editTarget.name;
    const nextName = editForm.nextName.trim();
    const description = editForm.description.trim();

    if (!nextName) {
      toast.error("카테고리 이름을 입력해주세요.");
      return;
    }

    setIsMutating(true);

    try {
      await categoryService.updateCategory({ prevName, nextName, description });
      toast.success("카테고리가 수정되었습니다.");
      setEditTarget(null);
      await reload();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "카테고리 수정에 실패했습니다.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsMutating(true);

    try {
      await categoryService.deleteCategory({ name: deleteTarget.name });
      toast.success("카테고리가 삭제되었습니다.");
      setDeleteTarget(null);
      await reload();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "카테고리 삭제에 실패했습니다.");
    } finally {
      setIsMutating(false);
    }
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
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="카테고리 이름을 입력하세요"
                className="admin-form-input"
                disabled={isMutating}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">설명</label>
              <input
                type="text"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                placeholder="설명을 입력하세요"
                className="admin-form-input"
                disabled={isMutating}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setIsCreating(false);
                setNewCategory({ name: "", description: "" });
              }}
              className="admin-btn-secondary"
              disabled={isMutating}
            >
              취소
            </button>
            <button onClick={handleCreate} className="admin-btn-cta" disabled={isMutating}>
              {isMutating ? "생성 중..." : "생성"}
            </button>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="admin-card col-span-full py-10 text-center text-sm text-gray-500">
            불러오는 중...
          </div>
        ) : error ? (
          <div className="admin-card col-span-full py-10 text-center text-sm text-red-600">
            {error}
          </div>
        ) : categories.length === 0 ? (
          <div className="admin-card col-span-full py-10 text-center text-sm text-gray-500">
            카테고리가 없습니다.
          </div>
        ) : (
          categories.map((category) => {
            const color = badgeColors[Math.abs(category.id) % badgeColors.length];

            return (
              <div key={category.id} className="admin-card hover:shadow-lg">
                <div className="flex justify-between items-start mb-3">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>
                    {category.name}
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => openEdit(category)}
                      className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                      title="편집"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="삭제"
                      onClick={() => setDeleteTarget(category)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="text-gray-600 line-clamp-2">
                    {category.description || "(설명 없음)"}
                  </div>
                  <div className="text-xs text-gray-500">ID: {category.id}</div>
                </div>
              </div>
            );
          })
        )}

        {/* Add Category Card */}
        <div 
          onClick={() => setIsCreating(true)}
          className="admin-card border-2 border-dashed border-gray-300 hover:border-primary-400 cursor-pointer flex flex-col items-center justify-center py-8 transition-colors"
        >
          <Plus className="w-8 h-8 text-gray-400 mb-2" />
          <span className="text-gray-600 font-medium">새 카테고리 추가</span>
        </div>
      </div>

      {/* Edit Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="admin-card w-full max-w-lg">
            <div className="admin-card-header">
              <h4 className="admin-card-title">카테고리 수정</h4>
              <p className="admin-card-description">이름/설명을 수정합니다</p>
            </div>

            <div className="space-y-4">
              <div className="admin-form-group">
                <label className="admin-form-label">기존 이름</label>
                <input
                  type="text"
                  value={editTarget.name}
                  className="admin-form-input"
                  disabled
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">새 이름</label>
                <input
                  type="text"
                  value={editForm.nextName}
                  onChange={(e) => setEditForm({ ...editForm, nextName: e.target.value })}
                  className="admin-form-input"
                  disabled={isMutating}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">설명</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="admin-form-input min-h-[96px]"
                  disabled={isMutating}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="admin-btn-secondary"
                onClick={() => setEditTarget(null)}
                disabled={isMutating}
              >
                취소
              </button>
              <button
                className="admin-btn-cta"
                onClick={handleUpdate}
                disabled={isMutating}
              >
                {isMutating ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="admin-card w-full max-w-lg">
            <div className="admin-card-header">
              <h4 className="admin-card-title">카테고리를 삭제할까요?</h4>
              <p className="admin-card-description">
                삭제하면 복구가 어려울 수 있습니다.
              </p>
            </div>

            <div className="text-sm text-gray-800">
              대상: <span className="font-semibold">{deleteTarget.name}</span>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="admin-btn-secondary"
                onClick={() => setDeleteTarget(null)}
                disabled={isMutating}
              >
                취소
              </button>
              <button
                className="admin-btn-danger"
                onClick={handleDelete}
                disabled={isMutating}
              >
                {isMutating ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main Content Management Component
export default function AdminContent() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const [countsLoading, setCountsLoading] = useState(true);
  const [countsError, setCountsError] = useState<string | null>(null);
  const [counts, setCounts] = useState<{
    projectCount: number;
    newsCount: number;
    csKnowledgeCount: number;
    categoryCount: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadCounts = async () => {
      setCountsLoading(true);
      setCountsError(null);

      try {
        const [metaRes, categoriesRes] = await Promise.all([
          fetchMetaCount(),
          fetchCategories(),
        ]);

        if (cancelled) return;

        setCounts({
          projectCount: metaRes.projectCount ?? 0,
          // User request: articleCount == 뉴스
          newsCount: metaRes.articleCount ?? 0,
          // User request: categoryCount == CS 지식
          csKnowledgeCount: metaRes.categoryCount ?? 0,
          // User request: 카테고리 갯수는 /project-service/api/category 결과 길이
          categoryCount: categoriesRes.categories?.length ?? 0,
        });
      } catch (err) {
        if (cancelled) return;
        setCounts(null);
        setCountsError(err instanceof Error ? err.message : "개요 카운트를 불러오지 못했습니다.");
      } finally {
        if (cancelled) return;
        setCountsLoading(false);
      }
    };

    loadCounts();

    return () => {
      cancelled = true;
    };
  }, []);

  // UPDATED: Removed articles tab from tabs array
  const tabs = [
    { id: "overview" as TabType, label: "개요", icon: Eye, color: "text-primary-600" },
    { id: "projects" as TabType, label: "프로젝트 관리", icon: FolderOpen, color: "text-green-600" },
    { id: "cs-knowledge" as TabType, label: "CS 지식", icon: BookOpen, color: "text-purple-600" },
    { id: "news" as TabType, label: "뉴스", icon: Newspaper, color: "text-blue-600" },
    { id: "categories" as TabType, label: "카테고리 관리", icon: Tag, color: "text-orange-600" },
  ];

  const stats = useMemo(() => {
    const valueOrLoading = (value: number | undefined): string => {
      if (countsLoading) return "…";
      return (value ?? 0).toLocaleString();
    };

    return [
      {
        label: "전체 프로젝트",
        value: valueOrLoading(counts?.projectCount),
        icon: FolderOpen,
        color: "bg-green-500",
      },
      {
        label: "CS 지식",
        value: valueOrLoading(counts?.csKnowledgeCount),
        icon: BookOpen,
        color: "bg-purple-500",
      },
      {
        label: "뉴스",
        value: valueOrLoading(counts?.newsCount),
        icon: Newspaper,
        color: "bg-blue-500",
      },
      {
        label: "카테고리",
        value: valueOrLoading(counts?.categoryCount),
        icon: Tag,
        color: "bg-orange-500",
      },
    ];
  }, [counts, countsLoading]);

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
                {countsError && (
                  <div className="mt-1 text-xs text-red-600">{countsError}</div>
                )}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            onClick={() => setActiveTab("news")}
            className="flex flex-col items-center p-6 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
          >
            <Newspaper className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-blue-900">뉴스 관리</span>
            <span className="text-sm text-blue-600 mt-1">게시물 점검</span>
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
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">콘텐츠 관리</h1>
        <p className="admin-page-subtitle">프로젝트, CS지식, 뉴스, 카테고리를 체계적으로 관리하세요</p>
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
        {activeTab === "news" && <NewsManagement />}
        {activeTab === "categories" && <InlineCategoryManagement />}
      </div>
    </div>
  );
}
