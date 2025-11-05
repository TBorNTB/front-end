"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MembersTable from "./components/MembersTable";
import GradeRequestsList from "./components/GradeRequestList";
import GradeStatsCards from "./components/GradeStatsCard";
import { 
  Search, 
  Filter, 
  UserPlus, 
  Users, 
  Clock,
  AlertCircle,
  Download,
  RefreshCw
} from "lucide-react";

export default function AdminMembers() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    role: "",
    status: "",
    dateRange: ""
  });
  const [showFilters, setShowFilters] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const router = useRouter();
  const searchParams = useSearchParams();

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
    setRefreshKey(prev => prev + 1);
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/admin/members/export', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `members-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">회원 관리</h1>
          <p className="text-gray-600 mt-1">SSG 회원들을 관리하고 등급을 조정하세요</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
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
          <button 
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
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
            <select 
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">모든 등급</option>
              <option value="GUEST">외부인</option>
              <option value="ASSOCIATE">준회원</option>
              <option value="REGULAR">정회원</option>
              <option value="SENIOR">선배님</option>
              <option value="ADMIN">운영진</option>
            </select>
            <select 
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">모든 상태</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
              <option value="pending">대기중</option>
            </select>
            <button 
              onClick={() => setFilters({ role: "", status: "", dateRange: "" })}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              필터 초기화
            </button>
          </div>
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === "all" && (
        <MembersTable 
          searchTerm={searchTerm}
          filters={filters}
          refreshKey={refreshKey}
        />
      )}

      {activeTab === "requests" && (
        <GradeRequestsList 
          searchTerm={searchTerm}
          refreshKey={refreshKey}
        />
      )}

      {activeTab === "grades" && (
        <GradeStatsCards 
          refreshKey={refreshKey}
        />
      )}
    </div>
  );
}
