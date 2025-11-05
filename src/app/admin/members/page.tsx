// src/app/admin/members/page.tsx - IMPROVED & COHESIVE
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Search, 
  Filter, 
  UserPlus, 
  MoreHorizontal, 
  CheckCircle, 
  Users, 
  Clock,
  Edit3,
  Trash2,
  UserX,
  AlertCircle,
  Download,
  RefreshCw
} from "lucide-react";

// Mock Data
const mockMembers = [
  {
    id: 1,
    name: "김철수",
    email: "kim@example.com",
    role: "REGULAR",
    roleDisplay: "정회원",
    joinDate: "2024-01-15",
    status: "active",
    avatar: "김"
  },
  {
    id: 2,
    name: "이영희",
    email: "lee@example.com", 
    role: "ASSOCIATE",
    roleDisplay: "준회원",
    joinDate: "2024-02-20",
    status: "active",
    avatar: "이"
  },
  {
    id: 3,
    name: "박민수",
    email: "park@example.com",
    role: "SENIOR",
    roleDisplay: "선배님",
    joinDate: "2023-11-10",
    status: "pending",
    avatar: "박"
  }
];

const mockGradeRequests = [
  {
    id: 1,
    name: "김민수",
    email: "minsu@example.com",
    fromGrade: "준회원",
    toGrade: "정회원",
    requestDate: "2024-10-10",
    reason: "프로젝트 기여도 향상",
    avatar: "김"
  },
  {
    id: 2,
    name: "최지영",
    email: "jiyoung@example.com",
    fromGrade: "정회원", 
    toGrade: "선배님",
    requestDate: "2024-10-12",
    reason: "멘토링 활동 참여",
    avatar: "최"
  }
];

const gradeStats = [
  { role: "외부인", count: 8, color: "gray" },
  { role: "준회원", count: 15, color: "blue" },
  { role: "정회원", count: 28, color: "green" },
  { role: "선배님", count: 12, color: "purple" },
  { role: "운영진", count: 5, color: "orange" }
];

