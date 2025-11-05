import { useState, useEffect } from 'react';

interface UseGradeStatsParams {
  refreshKey: number;
}

export default function useGradeStats({ refreshKey }: UseGradeStatsParams) {
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/members/stats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch grade statistics');
      }

      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error(String(err)));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [refreshKey]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats
  };
}
