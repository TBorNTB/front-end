"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { getApiUrl } from "@/lib/api/config";
import { ELASTIC_ENDPOINTS } from "@/lib/api/endpoints/elastic-endpoints";

interface PopularContent {
  id: string;
  contentType: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  likeCount: number;
  viewCount: number;
}

interface PopularContentsResponse {
  content: PopularContent[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// contentType을 한글로 변환
const getContentTypeLabel = (contentType: string): string => {
  const typeMap: Record<string, string> = {
    'PROJECT': '프로젝트',
    'NEWS': '뉴스',
    'CS': 'CS 아티클',
    'CSKNOWLEDGE': 'CS 아티클',
  };
  return typeMap[contentType] || contentType;
};

// contentType에 따른 색상 클래스
const getContentTypeColor = (contentType: string): string => {
  const colorMap: Record<string, string> = {
    'PROJECT': 'bg-green-100 text-green-800',
    'NEWS': 'bg-indigo-100 text-indigo-800',
    'CS': 'bg-blue-100 text-blue-800',
    'CSKNOWLEDGE': 'bg-blue-100 text-blue-800',
  };
  return colorMap[contentType] || 'bg-gray-100 text-gray-800';
};

// contentType + id로 게시물 상세 URL 생성
const getPostLink = (contentType: string, id: string): string => {
  const type = (contentType || '').toUpperCase();
  switch (type) {
    case 'PROJECT':
      return `/projects/${id}`;
    case 'NEWS':
    case 'CS':
    case 'CSKNOWLEDGE':
      return `/community/news/${id}`;
    default:
      return `/community/news/${id}`;
  }
};

export default function PopularPosts() {
  const router = useRouter();
  const [posts, setPosts] = useState<PopularContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCount, setShowCount] = useState(3); // 초기 3개 표시

  useEffect(() => {
    const fetchPopularPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${getApiUrl(ELASTIC_ENDPOINTS.ELASTIC.CONTENTS_POPULAR)}?page=0&size=10`,
          {
            method: 'GET',
            headers: {
              'accept': 'application/json',
            },
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch popular posts');
        }

        const data: PopularContentsResponse = await response.json();
        setPosts(data.content);
      } catch (err) {
        console.error('Error fetching popular posts:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPopularPosts();
  }, []);

  const handleToggleMore = () => {
    if (showCount === 3) {
      setShowCount(9); // 9개까지 확장
    } else {
      setShowCount(3); // 다시 3개로 축소
    }
  };

  const displayedPosts = posts.slice(0, showCount);
  const canShowMore = posts.length > 3 && showCount < 9;
  const canShowLess = showCount > 3;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">최근 인기 게시물</h3>
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-gray-700 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-sm text-red-600">{error}</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8 text-sm text-gray-700">인기 게시물이 없습니다.</div>
      ) : (
        <>
          <div className="space-y-4">
            {displayedPosts.map((post, index) => {
              const href = getPostLink(post.contentType, post.id);
              return (
                <div
                  key={`${post.contentType}-${post.id}-${index}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(href)}
                  onKeyDown={(e) => e.key === 'Enter' && router.push(href)}
                  className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                >
                  <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getContentTypeColor(post.contentType)}`}>
                    {getContentTypeLabel(post.contentType)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {post.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-700">
                      <span>조회수 {post.viewCount.toLocaleString()}</span>
                      <span>좋아요 {post.likeCount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 더보기/접기 버튼 */}
          {canShowMore && (
            <button
              onClick={handleToggleMore}
              className="w-full mt-4 flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <span>더보기</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          )}

          {canShowLess && (
            <button
              onClick={handleToggleMore}
              className="w-full mt-4 flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <span>접기</span>
              <ChevronUp className="h-4 w-4" />
            </button>
          )}
        </>
      )}
    </div>
  );
}
