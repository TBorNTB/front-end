"use client";

import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";

const grades = [
  {
    id: 1,
    name: "회장",
    baseAuthority: "운영진",
  },
  {
    id: 2,
    name: "부회장",
    baseAuthority: "운영진",
  },
  {
    id: 3,
    name: "정회원",
    baseAuthority: "정회원",
  },
  {
    id: 4,
    name: "준회원",
    baseAuthority: "준회원",
  },
  {
    id: 5,
    name: "명예회원",
    baseAuthority: "정회원",
  },
  {
    id: 6,
    name: "멘토",
    baseAuthority: "정회원",
  },
];

const authorityOptions = [
  "운영진",
  "정회원",
  "준회원",
  "신입생",
];

export default function GradeManagement() {
  const [isCreating, setIsCreating] = useState(false);
  const [newGrade, setNewGrade] = useState({ name: "", baseAuthority: "정회원" });

  const handleCreateGrade = () => {
    if (newGrade.name.trim()) {
      console.log("새 등급 생성:", newGrade);
      setNewGrade({ name: "", baseAuthority: "정회원" });
      setIsCreating(false);
    }
  };

  const handleEdit = (id: number) => {
    console.log(`편집: ${id}`);
  };

  const handleDelete = (id: number) => {
    console.log(`삭제: ${id}`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">회원 등급 관리</h3>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>새 등급 만들기</span>
        </button>
      </div>

      {/* 새 등급 생성 폼 */}
      {isCreating && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 className="font-medium text-gray-900 mb-4">새 등급 추가</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                등급명
              </label>
              <input
                type="text"
                value={newGrade.name}
                onChange={(e) => setNewGrade({ ...newGrade, name: e.target.value })}
                placeholder="등급명을 입력하세요"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                기반 권한
              </label>
              <select
                value={newGrade.baseAuthority}
                onChange={(e) => setNewGrade({ ...newGrade, baseAuthority: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {authorityOptions.map((authority) => (
                  <option key={authority} value={authority}>
                    {authority}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end space-x-2">
              <button
                onClick={handleCreateGrade}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                생성
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewGrade({ name: "", baseAuthority: "정회원" });
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 등급 목록 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-800">등급명</th>
              <th className="text-left py-3 px-4 font-medium text-gray-800">기반 권한</th>
              <th className="text-left py-3 px-4 font-medium text-gray-800">관리</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((grade) => (
              <tr key={grade.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-900 font-medium">{grade.name}</td>
                <td className="py-3 px-4 text-gray-800">{grade.baseAuthority}</td>
                <td className="py-3 px-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(grade.id)}
                      className="text-gray-800 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(grade.id)}
                      className="text-gray-800 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
