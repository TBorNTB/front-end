"use client";

import { useState } from "react";
import useMembersData from "../hooks/useMembersData";
import { Edit3, UserX, MoreHorizontal, CheckCircle, XCircle } from "lucide-react";

interface MembersTableProps {
  searchTerm: string;
  filters: {
    role: string;
    status: string;
    dateRange: string;
  };
  refreshKey: number;
}

export default function MembersTable({ searchTerm, filters, refreshKey }: MembersTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  
  const { 
    members, 
    totalCount, 
    isLoading, 
    error, 
    refetch 
  } = useMembersData({
    page,
    pageSize,
    searchTerm,
    filters,
    refreshKey
  });

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

  const handleMemberAction = async (memberId: number, action: string) => {
    try {
      const response = await fetch(`/api/admin/members/${memberId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        refetch();
      }
    } catch (error) {
      console.error(`Failed to ${action} member:`, error);
    }
  };

  if (error) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">데이터를 불러오는 중 오류가 발생했습니다.</p>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h3 className="text-lg font-semibold text-primary-900">전체 회원 목록</h3>
        <p className="text-sm text-gray-600 mt-1">
          총 {totalCount}명의 회원이 등록되어 있습니다
        </p>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center space-x-4 p-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/6"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
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
                {members?.map((member: any) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-bold text-primary-600">
                            {member.name.charAt(0)}
                          </span>
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
                      {new Date(member.joinDate).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`flex items-center text-sm ${
                        member.status === 'active' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {member.status === 'active' ? (
                          <CheckCircle className="w-4 h-4 mr-1" />
                        ) : (
                          <XCircle className="w-4 h-4 mr-1" />
                        )}
                        {member.status === 'active' ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleMemberAction(member.id, 'edit')}
                          className="text-gray-400 hover:text-primary-600 transition-colors"
                          title="편집"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleMemberAction(member.id, 'suspend')}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="정지"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                        <button 
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="더보기"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              {((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, totalCount)} / {totalCount}명
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded disabled:opacity-50 hover:bg-gray-200 transition-colors"
              >
                이전
              </button>
              <span className="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded">
                {page}
              </span>
              <button 
                onClick={() => setPage(prev => prev + 1)}
                disabled={page * pageSize >= totalCount}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded disabled:opacity-50 hover:bg-gray-200 transition-colors"
              >
                다음
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
