"use client";

import { useState, useMemo } from "react";
import { Article as ArticleType } from "@/types/article";
import { mockArticles } from "@/mocks/mockArticles"; // Import your mock articles
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon-picker";
import SimpleArticleCard from "@/components/common/SimpleArticleCard";

export default function MyArticlesPage() {
  // In a real app, this would be fetched user-specific data.
  const userArticles = mockArticles;

  // State to manage the sort order
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");

  // Memoize the sorted articles to avoid re-sorting on every render
  const sortedArticles = useMemo(() => {
    return [...userArticles].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
    });
  }, [userArticles, sortOrder]);

  return (
    <div className="space-y-6">
      {/* --- Header Section --- */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "latest" ? "oldest" : "latest")}
            className="w-28"
          >
            <Icon
              name={sortOrder === "latest" ? "arrow-down-wide-narrow" : "arrow-up-wide-narrow"}
              className="mr-2 h-4 w-4"
            />
            {sortOrder === "latest" ? "최신순" : "오래된순"}
          </Button>
        </div>

        <Button variant="outline" size="sm">
          <Icon name="pin" className="mr-2 h-4 w-4" />
          대표 아티클 수정
        </Button>
      </div>

      {/* --- Article Cards Grid --- */}
      {sortedArticles.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedArticles.map((article) => (
            <SimpleArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-500">
          작성한 아티클이 없습니다.
        </div>
      )}
    </div>
  );
}
