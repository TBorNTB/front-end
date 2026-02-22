"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, Trash2 } from "lucide-react";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";
import { deleteNews } from "@/lib/api/services/news-services";
import toast from "react-hot-toast";

type ApiNewsItem = {
  id: number;
  content: {
    title: string;
    category: string;
    summary?: string;
    content?: string;
  };
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  viewCount: number;
  writer: {
    username: string;
    nickname: string;
    realname: string;
  };
};

type NewsSearchResponse = {
  content: ApiNewsItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  error?: string;
};

type NewsRow = {
  id: number;
  title: string;
  author: string;
  category: string;
  createdAt: string;
  views: number;
  likes: number;
};

const PAGE_SIZE = 20;

const categories = [
  { label: "전체", value: "all" },
  { label: "MT", value: "MT" },
  { label: "OT", value: "OT" },
  { label: "STUDY", value: "STUDY" },
  { label: "SEMINAR", value: "SEMINAR" },
  { label: "UNITED_SEMINAR", value: "UNITED_SEMINAR" },
  { label: "CONFERENCE", value: "CONFERENCE" },
  { label: "CTF", value: "CTF" },
];

const sortOptions = ["최신순", "인기순", "조회순"] as const;

type SortOption = (typeof sortOptions)[number];

const sortToApi = (sortBy: SortOption): "LATEST" | "POPULAR" | "VIEWS" => {
  switch (sortBy) {
    case "최신순":
      return "LATEST";
    case "인기순":
      return "POPULAR";
    case "조회순":
      return "VIEWS";
    default:
      return "LATEST";
  }
};

const formatDate = (iso?: string): string => {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return String(iso).slice(0, 10);
  return date.toISOString().slice(0, 10);
};

const toRow = (item: ApiNewsItem): NewsRow => ({
  id: item.id,
  title: item.content?.title || "제목 없음",
  author: item.writer?.nickname || item.writer?.realname || item.writer?.username || "-",
  category: item.content?.category || "-",
  createdAt: formatDate(item.createdAt),
  views: item.viewCount || 0,
  likes: item.likeCount || 0,
});

