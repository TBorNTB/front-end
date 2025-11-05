"use client";

import { useState } from "react";
import { Search, ChevronDown, Plus } from "lucide-react";

const csKnowledgeItems = [
  {
    id: 1,
    title: "알고리즘 복잡도 분석 기초",
    author: "강멘토",
    category: "알고리즘",
    createdAt: "2025-07-25",
    views: 1250,
    difficulty: "초급",
  },
  {
    id: 2,
    title: "데이터 구조와 알고리즘 선택 가이드",
    author: "강멘토",
    category: "자료구조",
    createdAt: "2025-07-05",
    views: 980,
    difficulty: "중급",
  },
  {
    id: 3,
    title: "네트워크 프로토콜 이해하기",
    author: "김민준",
    category: "네트워크",
    createdAt: "2025-06-20",
    views: 1560,
    difficulty: "중급",
  },
  {
    id: 4,
    title: "운영체제 프로세스 관리",
    author: "이수진",
    category: "운영체제",
    createdAt: "2025-06-15",
    views: 890,
    difficulty: "고급",
  },
  {
    id: 5,
    title: "데이터베이스 정규화 원리",
    author: "박보안",
    category: "데이터베이스",
    createdAt: "2025-06-10",
    views: 1120,
    difficulty: "중급",
  },
  {
    id: 6,
    title: "컴퓨터 구조와 어셈블리어",
    author: "정선배",
    category: "컴퓨터구조",
    createdAt: "2025-05-28",
    views: 750,
    difficulty: "고급",
  },
];

const categories = ["모든 카테고리", "알고리즘", "자료구조", "네트워크", "운영체제", "데이터베이스", "컴퓨터구조"];
const difficulties = ["모든 난이도", "초급", "중급", "고급"];
const sortOptions = ["최신순", "인기순", "이름순", "난이도순"];

export default function CSKnowledgeManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("모든 카테고리");
  const [selectedDifficulty, setSelectedDifficulty] = useState("모든 난이도");
  const [sortBy, setSortBy] = useState("최신순");
  const [isCreating, setIsCreating] = useState(false);
  const [newItem, setNewItem] = useState({
    title: "",
    category: "알고리즘",
    difficulty: "초급",
  });

  const filteredItems = csKnowledgeItems.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "모든 카테고리" || item.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "모든 난이도" || item.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case "최신순":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "인기순":
        return b.views - a.views;
      case "이름순":
        return a.title.localeCompare(b.title);
      case "난이도순":
        const difficultyOrder: Record<string, number> = { "초급": 1, "중급": 2, "고급": 3 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      default:
        return 0;
    }
  });

  const handleCreateItem = () => {
    if (newItem.title.trim()) {
      console.log("새 CS지식 항목 생성:", newItem);
      setNewItem({ title: "", category: "알고리즘", difficulty: "초급" });
      setIsCreating(false);
    }
  };

  const handleView = (id: number) => {
    console.log(`보기: ${id}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "초급":
        return "bg-green-100 text-green-800";
      case "중급":
        return "bg-yellow-100 text-yellow-800";
      case "고급":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">CS지식 목록</h3>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>새 CS지식</span>
        </button>
      </div>

      {/* 새 CS지식 생성 폼 */}
      {isCreating && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 className="font-medium text-gray-900 mb-4">새 CS지식 항목 추가</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                제목
              </label>
              <input
                type="text"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                placeholder="CS지식 제목을 입력하세요"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                카테고리
              </label>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.slice(1).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                난이도
              </label>
              <select
                value={newItem.difficulty}
                onChange={(e) => setNewItem({ ...newItem, difficulty: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {difficulties.slice(1).map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end space-x-2">
              <button
                onClick={handleCreateItem}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                생성
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewItem({ title: "", category: "알고리즘", difficulty: "초급" });
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

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

          <div className="relative">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {difficulties.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {difficulty}
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

      {/* CS지식 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-800">제목</th>
              <th className="text-left py-3 px-4 font-medium text-gray-800">작성자</th>
              <th className="text-left py-3 px-4 font-medium text-gray-800">카테고리</th>
              <th className="text-left py-3 px-4 font-medium text-gray-800">난이도</th>
              <th className="text-left py-3 px-4 font-medium text-gray-800">작성일</th>
              <th className="text-left py-3 px-4 font-medium text-gray-800">조회수</th>
              <th className="text-left py-3 px-4 font-medium text-gray-800">관리</th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-900 font-medium">{item.title}</td>
                <td className="py-3 px-4 text-gray-800">{item.author}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {item.category}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(item.difficulty)}`}>
                    {item.difficulty}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-800">{item.createdAt}</td>
                <td className="py-3 px-4 text-gray-800">{item.views.toLocaleString()}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleView(item.id)}
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
