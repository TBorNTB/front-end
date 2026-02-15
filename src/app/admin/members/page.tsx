// src/app/admin/members/AdminMembersContent.tsx - NEW FILE
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Search, 
  Filter, 
  Users, 
  Clock,
  Edit3,
  AlertCircle,
  RefreshCw,
  Loader2,
  X
} from "lucide-react";
import { getApiUrl } from "@/lib/api/config";
import { USER_ENDPOINTS } from "@/lib/api/endpoints/user-endpoints";
import toast from "react-hot-toast";
import { getRoleBadgeColor, getRoleColor, getRoleDescription, getRoleDisplayLabel } from "@/lib/role-utils";

interface Member {
  id: number;
  nickname: string;
  role: string;
  realName: string;
  email: string;
  username: string;
  description: string;
  githubUrl: string;
  linkedinUrl: string;
  blogUrl: string;
  profileImageUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface MembersSearchResponse {
  message: string;
  size: number;
  page: number;
  totalPage: number;
  data: Member[];
}

interface RoleChangeRequest {
  roleChange: {
    id: number;
    realName: string;
    email: string;
    previousRole: string;
    requestedRole: string;
    requestStatus: string;
    processedBy: string | null;
    requestedAt: string;
    processedAt: string | null;
  };
}

interface RoleCountResponse {
  guestCount: number;
  associateMemberCount: number;
  fullMemberCount: number;
  seniorCount: number;
  adminCount: number;
  totalCount: number;
}

interface GradeStat {
  role: string;
  count: number;
  color: string;
}

export default function AdminMembersContent() {
  const [activeTab, setActiveTab] = useState("all");
  
  // 전체 회원 탭 검색/필터
  const [nicknameSearch, setNicknameSearch] = useState("");
  const [realNameSearch, setRealNameSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  
  // 등급 변경 요청 탭 검색/필터
  const [roleChangeNicknameSearch, setRoleChangeNicknameSearch] = useState("");
  const [roleChangeRealNameSearch, setRoleChangeRealNameSearch] = useState("");
  const [roleChangeSelectedRole, setRoleChangeSelectedRole] = useState<string>("");
  
  const [allMembers, setAllMembers] = useState<Member[]>([]); // 전체 조회된 회원 목록
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]); // 필터링된 회원 목록
  const [members, setMembers] = useState<Member[]>([]); // 페이지네이션된 회원 목록
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPage, setTotalPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // 역할 변경 관련 상태
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set()); // 선택된 회원 username들
  const [editingMember, setEditingMember] = useState<string | null>(null); // 편집 중인 회원 username
  const [showBatchRoleChange, setShowBatchRoleChange] = useState(false); // 일괄 변경 UI 표시 여부
  const [batchRoleChangeLoading, setBatchRoleChangeLoading] = useState(false); // 일괄 변경 로딩
  const [singleRoleChangeLoading, setSingleRoleChangeLoading] = useState<string | null>(null); // 단일 변경 로딩 (username)
  
  // 등급 관리 관련 상태
  const [gradeStats, setGradeStats] = useState<GradeStat[]>([
    { role: "GUEST", count: 0, color: "gray" },
    { role: "ASSOCIATE_MEMBER", count: 0, color: "blue" },
    { role: "FULL_MEMBER", count: 0, color: "green" },
    { role: "SENIOR", count: 0, color: "purple" },
    { role: "ADMIN", count: 0, color: "orange" }
  ]);
  const [totalMemberCount, setTotalMemberCount] = useState(0);
  const [gradeStatsLoading, setGradeStatsLoading] = useState(false);
  
  // 등급 변경 요청 관련 상태
  const [roleChangeRequests, setRoleChangeRequests] = useState<RoleChangeRequest[]>([]);
  const [allRoleChangeRequests, setAllRoleChangeRequests] = useState<RoleChangeRequest[]>([]);
  const [filteredRoleChangeRequests, setFilteredRoleChangeRequests] = useState<RoleChangeRequest[]>([]);
  const [roleChangeLoading, setRoleChangeLoading] = useState(false);
  const [roleChangePage, setRoleChangePage] = useState(0);
  const [roleChangeTotalPage, setRoleChangeTotalPage] = useState(0);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize tab from URL params
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['all', 'requests', 'grades'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/admin/members?tab=${tab}`);
    // 탭 변경 시 페이지 초기화
    setPage(0);
    setRoleChangePage(0);
  };

  // 역할별 회원 관리 버튼 클릭 핸들러
  const handleRoleManagement = (roleValue: string) => {
    setSelectedRole(roleValue);
    setPage(0);
    setNicknameSearch('');
    setRealNameSearch('');
    handleTabChange('all');
  };

  // 단일 회원 역할 변경
  const handleSingleRoleChange = async (username: string, newRole: string) => {
    try {
      setSingleRoleChangeLoading(username);
      setEditingMember(null);

      const response = await fetch(
        getApiUrl(USER_ENDPOINTS.USER.ROLE_BATCH),
        {
          method: 'PATCH',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            usernames: [username],
            role: newRole
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        throw new Error(`Failed to change role: ${response.status}`);
      }

      // 성공 시 회원 목록 새로고침
      const fetchMembers = async () => {
        const params = new URLSearchParams();
        params.append('page', '0');
        params.append('size', '1000');
        params.append('sortDirection', 'ASC');
        params.append('sortBy', 'createdAt');

        const response = await fetch(
          `${getApiUrl(USER_ENDPOINTS.USER.SEARCH)}?${params.toString()}`,
          {
            method: 'GET',
            headers: { 'accept': 'application/json' },
            credentials: 'include',
          }
        );

        if (response.ok) {
          const data: MembersSearchResponse = await response.json();
          setAllMembers(data.data || []);
        }
      };

      await fetchMembers();
      
      // 등급별 회원 수도 새로고침
      const fetchRoleCounts = async () => {
        const response = await fetch(
          getApiUrl(USER_ENDPOINTS.USER.COUNT_ROLE),
          {
            method: 'GET',
            headers: { 'accept': 'application/json' },
            credentials: 'include',
          }
        );

        if (response.ok) {
          const data: RoleCountResponse = await response.json();
          setGradeStats([
            { role: "GUEST", count: data.guestCount || 0, color: "gray" },
            { role: "ASSOCIATE_MEMBER", count: data.associateMemberCount || 0, color: "blue" },
            { role: "FULL_MEMBER", count: data.fullMemberCount || 0, color: "green" },
            { role: "SENIOR", count: data.seniorCount || 0, color: "purple" },
            { role: "ADMIN", count: data.adminCount || 0, color: "orange" }
          ]);
          setTotalMemberCount(data.totalCount || 0);
        }
      };

      await fetchRoleCounts();

      toast('역할이 성공적으로 변경되었습니다.');
    } catch (err) {
      console.error('Error changing role:', err);
      toast('역할 변경 중 오류가 발생했습니다.');
    } finally {
      setSingleRoleChangeLoading(null);
    }
  };

  // 일괄 역할 변경
  const handleBatchRoleChange = async (newRole: string) => {
    if (selectedMembers.size === 0) {
      alert('선택된 회원이 없습니다.');
      return;
    }

    try {
      setBatchRoleChangeLoading(true);

      const response = await fetch(
        getApiUrl(USER_ENDPOINTS.USER.ROLE_BATCH),
        {
          method: 'PATCH',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            usernames: Array.from(selectedMembers),
            role: newRole
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        throw new Error(`Failed to change roles: ${response.status}`);
      }

      // 성공 시 회원 목록 새로고침
      const fetchMembers = async () => {
        const params = new URLSearchParams();
        params.append('page', '0');
        params.append('size', '1000');
        params.append('sortDirection', 'ASC');
        params.append('sortBy', 'createdAt');

        const response = await fetch(
          `${getApiUrl(USER_ENDPOINTS.USER.SEARCH)}?${params.toString()}`,
          {
            method: 'GET',
            headers: { 'accept': 'application/json' },
            credentials: 'include',
          }
        );

        if (response.ok) {
          const data: MembersSearchResponse = await response.json();
          setAllMembers(data.data || []);
        }
      };

      await fetchMembers();
      
      // 등급별 회원 수도 새로고침
      const fetchRoleCounts = async () => {
        const response = await fetch(
          getApiUrl(USER_ENDPOINTS.USER.COUNT_ROLE),
          {
            method: 'GET',
            headers: { 'accept': 'application/json' },
            credentials: 'include',
          }
        );

        if (response.ok) {
          const data: RoleCountResponse = await response.json();
          setGradeStats([
            { role: "GUEST", count: data.guestCount || 0, color: "gray" },
            { role: "ASSOCIATE_MEMBER", count: data.associateMemberCount || 0, color: "blue" },
            { role: "FULL_MEMBER", count: data.fullMemberCount || 0, color: "green" },
            { role: "SENIOR", count: data.seniorCount || 0, color: "purple" },
            { role: "ADMIN", count: data.adminCount || 0, color: "orange" }
          ]);
          setTotalMemberCount(data.totalCount || 0);
        }
      };

      await fetchRoleCounts();

      setSelectedMembers(new Set());
      setShowBatchRoleChange(false);
      alert(`${selectedMembers.size}명의 역할이 성공적으로 변경되었습니다.`);
    } catch (err) {
      console.error('Error changing roles:', err);
      alert('역할 변경 중 오류가 발생했습니다.');
    } finally {
      setBatchRoleChangeLoading(false);
    }
  };

  // 회원 선택/해제
  const toggleMemberSelection = (username: string) => {
    setSelectedMembers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(username)) {
        newSet.delete(username);
      } else {
        newSet.add(username);
      }
      return newSet;
    });
  };

  // 전체 선택/해제
  const toggleSelectAll = () => {
    if (selectedMembers.size === members.length) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(members.map(m => m.username)));
    }
  };

  // 검색어나 필터 변경 시 페이지 리셋
  useEffect(() => {
    if (activeTab === "all") {
      setPage(0);
    }
  }, [selectedRole, nicknameSearch, realNameSearch, activeTab]);

  // 회원 목록 조회 (전체 조회, 검색 파라미터 없이)
  useEffect(() => {
    if (activeTab !== "all") return;

    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        
        // 전체 회원 조회 (검색 파라미터 없이)
        const params = new URLSearchParams();
        params.append('page', '0');
        params.append('size', '1000'); // 충분히 큰 수로 전체 조회
        params.append('sortDirection', 'ASC');
        params.append('sortBy', 'createdAt');

        const response = await fetch(
          `${getApiUrl(USER_ENDPOINTS.USER.SEARCH)}?${params.toString()}`,
          {
            method: 'GET',
            headers: {
              'accept': 'application/json',
            },
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch members');
        }

        const data: MembersSearchResponse = await response.json();
        setAllMembers(data.data || []);
      } catch (err) {
        console.error('Error fetching members:', err);
        setAllMembers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [activeTab]);

  // 클라이언트 사이드 필터링 (닉네임, 실명, 역할)
  useEffect(() => {
    if (activeTab !== "all") return;

    let filtered = [...allMembers];

    // 닉네임 필터링
    if (nicknameSearch.trim()) {
      filtered = filtered.filter(member =>
        member.nickname?.toLowerCase().includes(nicknameSearch.trim().toLowerCase())
      );
    }

    // 실명 필터링
    if (realNameSearch.trim()) {
      filtered = filtered.filter(member =>
        member.realName?.toLowerCase().includes(realNameSearch.trim().toLowerCase())
      );
    }

    // 역할 필터링
    if (selectedRole) {
      filtered = filtered.filter(member => member.role === selectedRole);
    }

    setFilteredMembers(filtered);
    setTotalElements(filtered.length);
    setTotalPage(Math.ceil(filtered.length / size));
  }, [allMembers, nicknameSearch, realNameSearch, selectedRole, activeTab, size]);

  // 페이지네이션 처리
  useEffect(() => {
    if (activeTab !== "all") return;

    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginated = filteredMembers.slice(startIndex, endIndex);
    setMembers(paginated);
  }, [filteredMembers, page, size, activeTab]);

  // 등급 변경 요청 조회
  useEffect(() => {
    if (activeTab !== "requests") return;

    const fetchRoleChangeRequests = async () => {
      try {
        setRoleChangeLoading(true);

        const response = await fetch(
          getApiUrl(USER_ENDPOINTS.USER.ROLE_ALL),
          {
            method: 'GET',
            headers: { 'accept': 'application/json' },
            credentials: 'include',
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
          });
          throw new Error(`Failed to fetch role change requests: ${response.status}`);
        }

        const data: RoleChangeRequest[] = await response.json();
        
        // 데이터가 배열인지 확인
        if (!Array.isArray(data)) {
          console.warn('Unexpected response format:', data);
          setRoleChangeRequests([]);
          setRoleChangeTotalPage(0);
          return;
        }

        // PENDING 상태만 필터링
        const pendingRequests = data.filter(
          item => item.roleChange && item.roleChange.requestStatus === 'PENDING'
        );
        
        // 전체 목록 저장 (개수 표시용)
        setAllRoleChangeRequests(pendingRequests);
      } catch (err) {
        console.error('Error fetching role change requests:', err);
        setRoleChangeRequests([]);
        setRoleChangeTotalPage(0);
      } finally {
        setRoleChangeLoading(false);
      }
    };

    fetchRoleChangeRequests();
  }, [activeTab]);

  // 등급별 회원 수 조회
  useEffect(() => {
    const fetchRoleCounts = async () => {
      try {
        setGradeStatsLoading(true);
        
        const response = await fetch(
          getApiUrl(USER_ENDPOINTS.USER.COUNT_ROLE),
          {
            method: 'GET',
            headers: {
              'accept': 'application/json',
            },
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch role counts');
        }

        const data: RoleCountResponse = await response.json();
        
        // API 응답을 gradeStats 형식으로 변환
        setGradeStats([
          { role: "GUEST", count: data.guestCount || 0, color: "gray" },
          { role: "ASSOCIATE_MEMBER", count: data.associateMemberCount || 0, color: "blue" },
          { role: "FULL_MEMBER", count: data.fullMemberCount || 0, color: "green" },
          { role: "SENIOR", count: data.seniorCount || 0, color: "purple" },
          { role: "ADMIN", count: data.adminCount || 0, color: "orange" }
        ]);
        
        setTotalMemberCount(data.totalCount || 0);
      } catch (err) {
        console.error('Error fetching role counts:', err);
        // 에러 발생 시 기본값 유지
      } finally {
        setGradeStatsLoading(false);
      }
    };

    fetchRoleCounts();
  }, []);

  // 등급 변경 요청 클라이언트 사이드 필터링 (닉네임, 실명, 역할)
  useEffect(() => {
    if (activeTab !== "requests") return;

    let filtered = [...allRoleChangeRequests];

    // 닉네임 필터링 (realName으로 검색, 닉네임 필드가 없을 수 있음)
    if (roleChangeNicknameSearch.trim()) {
      filtered = filtered.filter(item => {
        const realName = item.roleChange.realName?.toLowerCase() || '';
        return realName.includes(roleChangeNicknameSearch.trim().toLowerCase());
      });
    }

    // 실명 필터링
    if (roleChangeRealNameSearch.trim()) {
      filtered = filtered.filter(item => {
        const realName = item.roleChange.realName?.toLowerCase() || '';
        return realName.includes(roleChangeRealNameSearch.trim().toLowerCase());
      });
    }

    // 역할 필터링 (이전 역할 또는 요청한 역할)
    if (roleChangeSelectedRole) {
      filtered = filtered.filter(item => 
        item.roleChange.previousRole === roleChangeSelectedRole || 
        item.roleChange.requestedRole === roleChangeSelectedRole
      );
    }

    setFilteredRoleChangeRequests(filtered);
    
    // 페이지네이션 처리 (5개씩)
    const pageSize = 5;
    const totalPages = Math.ceil(filtered.length / pageSize);
    setRoleChangeTotalPage(totalPages);
    
    const startIndex = roleChangePage * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedRequests = filtered.slice(startIndex, endIndex);
    
    setRoleChangeRequests(paginatedRequests);
  }, [allRoleChangeRequests, roleChangeNicknameSearch, roleChangeRealNameSearch, roleChangeSelectedRole, roleChangePage, activeTab]);

  // 등급 변경 요청 승인/거절 처리
  const handleRoleChangeAction = async (requestId: number, approved: boolean) => {
    try {
      setProcessingIds(prev => new Set(prev).add(requestId));

      const endpoint = USER_ENDPOINTS.USER.ROLE_MANAGE.replace(':id', requestId.toString());
      const response = await fetch(
        getApiUrl(endpoint),
        {
          method: 'PATCH',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ approved }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        throw new Error(`Failed to ${approved ? 'approve' : 'reject'} role change request: ${response.status}`);
      }

      // 성공 시 전체 목록과 현재 페이지 목록에서 제거하고 페이지 조정
      setAllRoleChangeRequests(prev => 
        prev.filter(item => item.roleChange.id !== requestId)
      );
      setRoleChangeRequests(prev => {
        const filtered = prev.filter(item => item.roleChange.id !== requestId);
        // 현재 페이지에 아이템이 없고 이전 페이지가 있으면 이전 페이지로 이동
        if (filtered.length === 0 && roleChangePage > 0) {
          setRoleChangePage(prev => prev - 1);
        }
        return filtered;
      });

      console.log(`등급 변경 요청이 ${approved ? '승인' : '거부'}되었습니다.`);
    } catch (err) {
      console.error(`Error ${approved ? 'approving' : 'rejecting'} role change request:`, err);
      alert(`등급 변경 요청 ${approved ? '승인' : '거부'} 중 오류가 발생했습니다.`);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  // 역할에 따른 색상 및 스타일 매핑
  const getRoleChangeStyle = (requestedRole: string) => {
    const styleMap: Record<string, {
      bgColor: string;
      borderColor: string;
      avatarBg: string;
      avatarText: string;
    }> = {
      'ASSOCIATE': {
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        avatarBg: "bg-blue-100",
        avatarText: "text-blue-700"
      },
      'ASSOCIATE_MEMBER': {
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        avatarBg: "bg-blue-100",
        avatarText: "text-blue-700"
      },
      'REGULAR': {
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        avatarBg: "bg-green-100",
        avatarText: "text-green-700"
      },
      'FULL_MEMBER': {
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        avatarBg: "bg-green-100",
        avatarText: "text-green-700"
      },
      'SENIOR': {
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
        avatarBg: "bg-purple-100",
        avatarText: "text-purple-700"
      },
      'ADMIN': {
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        avatarBg: "bg-orange-100",
        avatarText: "text-orange-700"
      },
    };
    
    return styleMap[requestedRole] || {
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      avatarBg: "bg-yellow-100",
      avatarText: "text-yellow-700"
    };
  };

  // 이름의 첫 글자 추출
  const getInitialForRoleChange = (name: string): string => {
    return name ? name.charAt(0) : "?";
  };

  // 날짜 포맷팅
  const formatRoleChangeDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRefresh = () => {
    // 페이지를 0으로 리셋하고 다시 조회
    setPage(0);
  };

  // 이름의 첫 글자 추출
  const getInitial = (name: string): string => {
    return name ? name.charAt(0) : "?";
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-900">회원 관리</h1>
          <p className="text-gray-600 mt-1">SSG 회원들을 관리하고 등급 변경 요청을 처리합니다</p>
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
                {totalElements}
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
              {roleChangeLoading ? (
                <Loader2 className="h-3 w-3 text-gray-400 animate-spin" />
              ) : (
                <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">
                  {allRoleChangeRequests.length}
                </span>
              )}
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
      {activeTab === "all" && (
        <>
          <div className="flex flex-col gap-4">
            {/* 검색 및 필터 영역 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex items-center space-x-4 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="닉네임 검색..."
                    value={nicknameSearch}
                    onChange={(e) => setNicknameSearch(e.target.value)}
                    className="w-48 pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  />
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="실명 검색..."
                    value={realNameSearch}
                    onChange={(e) => setRealNameSearch(e.target.value)}
                    className="w-48 pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
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
            </div>
            
            {/* 일괄 작업 영역 */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg border border-primary-200">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedMembers.size > 0 && selectedMembers.size === members.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    전체 선택
                  </span>
                </div>
                {selectedMembers.size > 0 && (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-px bg-gray-300"></div>
                    <span className="text-sm font-semibold text-primary-700">
                      {selectedMembers.size}명 선택됨
                    </span>
                    <button
                      onClick={() => setSelectedMembers(new Set())}
                      className="text-xs text-gray-600 hover:text-gray-800 underline"
                    >
                      선택 해제
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  if (selectedMembers.size > 0) {
                    setShowBatchRoleChange(true);
                  }
                }}
                disabled={selectedMembers.size === 0}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  selectedMembers.size > 0
                    ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg transform hover:scale-105'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                <span>일괄 역할 변경</span>
                {selectedMembers.size > 0 && (
                  <span className="bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs font-bold">
                    {selectedMembers.size}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="card">
              <div className="flex flex-wrap gap-4">
                <select 
                  value={selectedRole}
                  onChange={(e) => {
                    setSelectedRole(e.target.value);
                    setPage(0);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">모든 등급</option>
                  <option value="GUEST">외부인</option>
                  <option value="ASSOCIATE_MEMBER">준회원</option>
                  <option value="FULL_MEMBER">정회원</option>
                  <option value="SENIOR">선배님</option>
                  <option value="ADMIN">운영진</option>
                </select>
                <button 
                  onClick={() => {
                    setSelectedRole("");
                    setNicknameSearch("");
                    setRealNameSearch("");
                    setPage(0);
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  필터 초기화
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* 등급 변경 요청 탭 Actions Bar */}
      {activeTab === "requests" && (
        <>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex items-center space-x-4 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="닉네임 검색..."
                  value={roleChangeNicknameSearch}
                  onChange={(e) => {
                    setRoleChangeNicknameSearch(e.target.value);
                    setRoleChangePage(0);
                  }}
                  className="w-48 pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="실명 검색..."
                  value={roleChangeRealNameSearch}
                  onChange={(e) => {
                    setRoleChangeRealNameSearch(e.target.value);
                    setRoleChangePage(0);
                  }}
                  className="w-48 pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
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
          </div>

          {/* 등급 변경 요청 Filters Panel */}
          {showFilters && (
            <div className="card">
              <div className="flex flex-wrap gap-4">
                <select 
                  value={roleChangeSelectedRole}
                  onChange={(e) => {
                    setRoleChangeSelectedRole(e.target.value);
                    setRoleChangePage(0);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">모든 등급</option>
                  <option value="GUEST">외부인</option>
                  <option value="ASSOCIATE_MEMBER">준회원</option>
                  <option value="FULL_MEMBER">정회원</option>
                  <option value="SENIOR">선배님</option>
                  <option value="ADMIN">운영진</option>
                </select>
                <button 
                  onClick={() => {
                    setRoleChangeSelectedRole("");
                    setRoleChangeNicknameSearch("");
                    setRoleChangeRealNameSearch("");
                    setRoleChangePage(0);
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  필터 초기화
                </button>
              </div>
            </div>
          )}
        </>
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
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">조회된 회원이 없습니다.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedMembers.size > 0 && selectedMembers.size === members.length}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <span className="ml-2">회원</span>
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">등급</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가입일</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {members.map((member) => (
                      <tr 
                        key={member.id} 
                        className={`hover:bg-gray-50 transition-colors ${
                          selectedMembers.has(member.username) ? 'bg-primary-50' : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedMembers.has(member.username)}
                              onChange={() => toggleMemberSelection(member.username)}
                              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mr-3"
                            />
                            {member.profileImageUrl ? (
                              <img 
                                src={member.profileImageUrl} 
                                alt={member.realName || member.nickname}
                                className="w-10 h-10 rounded-full mr-3 object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-sm font-bold text-primary-600">
                                  {getInitial(member.realName || member.nickname)}
                                </span>
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {member.realName || member.nickname}
                              </div>
                              <div className="text-sm text-gray-500">{member.email}</div>
                              {member.nickname && member.realName && member.nickname !== member.realName && (
                                <div className="text-xs text-gray-400">@{member.nickname}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingMember === member.username ? (
                            <div className="flex items-center space-x-2">
                              <select
                                defaultValue={member.role}
                                onChange={(e) => {
                                  handleSingleRoleChange(member.username, e.target.value);
                                }}
                                className="px-2 py-1 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-primary-500"
                                disabled={singleRoleChangeLoading === member.username}
                              >
                                <option value="GUEST">외부인</option>
                                <option value="ASSOCIATE_MEMBER">준회원</option>
                                <option value="FULL_MEMBER">정회원</option>
                                <option value="SENIOR">선배님</option>
                                <option value="ADMIN">운영진</option>
                              </select>
                              <button
                                onClick={() => setEditingMember(null)}
                                className="text-gray-400 hover:text-gray-600"
                                disabled={singleRoleChangeLoading === member.username}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                              {getRoleDisplayLabel(member.role)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(member.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => {
                                if (editingMember === member.username) {
                                  setEditingMember(null);
                                } else {
                                  setEditingMember(member.username);
                                }
                              }}
                              disabled={singleRoleChangeLoading === member.username}
                              className="text-gray-400 hover:text-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="역할 변경"
                            >
                              {singleRoleChangeLoading === member.username ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Edit3 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination */}
            {totalPage > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  페이지 {page + 1} / {totalPage} (총 {totalElements}명)
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage(prev => Math.max(0, prev - 1))}
                    disabled={page === 0}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    이전
                  </button>
                  <button
                    onClick={() => setPage(prev => Math.min(totalPage - 1, prev + 1))}
                    disabled={page >= totalPage - 1}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    다음
                  </button>
                </div>
              </div>
            )}
            
            {/* 일괄 역할 변경 모달 */}
            {showBatchRoleChange && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">일괄 역할 변경</h3>
                    <button
                      onClick={() => setShowBatchRoleChange(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    {selectedMembers.size}명의 회원 역할을 변경합니다.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        새로운 역할 선택
                      </label>
                      <select
                        id="batchRoleSelect"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="GUEST">외부인</option>
                        <option value="ASSOCIATE_MEMBER">준회원</option>
                        <option value="FULL_MEMBER">정회원</option>
                        <option value="SENIOR">선배님</option>
                        <option value="ADMIN">운영진</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        onClick={() => setShowBatchRoleChange(false)}
                        className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        취소
                      </button>
                      <button
                        onClick={() => {
                          const select = document.getElementById('batchRoleSelect') as HTMLSelectElement;
                          if (select) {
                            handleBatchRoleChange(select.value);
                          }
                        }}
                        disabled={batchRoleChangeLoading}
                        className="px-4 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {batchRoleChangeLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            변경 중...
                          </>
                        ) : (
                          '변경하기'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Grade Requests Tab */}
        {activeTab === "requests" && (
          <div>
            <div className="border-b border-gray-200 pb-4 mb-6">
              <h3 className="text-lg font-semibold text-primary-900">등급 변경 요청</h3>
              <p className="text-sm text-gray-600 mt-1">회원들의 등급 변경 요청을 검토하고 승인합니다</p>
            </div>
            
            {roleChangeLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
            ) : filteredRoleChangeRequests.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  {allRoleChangeRequests.length === 0 
                    ? "대기 중인 등급 변경 요청이 없습니다."
                    : "검색 결과가 없습니다."}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {roleChangeRequests.map((item) => {
                    const request = item.roleChange;
                    const style = getRoleChangeStyle(request.requestedRole);
                    const previousRoleLabel = getRoleDisplayLabel(request.previousRole);
                    const requestedRoleLabel = getRoleDisplayLabel(request.requestedRole);
                    
                    return (
                      <div key={request.id} className={`border ${style.borderColor} rounded-lg p-6 hover:shadow-md transition-shadow ${style.bgColor}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className={`w-12 h-12 ${style.avatarBg} rounded-full flex items-center justify-center`}>
                              <span className={`text-sm font-bold ${style.avatarText}`}>
                                {getInitialForRoleChange(request.realName)}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{request.realName}</h4>
                              <p className="text-sm text-gray-500 mb-1">{request.email}</p>
                              <p className="text-sm text-gray-600 mb-2">
                                <span className="font-medium">{previousRoleLabel}</span> → <span className="font-medium text-primary-600">{requestedRoleLabel}</span> 요청
                              </p>
                              <p className="text-xs text-gray-400 mt-1">요청일: {formatRoleChangeDate(request.requestedAt)}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleRoleChangeAction(request.id, true)}
                              disabled={processingIds.has(request.id)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              {processingIds.has(request.id) ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  처리중
                                </>
                              ) : (
                                '승인'
                              )}
                            </button>
                            <button 
                              onClick={() => handleRoleChangeAction(request.id, false)}
                              disabled={processingIds.has(request.id)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              {processingIds.has(request.id) ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  처리중
                                </>
                              ) : (
                                '거부'
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* 페이지네이션 */}
                {roleChangeTotalPage > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      페이지 {roleChangePage + 1} / {roleChangeTotalPage}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setRoleChangePage(prev => Math.max(0, prev - 1))}
                        disabled={roleChangePage === 0}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        이전
                      </button>
                      <button
                        onClick={() => setRoleChangePage(prev => Math.min(roleChangeTotalPage - 1, prev + 1))}
                        disabled={roleChangePage >= roleChangeTotalPage - 1}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        다음
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Grades Management Tab */}
        {activeTab === "grades" && (
          <div>
            <div className="border-b border-gray-200 pb-4 mb-6">
              <h3 className="text-lg font-semibold text-primary-900">등급 관리</h3>
              <p className="text-sm text-gray-600 mt-1">회원 등급 시스템을 관리합니다</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gradeStats.map((grade, index) => (
                <div 
                  key={index} 
                  onClick={() => handleRoleManagement(grade.role)}
                  className={`p-6 rounded-lg border-2 hover:shadow-lg transition-all cursor-pointer ${
                    getRoleColor(grade.role) === 'gray' ? 'bg-gray-50 border-gray-200 hover:border-gray-300' :
                    getRoleColor(grade.role) === 'blue' ? 'bg-blue-50 border-blue-200 hover:border-blue-300' :
                    getRoleColor(grade.role) === 'green' ? 'bg-green-50 border-green-200 hover:border-green-300' :
                    getRoleColor(grade.role) === 'purple' ? 'bg-purple-50 border-purple-200 hover:border-purple-300' :
                    'bg-orange-50 border-orange-200 hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        getRoleColor(grade.role) === 'gray' ? 'bg-gray-100' :
                        getRoleColor(grade.role) === 'blue' ? 'bg-blue-100' :
                        getRoleColor(grade.role) === 'green' ? 'bg-green-100' :
                        getRoleColor(grade.role) === 'purple' ? 'bg-purple-100' :
                        'bg-orange-100'
                      }`}>
                        <span className={`text-sm font-bold ${
                          getRoleColor(grade.role) === 'gray' ? 'text-gray-600' :
                          getRoleColor(grade.role) === 'blue' ? 'text-blue-600' :
                          getRoleColor(grade.role) === 'green' ? 'text-green-600' :
                          getRoleColor(grade.role) === 'purple' ? 'text-purple-600' :
                          'text-orange-600'
                        }`}>
                          {getRoleDisplayLabel(grade.role).charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{getRoleDisplayLabel(grade.role)}</h4>
                        <p className="text-sm text-gray-500">
                          {getRoleDescription(grade.role)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      {gradeStatsLoading ? (
                        <span className="text-gray-400">로딩 중...</span>
                      ) : (
                        `총 ${grade.count}명`
                      )}
                    </span>
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
                  <span className="text-2xl font-bold text-gray-900">
                    {gradeStatsLoading ? (
                      <span className="text-gray-400">로딩 중...</span>
                    ) : (
                      `총 ${totalMemberCount}명`
                    )}
                  </span>
                  <button 
                    onClick={() => {
                      setSelectedRole('');
                      setPage(0);
                      setNicknameSearch('');
                      setRealNameSearch('');
                      handleTabChange('all');
                    }}
                    className="px-3 py-1.5 bg-primary-100 text-primary-700 hover:bg-primary-200 rounded-lg text-sm font-medium transition-colors"
                  >
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
