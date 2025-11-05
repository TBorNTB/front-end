import { useState, useEffect } from 'react';

interface UseMembersDataParams {
  page: number;
  pageSize: number;
  searchTerm: string;
  filters: {
    role: string;
    status: string;
    dateRange: string;
  };
  refreshKey: number;
}

export default function useMembersData({
  page,
  pageSize,
  searchTerm,
  filters,
  refreshKey
}: UseMembersDataParams) {
  const [members, setMembers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | string | null>(null);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        search: searchTerm,
        role: filters.role,
        status: filters.status,
      });

      const response = await fetch(`/api/admin/members?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }

      const data = await response.json();
      setMembers(data.members);
      setTotalCount(data.totalCount);
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchMembers();
    }, searchTerm ? 300 : 0); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [page, pageSize, searchTerm, filters.role, filters.status, refreshKey]);

  return {
    members,
    totalCount,
    isLoading,
    error,
    refetch: fetchMembers
  };
}
