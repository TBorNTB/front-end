"use client";

import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";

const members = [
  {
    id: 1,
    name: "김민준",
    authority: "운영진",
    currentGrade: "회장",
    joinDate: "2023-03-02",
  },
  {
    id: 2,
    name: "이수진",
    authority: "정회원",
    currentGrade: "정회원",
    joinDate: "2023-09-01",
  },
  {
    id: 3,
    name: "박보안",
    authority: "정회원",
    currentGrade: "명예회원",
    joinDate: "2023-03-02",
  },
  {
    id: 4,
    name: "김신입",
    authority: "준회원",
    currentGrade: "준회원",
    joinDate: "2025-08-10",
  },
  {
    id: 5,
    name: "강멘토",
    authority: "정회원",
    currentGrade: "멘토",
    joinDate: "2024-03-02",
  },
  {
    id: 6,
    name: "정선배",
    authority: "정회원",
    currentGrade: "선배",
    joinDate: "2022-09-01",
  },
];

const gradeOptions = [
  "회장",
  "부회장", 
  "정회원",
  "준회원",
  "명예회원",
  "멘토",
  "선배",
  "24기",
  "23기",
  "졸업생",
  "신입생",
];

export default function AllMembers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("가입일순");
  const [memberGrades, setMemberGrades] = useState<Record<number, string>>(
    members.reduce((acc, member) => {
      acc[member.id] = member.currentGrade;
      return acc;
    }, {} as Record<number, string>)
  );

  const handleGradeChange = (memberId: number, newGrade: string) => {
    setMemberGrades(prev => ({
      ...prev,
      [memberId]: newGrade
    }));
  };

  const handleApply = (memberId: number) => {
    console.log(`적용: ${memberId} -> ${memberGrades[memberId]}`);
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">전체 회원</h3>
      
      {/* 검색 및 정렬 컨트롤 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="가입일순">정렬: 가입일순</option>
              <option value="이름순">정렬: 이름순</option>
              <option value="등급순">정렬: 등급순</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="이름으로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>
      </div>

      {/* 회원 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-800">이름</th>
              <th className="text-left py-3 px-4 font-medium text-gray-800">권한</th>
              <th className="text-left py-3 px-4 font-medium text-gray-800">등급명 (수정)</th>
              <th className="text-left py-3 px-4 font-medium text-gray-800">가입일</th>
              <th className="text-left py-3 px-4 font-medium text-gray-800">관리</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member) => (
              <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-900">{member.name}</td>
                <td className="py-3 px-4 text-gray-800">{member.authority}</td>
                <td className="py-3 px-4">
                  <select
                    value={memberGrades[member.id]}
                    onChange={(e) => handleGradeChange(member.id, e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {gradeOptions.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-3 px-4 text-gray-800">{member.joinDate}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleApply(member.id)}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    적용
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
