"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

const badges = [
  {
    id: 1,
    name: "이달의 기여자",
    description: "한 달간 가장 많은 아티클을 작성하거나 우수 답변을 채택받은 멤버에게 수여됩니다.",
    holderCount: 5,
  },
  {
    id: 2,
    name: "명예의 전당 아티클",
    description: "운영진이 인정한 우수 아티클을 작성한 멤버에게 수여됩니다.",
    holderCount: 12,
  },
  {
    id: 3,
    name: "Q&A 해결사",
    description: "Q&A 게시판에서 10개 이상의 답변이 채택된 멤버에게 수여됩니다.",
    holderCount: 8,
  },
  {
    id: 4,
    name: "프로젝트 마스터",
    description: "3개 이상의 완성된 프로젝트를 제출한 멤버에게 수여됩니다.",
    holderCount: 15,
  },
  {
    id: 5,
    name: "지식 공유자",
    description: "CS지식 섹션에서 5개 이상의 유용한 글을 작성한 멤버에게 수여됩니다.",
    holderCount: 7,
  },
  {
    id: 6,
    name: "신입 멘토",
    description: "신입 멤버들을 도와주고 멘토링을 제공한 멤버에게 수여됩니다.",
    holderCount: 3,
  },
  {
    id: 7,
    name: "커뮤니티 리더",
    description: "커뮤니티 활동에 적극적으로 참여하고 리더십을 보여준 멤버에게 수여됩니다.",
    holderCount: 4,
  },
  {
    id: 8,
    name: "기술 혁신가",
    description: "혁신적인 기술이나 아이디어를 제안하고 구현한 멤버에게 수여됩니다.",
    holderCount: 2,
  },
];

export default function BadgeManagement() {
  const [isCreating, setIsCreating] = useState(false);
  const [newBadge, setNewBadge] = useState({
    name: "",
    description: "",
  });

  const handleCreateBadge = () => {
    if (newBadge.name.trim() && newBadge.description.trim()) {
      console.log("새 뱃지 생성:", newBadge);
      setNewBadge({ name: "", description: "" });
      setIsCreating(false);
    }
  };

  const handleEdit = (id: number) => {
    console.log(`편집: ${id}`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">뱃지 종류 관리</h3>
        <button
          onClick={() => setIsCreating(true)}
          className="admin-btn admin-btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>새 뱃지 만들기</span>
        </button>
      </div>

      {/* 새 뱃지 생성 폼 */}
      {isCreating && (
        <div className="bg-gray-50 p-6 rounded-xl mb-6 border border-gray-200">
          <h4 className="font-bold text-gray-900 mb-4 text-lg">새 뱃지 추가</h4>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                뱃지 이름
              </label>
              <input
                type="text"
                value={newBadge.name}
                onChange={(e) => setNewBadge({ ...newBadge, name: e.target.value })}
                placeholder="뱃지 이름을 입력하세요"
                className="admin-input"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                뱃지 설명
              </label>
              <textarea
                value={newBadge.description}
                onChange={(e) => setNewBadge({ ...newBadge, description: e.target.value })}
                placeholder="뱃지 획득 조건을 설명하세요"
                rows={3}
                className="admin-textarea"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleCreateBadge}
                className="admin-btn admin-btn-primary"
              >
                생성
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewBadge({ name: "", description: "" });
                }}
                className="admin-btn admin-btn-secondary"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 뱃지 테이블 */}
      <div className="overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>이름</th>
              <th>설명</th>
              <th>획득자 수</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {badges.map((badge) => (
              <tr key={badge.id}>
                <td className="font-semibold text-gray-900">{badge.name}</td>
                <td className="text-gray-700 text-sm max-w-md">
                  {badge.description}
                </td>
                <td className="text-gray-800 font-medium">{badge.holderCount}명</td>
                <td>
                  <button
                    onClick={() => handleEdit(badge.id)}
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
