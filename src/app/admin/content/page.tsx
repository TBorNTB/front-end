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
  FileText,
  Upload,
  Brain,
} from "lucide-react";

// Import complex components - REMOVED ArticleManagement
import ProjectManagement from "./components/ProjectManagement";
import CSKnowledgeManagement from "./components/CSKnowledgeManagement";
import NewsManagement from "./components/NewsManagement";
import { fetchAdminMetaCount } from "@/lib/api/services/meta-services";
import { categoryService } from "@/lib/api/services/category-services";
import { uploadRAGDocument } from "@/lib/api/services/elastic-services";
import toast from "react-hot-toast";

// UPDATED: Removed "articles" from TabType
type TabType = "overview" | "projects" | "cs-knowledge" | "news" | "categories" | "rag";

type ApiCategory = {
  id: number;
  name: string;
  description: string;
  content?: string;
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
  const [newCategory, setNewCategory] = useState({ name: "", description: "", content: "" });

  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const [editTarget, setEditTarget] = useState<ApiCategory | null>(null);
  const [editForm, setEditForm] = useState({ nextName: "", description: "", content: "" });
  const [deleteTarget, setDeleteTarget] = useState<ApiCategory | null>(null);
  const [viewTarget, setViewTarget] = useState<ApiCategory | null>(null);

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
    const content = newCategory.content.trim();

    if (!name) {
      toast.error("카테고리 이름을 입력해주세요.");
      return;
    }

    if (!content) {
      toast.error("자세한 설명을 입력해주세요.");
      return;
    }

    setIsMutating(true);

    try {
      await categoryService.createCategory({ name, description, content });
      toast.success("카테고리가 생성되었습니다.");
      setNewCategory({ name: "", description: "", content: "" });
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
      content: category.content || "",
    });
  };

  const handleUpdate = async () => {
    if (!editTarget) return;

    const prevName = editTarget.name;
    const nextName = editForm.nextName.trim();
    const description = editForm.description.trim();
    const content = editForm.content.trim();

    if (!nextName) {
      toast.error("카테고리 이름을 입력해주세요.");
      return;
    }

    if (!content) {
      toast.error("자세한 설명을 입력해주세요.");
      return;
    }

    setIsMutating(true);

    try {
      await categoryService.updateCategory({ prevName, nextName, description, content });
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
              <label className="admin-form-label">요약</label>
              <input
                type="text"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                placeholder="요약을 입력하세요"
                className="admin-form-input"
                disabled={isMutating}
              />
            </div>

            <div className="admin-form-group md:col-span-2">
              <label className="admin-form-label">자세한 설명</label>
              <textarea
                value={newCategory.content}
                onChange={(e) => setNewCategory({ ...newCategory, content: e.target.value })}
                placeholder="자세한 설명을 입력하세요"
                className="admin-form-input min-h-[120px]"
                disabled={isMutating}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setIsCreating(false);
                setNewCategory({ name: "", description: "", content: "" });
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
          <div className="admin-card col-span-full py-10 text-center text-sm text-gray-700">
            불러오는 중...
          </div>
        ) : error ? (
          <div className="admin-card col-span-full py-10 text-center text-sm text-red-600">
            {error}
          </div>
        ) : categories.length === 0 ? (
          <div className="admin-card col-span-full py-10 text-center text-sm text-gray-700">
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
                      onClick={() => setViewTarget(category)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      title="자세히 보기"
                    >
                      <Eye className="w-4 h-4" />
                      자세히
                    </button>
                    <button
                      onClick={() => openEdit(category)}
                      className="p-1 text-gray-700 hover:text-primary-600 transition-colors"
                      title="편집"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1 text-gray-700 hover:text-red-600 transition-colors"
                      title="삭제"
                      onClick={() => setDeleteTarget(category)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="text-gray-700 line-clamp-2">
                    {category.description || "(요약 없음)"}
                  </div>
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
          <Plus className="w-8 h-8 text-gray-700 mb-2" />
          <span className="text-gray-700 font-medium">새 카테고리 추가</span>
        </div>
      </div>

      {/* Edit Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="admin-card w-full max-w-lg">
            <div className="admin-card-header">
              <h4 className="admin-card-title">카테고리 수정</h4>
              <p className="admin-card-description">이름/설명/콘텐츠를 수정합니다</p>
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
                <label className="admin-form-label">요약</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="admin-form-input min-h-[96px]"
                  disabled={isMutating}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">자세한 설명</label>
                <textarea
                  value={editForm.content}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  className="admin-form-input min-h-[120px]"
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

      {/* Detail Modal */}
      {viewTarget && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="admin-card w-full max-w-2xl">
            <div className="admin-card-header">
              <h4 className="admin-card-title">카테고리 자세히 보기</h4>
              <p className="admin-card-description">카테고리의 상세 정보를 확인합니다</p>
            </div>

            <div className="space-y-4">
              <div className="admin-form-group">
                <label className="admin-form-label">이름</label>
                <input type="text" value={viewTarget.name} className="admin-form-input" disabled />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">요약</label>
                <textarea
                  value={viewTarget.description || ''}
                  className="admin-form-input min-h-[96px]"
                  disabled
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">자세한 설명</label>
                <textarea
                  value={viewTarget.content || ''}
                  className="admin-form-input min-h-[160px]"
                  disabled
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button className="admin-btn-secondary" onClick={() => setViewTarget(null)}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// RAG 학습용 PDF 업로드 UI (간단 버전)
function RAGLearningManagement() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else if (file) {
      toast.error("PDF 파일만 업로드 가능합니다.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else if (file) {
      toast.error("PDF 파일만 업로드 가능합니다.");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleLearn = async () => {
    if (!selectedFile) {
      toast.error("PDF 파일을 선택해주세요.");
      return;
    }
    setIsUploading(true);
    try {
      const res = await uploadRAGDocument(selectedFile);
      setSelectedFile(null);
      toast.success(res.data?.message || "RAG 학습 요청이 완료되었습니다.");
    } catch (e) {
      const message = e instanceof Error ? e.message : "학습 요청에 실패했습니다.";
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => setSelectedFile(null);

  return (
    <div className="space-y-8">
      <div className="admin-card">
        <div className="admin-card-header">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-indigo-600" />
            <h3 className="admin-card-title">RAG 학습용 PDF 업로드</h3>
          </div>
          <p className="admin-card-description">
            챗봇/검색에 활용할 PDF 문서를 업로드하여 학습시킵니다. 한 번에 1개 파일만 업로드 가능합니다.
          </p>
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
            용량이 큰 PDF는 업로드가 제한될 수 있습니다. 오류 시 더 작은 파일로 나누거나 용량을 줄여 올려주세요.
          </p>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            isDragging ? "border-indigo-500 bg-indigo-50" : "border-gray-300 bg-gray-50/50"
          }`}
        >
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
            id="rag-pdf-input"
          />
          <label htmlFor="rag-pdf-input" className="cursor-pointer block">
            <Upload className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-700 font-medium">
              PDF 파일을 여기에 끌어다 놓거나 클릭하여 선택하세요
            </p>
            <p className="text-sm text-gray-700 mt-1">*.pdf 만 지원 · 한 번에 1개만 선택</p>
          </label>
        </div>

        {selectedFile && (
          <div className="mt-4 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-red-500 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-700">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearFile}
                className="admin-btn-secondary text-sm py-2"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleLearn}
                disabled={isUploading}
                className="admin-btn-cta text-sm py-2 flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    학습 중...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    학습 시키기
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
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
        const metaRes = await fetchAdminMetaCount();

        if (cancelled) return;

        setCounts({
          projectCount: metaRes.projectCount ?? 0,
          // 새로운 API: articleCount == CS 지식, newsCount == 뉴스
          csKnowledgeCount: metaRes.articleCount ?? 0,
          newsCount: metaRes.newsCount ?? 0,
          // 카테고리 갯수는 API에서 직접 받음
          categoryCount: metaRes.categoryCount ?? 0,
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
    { id: "rag" as TabType, label: "RAG 학습", icon: Brain, color: "text-indigo-600" },
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <button 
            onClick={() => setActiveTab("projects")}
            className="flex flex-col items-center p-6 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
          >
            <FolderOpen className="w-8 h-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-green-900">프로젝트 승인</span>
          </button>
          
          <button 
            onClick={() => setActiveTab("cs-knowledge")}
            className="flex flex-col items-center p-6 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
          >
            <BookOpen className="w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-purple-900">CS 지식 관리</span>
          </button>

          <button 
            onClick={() => setActiveTab("news")}
            className="flex flex-col items-center p-6 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
          >
            <Newspaper className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-blue-900">뉴스 관리</span>
          </button>
          
          <button 
            onClick={() => setActiveTab("categories")}
            className="flex flex-col items-center p-6 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group"
          >
            <Tag className="w-8 h-8 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-orange-900">카테고리 정리</span>
          </button>

          <button 
            onClick={() => setActiveTab("rag")}
            className="flex flex-col items-center p-6 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors group"
          >
            <Brain className="w-8 h-8 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-indigo-900">RAG 학습</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">카테고리 관리</h1>
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
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? tab.color : 'text-gray-700'}`} />
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
        {activeTab === "rag" && <RAGLearningManagement />}
      </div>
    </div>
  );
}
