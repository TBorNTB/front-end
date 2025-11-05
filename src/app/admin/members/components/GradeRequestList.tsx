"use client";

import { useState } from "react";
import useGradeRequests from "../hooks/useGradeRequests";
import { Check, X, Clock, User } from "lucide-react";

interface GradeRequestsListProps {
  searchTerm: string;
  refreshKey: number;
}

export default function GradeRequestsList({ searchTerm, refreshKey }: GradeRequestsListProps) {
  const [processingIds, setProcessingIds] = useState<number[]>([]);
  
  const { 
    requests, 
    isLoading, 
    error, 
    refetch 
  } = useGradeRequests({
    searchTerm,
    refreshKey
  });

  const handleRequestAction = async (requestId: number, action: 'approve' | 'reject', reason?: string) => {
    setProcessingIds(prev => [...prev, requestId]);
    
    try {
      const response = await fetch(`/api/admin/grade-requests/${requestId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        refetch();
      }
    } catch (error) {
      console.error(`Failed to ${action} request:`, error);
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== requestId));
    }
  };

  if (error) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">등급 변경 요청을 불러오는 중 오류가 발생했습니다.</p>
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
        <h3 className="text-lg font-semibold text-primary-900">등급 변경 요청</h3>
        <p className="text-sm text-gray-600 mt-1">
          회원들의 등급 변경 요청을 검토하고 승인합니다
        </p>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-40"></div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div className="w-16 h-8 bg-gray-200 rounded"></div>
                  <div className="w-16 h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : requests?.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">등급 변경 요청이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests?.map((request: any) => (
            <div 
              key={request.id} 
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-yellow-700">
                      {request.user.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{request.user.name}</h4>
                    <p className="text-sm text-gray-500 mb-2">{request.user.email}</p>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm text-gray-600">등급 변경:</span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                        {request.fromGrade}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded text-xs font-medium">
                        {request.toGrade}
                      </span>
                    </div>
                    {request.reason && (
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">사유:</span> {request.reason}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      요청일: {new Date(request.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleRequestAction(request.id, 'approve')}
                    disabled={processingIds.includes(request.id)}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    승인
                  </button>
                  <button 
                    onClick={() => handleRequestAction(request.id, 'reject')}
                    disabled={processingIds.includes(request.id)}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4 mr-1" />
                    거부
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
