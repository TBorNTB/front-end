"use client";

import { Check, X } from "lucide-react";

const gradeChangeRequests = [
  {
    id: 1,
    name: "김신입",
    email: "new@email.com",
    requestedGrade: "24기",
    requestDate: "2025-08-10",
  },
  {
    id: 2,
    name: "박새내",
    email: "park@email.com",
    requestedGrade: "23기",
    requestDate: "2025-08-09",
  },
  {
    id: 3,
    name: "이준회",
    email: "lee@email.com",
    requestedGrade: "졸업생",
    requestDate: "2025-08-09",
  },
  {
    id: 4,
    name: "최외부",
    email: "choi@email.com",
    requestedGrade: "신입생",
    requestDate: "2025-08-08",
  },
];

export default function GradeChangeRequestsTable() {
  const handleApprove = (id: number) => {
    console.log(`승인: ${id}`);
  };

  const handleReject = (id: number) => {
    console.log(`거절: ${id}`);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          등급 변경 요청 목록
        </h3>
        <span className="admin-badge admin-badge-primary">
          {gradeChangeRequests.length}건
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>이름</th>
              <th>이메일</th>
              <th>신청 등급</th>
              <th>신청일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {gradeChangeRequests.map((request) => (
              <tr key={request.id}>
                <td>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-bold text-sm">
                        {request.name.charAt(0)}
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900">{request.name}</span>
                  </div>
                </td>
                <td className="text-gray-700 font-medium">{request.email}</td>
                <td>
                  <span className="admin-badge admin-badge-primary">
                    {request.requestedGrade}
                  </span>
                </td>
                <td className="text-gray-700 font-medium">{request.requestDate}</td>
                <td>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="admin-btn admin-btn-success admin-btn-sm"
                    >
                      승인
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="admin-btn admin-btn-danger admin-btn-sm"
                    >
                      거절
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
