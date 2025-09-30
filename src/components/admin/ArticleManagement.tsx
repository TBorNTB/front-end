"use client";

import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";

const articles = [
  {
    id: 1,
    title: "CSRF 토큰은 어떻게 동작하는가?",
    author: "이수진",
    category: "웹 해킹",
    createdAt: "2025-08-01",
    likes: 250,
  },
  {
    id: 2,
    title: "PE 파일 구조 완전 정복",
    author: "박보안",
    category: "리버싱",
    createdAt: "2025-07-28",
    likes: 180,
  },
  {
    id: 3,
    title: "알고리즘 복잡도 분석 기초",
    author: "강멘토",
    category: "웹 개발",
    createdAt: "2025-07-25",
    likes: 320,
  },
  {
    id: 4,
    title: "React 보안 취약점과 대응방안",
    author: "김민준",
    category: "웹 개발",
    createdAt: "2025-07-20",
    likes: 145,
  },
  {
    id: 5,
    title: "모바일 앱의 주요 보안 위협",
    author: "이수진",
    category: "모바일 보안",
    createdAt: "2025-07-15",
    likes: 98,
  },
  {
    id: 6,
    title: "SQL Injection 공격 기법과 방어",
    author: "박보안",
    category: "웹 해킹",
    createdAt: "2025-07-10",
    likes: 210,
  },
  {
    id: 7,
    title: "데이터 구조와 알고리즘 선택 가이드",
    author: "강멘토",
    category: "웹 개발",
    createdAt: "2025-07-05",
    likes: 275,
  },
];

const categories = ["모든 카테고리", "웹 해킹", "리버싱", "웹 개발", "모바일 보안"];
const sortOptions = ["최신순", "인기순", "이름순"];

export default function ArticleManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("모든 카테고리");
  const [sortBy, setSortBy] = useState("최신순");

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "모든 카테고리" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    switch (sortBy) {
      case "최신순":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "인기순":
        return b.likes - a.likes;
      case "이름순":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const handleView = (id: number) => {
    console.log(`보기: ${id}`);
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">아티클 목록</h3>
      
      {/* 검색 및 필터 컨트롤 */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="제목으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          
          {sortOptions.map((option) => (
            <button
              key={option}
              onClick={() => setSortBy(option)}
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

      {/* 아티클 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-800">제목</th>
              <th className="text-left py-3 px-4 font-medium text-gray-800">작성자</th>
              <th className="text-left py-3 px-4 font-medium text-gray-800">카테고리</th>
              <th className="text-left py-3 px-4 font-medium text-gray-800">작성일</th>
              <th className="text-left py-3 px-4 font-medium text-gray-800">좋아요</th>
              <th className="text-left py-3 px-4 font-medium text-gray-800">관리</th>
            </tr>
          </thead>
          <tbody>
            {sortedArticles.map((article) => (
              <tr key={article.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-900 font-medium">{article.title}</td>
                <td className="py-3 px-4 text-gray-800">{article.author}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {article.category}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-800">{article.createdAt}</td>
                <td className="py-3 px-4 text-gray-800">{article.likes}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleView(article.id)}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    보기
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