export default function NewsManagement() {
  const [items, setItems] = useState<NewsRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("최신순");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const debounceRef = useRef<number | null>(null);
  const suggestionDebounceRef = useRef<number | null>(null);
  const suggestionsRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<NewsRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();

    const q = searchQuery.trim();
    if (q) params.append("keyword", q);

    // Match community "멤버소식" behavior: when 'all', default to MT.
    const apiCategory = selectedCategory !== "all" ? selectedCategory : "MT";
    params.append("category", apiCategory);
    params.append("postSortType", sortToApi(sortBy));
    params.append("size", String(PAGE_SIZE));
    params.append("page", String(page));

    return params;
  }, [searchQuery, selectedCategory, sortBy, page]);

  useEffect(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(() => {
      const controller = new AbortController();

      const load = async () => {
        setIsLoading(true);
        setError(null);

        try {
          const response = await fetch(`/api/news/search?${queryParams.toString()}`, {
            signal: controller.signal,
          });
          const data = (await response.json().catch(() => null)) as NewsSearchResponse | null;

          if (!response.ok || !data) {
            const message = response.statusText || `API error: ${response.status}`;
            setItems([]);
            setTotalPages(0);
            setTotalElements(0);
            setError(message);
            return;
          }

          if (data.error) {
            setItems([]);
            setTotalPages(0);
            setTotalElements(0);
            setError(data.error);
            return;
          }

          setItems((data.content || []).map(toRow));
          setTotalPages(data.totalPages || 0);
          setTotalElements(data.totalElements || 0);
        } catch (err) {
          if (err instanceof DOMException && err.name === "AbortError") return;
          setItems([]);
          setTotalPages(0);
          setTotalElements(0);
          setError(err instanceof Error ? err.message : "뉴스를 불러오지 못했습니다.");
        } finally {
          setIsLoading(false);
        }
      };

      load();
      return () => controller.abort();
    }, 250);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [queryParams]);

  // Search suggestions (Elasticsearch)
  useEffect(() => {
    if (suggestionDebounceRef.current) {
      window.clearTimeout(suggestionDebounceRef.current);
    }

    const q = searchQuery.trim();
    if (!q) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoadingSuggestions(false);
      return;
    }

    suggestionDebounceRef.current = window.setTimeout(() => {
      const controller = new AbortController();

      const loadSuggestions = async () => {
        setIsLoadingSuggestions(true);

        try {
          const response = await fetch(
            `/api/news/suggestions?query=${encodeURIComponent(q)}`,
            { signal: controller.signal }
          );
          const data = (await response.json().catch(() => [])) as unknown;
          const list = Array.isArray(data) ? (data as string[]) : [];
          setSuggestions(list.slice(0, 5));
          setShowSuggestions(true);
        } catch (err) {
          if (err instanceof DOMException && err.name === "AbortError") return;
          setSuggestions([]);
          setShowSuggestions(false);
        } finally {
          setIsLoadingSuggestions(false);
        }
      };

      loadSuggestions();
      return () => controller.abort();
    }, 200);

    return () => {
      if (suggestionDebounceRef.current) {
        window.clearTimeout(suggestionDebounceRef.current);
      }
    };
  }, [searchQuery]);

  // Close suggestion dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sortedItems = items;

  const handleDelete = async (target: NewsRow) => {
    const previous = items;
    setItems((prev) => prev.filter((x) => x.id !== target.id));
    setTotalElements((prev) => Math.max(0, prev - 1));
    setIsDeleting(true);

    try {
      await deleteNews(target.id);
      toast.success("뉴스가 삭제되었습니다.");
    } catch (err) {
      console.error(err);
      setItems(previous);
      setTotalElements((prev) => prev + 1);
      toast.error("뉴스 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">뉴스 관리</h3>
          <p className="admin-card-description">
            뉴스/공지 콘텐츠를 검색하고, 부적절한 게시물을 삭제할 수 있습니다
          </p>
        </div>

        {/* 검색 및 필터 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
            <input
              type="text"
              placeholder="제목으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-form-input pl-10"
              ref={searchInputRef}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setShowSuggestions(false);
                  setPage(0);
                }
                if (e.key === "Escape") {
                  setShowSuggestions(false);
                }
              }}
            />

            {showSuggestions && (
              <div
                ref={suggestionsRef}
                className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden"
              >
                {isLoadingSuggestions ? (
                  <div className="px-3 py-2 text-sm text-gray-700">검색어 제안 불러오는 중...</div>
                ) : suggestions.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-700">검색어 제안이 없습니다.</div>
                ) : (
                  suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
                      onClick={() => {
                        setSearchQuery(s);
                        setShowSuggestions(false);
                        setPage(0);
                        searchInputRef.current?.blur();
                      }}
                    >
                      {s}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(0);
                }}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
            </div>

            {sortOptions.map((option) => (
              <button
                key={option}
                onClick={() => {
                  setSortBy(option);
                  setPage(0);
                }}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  sortBy === option
                    ? "bg-white text-gray-900 border border-gray-300"
                    : "text-gray-800 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 text-sm text-gray-700">
          <span>
            총 <span className="font-semibold text-gray-900">{totalElements.toLocaleString()}</span>개
          </span>
          <div className="flex items-center gap-2">
            <button
              className="admin-btn-secondary px-3 py-1 text-sm disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page <= 0 || isLoading}
            >
              이전
            </button>
            <span>{totalPages > 0 ? `${page + 1} / ${totalPages}` : "-"}</span>
            <button
              className="admin-btn-secondary px-3 py-1 text-sm disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={isLoading || totalPages === 0 || page >= totalPages - 1}
            >
              다음
            </button>
          </div>
        </div>

        {/* 테이블 */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-800">제목</th>
                <th className="text-left py-3 px-4 font-medium text-gray-800">작성자</th>
                <th className="text-left py-3 px-4 font-medium text-gray-800">카테고리</th>
                <th className="text-left py-3 px-4 font-medium text-gray-800">작성일</th>
                <th className="text-left py-3 px-4 font-medium text-gray-800">조회수</th>
                <th className="text-left py-3 px-4 font-medium text-gray-800">좋아요</th>
                <th className="text-left py-3 px-4 font-medium text-gray-800">관리</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 px-4 text-center text-sm text-gray-700"
                  >
                    불러오는 중...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 px-4 text-center text-sm text-red-600"
                  >
                    {error}
                  </td>
                </tr>
              ) : sortedItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 px-4 text-center text-sm text-gray-700"
                  >
                    조건에 맞는 뉴스가 없습니다.
                  </td>
                </tr>
              ) : (
                sortedItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-gray-900 font-medium">
                      {item.title}
                    </td>
                    <td className="py-3 px-4 text-gray-800">{item.author}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-800">{item.createdAt}</td>
                    <td className="py-3 px-4 text-gray-800">
                      {item.views.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-gray-800">
                      {item.likes.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 font-medium text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        삭제
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        title="뉴스를 삭제할까요?"
        description="삭제하면 복구가 어려울 수 있습니다."
        itemLabel={deleteTarget ? deleteTarget.title : undefined}
        loading={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await handleDelete(deleteTarget);
          setDeleteTarget(null);
        }}
      />
    </>
  );
}
