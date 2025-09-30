"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

const categories = [
  {
    id: 1,
    name: "웹 해킹",
    slug: "web-hacking",
    projectCount: 5,
    articleCount: 12,
  },
  {
    id: 2,
    name: "리버싱",
    slug: "reversing",
    projectCount: 3,
    articleCount: 8,
  },
  {
    id: 3,
    name: "웹 개발",
    slug: "web-development",
    projectCount: 4,
    articleCount: 6,
  },
  {
    id: 4,
    name: "모바일 보안",
    slug: "mobile-security",
    projectCount: 1,
    articleCount: 3,
  },
];

export default function CategoryManagement() {
  const [isCreating, setIsCreating] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", slug: "" });

  const handleCreateCategory = () => {
    if (newCategory.name.trim() && newCategory.slug.trim()) {
      console.log("새 카테고리 생성:", newCategory);
      setNewCategory({ name: "", slug: "" });
      setIsCreating(false);
    }
  };

  const handleEdit = (id: number) => {
    console.log(`편집: ${id}`);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[가-힣]/g, (char) => {
        const hangul: { [key: string]: string } = {
          'ㄱ': 'g', 'ㄴ': 'n', 'ㄷ': 'd', 'ㄹ': 'r', 'ㅁ': 'm', 'ㅂ': 'b', 'ㅅ': 's',
          'ㅇ': '', 'ㅈ': 'j', 'ㅊ': 'ch', 'ㅋ': 'k', 'ㅌ': 't', 'ㅍ': 'p', 'ㅎ': 'h'
        };
        return hangul[char] || char;
      });
  };

  const handleNameChange = (name: string) => {
    setNewCategory({
      name,
      slug: generateSlug(name)
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">카테고리 목록</h3>
        <button
          onClick={() => setIsCreating(true)}
          className="admin-btn admin-btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>새 카테고리</span>
        </button>
      </div>

      {/* 새 카테고리 생성 폼 */}
      {isCreating && (
        <div className="bg-gray-50 p-6 rounded-xl mb-6 border border-gray-200">
          <h4 className="font-bold text-gray-900 mb-4 text-lg">새 카테고리 추가</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                이름
              </label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="카테고리 이름을 입력하세요"
                className="admin-input"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                SLUG
              </label>
              <input
                type="text"
                value={newCategory.slug}
                onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                placeholder="카테고리 슬러그를 입력하세요"
                className="admin-input"
              />
            </div>
            <div className="flex items-end space-x-2">
              <button
                onClick={handleCreateCategory}
                className="admin-btn admin-btn-primary"
              >
                생성
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewCategory({ name: "", slug: "" });
                }}
                className="admin-btn admin-btn-secondary"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 카테고리 테이블 */}
      <div className="overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>이름</th>
              <th>SLUG</th>
              <th>프로젝트 수</th>
              <th>아티클 수</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="font-semibold text-gray-900">{category.name}</td>
                <td className="text-gray-700 font-mono text-sm">{category.slug}</td>
                <td className="text-gray-800 font-medium">{category.projectCount}</td>
                <td className="text-gray-800 font-medium">{category.articleCount}</td>
                <td>
                  <button
                    onClick={() => handleEdit(category.id)}
                    className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                  >
                    수정
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
