"use client";

import { useState } from "react";
import { Search, X, Check } from "lucide-react";

const badges = [
  { id: 1, name: "이달의 기여자" },
  { id: 2, name: "명예의 전당 아티클" },
  { id: 3, name: "Q&A 해결사" },
  { id: 4, name: "프로젝트 마스터" },
  { id: 5, name: "지식 공유자" },
  { id: 6, name: "신입 멘토" },
  { id: 7, name: "커뮤니티 리더" },
  { id: 8, name: "기술 혁신가" },
];

const members = [
  { id: 1, name: "김민준", avatar: "김" },
  { id: 2, name: "이수진", avatar: "이" },
  { id: 3, name: "박보안", avatar: "박" },
  { id: 4, name: "최고수", avatar: "최" },
  { id: 5, name: "정데이터", avatar: "정" },
  { id: 6, name: "강신임", avatar: "강" },
  { id: 7, name: "윤개발", avatar: "윤" },
  { id: 8, name: "한코딩", avatar: "한" },
  { id: 9, name: "조알고", avatar: "조" },
  { id: 10, name: "임리버", avatar: "임" },
];

export default function BadgeAssignment() {
  const [selectedBadge, setSelectedBadge] = useState(badges[0]);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMemberToggle = (memberId: number) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleRemoveMember = (memberId: number) => {
    setSelectedMembers((prev) => prev.filter((id) => id !== memberId));
  };

  const handleAssignBadge = () => {
    console.log(`뱃지 "${selectedBadge.name}"을 ${selectedMembers.length}명에게 부여:`, selectedMembers);
  };

  const getSelectedMemberNames = () => {
    return selectedMembers.map((id) => members.find((m) => m.id === id)?.name).join(", ");
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">뱃지 다중 부여</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 왼쪽 패널 - 뱃지 선택 및 선택된 멤버 */}
        <div className="space-y-6">
          {/* 뱃지 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              뱃지 선택
            </label>
            <select
              value={selectedBadge.id}
              onChange={(e) => {
                const badge = badges.find((b) => b.id === parseInt(e.target.value));
                if (badge) setSelectedBadge(badge);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {badges.map((badge) => (
                <option key={badge.id} value={badge.id}>
                  {badge.name}
                </option>
              ))}
            </select>
          </div>

          {/* 선택된 멤버 */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              선택된 멤버 ({selectedMembers.length})
            </label>
            <div className="border border-gray-300 rounded-lg p-3 min-h-[100px] bg-gray-50">
              {selectedMembers.length === 0 ? (
                <p className="text-gray-700 text-sm">선택된 멤버가 없습니다.</p>
              ) : (
                <div className="space-y-2">
                  {selectedMembers.map((memberId) => {
                    const member = members.find((m) => m.id === memberId);
                    return member ? (
                      <div
                        key={memberId}
                        className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {member.avatar}
                          </div>
                          <span className="text-sm font-medium">{member.name}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveMember(memberId)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 뱃지 부여 버튼 */}
          <button
            onClick={handleAssignBadge}
            disabled={selectedMembers.length === 0}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              selectedMembers.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
          >
            총 {selectedMembers.length}명에게 뱃지 부여하기
          </button>
        </div>

        {/* 오른쪽 패널 - 멤버 목록 */}
        <div>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="이름으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="border border-gray-300 rounded-lg max-h-96 overflow-y-auto">
            <div className="p-3">
              <h4 className="text-sm font-medium text-gray-800 mb-3">멤버 목록</h4>
              <div className="space-y-2">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {member.avatar}
                      </div>
                      <span className="text-sm font-medium">{member.name}</span>
                    </div>
                    <button
                      onClick={() => handleMemberToggle(member.id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        selectedMembers.includes(member.id)
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-gray-300 hover:border-blue-500"
                      }`}
                    >
                      {selectedMembers.includes(member.id) && (
                        <Check className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
