"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Search, FileText, FolderOpen, Tag } from "lucide-react";
import { useLandingData } from "@/hooks/useLandingData";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: "article" | "project" | "topic";
  href: string;
  icon: React.ReactNode;
}

export default function SearchModal({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
}: SearchModalProps) {
  const { articles, projects, topics } = useLandingData();
  const [results, setResults] = useState<SearchResult[]>([]);

  // Search function
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search in articles
    if (articles && Array.isArray(articles)) {
      articles.forEach((article: any) => {
        const title = article.content?.title || "";
        const description = article.content?.summary || article.content?.content || "";
        
        if (
          title.toLowerCase().includes(query) ||
          description.toLowerCase().includes(query) ||
          (article.tags && article.tags.some((tag: any) => 
            typeof tag === 'string' 
              ? tag.toLowerCase().includes(query)
              : tag.name?.toLowerCase().includes(query)
          ))
        ) {
          searchResults.push({
            id: article.id,
            title,
            description: description.substring(0, 100) + (description.length > 100 ? "..." : ""),
            type: "article",
            href: `/articles/${article.id}`,
            icon: <FileText className="w-5 h-5 text-blue-500" />,
          });
        }
      });
    }

    // Search in projects
    if (projects && Array.isArray(projects)) {
      projects.forEach((project: any) => {
        const title = project.title || "";
        const description = project.description || "";
        
        if (
          title.toLowerCase().includes(query) ||
          description.toLowerCase().includes(query) ||
          (project.projectCategories && project.projectCategories.some((cat: any) =>
            typeof cat === 'string'
              ? cat.toLowerCase().includes(query)
              : cat.name?.toLowerCase().includes(query)
          ))
        ) {
          searchResults.push({
            id: project.id,
            title,
            description: description.substring(0, 100) + (description.length > 100 ? "..." : ""),
            type: "project",
            href: `/projects/${project.id}`,
            icon: <FolderOpen className="w-5 h-5 text-green-500" />,
          });
        }
      });
    }

    // Search in topics
    if (topics && Array.isArray(topics)) {
      topics.forEach((topic: any) => {
        const title = topic.title || topic.name || "";
        const description = topic.description || "";
        
        if (
          title.toLowerCase().includes(query) ||
          description.toLowerCase().includes(query)
        ) {
          searchResults.push({
            id: topic.id,
            title,
            description: description.substring(0, 100) + (description.length > 100 ? "..." : ""),
            type: "topic",
            href: `/topics#${topic.id || topic.name?.replace(/\s+/g, "-").toLowerCase()}`,
            icon: <Tag className="w-5 h-5 text-purple-500" />,
          });
        }
      });
    }

    setResults(searchResults);
  }, [searchQuery, articles, projects, topics]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="border-b border-gray-200 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="검색어를 입력하세요..."
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {searchQuery.trim() === "" ? (
              <div className="p-8 text-center text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>검색어를 입력하여 결과를 확인하세요.</p>
              </div>
            ) : results.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="font-medium">"{searchQuery}"에 대한 결과가 없습니다.</p>
                <p className="text-sm mt-2">다른 검색어를 시도해보세요.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {results.map((result) => (
                  <Link
                    key={`${result.type}-${result.id}`}
                    href={result.href}
                    onClick={onClose}
                    className="block p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{result.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {result.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {result.description}
                        </p>
                        <span className="inline-block mt-2 text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                          {result.type === "article"
                            ? "아티클"
                            : result.type === "project"
                            ? "프로젝트"
                            : "토픽"}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
