'use client';

import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect, Fragment, useRef } from 'react';
import { Menu, Transition } from '@headlessui/react';
import DocumentModal from '../_components/DocumentModal';
import { fetchProjectDetail, deleteDocument } from '@/lib/api/services/project-services';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { 
  fetchViewCount,
  incrementViewCount,
  fetchLikeCount,
  fetchLikeStatus,
  toggleLike,
  fetchComments,
  createComment,
  createReply,
  updateComment,
  deleteComment,
  fetchReplies,
  Comment,
  CommentListResponse
} from '@/lib/api/services/user-services';
import { ProjectDetailResponse } from '../../../../types/services/project';

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

// UI에 맞게 변환된 프로젝트 데이터 타입
interface MappedProject {
  id: string;
  title: string;
  subtitle: string;
  category?: string;
  author: {
    username: string;
    name: string;
    avatar: string | null;
  };
  createdAt: string;
  updatedAt: string;
  period: string;
  github?: string;
  tags: string[];
  technologies: string[];
  stats: {
    views: number;
    likes: number;
    comments: number;
  };
  description: string;
  content: string;
  team: Array<{
    name: string;
    role: string;
    username: string;
    avatar?: string | null;
  }>;
      documents: Array<{
        id: string;
        name: string;
        type: string;
        size?: string;
        uploadedAt: string;
        createdBy: string;
        thumbnailUrl?: string | null;
      }>;
  relatedProjects: Array<{
    id: string;
    title: string;
    version: string;
  }>;
  projectStatus: string;
  thumbnailUrl?: string;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  
  // Comment states
  const [comments, setComments] = useState<Comment[]>([]);
  const commentsRef = useRef<Comment[]>([]); // 현재 댓글 목록 추적용
  const [commentContent, setCommentContent] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isLoadingMoreComments, setIsLoadingMoreComments] = useState(false);
  const [commentSortDirection, setCommentSortDirection] = useState<'ASC' | 'DESC'>('DESC');
  const [nextCursorId, setNextCursorId] = useState<number>(0);
  const nextCursorIdRef = useRef<number>(0); // 최신 cursorId를 추적하기 위한 ref
  const [hasNextComments, setHasNextComments] = useState<boolean>(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());
  const [replies, setReplies] = useState<Record<number, Comment[]>>({});
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  
  // Dropdown states
  const [openSections, setOpenSections] = useState<{[key: string]: boolean}>({
    info: true,
    team: false,
    documents: true, // Open by default
    related: false,
  });

  const [project, setProject] = useState<MappedProject | null>(null);
  
  // Like states
  const [isLiked, setIsLiked] = useState(false);
  const [isTogglingLike, setIsTogglingLike] = useState(false);

  // Comment functions - useEffect보다 먼저 정의
  const loadComments = async (postId: string, direction: 'ASC' | 'DESC', reset: boolean = true) => {
    try {
      if (reset) {
        setIsLoadingComments(true);
        setNextCursorId(0);
        nextCursorIdRef.current = 0;
      } else {
        setIsLoadingMoreComments(true);
      }
      
      // reset이 false일 때는 ref에서 최신 cursorId를 가져옴
      const cursorId = reset ? 0 : nextCursorIdRef.current;
      
      console.log(`[loadComments] reset=${reset}, cursorId=${cursorId}, direction=${direction}`);
      
      const response = await fetchComments(postId, 'PROJECT', cursorId, 5, direction);
      
      console.log(`[API 응답] content.length=${response.content.length}, nextCursorId=${response.nextCursorId}, hasNext=${response.hasNext}`);
      
      if (reset) {
        // 초기 로드: 첫 5개만 표시
        setComments(response.content);
        commentsRef.current = response.content; // ref도 업데이트
      } else {
        // 더 보기: 기존 댓글은 유지하고 아래에 새로운 댓글 5개 추가
        // 상태 업데이트 함수를 사용하여 최신 상태를 가져옴
        setComments(prevComments => {
          const existingIds = new Set(prevComments.map(c => c.id));
          const newComments = response.content.filter(c => !existingIds.has(c.id));
          const updated = [...prevComments, ...newComments];
          
          commentsRef.current = updated; // ref도 업데이트
          console.log(`[더 보기] 기존 ${prevComments.length}개 + 새로운 ${newComments.length}개 = 총 ${updated.length}개`);
          
          return updated;
        });
      }
      
      // cursorId와 ref 모두 업데이트
      setNextCursorId(response.nextCursorId);
      nextCursorIdRef.current = response.nextCursorId;
      setHasNextComments(response.hasNext);
      
      // Update comment count in project stats (total count including all pages)
      // Note: API doesn't return total count, so we use current page count
      // If you need accurate total count, you may need a separate API endpoint
      if (project && reset) {
        setProject({
          ...project,
          stats: {
            ...(project.stats || { views: 0, likes: 0, comments: 0 }),
            comments: response.content.length,
          },
        });
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoadingComments(false);
      setIsLoadingMoreComments(false);
    }
  };

  const loadMoreComments = async () => {
    if (projectId && hasNextComments && !isLoadingMoreComments) {
      console.log(`[더 보기 클릭] 현재 댓글 수: ${comments.length}개, cursorId: ${nextCursorIdRef.current}, 다음 5개 로드 예정`);
      // 명시적으로 direction을 전달하고 reset=false로 설정
      await loadComments(projectId, commentSortDirection, false);
    }
  };

  useEffect(() => {
    params.then((resolvedParams) => {
      setProjectId(resolvedParams.id);
      fetchProjectData(resolvedParams.id);
      // 초기 로드 시 최신순(DESC)으로 댓글 로드
      loadComments(resolvedParams.id, 'DESC');
    });
  }, [params]);

  // Load comments when sort direction changes
  useEffect(() => {
    if (projectId) {
      loadComments(projectId, commentSortDirection, true);
    }
  }, [commentSortDirection]);

  // API 응답을 UI에 맞게 매핑하는 함수
  const mapApiResponseToUI = (apiData: ProjectDetailResponse): MappedProject => {
    // 날짜 포맷팅
    const formatDate = (dateString: string | null | undefined) => {
      if (!dateString) return 'Unknown';
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Unknown';
        return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
      } catch {
        return 'Unknown';
      }
    };

    // 프로젝트 상태 한글 변환
    const statusMap: Record<string, string> = {
      'PLANNING': '기획중',
      'IN_PROGRESS': '진행중',
      'COMPLETED': '완료',
    };

    // 기간 계산 (생성일 ~ 종료일)
    const formatDateForPeriod = (date: Date) => {
      if (isNaN(date.getTime())) return 'Unknown';
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    const createdDate = apiData.createdAt ? new Date(apiData.createdAt) : new Date();
    const endedDate = apiData.endedAt ? new Date(apiData.endedAt) : (apiData.updatedAt ? new Date(apiData.updatedAt) : new Date());
    const period = `${formatDateForPeriod(createdDate)} ~ ${formatDateForPeriod(endedDate)}`;

    // 탈퇴한 유저 확인 헬퍼 함수
    const getDisplayName = (nickname?: string, realName?: string): string => {
      if (!nickname && !realName) {
        return '탈퇴한 유저';
      }
      return nickname || realName || '탈퇴한 유저';
    };

    // Owner profile 정보 추출
    const ownerProfile = apiData.ownerProfile || {
      username: 'unknown',
      nickname: '',
      realName: '',
      profileImageUrl: '',
    };

    return {
      id: String(apiData.id),
      title: apiData.title,
      subtitle: apiData.description || '',
      author: {
        username: ownerProfile.username || 'unknown',
        name: getDisplayName(ownerProfile.nickname, ownerProfile.realName),
        avatar: ownerProfile.profileImageUrl || null,
      },
      createdAt: formatDate(apiData.createdAt),
      updatedAt: formatDate(apiData.updatedAt),
      period,
      tags: (apiData.categories || [])
        .filter(cat => cat && cat.name)
        .map(cat => cat.name),
      technologies: (apiData.techStackDtos || [])
        .filter(tech => tech && tech.name)
        .map(tech => tech.name),
      stats: {
        views: 0, // fetchProjectData에서 실제 API로 업데이트됨
        likes: 0, // fetchProjectData에서 실제 API로 업데이트됨
        comments: 0, // TODO: 댓글 수 API 필요
      },
      description: apiData.description || '',
      content: apiData.content || apiData.contentJson || '',
      team: [
        {
          name: getDisplayName(ownerProfile.nickname, ownerProfile.realName),
          role: 'Owner',
          username: ownerProfile.username || 'unknown',
          avatar: ownerProfile.profileImageUrl || null,
        },
        ...(apiData.collaborators || [])
          .filter(collab => collab && collab.profile && collab.profile.username)
          .map(collab => {
            const profile = collab.profile;
            return {
              name: getDisplayName(profile.nickname, profile.realName),
              role: 'Collaborator',
              username: profile.username || 'unknown',
              avatar: profile.profileImageUrl || null,
            };
          }),
      ],
      documents: (apiData.documentDtos || [])
        .filter(doc => doc && doc.id !== undefined)
        .map(doc => ({
          id: String(doc.id),
          name: doc.title || 'Untitled Document',
          type: 'document',
          uploadedAt: doc.createdAt ? formatDate(doc.createdAt) : 'Unknown',
          createdBy: doc.description || 'Unknown',
          thumbnailUrl: doc.thumbnailUrl || null,
        })),
      relatedProjects: [], // TODO: 연관 프로젝트 API 필요
      projectStatus: statusMap[apiData.projectStatus] || apiData.projectStatus,
      thumbnailUrl: apiData.thumbnailUrl,
    };
  };

  const fetchProjectData = async (id: string) => {
    setIsLoading(true);
    setError(null); // 에러 상태 초기화

    // 1) 기본 프로젝트 데이터 가져오기 (실패 시 Fallback)
    try {
      const response = await fetch(`/api/projects/${id}`);
      if (!response.ok) throw new Error('Failed to fetch project');
      const data = await response.json();
      setProject(data);
      setError(null); // 성공 시 에러 초기화
    } catch (error) {
      console.error('Error fetching project:', error);
      // Mock data fallback 제거 - 에러 발생 시 null로 설정하여 삭제된 게시글 처리
      setProject(null);
      setError('프로젝트를 불러오는 중 오류가 발생했습니다.');
      setImageError(false);
    }

    // 2) 상세/통계 합치기 (항상 시도)
    try {
      // 조회수 증가 API 호출 (페이지 진입 시 자동으로 조회수 증가)
      const [apiData, viewCountData, likeCountData, likeStatusData] = await Promise.all([
        fetchProjectDetail(id),
        incrementViewCount(id, 'PROJECT').catch(() => ({ viewCount: 0 })), // 조회수 증가 및 반환
        fetchLikeCount(id, 'PROJECT').catch(() => ({ likedCount: 0 })),
        fetchLikeStatus(id, 'PROJECT').catch(() => ({ likeCount: 0, status: 'NOT_LIKED' as const })),
      ]);

      const mappedData = mapApiResponseToUI(apiData);
      mappedData.stats = {
        views: viewCountData.viewCount,
        likes: likeStatusData.likeCount || likeCountData.likedCount,
        comments: 0,
      };
      setProject(mappedData);
      setIsLiked(likeStatusData.status === 'LIKED');
    } catch (error) {
      console.error('Error fetching project details:', error);
      setProject((prev) => prev); // keep whatever was set above
    } finally {
      setIsLoading(false);
    }
  };

  // Handle like toggle
  const handleLikeToggle = async () => {
    if (!projectId || isTogglingLike) return;
    
    setIsTogglingLike(true);
    try {
      const response = await toggleLike(projectId, 'PROJECT');
      setIsLiked(response.status === 'LIKED');
      
      // Update project stats
      if (project) {
        setProject({
          ...project,
          stats: {
            ...(project.stats || { views: 0, likes: 0, comments: 0 }),
            likes: response.likeCount,
          },
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // 에러 발생 시 사용자에게 알림 (선택사항)
      if (error instanceof Error && error.message.includes('로그인이 필요')) {
        alert('로그인이 필요합니다.');
      }
    } finally {
      setIsTogglingLike(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">프로젝트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 프로젝트가 없거나 에러가 있는 경우 삭제된 게시글 메시지 표시
  if (!isLoading && !project) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
            <div className="mb-4">
              <svg
                className="w-16 h-16 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">해당 게시글은 삭제 된 게시글입니다</h2>
            <p className="text-gray-600 mb-6">
              요청하신 게시글을 찾을 수 없습니다. 삭제되었거나 존재하지 않는 게시글일 수 있습니다.
            </p>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // project가 null이면 렌더링하지 않음 (위에서 이미 처리됨)
  if (!project) {
    return null;
  }

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleDocumentAction = async (docId: string, action: 'edit' | 'delete' | 'share' | 'download') => {
    switch (action) {
      case 'edit':
        router.push(`/projects/${projectId}/documents/${docId}/edit`);
        break;
      case 'delete':
        if (confirm('이 문서를 삭제하시겠습니까?')) {
          try {
            await deleteDocument(docId);
            // Refresh documents list
            setProject((prev: any) => ({
              ...prev,
              documents: prev.documents.filter((doc: any) => doc.id !== docId)
            }));
            // Refresh project data to get updated document list
            await fetchProjectData(projectId);
          } catch (error: any) {
            console.error('Delete error:', error);
            alert(error.message || '문서 삭제에 실패했습니다.');
          }
        }
        break;
      case 'share':
        // Copy share link to clipboard
        const shareUrl = `${window.location.origin}/projects/${projectId}/documents/${docId}`;
        navigator.clipboard.writeText(shareUrl);
        alert('공유 링크가 클립보드에 복사되었습니다!');
        break;
      case 'download':
        // Trigger download
        window.location.href = `/api/documents/${docId}/download`;
        break;
    }
  };

  const handleAddQuickDocument = () => {
    setIsDocModalOpen(true);
  };

  const handleAddFullDocument = () => {
    router.push(`/projects/${projectId}/documents/new`);
  };

  const handleSubmitComment = async () => {
    if (!commentContent.trim() || !projectId) return;
    
    try {
      await createComment(projectId, 'PROJECT', { content: commentContent });
      setCommentContent('');
      await loadComments(projectId, commentSortDirection, true);
      // Refresh project stats to update comment count
      if (project) {
        const response = await fetchComments(projectId, 'PROJECT', 0, 5, commentSortDirection);
        setProject({
          ...project,
          stats: {
            ...(project.stats || { views: 0, likes: 0, comments: 0 }),
            comments: response.content.length,
          },
        });
      }
    } catch (error: any) {
      console.error('Error creating comment:', error);
      alert(error.message || '댓글 작성에 실패했습니다.');
    }
  };

  const handleEditComment = async (commentId: number) => {
    if (!editContent.trim()) return;
    
    try {
      await updateComment(commentId, { content: editContent });
      setEditingCommentId(null);
      setEditContent('');
      await loadComments(projectId, commentSortDirection, true);
    } catch (error: any) {
      console.error('Error updating comment:', error);
      alert(error.message || '댓글 수정에 실패했습니다.');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;
    
    try {
      await deleteComment(commentId);
      await loadComments(projectId, commentSortDirection, true);
      // Also remove from expanded replies if it was a reply
      const newReplies = { ...replies };
      Object.keys(newReplies).forEach(parentId => {
        newReplies[Number(parentId)] = newReplies[Number(parentId)].filter(
          reply => reply.id !== commentId
        );
      });
      setReplies(newReplies);
      // Refresh project stats to update comment count
      if (project) {
        const response = await fetchComments(projectId, 'PROJECT', 0, 5, commentSortDirection);
        setProject({
          ...project,
          stats: {
            ...(project.stats || { views: 0, likes: 0, comments: 0 }),
            comments: response.content.length,
          },
        });
      }
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      alert(error.message || '댓글 삭제에 실패했습니다.');
    }
  };

  const handleLoadReplies = async (commentId: number) => {
    if (expandedReplies.has(commentId)) {
      // Collapse
      setExpandedReplies(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
      return;
    }

    try {
      const response = await fetchReplies(commentId, 0, 5, commentSortDirection);
      setReplies(prev => ({
        ...prev,
        [commentId]: response.content,
      }));
      setExpandedReplies(prev => new Set(prev).add(commentId));
    } catch (error) {
      console.error('Error loading replies:', error);
    }
  };

  const handleSubmitReply = async (parentId: number) => {
    if (!replyContent.trim() || !projectId) return;
    
    try {
      await createReply(projectId, parentId, 'PROJECT', { content: replyContent });
      setReplyingToId(null);
      setReplyContent('');
      await handleLoadReplies(parentId);
      // Reload to update reply count
      await loadComments(projectId, commentSortDirection, true);
    } catch (error: any) {
      console.error('Error creating reply:', error);
      alert(error.message || '대댓글 작성에 실패했습니다.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Back Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="container py-6">
            <Link
              href="/projects"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm">프로젝트 목록</span>
            </Link>
          </div>
        </div>

        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Sidebar */}
            <aside className="lg:col-span-3">
              <div className="lg:sticky lg:top-8 space-y-4">
                
                {/* Project Info Section */}
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => toggleSection('info')}
                    className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-bold text-gray-900">프로젝트 정보</span>
                    <svg
                      className={`w-5 h-5 text-gray-600 transition-transform ${
                        openSections.info ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {openSections.info && (
                    <div className="p-4 space-y-3 text-sm">
                      <div>
                        <p className="text-gray-600 mb-1">상태</p>
                        <span className={`px-2 py-1 rounded text-xs ${
                          project.projectStatus === '진행중' 
                            ? 'bg-green-100 text-green-700'
                            : project.projectStatus === '완료'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {project.projectStatus}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">기간</p>
                        <p className="text-gray-900">{project.period}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">사용 기술</p>
                        <div className="flex flex-wrap gap-1">
                          {(project.technologies || []).length > 0 ? (
                            (project.technologies || []).map((tech: string, idx: number) => (
                              <span key={idx} className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                                {tech}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">기술 스택 정보가 없습니다</span>
                          )}
                        </div>
                      </div>
                      {project.github && (
                        <div>
                          <p className="text-gray-600 mb-1">링크</p>
                          <a
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            <span className="text-xs">GitHub</span>
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Team Section */}
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => toggleSection('team')}
                    className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-bold text-gray-900">팀원 ({(project.team || []).length})</span>
                    <svg
                      className={`w-5 h-5 text-gray-600 transition-transform ${
                        openSections.team ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {openSections.team && (
                    <div className="p-4 space-y-3">
                      {(project.team || [])
                        .filter(member => member && member.name)
                        .map((member: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                            {member.avatar ? (
                              <ImageWithFallback
                                src={member.avatar}
                                fallbackSrc="/images/placeholder/default-avatar.svg"
                                alt={member.name || 'Member'}
                                type="avatar"
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-500">
                                {(member.name || 'U').charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {member.name || 'Unknown'}
                            </p>
                            <p className="text-xs text-gray-600 truncate">
                              {member.role || 'Member'}
                            </p>
                          </div>
                        </div>
                      ))}
                      <button className="w-full mt-2 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        팀원 추가
                      </button>
                    </div>
                  )}
                </div>

                {/* 📄 ENHANCED DOCUMENTS SECTION */}
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => toggleSection('documents')}
                    className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-bold text-gray-900">도큐먼트 ({(project.documents || []).length})</span>
                    <svg
                      className={`w-5 h-5 text-gray-600 transition-transform ${
                        openSections.documents ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {openSections.documents && (
                    <div className="p-4">
                      {/* Document List */}
                      <div className="space-y-1 mb-3">
                        {(project.documents || []).length > 0 ? (
                          (project.documents || [])
                            .filter(doc => doc && doc.id)
                            .map((doc: any) => (
                          <div
                            key={doc.id}
                            className="group flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            {/* Document Link */}
                            <Link
                              href={`/projects/${projectId}/documents/${doc.id}`}
                              className="flex items-center gap-2 flex-1 min-w-0"
                            >
                              {doc.thumbnailUrl ? (
                                <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                                  <ImageWithFallback
                                    src={doc.thumbnailUrl}
                                    fallbackSrc="/images/placeholder/document.png"
                                    alt={doc.name || 'Document'}
                                    type="article"
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900 truncate group-hover:text-primary-600 font-medium">
                                  {doc.name || 'Untitled Document'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {doc.uploadedAt || 'Unknown'} · {doc.createdBy || 'Unknown'}
                                </p>
                              </div>
                            </Link>

                            {/* Action Menu (visible on hover) */}
                            <Menu as="div" className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                              <Menu.Button className="p-1 hover:bg-gray-200 rounded-full">
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                              </Menu.Button>
                              <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                              >
                                <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white divide-y divide-gray-100 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                  <div className="p-1">
                                    <Menu.Item>
                                      {({ active }: { active: boolean }) => (
                                        <button
                                          onClick={() => router.push(`/projects/${projectId}/documents/${doc.id}`)}
                                          className={`${
                                            active ? 'bg-gray-100' : ''
                                          } group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700`}
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                          </svg>
                                          보기
                                        </button>
                                      )}
                                    </Menu.Item>
                                    <Menu.Item>
                                      {({ active }: { active: boolean }) => (
                                        <button
                                          onClick={() => handleDocumentAction(doc.id, 'edit')}
                                          className={`${
                                            active ? 'bg-gray-100' : ''
                                          } group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700`}
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                          </svg>
                                          편집
                                        </button>
                                      )}
                                    </Menu.Item>
                                    <Menu.Item>
                                      {({ active }: { active: boolean }) => (
                                        <button
                                          onClick={() => handleDocumentAction(doc.id, 'share')}
                                          className={`${
                                            active ? 'bg-gray-100' : ''
                                          } group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700`}
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                          </svg>
                                          공유
                                        </button>
                                      )}
                                    </Menu.Item>
                                    <Menu.Item>
                                      {({ active }: { active: boolean }) => (
                                        <button
                                          onClick={() => handleDocumentAction(doc.id, 'download')}
                                          className={`${
                                            active ? 'bg-gray-100' : ''
                                          } group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700`}
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                          </svg>
                                          다운로드
                                        </button>
                                      )}
                                    </Menu.Item>
                                  </div>
                                  <div className="p-1">
                                    <Menu.Item>
                                      {({ active }: { active: boolean }) => (
                                        <button
                                          onClick={() => handleDocumentAction(doc.id, 'delete')}
                                          className={`${
                                            active ? 'bg-red-50' : ''
                                          } group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600`}
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                          삭제
                                        </button>
                                      )}
                                    </Menu.Item>
                                  </div>
                                </Menu.Items>
                              </Transition>
                            </Menu>
                          </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-4">
                            문서가 없습니다
                          </p>
                        )}
                      </div>

                      {/* Add Document Buttons */}
                      <div className="space-y-2 pt-2 border-t border-gray-200">
                        <button 
                          onClick={handleAddQuickDocument}
                          className="w-full py-2 text-sm text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          도큐멘트 추가
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Related Projects Section */}
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => toggleSection('related')}
                    className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-bold text-gray-900">연관 프로젝트</span>
                    <svg
                      className={`w-5 h-5 text-gray-600 transition-transform ${
                        openSections.related ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {openSections.related && (
                    <div className="p-4 space-y-2">
                      {(project.relatedProjects || []).length > 0 ? (
                        (project.relatedProjects || []).map((related: any) => (
                          <Link
                            key={related.id}
                            href={`/projects/${related.id}`}
                            className="block p-2 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              {related.title}
                            </p>
                            <p className="text-xs text-gray-600">
                              {related.version}
                            </p>
                          </Link>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">
                          연관 프로젝트가 없습니다
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-9">
              <div className="card">
                {/* Project Header */}
                <header className="mb-8">
                  <h1 className="text-4xl font-bold text-foreground mb-3">
                    {project.title}
                  </h1>
                  <p className="text-lg text-gray-600 mb-4">
                    {project.subtitle}
                  </p>

                  {/* Author & Stats */}
                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                        {project.author?.avatar ? (
                          <ImageWithFallback
                            src={project.author.avatar}
                            fallbackSrc="/images/placeholder/default-avatar.svg"
                            alt={project.author.name || 'Author'}
                            type="avatar"
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
                            {(project.author?.name || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="font-medium">{project.author?.name || 'Unknown'}</span>
                    </div>
                    <span>👁 {project.stats?.views || 0}</span>
                    <span>❤️ {project.stats?.likes || 0}</span>
                    <span>💬 {project.stats?.comments || 0}</span>
                  </div>
                </header>

                {/* Featured Image */}
                {project.thumbnailUrl && !imageError ? (
                  <div className="relative w-full h-96 mb-8 rounded-xl overflow-hidden bg-gray-100 border border-gray-300">
                    <img 
                      src={project.thumbnailUrl} 
                      alt={project.title}
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  </div>
                ) : (
                  <div className="relative w-full h-96 mb-8 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-300">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-200 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500">프로젝트 스크린샷</p>
                    </div>
                  </div>
                )}

                {/* Description */}
                {project.description && (
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-foreground mb-4">프로젝트 개요</h2>
                    <div className="prose prose-lg max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {project.description}
                      </p>
                    </div>
                  </section>
                )}

                {/* Content */}
                {project.content && (
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-foreground mb-4">상세 내용</h2>
                    <div 
                      className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-gray-700 prose-a:text-primary-600 prose-strong:text-foreground prose-code:text-primary-600"
                      dangerouslySetInnerHTML={{ __html: project.content }}
                    />
                  </section>
                )}

                {/* Tags */}
                {(project.tags || []).length > 0 && (
                  <section className="mb-12">
                    <div className="flex flex-wrap gap-2">
                      {(project.tags || []).map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* Like Button */}
                <section className="mb-12 flex justify-center py-4">
                  <button 
                    onClick={handleLikeToggle}
                    disabled={isTogglingLike}
                    className={`flex flex-col items-center gap-2 px-8 py-4 rounded-full border-2 transition-colors group ${
                      isLiked 
                        ? 'border-red-500 bg-red-50 hover:bg-red-100' 
                        : 'border-gray-300 hover:border-primary-500 hover:bg-primary-50'
                    } ${isTogglingLike ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <svg 
                      className={`w-8 h-8 transition-colors ${
                        isLiked 
                          ? 'text-red-500 fill-red-500' 
                          : 'text-gray-400 group-hover:text-primary-600'
                      }`} 
                      fill={isLiked ? 'currentColor' : 'none'} 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    <span className={`text-2xl font-bold transition-colors ${
                      isLiked 
                        ? 'text-red-600' 
                        : 'text-gray-900 group-hover:text-primary-600'
                    }`}>
                      {project.stats?.likes || 0}
                    </span>
                    {isTogglingLike && (
                      <span className="text-xs text-gray-500">처리 중...</span>
                    )}
                  </button>
                </section>

                {/* Comments Section */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-foreground">
                      댓글 {comments.length > 0 && `(${comments.length}${hasNextComments ? '+' : ''})`}
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCommentSortDirection('DESC')}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                          commentSortDirection === 'DESC'
                            ? 'bg-primary-100 text-primary-700 font-medium'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        최신순
                      </button>
                      <button
                        onClick={() => setCommentSortDirection('ASC')}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                          commentSortDirection === 'ASC'
                            ? 'bg-primary-100 text-primary-700 font-medium'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        오래된순
                      </button>
                    </div>
                  </div>

                  {/* Comment Input */}
                  <div className="mb-8">
                    <textarea
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="댓글을 작성해주세요..."
                      className="w-full min-h-[120px] p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none bg-white mb-3"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleSubmitComment}
                        disabled={!commentContent.trim() || isLoadingComments}
                        className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        댓글 등록
                      </button>
                    </div>
                  </div>

                  {/* Comments List */}
                  {isLoadingComments ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                      <p className="text-gray-500 mt-2">댓글을 불러오는 중...</p>
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {comments.map((comment) => {
                        const getDisplayName = (user?: { nickname?: string; realName?: string }): string => {
                          if (!user || (!user.nickname && !user.realName)) {
                            return '탈퇴한 유저';
                          }
                          return user.nickname || user.realName || '탈퇴한 유저';
                        };
                        const displayName = comment.user ? getDisplayName(comment.user) : comment.username;
                        const profileImageUrl = comment.user?.profileImageUrl;
                        const initial = displayName.charAt(0).toUpperCase();

                        return (
                          <div key={`comment-${comment.id}`} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex gap-4">
                              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                {profileImageUrl ? (
                                  <ImageWithFallback
                                    src={profileImageUrl}
                                    fallbackSrc="/images/placeholder/default-avatar.svg"
                                    alt={displayName}
                                    type="avatar"
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-500">
                                    {initial}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900">{displayName}</span>
                                    <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
                                    {comment.updatedAt !== comment.createdAt && (
                                      <span className="text-xs text-gray-400">(수정됨)</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Menu as="div" className="relative">
                                    <Menu.Button className="p-1 hover:bg-gray-200 rounded-full">
                                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                      </svg>
                                    </Menu.Button>
                                    <Transition
                                      as={Fragment}
                                      enter="transition ease-out duration-100"
                                      enterFrom="transform opacity-0 scale-95"
                                      enterTo="transform opacity-100 scale-100"
                                      leave="transition ease-in duration-75"
                                      leaveFrom="transform opacity-100 scale-100"
                                      leaveTo="transform opacity-0 scale-95"
                                    >
                                      <Menu.Items className="absolute right-0 mt-2 w-32 origin-top-right bg-white divide-y divide-gray-100 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                        <div className="p-1">
                                          <Menu.Item>
                                            {({ active }: { active: boolean }) => (
                                              <button
                                                onClick={() => {
                                                  setEditingCommentId(comment.id);
                                                  setEditContent(comment.content);
                                                }}
                                                className={`${
                                                  active ? 'bg-gray-100' : ''
                                                } group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700`}
                                              >
                                                편집
                                              </button>
                                            )}
                                          </Menu.Item>
                                          <Menu.Item>
                                            {({ active }: { active: boolean }) => (
                                              <button
                                                onClick={() => handleDeleteComment(comment.id)}
                                                className={`${
                                                  active ? 'bg-red-50' : ''
                                                } group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600`}
                                              >
                                                삭제
                                              </button>
                                            )}
                                          </Menu.Item>
                                        </div>
                                      </Menu.Items>
                                    </Transition>
                                  </Menu>
                                </div>
                              </div>
                              
                              {editingCommentId === comment.id ? (
                                <div className="space-y-2">
                                  <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                                    rows={3}
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleEditComment(comment.id)}
                                      className="px-4 py-1.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700"
                                    >
                                      저장
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingCommentId(null);
                                        setEditContent('');
                                      }}
                                      className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                                    >
                                      취소
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="text-gray-700 whitespace-pre-wrap break-words">{comment.content}</p>
                                  
                                  {/* Reply button */}
                                  <div className="mt-3 flex items-center gap-4">
                                    <button
                                      onClick={() => {
                                        if (replyingToId === comment.id) {
                                          setReplyingToId(null);
                                          setReplyContent('');
                                        } else {
                                          setReplyingToId(comment.id);
                                          setReplyContent('');
                                        }
                                      }}
                                      className="text-sm text-gray-600 hover:text-primary-600"
                                    >
                                      답글
                                    </button>
                                    {comment.replyCount > 0 && (
                                      <button
                                        onClick={() => handleLoadReplies(comment.id)}
                                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                      >
                                        {expandedReplies.has(comment.id) ? '답글 숨기기' : `답글 ${comment.replyCount}개 보기`}
                                      </button>
                                    )}
                                  </div>

                                  {/* Reply input */}
                                  {replyingToId === comment.id && (
                                    <div className="mt-3 pl-4 border-l-2 border-primary-200">
                                      <textarea
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        placeholder="대댓글을 작성해주세요..."
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none mb-2"
                                        rows={2}
                                      />
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => handleSubmitReply(comment.id)}
                                          disabled={!replyContent.trim()}
                                          className="px-4 py-1.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          등록
                                        </button>
                                        <button
                                          onClick={() => {
                                            setReplyingToId(null);
                                            setReplyContent('');
                                          }}
                                          className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                                        >
                                          취소
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  {/* Replies */}
                                  {expandedReplies.has(comment.id) && replies[comment.id] && (
                                    <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-200">
                                      {replies[comment.id].map((reply) => {
                                        const replyDisplayName = reply.user ? getDisplayName(reply.user) : reply.username;
                                        const replyProfileImageUrl = reply.user?.profileImageUrl;
                                        const replyInitial = replyDisplayName.charAt(0).toUpperCase();

                                        return (
                                          <div key={`reply-${comment.id}-${reply.id}`} className="bg-white rounded-lg p-3 border border-gray-200">
                                            <div className="flex gap-3">
                                              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                                {replyProfileImageUrl ? (
                                                  <ImageWithFallback
                                                    src={replyProfileImageUrl}
                                                    fallbackSrc="/images/placeholder/default-avatar.svg"
                                                    alt={replyDisplayName}
                                                    type="avatar"
                                                    width={32}
                                                    height={32}
                                                    className="w-full h-full object-cover"
                                                  />
                                                ) : (
                                                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
                                                    {replyInitial}
                                                  </div>
                                                )}
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                  <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-gray-900">{replyDisplayName}</span>
                                                    <span className="text-xs text-gray-500">{formatDate(reply.createdAt)}</span>
                                                    {reply.updatedAt !== reply.createdAt && (
                                                      <span className="text-xs text-gray-400">(수정됨)</span>
                                                    )}
                                                  </div>
                                                  <Menu as="div" className="relative">
                                                    <Menu.Button className="p-1 hover:bg-gray-200 rounded-full">
                                                      <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                                      </svg>
                                                    </Menu.Button>
                                                    <Transition
                                                      as={Fragment}
                                                      enter="transition ease-out duration-100"
                                                      enterFrom="transform opacity-0 scale-95"
                                                      enterTo="transform opacity-100 scale-100"
                                                      leave="transition ease-in duration-75"
                                                      leaveFrom="transform opacity-100 scale-100"
                                                      leaveTo="transform opacity-0 scale-95"
                                                    >
                                                      <Menu.Items className="absolute right-0 mt-2 w-32 origin-top-right bg-white divide-y divide-gray-100 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                                        <div className="p-1">
                                                          <Menu.Item>
                                                            {({ active }: { active: boolean }) => (
                                                              <button
                                                                onClick={() => {
                                                                  setEditingCommentId(reply.id);
                                                                  setEditContent(reply.content);
                                                                }}
                                                                className={`${
                                                                  active ? 'bg-gray-100' : ''
                                                                } group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700`}
                                                              >
                                                                편집
                                                              </button>
                                                            )}
                                                          </Menu.Item>
                                                          <Menu.Item>
                                                            {({ active }: { active: boolean }) => (
                                                              <button
                                                                onClick={() => handleDeleteComment(reply.id)}
                                                                className={`${
                                                                  active ? 'bg-red-50' : ''
                                                                } group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600`}
                                                              >
                                                                삭제
                                                              </button>
                                                            )}
                                                          </Menu.Item>
                                                        </div>
                                                      </Menu.Items>
                                                    </Transition>
                                                  </Menu>
                                                </div>
                                                {editingCommentId === reply.id ? (
                                                  <div className="space-y-2 mt-2">
                                                    <textarea
                                                      value={editContent}
                                                      onChange={(e) => setEditContent(e.target.value)}
                                                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                                                      rows={2}
                                                    />
                                                    <div className="flex gap-2">
                                                      <button
                                                        onClick={() => handleEditComment(reply.id)}
                                                        className="px-3 py-1 bg-primary-600 text-white rounded-lg text-xs hover:bg-primary-700"
                                                      >
                                                        저장
                                                      </button>
                                                      <button
                                                        onClick={() => {
                                                          setEditingCommentId(null);
                                                          setEditContent('');
                                                        }}
                                                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs hover:bg-gray-300"
                                                      >
                                                        취소
                                                      </button>
                                                    </div>
                                                  </div>
                                                ) : (
                                                  <p className="text-sm text-gray-700 whitespace-pre-wrap break-words mt-1">{reply.content}</p>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        );
                      })}
                      
                      {/* Load More Button */}
                      {hasNextComments && (
                        <div className="flex justify-center mt-6">
                          <button
                            onClick={loadMoreComments}
                            disabled={isLoadingMoreComments}
                            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {isLoadingMoreComments ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                                <span>불러오는 중...</span>
                              </>
                            ) : (
                              <span>댓글 더 보기</span>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Document Modal */}
      <DocumentModal 
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        projectId={projectId}
        onSuccess={async () => {
          // Refresh project data to get updated document list
          if (projectId) {
            await fetchProjectData(projectId);
          }
        }}
      />
    </>
  );
}
