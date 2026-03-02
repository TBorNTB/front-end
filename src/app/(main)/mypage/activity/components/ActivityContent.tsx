// app/profile/activity/components/ActivityContent.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Grid, 
  List,
  Eye,
  ThumbsUp,
  MessageCircle,
  Calendar,
  User,
  BookOpen,
  Code,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Newspaper
} from 'lucide-react';
import { profileService } from '@/lib/api/services/user-services';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { ELASTIC_ENDPOINTS, getElasticApiUrl } from '@/lib/api/endpoints/elastic-endpoints';
import { USER_ENDPOINTS, getUserApiUrl } from '@/lib/api/endpoints/user-endpoints';
import { fetchWithRefresh } from '@/lib/api/fetch-with-refresh';
import { decodeHtmlEntities } from '@/lib/html-utils';

// API Response Types
interface ProjectResponse {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  projectStatus: 'IN_PROGRESS' | 'COMPLETED' | 'DRAFT';
  projectCategories: string[];
  projectTechStacks: string[];
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  viewCount: number;
  owner: {
    username: string;
    nickname: string;
    realname: string;
  };
  collaborators: Array<{
    username: string;
    nickname: string;
    realname: string;
  }>;
}

interface CSKnowledgeResponse {
  id: number;
  title: string;
  content: string;
  description?: string;
  thumbnailUrl?: string;
  category: string;
  createdAt: string;
  likeCount: number;
  viewCount: number;
  writer: {
    username: string;
    nickname: string;
    realname: string;
  };
}

interface NewsResponse {
  id: number;
  content: {
    title: string;
    summary: string;
    content: string;
    category: string;
  };
  thumbnailUrl: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  viewCount: number;
  writer: {
    username: string;
    nickname: string;
    realname: string;
  };
  participants: Array<{
    username: string;
    nickname: string;
    realname: string;
  }>;
}

interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

interface LikedPostsResponse {
  message: string;
  size: number;
  page: number;
  totalPage: number;
  data: Array<{
    postType: 'PROJECT' | 'ARTICLE' | 'NEWS';
    postId: number;
  }>;
}

interface CommentedPostsResponse {
  message: string;
  size: number;
  page: number;
  totalPage: number;
  data: Array<{
    postType: 'PROJECT' | 'ARTICLE' | 'NEWS';
    postId: number;
  }>;
}

interface PostDetailResponse {
  postId: number;
  postType: 'PROJECT' | 'ARTICLE' | 'NEWS';
  title: string;
  createdAt: string;
  writer: {
    username: string;
    nickname: string;
    realname: string;
  };
}

// Activity Item Type
interface ActivityItem {
  id: number;
  type: 'project' | 'CSnote' | 'news' | 'like' | 'comment';
  title: string;
  description?: string;
  image?: string;
  date: string;
  views?: number;
  likes?: number;
  status?: 'active' | 'completed' | 'draft';
  tags?: string[];
  author?: string;
  link?: string;
  postType?: 'PROJECT' | 'ARTICLE' | 'NEWS';
}

const activityTabs = [
  { key: 'project', label: '참여한 프로젝트', count: 0 },
  { key: 'CSnote', label: '작성한 CS지식', count: 0 },
  { key: 'news', label: '작성한 News', count: 0 },
  { key: 'like', label: '좋아요 누른 글', count: 0 },
  { key: 'comment', label: '댓글 단 글', count: 0 },
];

const ITEMS_PER_PAGE = 5;

