"use client";

import { Users, ArrowRight } from "lucide-react";
import Link from "next/link";

const gradeChangeRequestsCount = 4;

export default function GradeChangeRequests() {
  return (
    <div className="admin-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          등급 변경 요청
        </h3>
        <div className="p-2 bg-blue-100 rounded-lg">
          <Users className="w-5 h-5 text-blue-600" />
        </div>
      </div>
      
      <div className="text-center mb-6">
        <div className="text-4xl font-bold text-blue-600 mb-2">
          {gradeChangeRequestsCount}
        </div>
        <p className="text-gray-600 font-medium">
          명의 회원이 등급 변경 요청을 하였습니다
        </p>
      </div>
      
      <Link 
        href="/admin/members"
        className="admin-btn admin-btn-primary w-full flex items-center justify-center space-x-2"
      >
        <span>회원 관리 페이지로 이동</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
