import { useState, useEffect } from 'react';

interface UseGradeRequestsParams {
  searchTerm: string;
  refreshKey: number;
}

export default function useGradeRequests({
  searchTerm,
  refreshKey
}: UseGradeRequestsParams) {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        search: searchTerm,
        status: 'pending',
      });

      const response = await fetch(`/api/admin/grade-requests?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch grade requests');
      }

      const data = await response.json();
      setRequests(data.requests);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchRequests();
    }, searchTerm ? 300 : 0);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, refreshKey]);

  return {
    requests,
    isLoading,
    error,
    refetch: fetchRequests
  };
}