export default function ActivityContent() {
  const { user, isLoading: userLoading } = useCurrentUser();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activeTab, setActiveTab] = useState<'project' | 'CSnote' | 'news' | 'like' | 'comment'>('project');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [_totalElements, setTotalElements] = useState(0);
  // 탭별 갯수: 해당 탭을 클릭해 데이터를 불러온 뒤에만 갯수 표시 (초기 로드 없음)
  const [tabCounts, setTabCounts] = useState({
    project: 0,
    CSnote: 0,
    news: 0,
    like: 0,
    comment: 0,
  });
  const [tabCountsLoaded, setTabCountsLoaded] = useState<Record<string, boolean>>({
    project: false,
    CSnote: false,
    news: false,
    like: false,
    comment: false,
  });
  const [activityStats, setActivityStats] = useState<{
    totalPostCount: number;
    totalViewCount: number;
    totalLikeCount: number;
    totalCommentCount: number;
  } | null>(null);

  // Format date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).replace(/\./g, '.').replace(/\s/g, '');
    } catch {
      return dateString;
    }
  };

  // Map project status
  const mapProjectStatus = (status: string): 'active' | 'completed' | 'draft' => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'active';
      case 'COMPLETED':
        return 'completed';
      case 'DRAFT':
        return 'draft';
      default:
        return 'active';
    }
  };

  // Fetch projects (참여한 프로젝트) - elastic project/search/member API, 닉네임(name)으로 조회
  const fetchProjects = async (name: string, page: number) => {
    const url = `${getElasticApiUrl(ELASTIC_ENDPOINTS.ELASTIC.PROJECT_SEARCH_BY_MEMBER)}?name=${encodeURIComponent(name)}&size=${ITEMS_PER_PAGE}&page=${page}`;
    const response = await fetchWithRefresh(url, {
      method: 'GET',
      headers: { accept: 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.status}`);
    }

    const raw = await response.json();
    const content = Array.isArray(raw) ? raw : (raw?.content ?? []);
    const pageNum = typeof raw?.page === 'number' ? raw.page : page;
    const totalPages = typeof raw?.totalPages === 'number' ? raw.totalPages : Math.ceil((raw?.totalElements ?? content.length) / ITEMS_PER_PAGE) || 1;
    const totalElements = typeof raw?.totalElements === 'number' ? raw.totalElements : content.length;

    const items: ActivityItem[] = content.map((item: any) => {
      const owner = item.owner ?? item.ownerProfile ?? {};
      const categories = item.projectCategories ?? item.categories ?? [];
      const techStacks = item.projectTechStacks ?? item.techStackDtos ?? [];
      return {
        id: item.id,
        type: 'project' as const,
        title: item.title ?? '',
        description: item.description ?? '',
        image: item.thumbnailUrl || undefined,
        date: formatDate(item.createdAt ?? item.created_at ?? ''),
        views: item.viewCount ?? item.views ?? 0,
        likes: item.likeCount ?? item.likes ?? 0,
        status: mapProjectStatus(item.projectStatus ?? item.project_status ?? 'IN_PROGRESS'),
        tags: [...(Array.isArray(categories) ? categories : []).map((c: any) => (typeof c === 'string' ? c : c?.name ?? '')), ...(Array.isArray(techStacks) ? techStacks : []).map((t: any) => (typeof t === 'string' ? t : t?.name ?? ''))],
        author: owner.nickname ?? owner.realName ?? owner.realname ?? owner.username ?? '',
        link: `/projects/${item.id}`,
      };
    });

    return {
      items,
      pagination: { page: pageNum, totalPages, totalElements },
    };
  };

  // Fetch CS Knowledge
  const fetchCSKnowledge = async (username: string, page: number) => {
    const url = `${getElasticApiUrl(ELASTIC_ENDPOINTS.ELASTIC.ARTICLE_BY_USER)}/${encodeURIComponent(username)}?size=${ITEMS_PER_PAGE}&page=${page}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch CS knowledge: ${response.status}`);
    }

    const data: PaginatedResponse<CSKnowledgeResponse> = await response.json();
    return {
      items: data.content.map((item): ActivityItem => {
        const desc = item.description ?? item.content ?? '';
        const descPreview = desc.length > 150 ? desc.substring(0, 150) + '...' : desc;
        return {
          id: item.id,
          type: 'CSnote',
          title: item.title,
          description: descPreview,
          image: item.thumbnailUrl || undefined,
          date: formatDate(item.createdAt),
          views: item.viewCount,
          likes: item.likeCount,
          tags: [item.category],
          author: item.writer.nickname || item.writer.realname || item.writer.username,
          link: `/articles/${item.id}`,
        };
      }),
      pagination: {
        page: data.page,
        totalPages: data.totalPages,
        totalElements: data.totalElements,
      },
    };
  };

  // Fetch News (작성한 News) - elastic news/search/member API, 닉네임(name)으로 조회
  const fetchNews = async (name: string, page: number) => {
    const url = `${getElasticApiUrl(ELASTIC_ENDPOINTS.ELASTIC.NEWS_SEARCH_BY_MEMBER)}?name=${encodeURIComponent(name)}&size=${ITEMS_PER_PAGE}&page=${page}`;
    const response = await fetchWithRefresh(url, {
      method: 'GET',
      headers: { accept: 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch news: ${response.status}`);
    }

    const data: PaginatedResponse<NewsResponse> = await response.json();
    return {
      items: data.content.map((item): ActivityItem => ({
        id: item.id,
        type: 'news',
        title: item.content.title,
        description: item.content.summary || item.content.content.substring(0, 150) + (item.content.content.length > 150 ? '...' : ''),
        image: item.thumbnailUrl ?? (item as any).thumbnail ?? undefined,
        date: formatDate(item.createdAt),
        views: item.viewCount,
        likes: item.likeCount,
        tags: item.tags,
        author: item.writer.nickname || item.writer.realname || item.writer.username,
        link: `/community/news/${item.id}`,
      })),
      pagination: {
        page: data.page,
        totalPages: data.totalPages,
        totalElements: data.totalElements,
      },
    };
  };

  // Fetch liked posts
  const fetchLikedPosts = async (page: number) => {
    // Step 1: Get liked posts list
    const likedPostsUrl = `${getUserApiUrl(USER_ENDPOINTS.USER.LIKED_POSTS)}?page=${page}&size=${ITEMS_PER_PAGE}&sortDirection=DESC&sortBy=createdAt`;
    const likedPostsResponse = await fetchWithRefresh(likedPostsUrl, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
      credentials: 'include',
    });

    if (!likedPostsResponse.ok) {
      if (likedPostsResponse.status === 401 || likedPostsResponse.status === 403) {
        throw new Error('로그인이 필요합니다.');
      }
      throw new Error(`Failed to fetch liked posts: ${likedPostsResponse.status}`);
    }

    const likedPostsData: LikedPostsResponse = await likedPostsResponse.json();

    if (!likedPostsData.data || likedPostsData.data.length === 0) {
      return {
        items: [],
        pagination: {
          page: likedPostsData.page,
          totalPages: likedPostsData.totalPage,
          totalElements: 0,
        },
      };
    }

    // Step 2: Get actual post details using elastic service
    const postsUrl = getElasticApiUrl(ELASTIC_ENDPOINTS.ELASTIC.CONTENTS_POSTS);
    const postsResponse = await fetch(postsUrl, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        posts: likedPostsData.data.map(item => ({
          postType: item.postType,
          postId: item.postId,
        })),
      }),
    });

    if (!postsResponse.ok) {
      throw new Error(`Failed to fetch post details: ${postsResponse.status}`);
    }

    const postDetails: PostDetailResponse[] = await postsResponse.json();

    // Ensure we only return ITEMS_PER_PAGE items
    const limitedPostDetails = postDetails.slice(0, ITEMS_PER_PAGE);

    // Map to ActivityItem format
    const items: ActivityItem[] = limitedPostDetails.map((post) => {
      let link = '';

      if (post.postType === 'PROJECT') {
        link = `/projects/${post.postId}`;
      } else if (post.postType === 'ARTICLE') {
        link = `/articles/${post.postId}`;
      } else if (post.postType === 'NEWS') {
        link = `/community/news/${post.postId}`;
      }

      return {
        id: post.postId,
        type: 'like',
        title: post.title,
        date: formatDate(post.createdAt),
        author: post.writer.nickname || post.writer.realname || post.writer.username,
        link,
        postType: post.postType,
      };
    });

    // Calculate total elements from totalPage and size
    const totalElements = likedPostsData.totalPage * ITEMS_PER_PAGE;

    return {
      items,
      pagination: {
        page: likedPostsData.page,
        totalPages: likedPostsData.totalPage,
        totalElements,
      },
    };
  };

  // Fetch commented posts
  const fetchCommentedPosts = async (page: number) => {
    // Step 1: Get commented posts list
    const commentedPostsUrl = `${getUserApiUrl(USER_ENDPOINTS.USER.COMMENTED_POSTS)}?page=${page}&size=${ITEMS_PER_PAGE}&sortDirection=DESC&sortBy=createdAt`;
    const commentedPostsResponse = await fetchWithRefresh(commentedPostsUrl, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
      credentials: 'include',
    });

    if (!commentedPostsResponse.ok) {
      if (commentedPostsResponse.status === 401 || commentedPostsResponse.status === 403) {
        throw new Error('로그인이 필요합니다.');
      }
      throw new Error(`Failed to fetch commented posts: ${commentedPostsResponse.status}`);
    }

    const commentedPostsData: CommentedPostsResponse = await commentedPostsResponse.json();

    if (!commentedPostsData.data || commentedPostsData.data.length === 0) {
      return {
        items: [],
        pagination: {
          page: commentedPostsData.page,
          totalPages: commentedPostsData.totalPage,
          totalElements: 0,
        },
      };
    }

    // Step 2: Get actual post details using elastic service
    const postsUrl = getElasticApiUrl(ELASTIC_ENDPOINTS.ELASTIC.CONTENTS_POSTS);
    const postsResponse = await fetch(postsUrl, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        posts: commentedPostsData.data.map(item => ({
          postType: item.postType,
          postId: item.postId,
        })),
      }),
    });

    if (!postsResponse.ok) {
      throw new Error(`Failed to fetch post details: ${postsResponse.status}`);
    }

    const postDetails: PostDetailResponse[] = await postsResponse.json();

    // Ensure we only return ITEMS_PER_PAGE items
    const limitedPostDetails = postDetails.slice(0, ITEMS_PER_PAGE);

    // Map to ActivityItem format
    const items: ActivityItem[] = limitedPostDetails.map((post) => {
      let link = '';

      if (post.postType === 'PROJECT') {
        link = `/projects/${post.postId}`;
      } else if (post.postType === 'ARTICLE') {
        link = `/articles/${post.postId}`;
      } else if (post.postType === 'NEWS') {
        link = `/community/news/${post.postId}`;
      }

      return {
        id: post.postId,
        type: 'comment',
        title: post.title,
        date: formatDate(post.createdAt),
        author: post.writer.nickname || post.writer.realname || post.writer.username,
        link,
        postType: post.postType,
      };
    });

    // Calculate total elements from totalPage and size
    const totalElements = commentedPostsData.totalPage * ITEMS_PER_PAGE;

    return {
      items,
      pagination: {
        page: commentedPostsData.page,
        totalPages: commentedPostsData.totalPage,
        totalElements,
      },
    };
  };

  // Fetch tab counts
  const fetchTabCounts = async (username: string) => {
    try {
      const [projectsRes, csRes, newsRes, likesRes, commentsRes] = await Promise.allSettled([
        fetch(`${getElasticApiUrl(ELASTIC_ENDPOINTS.ELASTIC.PROJECT_BY_USER)}/${encodeURIComponent(username)}?size=1&page=0`, {
          headers: { 'accept': 'application/json' },
          credentials: 'include',
        }),
        fetch(`${getElasticApiUrl(ELASTIC_ENDPOINTS.ELASTIC.ARTICLE_BY_USER)}/${encodeURIComponent(username)}?size=1&page=0`, {
          headers: { 'accept': 'application/json' },
          credentials: 'include',
        }),
        fetch(`${getElasticApiUrl(ELASTIC_ENDPOINTS.ELASTIC.NEWS_BY_USER)}/${encodeURIComponent(username)}?size=1&page=0`, {
          headers: { 'accept': 'application/json' },
          credentials: 'include',
        }),
        fetchWithRefresh(`${getUserApiUrl(USER_ENDPOINTS.USER.LIKED_POSTS)}?page=0&size=1&sortDirection=DESC&sortBy=createdAt`, {
          method: 'GET',
          headers: { 'accept': 'application/json' },
          credentials: 'include',
        }),
        fetchWithRefresh(`${getUserApiUrl(USER_ENDPOINTS.USER.COMMENTED_POSTS)}?page=0&size=1&sortDirection=DESC&sortBy=createdAt`, {
          method: 'GET',
          headers: { 'accept': 'application/json' },
          credentials: 'include',
        }),
      ]);

      const counts = { project: 0, CSnote: 0, news: 0, like: 0, comment: 0 };

      if (projectsRes.status === 'fulfilled' && projectsRes.value.ok) {
        const data = await projectsRes.value.json() as PaginatedResponse<ProjectResponse>;
        counts.project = data.totalElements;
      }

      if (csRes.status === 'fulfilled' && csRes.value.ok) {
        const data = await csRes.value.json() as PaginatedResponse<CSKnowledgeResponse>;
        counts.CSnote = data.totalElements;
      }

      if (newsRes.status === 'fulfilled' && newsRes.value.ok) {
        const data = await newsRes.value.json() as PaginatedResponse<NewsResponse>;
        counts.news = data.totalElements;
      }

      if (likesRes.status === 'fulfilled' && likesRes.value.ok) {
        const likedPostsData = await likesRes.value.json() as LikedPostsResponse;
        // Use actual data count from first page (limited to ITEMS_PER_PAGE)
        counts.like = likedPostsData.data ? Math.min(likedPostsData.data.length, ITEMS_PER_PAGE) : 0;
      }

      if (commentsRes.status === 'fulfilled' && commentsRes.value.ok) {
        const commentedPostsData = await commentsRes.value.json() as CommentedPostsResponse;
        // Use actual data count from first page (limited to ITEMS_PER_PAGE)
        counts.comment = commentedPostsData.data ? Math.min(commentedPostsData.data.length, ITEMS_PER_PAGE) : 0;
      }

      setTabCounts(counts);
    } catch (err) {
      console.error('Failed to fetch tab counts:', err);
    }
  };

  // Load activities based on active tab
  useEffect(() => {
    const loadActivities = async () => {
      if (userLoading || !user?.username) {
        setIsLoading(true);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        let result;
        switch (activeTab) {
          case 'project':
            result = await fetchProjects(user.nickname || user.realName || user.username, currentPage);
            break;
          case 'CSnote':
            result = await fetchCSKnowledge(user.username, currentPage);
            break;
          case 'news':
            result = await fetchNews(user.nickname || user.realName || user.username, currentPage);
            break;
          case 'like':
            result = await fetchLikedPosts(currentPage);
            break;
          case 'comment':
            result = await fetchCommentedPosts(currentPage);
            break;
          default:
            result = { items: [], pagination: { page: 0, totalPages: 0, totalElements: 0 } };
        }

        setActivities(result.items);
        setTotalPages(result.pagination.totalPages);
        setTotalElements(result.pagination.totalElements);

        // 클릭한 탭의 갯수만 API 응답 totalElements로 갱신
        setTabCounts(prev => ({
          ...prev,
          [activeTab]: result.pagination.totalElements,
        }));
        setTabCountsLoaded(prev => ({ ...prev, [activeTab]: true }));

        // 요약 통계는 첫 탭 로드 시에만 한 번 로드 (클릭 시 갯수 보이도록)
        if (!activityStats) {
          try {
            const stats = await profileService.getActivityStats();
            setActivityStats(stats);
          } catch {
            // 무시
          }
        }
      } catch (err) {
        console.error('Failed to load activities:', err);
        setError('활동 내역을 불러올 수 없습니다.');
        setActivities([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadActivities();
  }, [user, userLoading, activeTab, currentPage]);

  // 탭/요약 갯수는 초기 로드하지 않음. 탭 클릭 시 해당 탭 데이터 로드 후 갯수 표시.

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(0);
  }, [activeTab]);

  // Filter activities based on search
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <Code className="h-5 w-5" />;
      case 'CSnote':
        return <BookOpen className="h-5 w-5" />;
      case 'news':
        return <Newspaper className="h-5 w-5" />;
      case 'like':
        return <ThumbsUp className="h-5 w-5" />;
      case 'comment':
        return <MessageCircle className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'project':
        return 'bg-primary-500/20 text-primary-700';
      case 'CSnote':
        return 'bg-secondary-500/20 text-secondary-700';
      case 'news':
        return 'bg-blue-500/20 text-blue-700';
      case 'like':
        return 'bg-red-500/20 text-red-700';
      case 'comment':
        return 'bg-yellow-500/20 text-yellow-700';
      default:
        return 'bg-gray-500/20 text-gray-700';
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    switch (status) {
      case 'active':
        return <Badge className="bg-success/20 text-success border-success/30 text-xs">진행중</Badge>;
      case 'completed':
        return <Badge className="bg-primary-500/20 text-primary-700 border-primary-300 text-xs">완료</Badge>;
      case 'draft':
        return <Badge className="bg-gray-500/20 text-gray-700 border-gray-300 text-xs">임시저장</Badge>;
      default:
        return null;
    }
  };

  const getPostTypeLabel = (postType?: string) => {
    switch (postType) {
      case 'PROJECT':
        return '프로젝트';
      case 'ARTICLE':
        return 'CS지식';
      case 'NEWS':
        return '뉴스';
      default:
        return null;
    }
  };

  const getPostTypeBadge = (postType?: string) => {
    const label = getPostTypeLabel(postType);
    if (!label) return null;

    let badgeClass = 'text-xs';
    switch (postType) {
      case 'PROJECT':
        badgeClass += ' bg-primary-100 text-primary-700 border-primary-300';
        break;
      case 'ARTICLE':
        badgeClass += ' bg-secondary-100 text-secondary-700 border-secondary-300';
        break;
      case 'NEWS':
        badgeClass += ' bg-blue-100 text-blue-700 border-blue-300';
        break;
      default:
        badgeClass += ' bg-gray-100 text-gray-700 border-gray-300';
    }

    return <Badge variant="outline" className={badgeClass}>{label}</Badge>;
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-700">사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!user?.username) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-2">로그인이 필요합니다</p>
        </div>
      </div>
    );
  }

  if (isLoading && activities.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-700">활동 내역을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error && activities.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-2">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              setCurrentPage(0);
            }} 
            className="btn btn-primary mt-4"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const summaryStats = [
    {
      label: '작성한 글',
      value: activityStats?.totalPostCount ?? null,
      icon: BookOpen,
      colorClass: 'bg-primary-500/10 text-primary-600 border-primary-200',
    },
    {
      label: '총 조회수',
      value: activityStats?.totalViewCount ?? null,
      icon: Eye,
      colorClass: 'bg-blue-500/10 text-blue-600 border-blue-200',
    },
    {
      label: '받은 좋아요',
      value: activityStats?.totalLikeCount ?? null,
      icon: ThumbsUp,
      colorClass: 'bg-red-500/10 text-red-600 border-red-200',
    },
    {
      label: '받은 댓글',
      value: activityStats?.totalCommentCount ?? null,
      icon: MessageCircle,
      colorClass: 'bg-amber-500/10 text-amber-600 border-amber-200',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary-700 mb-2">나의 활동</h1>
        <p className="text-gray-700">참여한 프로젝트와 작성한 콘텐츠를 확인하세요</p>
      </div>

      {/* 활동 요약 카드 - 작성한 글, 조회수, 좋아요, 댓글 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`rounded-xl border p-4 transition-all duration-200 hover:shadow-md ${stat.colorClass}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/60">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-2xl font-bold tabular-nums">
                    {stat.value != null ? Number(stat.value).toLocaleString() : '-'}
                  </p>
                  <p className="text-sm font-medium opacity-90">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {activityTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'project' | 'CSnote' | 'news' | 'like' | 'comment')}
              className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-300 ${
                activeTab === tab.key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-700 hover:text-primary-600 hover:border-primary-300'
              }`}
            >
              {tab.label}
              {tab.key !== 'like' && tab.key !== 'comment' && (
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  activeTab === tab.key
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {tabCountsLoaded[tab.key]
                    ? tabCounts[tab.key as keyof typeof tabCounts].toLocaleString()
                    : '-'}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-700" />
            <input
              type="text"
              placeholder="활동 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm
                       focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200
                       transition-all duration-300"
            />
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors duration-200 ${
              viewMode === 'grid'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors duration-200 ${
              viewMode === 'list'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Activities Content */}
      {filteredActivities.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-gray-700 text-lg mb-2">활동 내역이 없습니다</div>
          <p className="text-gray-700">새로운 프로젝트에 참여하거나 글을 작성해보세요!</p>
        </div>
      ) : (
        <>
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredActivities.map((activity, index) => (
              <a
                key={`${activity.type}-${activity.postType || 'none'}-${activity.id}-${index}`}
                href={activity.link}
                className={`group cursor-pointer transition-all duration-300 hover:shadow-lg block ${
                  viewMode === 'grid' 
                    ? 'card p-0 overflow-hidden hover:scale-[1.02]' 
                    : 'card flex items-center gap-4 p-4'
                }`}
              >
                {viewMode === 'grid' ? (
                  // Grid View
                  <>
                    {(activity.image || activity.type === 'CSnote' || activity.type === 'news') ? (
                      <div className="relative h-48 overflow-hidden bg-gray-100">
                        {activity.image ? (
                          <ImageWithFallback
                            src={activity.image}
                            alt={decodeHtmlEntities(activity.title)}
                            width={300}
                            height={200}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <div className={`p-4 rounded-xl ${getActivityColor(activity.type)}`}>
                              {getActivityIcon(activity.type)}
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                        <div className="absolute top-3 left-3">
                          <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                            {getActivityIcon(activity.type)}
                          </div>
                        </div>
                        {activity.status && (
                          <div className="absolute top-3 right-3">
                            {getStatusBadge(activity.status)}
                          </div>
                        )}
                      </div>
                    ) : null}
                    
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary-700 transition-colors flex-1">
                          {decodeHtmlEntities(activity.title)}
                        </h3>
                        {(activity.type === 'like' || activity.type === 'comment') && activity.postType && (
                          <div className="flex-shrink-0">
                            {getPostTypeBadge(activity.postType)}
                          </div>
                        )}
                      </div>
                      
                      {activity.description && (
                        <p className="text-gray-700 text-sm mb-4 line-clamp-2 leading-relaxed">
                          {decodeHtmlEntities(activity.description)}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-700 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{activity.date}</span>
                        </div>
                        {activity.author && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{activity.author}</span>
                          </div>
                        )}
                      </div>
                      
                      {(activity.views !== undefined || activity.likes !== undefined) && (
                        <div className="flex items-center gap-4 text-xs text-gray-700 mb-4">
                          {activity.views !== undefined && (
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              <span>{activity.views}</span>
                            </div>
                          )}
                          {activity.likes !== undefined && (
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3" />
                              <span>{activity.likes}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {activity.tags && activity.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {activity.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-300">
                              {decodeHtmlEntities(tag)}
                            </Badge>
                          ))}
                          {activity.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-300">
                              +{activity.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  // List View
                  <>
                    <div className={`p-3 rounded-full ${getActivityColor(activity.type)} flex-shrink-0`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-foreground truncate flex-1 min-w-0">{decodeHtmlEntities(activity.title)}</h3>
                        {(activity.type === 'like' || activity.type === 'comment') && activity.postType && (
                          <div className="flex-shrink-0">
                            {getPostTypeBadge(activity.postType)}
                          </div>
                        )}
                        {activity.status && getStatusBadge(activity.status)}
                      </div>
                      
                      {activity.description && (
                        <p className="text-gray-700 text-sm mb-2 line-clamp-1">{decodeHtmlEntities(activity.description)}</p>
                      )}
                      
                      {activity.tags && activity.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {activity.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-300">
                              {decodeHtmlEntities(tag)}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right text-sm text-gray-700 flex-shrink-0">
                      <div className="flex items-center gap-1 mb-1">
                        <Calendar className="h-3 w-3" />
                        <span>{activity.date}</span>
                      </div>
                      {(activity.views !== undefined || activity.likes !== undefined) && (
                        <div className="flex items-center gap-3 text-xs">
                          {activity.views !== undefined && (
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              <span>{activity.views}</span>
                            </div>
                          )}
                          {activity.likes !== undefined && (
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3" />
                              <span>{activity.likes}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </a>
            ))}
          </div>

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className={`p-2 rounded-lg border transition-colors ${
                  currentPage === 0
                    ? 'border-gray-200 text-gray-700 cursor-not-allowed'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i;
                  } else if (currentPage < 3) {
                    pageNum = i;
                  } else if (currentPage > totalPages - 4) {
                    pageNum = totalPages - 5 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        currentPage === pageNum
                          ? 'bg-primary text-white border-primary'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className={`p-2 rounded-lg border transition-colors ${
                  currentPage >= totalPages - 1
                    ? 'border-gray-200 text-gray-700 cursor-not-allowed'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