export default function AdminMembers() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize tab from URL params
  useEffect(() => {
    const tab = searchParams?.get('tab');
    if (tab && ['all', 'requests', 'grades'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/admin/members?tab=${tab}`);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };

  const getRoleColor = (role: string) => {
    const colorMap = {
      'GUEST': 'bg-gray-100 text-gray-800',
      'ASSOCIATE': 'bg-blue-100 text-blue-800',
      'REGULAR': 'bg-green-100 text-green-800',
      'SENIOR': 'bg-purple-100 text-purple-800',
      'ADMIN': 'bg-orange-100 text-orange-800'
    };
    return colorMap[role as keyof typeof colorMap] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>새로고침</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="card p-0 overflow-hidden">
        <nav className="flex border-b border-gray-200">
          <button
            onClick={() => handleTabChange("all")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "all"
                ? "text-primary-600 bg-primary-50 border-b-2 border-primary-600"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Users className="h-4 w-4" />
              <span>전체 회원</span>
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {mockMembers.length}
              </span>
            </div>
          </button>
          <button
            onClick={() => handleTabChange("requests")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "requests"
                ? "text-primary-600 bg-primary-50 border-b-2 border-primary-600"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>등급 변경 요청</span>
              <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">
                {mockGradeRequests.length}
              </span>
            </div>
          </button>
          <button
            onClick={() => handleTabChange("grades")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "grades"
                ? "text-primary-600 bg-primary-50 border-b-2 border-primary-600"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <AlertCircle className="h-4 w-4" />
              <span>등급 관리</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="회원 이름이나 이메일 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              showFilters 
                ? 'bg-primary-100 text-primary-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            필터
          </button>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors">
            <Download className="w-4 h-4 mr-2" />
            내보내기
          </button>
          <button className="flex items-center px-4 py-2 bg-primary-600 text-white shadow-sm hover:bg-primary-700 rounded-lg font-medium transition-all duration-200">
            <UserPlus className="w-4 h-4 mr-2" />
            회원 추가
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card">
          <div className="flex flex-wrap gap-4">
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
              <option>모든 등급</option>
              <option>외부인</option>
              <option>준회원</option>
              <option>정회원</option>
              <option>선배님</option>
              <option>운영진</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
              <option>모든 상태</option>
              <option>활성</option>
              <option>비활성</option>
              <option>대기중</option>
            </select>
            <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
              필터 초기화
            </button>
          </div>
        </div>
      )}

      {/* Content based on active tab */}
      <div className="card">
        {/* All Members Tab */}
        {activeTab === "all" && (
          <div>
            <div className="border-b border-gray-200 pb-4 mb-6">
              <h3 className="text-lg font-semibold text-primary-900">전체 회원 목록</h3>
              <p className="text-sm text-gray-600 mt-1">모든 등록된 회원들을 관리합니다</p>
            </div>
            
            {/* Members Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">회원</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">등급</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가입일</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-bold text-primary-600">{member.avatar}</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                            <div className="text-sm text-gray-500">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                          {member.roleDisplay}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.joinDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`flex items-center text-sm ${
                          member.status === 'active' ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {member.status === 'active' ? '활성' : '대기중'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button className="text-gray-400 hover:text-primary-600 transition-colors">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button className="text-gray-400 hover:text-red-600 transition-colors">
                            <UserX className="w-4 h-4" />
                          </button>
                          <button className="text-gray-400 hover:text-gray-600 transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Grade Requests Tab */}
        {activeTab === "requests" && (
          <div>
            <div className="border-b border-gray-200 pb-4 mb-6">
              <h3 className="text-lg font-semibold text-primary-900">등급 변경 요청</h3>
              <p className="text-sm text-gray-600 mt-1">회원들의 등급 변경 요청을 검토하고 승인합니다</p>
            </div>
            
            <div className="space-y-4">
              {mockGradeRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-yellow-700">{request.avatar}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{request.name}</h4>
                        <p className="text-sm text-gray-500 mb-1">{request.email}</p>
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">{request.fromGrade}</span> → <span className="font-medium text-primary-600">{request.toGrade}</span> 요청
                        </p>
                        <p className="text-xs text-gray-500">사유: {request.reason}</p>
                        <p className="text-xs text-gray-400 mt-1">요청일: {request.requestDate}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors">
                        승인
                      </button>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors">
                        거부
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grades Management Tab - Inline */}
        {activeTab === "grades" && (
          <div>
            <div className="border-b border-gray-200 pb-4 mb-6">
              <h3 className="text-lg font-semibold text-primary-900">등급 관리</h3>
              <p className="text-sm text-gray-600 mt-1">회원 등급 시스템을 관리합니다</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gradeStats.map((grade, index) => (
                <div key={index} className={`p-6 rounded-lg border-2 hover:shadow-lg transition-all cursor-pointer ${
                  grade.color === 'gray' ? 'bg-gray-50 border-gray-200 hover:border-gray-300' :
                  grade.color === 'blue' ? 'bg-blue-50 border-blue-200 hover:border-blue-300' :
                  grade.color === 'green' ? 'bg-green-50 border-green-200 hover:border-green-300' :
                  grade.color === 'purple' ? 'bg-purple-50 border-purple-200 hover:border-purple-300' :
                  'bg-orange-50 border-orange-200 hover:border-orange-300'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        grade.color === 'gray' ? 'bg-gray-100' :
                        grade.color === 'blue' ? 'bg-blue-100' :
                        grade.color === 'green' ? 'bg-green-100' :
                        grade.color === 'purple' ? 'bg-purple-100' :
                        'bg-orange-100'
                      }`}>
                        <span className={`text-sm font-bold ${
                          grade.color === 'gray' ? 'text-gray-600' :
                          grade.color === 'blue' ? 'text-blue-600' :
                          grade.color === 'green' ? 'text-green-600' :
                          grade.color === 'purple' ? 'text-purple-600' :
                          'text-orange-600'
                        }`}>
                          {grade.role.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{grade.role}</h4>
                        <p className="text-sm text-gray-500">
                          {grade.role === '외부인' && '제한된 권한을 가진 방문자'}
                          {grade.role === '준회원' && '기본 권한을 가진 회원'}
                          {grade.role === '정회원' && '모든 기능을 사용할 수 있는 회원'}
                          {grade.role === '선배님' && '경험과 지식을 가진 선배 회원'}
                          {grade.role === '운영진' && '관리 권한을 가진 회원'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">총 {grade.count}명</span>
                    <button className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      grade.color === 'gray' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' :
                      grade.color === 'blue' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                      grade.color === 'green' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                      grade.color === 'purple' ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' :
                      'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    }`}>
                      관리
                    </button>
                  </div>
                </div>
              ))}

              {/* Total Members Summary */}
              <div className="p-6 bg-primary-50 border-2 border-primary-200 rounded-lg hover:shadow-lg transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">전체 회원</h4>
                      <p className="text-sm text-gray-500">모든 등급을 포함한 총 회원</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">총 68명</span>
                  <button className="px-3 py-1.5 bg-primary-100 text-primary-700 hover:bg-primary-200 rounded-lg text-sm font-medium transition-colors">
                    전체보기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
