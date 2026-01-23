// app/(main)/articles/[id]/page.tsx
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, createElement, useRef, JSX } from 'react';
import { Heart, Eye, MessageCircle, Share2, Edit, Clock, ArrowLeft, Code, FileText, Trash2, X } from 'lucide-react';
import { fetchArticleById, updateArticle, deleteArticle, type ArticleResponse } from '@/lib/api/services/article-services';
import { useRouter } from 'next/navigation';
import TipTapEditor from '@/components/editor/TipTapEditor';
import { fetchCategories } from '@/lib/api/services/project-services';
import { searchCSKnowledge, searchCSKnowledgeByMember } from '@/lib/api/services/elastic-services';
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

interface BlogPostPageProps {
  params: Promise<{ id: string }>;
}

// Helper to extract headings from content
const extractHeadings = (content: string) => {
  const headings: { id: string; text: string; level: number }[] = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = `heading-${index}`;
      headings.push({ id, text, level });
    }
  });

  return headings;
};

interface PostData {
  id: string | number;
  title: string;
  category: string;
  subcategory?: string;
  content: string;
  author: {
    username: string;
    name: string;
    avatar: string | null;
  };
  publishedAt: string;
  readTime?: string;
  stats: {
    views: number;
    likes: number;
    comments: number;
  };
  tags: string[];
  relatedArticles: Array<{
    id: string;
    title: string;
    author: string;
    category: string;
    tags: string[];
    slug: string;
    createdAt?: string;
    viewCount?: number;
    likeCount?: number;
  }>;
  popularArticles: Array<{
    id: string;
    title: string;
    author: string;
    category: string;
    slug: string;
    createdAt?: string;
    viewCount?: number;
    likeCount?: number;
  }>;
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const router = useRouter();
  const [articleId, setArticleId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('');
  const [isLiked, setIsLiked] = useState(false);
  const [isTogglingLike, setIsTogglingLike] = useState(false);
  const [post, setPost] = useState<PostData | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Comment states
  const [comments, setComments] = useState<Comment[]>([]);
  const commentsRef = useRef<Comment[]>([]); // 현재 댓글 목록 추적용
  const [commentContent, setCommentContent] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isLoadingMoreComments, setIsLoadingMoreComments] = useState(false);
  const [commentSortDirection, setCommentSortDirection] = useState<'ASC' | 'DESC'>('DESC');
  const [nextCursorId, setNextCursorId] = useState<number>(0);
  const nextCursorIdRef = useRef<number>(0);
  const [hasNextComments, setHasNextComments] = useState<boolean>(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());
  const [replies, setReplies] = useState<Record<number, Comment[]>>({});
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // ✅ Next.js 15: params는 Promise라 언랩 필요
  useEffect(() => {
    let mounted = true;

    params.then((resolvedParams) => {
      if (!mounted) return;
      setArticleId(resolvedParams.id);
    });

    return () => {
      mounted = false;
    };
  }, [params]);

  // 댓글 로드 함수 (커서 기반 페이지네이션)
  // reset: true → 초기 로드 (5개만)
  // reset: false → 더 보기 클릭 시 (기존 댓글 유지 + 5개 추가)
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
      
      // 프로젝트처럼 한 번에 5개씩 로드
      const response = await fetchComments(postId, 'ARTICLE', cursorId, 5, direction);
      
      console.log(`[API 응답] content.length=${response.content.length}, nextCursorId=${response.nextCursorId}, hasNext=${response.hasNext}`);
      
      if (reset) {
        // 초기 로드: 첫 5개만 표시
        setComments(response.content);
        commentsRef.current = response.content; // ref도 업데이트
        console.log(`[초기 로드] 댓글 ${response.content.length}개 로드`);
        
        // 댓글 수 업데이트
        if (post) {
          setPost({
            ...post,
            stats: {
              ...post.stats,
              comments: response.content.length,
            },
          });
        }
      } else {
        // 더 보기: 기존 댓글은 유지하고 아래에 새로운 댓글 5개 추가
        // 상태 업데이트 함수를 사용하여 최신 상태를 가져옴
        setComments(prevComments => {
          const existingIds = new Set(prevComments.map(c => c.id));
          const newComments = response.content.filter((c: { id: any; }) => !existingIds.has(c.id));
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
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoadingComments(false);
      setIsLoadingMoreComments(false);
    }
  };

  const loadMoreComments = async () => {
    if (articleId && hasNextComments && !isLoadingMoreComments) {
      console.log(`[더 보기 클릭] 현재 댓글 수: ${comments.length}개, cursorId: ${nextCursorIdRef.current}, 다음 5개 로드 예정`);
      // 명시적으로 direction을 전달하고 reset=false로 설정
      await loadComments(articleId, commentSortDirection, false);
    }
  };

  // 좋아요 토글
  const handleToggleLike = async () => {
    if (!articleId || isTogglingLike) return;
    
    setIsTogglingLike(true);
    try {
      const response = await toggleLike(articleId, 'ARTICLE');
      setIsLiked(response.status === 'LIKED');
      
      // Update post stats
      if (post) {
        setPost({
          ...post,
          stats: {
            ...post.stats,
            likes: response.likeCount,
          },
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // 에러 발생 시 사용자에게 알림
      if (error instanceof Error && error.message.includes('로그인이 필요')) {
        alert('로그인이 필요합니다.');
      }
    } finally {
      setIsTogglingLike(false);
    }
  };

  // 아티클 삭제
  const handleDeleteArticle = async () => {
    if (!articleId) return;
    
    if (!confirm('정말로 이 아티클을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      await deleteArticle(articleId);
      alert('아티클이 성공적으로 삭제되었습니다.');
      router.push('/articles');
    } catch (error) {
      console.error('Error deleting article:', error);
      alert(error instanceof Error ? error.message : '아티클 삭제에 실패했습니다.');
    }
  };

  // 아티클 수정
  const [isEditing, setIsEditing] = useState(false);
  const [articleEditTitle, setArticleEditTitle] = useState('');
  const [articleEditContent, setArticleEditContent] = useState('');
  const [articleEditCategory, setArticleEditCategory] = useState('');
  
  // 카테고리 API 데이터
  const [categories, setCategories] = useState<Array<{ id: number; name: string; description: string }>>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const handleEditArticle = () => {
    if (!post) return;
    setArticleEditTitle(post.title);
    setArticleEditContent(post.content);
    setArticleEditCategory(post.category);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!articleId || !articleEditTitle.trim() || !articleEditContent.trim() || !articleEditCategory.trim()) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    try {
      await updateArticle(articleId, {
        title: articleEditTitle,
        content: articleEditContent,
        category: articleEditCategory,
      });
      
      alert('아티클이 성공적으로 수정되었습니다.');
      setIsEditing(false);
      // 페이지 새로고침하여 업데이트된 내용 반영
      window.location.reload();
    } catch (error) {
      console.error('Error updating article:', error);
      alert(error instanceof Error ? error.message : '아티클 수정에 실패했습니다.');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setArticleEditTitle('');
    setArticleEditContent('');
    setArticleEditCategory('');
  };

  // 카테고리 로드
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await fetchCategories();
        setCategories(response.categories);
      } catch (error) {
        console.error('Failed to load categories:', error);
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  // 댓글 작성
  const handleCreateComment = async () => {
    if (!commentContent.trim() || !articleId) return;

    try {
      await createComment(articleId, 'ARTICLE', { content: commentContent });
      setCommentContent('');
      // 댓글 목록 새로고침 (reset: true로 처음부터 다시 로드)
      await loadComments(articleId, commentSortDirection, true);
    } catch (error) {
      console.error('Error creating comment:', error);
      alert('댓글 작성에 실패했습니다.');
    }
  };

  // 댓글 수정
  const handleUpdateComment = async (commentId: number) => {
    if (!editContent.trim()) return;

    try {
      await updateComment(commentId, { content: editContent });
      setEditingCommentId(null);
      setEditContent('');
      // 댓글 목록 새로고침 (reset: true로 처음부터 다시 로드)
      await loadComments(articleId, commentSortDirection, true);
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('댓글 수정에 실패했습니다.');
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;

    try {
      await deleteComment(commentId);
      // 댓글 목록 새로고침 (reset: true로 처음부터 다시 로드)
      await loadComments(articleId, commentSortDirection, true);
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  // 대댓글 작성
  const handleCreateReply = async (parentId: number) => {
    if (!replyContent.trim() || !articleId) return;

    try {
      await createReply(articleId, parentId, 'ARTICLE', { content: replyContent });
      setReplyingToId(null);
      setReplyContent('');
      // 대댓글 목록 새로고침
      const repliesData = await fetchReplies(parentId);
      setReplies(prev => ({ ...prev, [parentId]: repliesData.content }));
      // 댓글 목록도 새로고침하여 replyCount 업데이트
      await loadComments(articleId, commentSortDirection, true);
    } catch (error) {
      console.error('Error creating reply:', error);
      alert('대댓글 작성에 실패했습니다.');
    }
  };

  // 대댓글 로드
  const loadReplies = async (commentId: number) => {
    if (replies[commentId]) {
      // 이미 로드된 경우 토글
      setExpandedReplies(prev => {
        const newSet = new Set(prev);
        if (newSet.has(commentId)) {
          newSet.delete(commentId);
        } else {
          newSet.add(commentId);
        }
        return newSet;
      });
      return;
    }

    try {
      const repliesData = await fetchReplies(commentId);
      setReplies(prev => ({ ...prev, [commentId]: repliesData.content }));
      setExpandedReplies(prev => new Set(prev).add(commentId));
    } catch (error) {
      console.error('Error loading replies:', error);
    }
  };

  // API 호출
  useEffect(() => {
    if (!articleId) return;

    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 모든 초기 데이터를 병렬로 가져오기 (최적화)
        const [articleData, viewCountData, likeCountData, likeStatusData, popularArticlesResponse] = await Promise.all([
          fetchArticleById(articleId),
          incrementViewCount(articleId, 'ARTICLE').catch(() => ({ viewCount: 0 })),
          fetchLikeCount(articleId, 'ARTICLE').catch(() => ({ likedCount: 0 })),
          fetchLikeStatus(articleId, 'ARTICLE').catch(() => ({ likeCount: 0, status: 'NOT_LIKED' as const })),
          searchCSKnowledge({ sortType: 'POPULAR', page: 0, size: 3 }).catch(() => ({ content: [], page: 0, size: 3, totalElements: 0, totalPages: 0 })),
        ]);
        
        if (articleData) {
          // 저자의 다른 글 조회 (nickname 기반으로 직접 조회 - 추가 API 호출 제거)
          const authorArticlesResponse = await searchCSKnowledgeByMember({ 
            name: articleData.nickname, 
            page: 0, 
            size: 4 // 현재 글 제외하고 3개 필요하므로 4개 가져옴
          }).catch(() => ({ content: [], page: 0, size: 4, totalElements: 0, totalPages: 0 }));

          // 인기 아티클 매핑 (현재 아티클 제외)
          const popularArticles = popularArticlesResponse.content
            .filter((item) => item.id !== articleData.id)
            .slice(0, 3)
            .map((item) => ({
              id: String(item.id),
              title: item.title,
              author: item.writer.nickname || item.writer.realname || item.writer.username,
              category: item.category,
              tags: [],
              slug: String(item.id),
              createdAt: item.createdAt,
              viewCount: item.viewCount,
              likeCount: item.likeCount,
            }));

          // 저자의 다른 글 매핑 (현재 아티클 제외)
          const authorArticles = authorArticlesResponse.content
            .filter((item) => item.id !== articleData.id)
            .slice(0, 3)
            .map((item) => ({
              id: String(item.id),
              title: item.title,
              author: item.writer.nickname || item.writer.realname || item.writer.username,
              category: item.category,
              tags: [],
              slug: String(item.id),
              createdAt: item.createdAt,
              viewCount: item.viewCount,
              likeCount: item.likeCount,
            }));

          // API 응답을 UI 형식으로 변환
          const mappedPost: PostData = {
            id: articleData.id,
            title: articleData.title,
            category: articleData.category,
            content: articleData.content,
            author: {
              username: articleData.writerId,
              name: articleData.nickname,
              avatar: null,
            },
            publishedAt: articleData.createdAt,
            readTime: `${Math.ceil(articleData.content.length / 500)}분`,
            stats: {
              views: viewCountData.viewCount,
              likes: likeStatusData.likeCount || likeCountData.likedCount,
              comments: 0, // 댓글 수는 댓글 로드 후 업데이트
            },
            tags: [], // API에 없으면 빈 배열
            relatedArticles: authorArticles,
            popularArticles: popularArticles,
          };

          setPost(mappedPost);
          setIsLiked(likeStatusData.status === 'LIKED');
          
          // 댓글은 백그라운드에서 로드 (UI 블로킹하지 않음)
          loadComments(articleId, 'DESC', true);
        } else {
          console.log('Article not found, using default data');
          setPost(null);
        }
      } catch (err) {
        console.error('Error fetching article:', err);
        setError(err instanceof Error ? err.message : '아티클을 불러오는 중 오류가 발생했습니다.');
        setPost(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

  // 댓글 정렬 방향 변경 시 재로드
  useEffect(() => {
    if (articleId) {
      loadComments(articleId, commentSortDirection, true);
    }
  }, [commentSortDirection]);

  // 기본값 설정 (API 호출 전 또는 에러 시)
  const displayPost: PostData = post || {
    id: articleId || '13',
    title: '시스템 해킹 기초 스터디 자료',
    category: 'CS 지식',
    subcategory: '시스템 해킹',
    content: `## 시스템 해킹 기초 스터디 개요

이 자료는 시스템 해킹의 기초를 다루는 스터디 자료입니다. 시스템 해킹은 컴퓨터 시스템의 취약점을 찾아내고 이를 이용하여 시스템에 접근하거나 제어하는 기술을 의미합니다. 본 자료에서는 메모리 구조, 버퍼 오버플로우, 스택 오버플로우 등 핵심 개념을 다룹니다.`,
    author: {
      username: 'PlusUltraCode',
      name: 'PlusUltraCode',
      avatar: null,
    },
    publishedAt: '2026-01-06',
    readTime: '8분',
    stats: {
      views: 1247,
      likes: 89,
      comments: 12,
    },
    tags: ['시스템 해킹', '보안', 'CS 지식', '메모리', '버퍼 오버플로우'],
    relatedArticles: [
      {
        id: '2',
        title: 'XSS 공격의 모든 것',
        author: '김동현',
        category: '스터디 노트',
        tags: ['웹 해킹', 'XSS', '보안'],
        slug: 'xss-deep-dive',
      },
      {
        id: '3',
        title: 'JWT 인증 방식의 이해',
        author: '김동현',
        category: '보안 가이드',
        tags: ['JWT', '인증', 'Token'],
        slug: 'jwt-auth',
      },
      {
        id: '4',
        title: 'React 상태 관리 완벽 가이드',
        author: '김동현',
        category: '개발 튜토리얼',
        tags: ['React', 'State', 'Frontend'],
        slug: 'react-state-management',
      },
    ],
    popularArticles: [
      {
        id: '5',
        title: '초보자를 위한 SQL Injection 기초',
        author: '박보안',
        category: '보안 가이드',
        slug: 'sql-injection-basics',
      },
      {
        id: '6',
        title: 'Nmap 스캔 옵션 완벽 가이드',
        author: '최고수',
        category: '보안 가이드',
        slug: 'nmap-guide',
      },
    ],
  };

  const tableOfContents = extractHeadings(displayPost.content);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">아티클을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러가 있고 post도 없는 경우에만 에러 화면 표시
  // post가 null이어도 displayPost는 기본값이 있으므로 계속 진행
  if (error && !post) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }


  // 개선된 renderContent: 코드 블록 지원
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    let headingIndex = 0;
    const elements: React.JSX.Element[] = [];
    let currentParagraph = '';
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeBlockLanguage = '';

    lines.forEach((line, index) => {
      // 코드 블록 시작/끝 감지
      const codeBlockMatch = line.match(/^```(\w+)?$/);
      if (codeBlockMatch) {
        if (inCodeBlock) {
          // 코드 블록 종료
          if (currentParagraph) {
            elements.push(
              <p
                key={`p-${index}`}
                className="text-gray-700 leading-relaxed mb-4"
              >
                {currentParagraph.trim()}
              </p>,
            );
            currentParagraph = '';
          }
          elements.push(
            <pre
              key={`code-${index}`}
              className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-6 border border-gray-700"
            >
              <code className="text-sm font-mono">
                {codeBlockContent.join('\n')}
              </code>
            </pre>,
          );
          codeBlockContent = [];
          codeBlockLanguage = '';
          inCodeBlock = false;
        } else {
          // 코드 블록 시작
          if (currentParagraph) {
            elements.push(
              <p
                key={`p-${index}`}
                className="text-gray-700 leading-relaxed mb-4"
              >
                {currentParagraph.trim()}
              </p>,
            );
            currentParagraph = '';
          }
          codeBlockLanguage = codeBlockMatch[1] || '';
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        if (currentParagraph) {
          elements.push(
            <p
              key={`p-${index}`}
              className="text-gray-700 leading-relaxed mb-4"
            >
              {currentParagraph.trim()}
            </p>,
          );
          currentParagraph = '';
        }

        const level = headingMatch[1].length;
        const text = headingMatch[2].trim();
        const tagName = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements;
        const id = `heading-${headingIndex}`;
        headingIndex++;

        const className = `font-bold text-foreground scroll-mt-24 ${
          level === 1
            ? 'text-3xl mt-8 mb-4'
            : level === 2
            ? 'text-2xl mt-6 mb-3'
            : 'text-xl mt-4 mb-2'
        }`;

        elements.push(
          createElement(
            tagName as string,
            { key: id, id, className },
            text,
          ),
        );
      } else if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        if (currentParagraph) {
          elements.push(
            <p
              key={`p-${index}`}
              className="text-gray-700 leading-relaxed mb-4"
            >
              {currentParagraph.trim()}
            </p>,
          );
          currentParagraph = '';
        }

        const item = line.replace(/^[•\-]\s*/, '').trim();
        if (item) {
          elements.push(
            <li key={`li-${index}`} className="text-gray-700 ml-6 mb-2 list-disc">
              {item}
            </li>,
          );
        }
      } else if (line.trim().startsWith('`') && line.trim().endsWith('`') && line.trim().length > 2) {
        // 인라인 코드
        if (currentParagraph) {
          elements.push(
            <p
              key={`p-${index}`}
              className="text-gray-700 leading-relaxed mb-4"
            >
              {currentParagraph.trim()}
            </p>,
          );
          currentParagraph = '';
        }
        const codeText = line.trim().slice(1, -1);
        elements.push(
          <code
            key={`inline-code-${index}`}
            className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono"
          >
            {codeText}
          </code>,
        );
      } else if (line.trim()) {
        currentParagraph += line + ' ';
      } else if (currentParagraph) {
        elements.push(
          <p
            key={`p-${index}`}
            className="text-gray-700 leading-relaxed mb-4"
          >
            {currentParagraph.trim()}
          </p>,
        );
        currentParagraph = '';
      }
    });

    if (inCodeBlock && codeBlockContent.length > 0) {
      elements.push(
        <pre
          key="code-final"
          className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-6 border border-gray-700"
        >
          <code className="text-sm font-mono">
            {codeBlockContent.join('\n')}
          </code>
        </pre>,
      );
    }

    if (currentParagraph) {
      elements.push(
        <p key="final-p" className="text-gray-700 leading-relaxed mb-4">
          {currentParagraph.trim()}
        </p>,
      );
    }

    return elements;
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Navigation */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container py-4">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">목록으로 돌아가기</span>
          </Link>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <article className="lg:col-span-8">
            <div className="card">
              {/* Post Header */}
              <header className="mb-8">
                <h1 className="text-4xl font-bold text-foreground mb-4">
                  {displayPost.title}
                </h1>

                {/* Author & Metadata */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {displayPost.author.avatar ? (
                      <Image
                        src={displayPost.author.avatar}
                        alt={displayPost.author.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-500">
                        {displayPost.author.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {displayPost.author.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-gray-500">
                        {new Date(displayPost.publishedAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      {displayPost.readTime && (
                        <>
                          <span className="text-gray-300">·</span>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{displayPost.readTime}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Categories & Tags */}
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                    {displayPost.category}
                  </span>
                  {displayPost.subcategory && (
                    <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                      {displayPost.subcategory}
                    </span>
                  )}
                </div>
              </header>

              {/* Stats Bar */}
              <div className="flex items-center gap-8 py-5 border-y border-gray-200 mb-8 bg-gray-50 rounded-lg px-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  <span className="text-sm font-semibold">
                    {displayPost.stats.likes}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Eye className="w-5 h-5" />
                  <span className="text-sm font-semibold">
                    {displayPost.stats.views.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-semibold">
                    {displayPost.stats.comments}
                  </span>
                </div>
              </div>

              {/* Like Button */}
              <section className="mb-12 flex justify-center py-4">
                <button 
                  onClick={handleToggleLike}
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
                    {displayPost.stats.likes}
                  </span>
                  {isTogglingLike && (
                    <span className="text-xs text-gray-500">처리 중...</span>
                  )}
                </button>
              </section>

              {/* Featured Image */}
              <div className="relative w-full h-80 mb-8 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center border border-gray-200 shadow-sm">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white shadow-md flex items-center justify-center">
                    <FileText className="w-10 h-10 text-blue-500" />
                  </div>
                  <p className="text-gray-600 font-medium">CS 지식 아티클</p>
                </div>
              </div>

              {/* Post Content */}
              <div
                ref={contentRef}
                className="prose prose-lg max-w-none mb-12"
              >
                <div className="text-gray-700 leading-relaxed space-y-4 text-base">
                  {renderContent(displayPost.content)}
                </div>
              </div>

              {/* Tags */}
              {displayPost.tags && displayPost.tags.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">태그</h3>
                  <div className="flex flex-wrap gap-2">
                    {displayPost.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer border border-blue-200"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mb-8 pb-8 border-b border-gray-200">
                <button 
                  onClick={handleEditArticle}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  <Edit className="w-4 h-4" />
                  수정
                </button>
                <button 
                  onClick={handleDeleteArticle}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  삭제
                </button>
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm border border-gray-300">
                  <Share2 className="w-4 h-4" />
                  공유
                </button>
              </div>

              {/* 수정 모달 */}
              {isEditing && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <h2 className="text-2xl font-bold mb-4">아티클 수정</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          제목 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={articleEditTitle}
                          onChange={(e) => setArticleEditTitle(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="제목을 입력하세요"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          카테고리 <span className="text-red-500">*</span>
                        </label>
                        {isLoadingCategories ? (
                          <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                            <span className="text-gray-500">카테고리 로딩 중...</span>
                          </div>
                        ) : (
                          <>
                            <div className={`border rounded-lg p-3 min-h-[120px] max-h-[200px] overflow-y-auto ${
                              !articleEditCategory ? 'border-red-300' : 'border-gray-300'
                            }`}>
                              {categories.length === 0 ? (
                                <p className="text-gray-500 text-sm">카테고리가 없습니다</p>
                              ) : (
                                <div className="space-y-2">
                                  {categories.map((cat) => {
                                    const isSelected = articleEditCategory === cat.name;
                                    return (
                                      <label
                                        key={cat.id}
                                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                                      >
                                        <input
                                          type="radio"
                                          name="editCategory"
                                          checked={isSelected}
                                          onChange={() => {
                                            setArticleEditCategory(cat.name);
                                          }}
                                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <div className="flex-1">
                                          <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                                          {cat.description && (
                                            <p className="text-xs text-gray-500 mt-0.5">{cat.description}</p>
                                          )}
                                        </div>
                                      </label>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                            {/* Selected Category Display */}
                            {articleEditCategory && (
                              <div className="mt-3">
                                <p className="text-xs text-gray-600 mb-2">선택된 카테고리:</p>
                                <div className="flex flex-wrap gap-2">
                                  <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                                    {articleEditCategory}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setArticleEditCategory('');
                                      }}
                                      className="hover:text-blue-900"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </span>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          내용 <span className="text-red-500">*</span>
                        </label>
                        <div className="border border-gray-300 rounded-lg overflow-hidden">
                          <TipTapEditor
                            content={articleEditContent}
                            onChange={(html) => setArticleEditContent(html)}
                            placeholder="내용을 입력하세요"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                      >
                        취소
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        저장
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <MessageCircle className="w-6 h-6" />
                    댓글 {comments.length > 0 ? `(${comments.length}${hasNextComments ? '+' : ''})` : ''}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCommentSortDirection('DESC')}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        commentSortDirection === 'DESC'
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      최신순
                    </button>
                    <button
                      onClick={() => setCommentSortDirection('ASC')}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        commentSortDirection === 'ASC'
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      오래된순
                    </button>
                  </div>
                </div>

                {/* 댓글 입력 */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
                  <textarea
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="댓글을 입력하세요..."
                    className="w-full min-h-[100px] p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={handleCreateComment}
                      disabled={!commentContent.trim() || isLoadingComments}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      댓글 작성
                    </button>
                  </div>
                </div>

                {/* 댓글 목록 */}
                {isLoadingComments ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2 text-sm">댓글을 불러오는 중...</p>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold text-gray-600">
                              {comment.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900">{comment.username}</span>
                                <span className="text-xs text-gray-500">
                                  {new Date(comment.createdAt).toLocaleDateString('ko-KR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {editingCommentId === comment.id ? (
                                  <>
                                    <button
                                      onClick={() => handleUpdateComment(comment.id)}
                                      className="text-xs text-blue-600 hover:text-blue-700"
                                    >
                                      저장
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingCommentId(null);
                                        setEditContent('');
                                      }}
                                      className="text-xs text-gray-500 hover:text-gray-700"
                                    >
                                      취소
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => {
                                        setEditingCommentId(comment.id);
                                        setEditContent(comment.content);
                                      }}
                                      className="text-xs text-gray-500 hover:text-gray-700"
                                    >
                                      수정
                                    </button>
                                    <button
                                      onClick={() => handleDeleteComment(comment.id)}
                                      className="text-xs text-red-500 hover:text-red-700"
                                    >
                                      삭제
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                            {editingCommentId === comment.id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                              </div>
                            ) : (
                              <p className="text-gray-700 text-sm whitespace-pre-wrap">{comment.content}</p>
                            )}
                            {comment.replyCount > 0 && (
                              <button
                                onClick={() => loadReplies(comment.id)}
                                className="mt-2 text-xs text-blue-600 hover:text-blue-700"
                              >
                                {expandedReplies.has(comment.id) ? '답글 숨기기' : `답글 ${comment.replyCount}개 보기`}
                              </button>
                            )}
                            {replyingToId === comment.id ? (
                              <div className="mt-3 space-y-2">
                                <textarea
                                  value={replyContent}
                                  onChange={(e) => setReplyContent(e.target.value)}
                                  placeholder="답글을 입력하세요..."
                                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleCreateReply(comment.id)}
                                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                                  >
                                    작성
                                  </button>
                                  <button
                                    onClick={() => {
                                      setReplyingToId(null);
                                      setReplyContent('');
                                    }}
                                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
                                  >
                                    취소
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setReplyingToId(comment.id)}
                                className="mt-2 text-xs text-gray-500 hover:text-gray-700"
                              >
                                답글 달기
                              </button>
                            )}
                            {expandedReplies.has(comment.id) && replies[comment.id] && (
                              <div className="mt-4 ml-4 space-y-3 border-l-2 border-gray-200 pl-4">
                                {replies[comment.id].map((reply) => (
                                  <div key={reply.id} className="flex items-start gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                      <span className="text-xs font-semibold text-gray-600">
                                        {reply.username.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-gray-900 text-sm">{reply.username}</span>
                                        <span className="text-xs text-gray-500">
                                          {new Date(reply.createdAt).toLocaleDateString('ko-KR')}
                                        </span>
                                      </div>
                                      <p className="text-gray-700 text-sm">{reply.content}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {hasNextComments && (
                      <div className="text-center pt-4">
                        <button
                          onClick={loadMoreComments}
                          disabled={isLoadingMoreComments}
                          className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
                        >
                          {isLoadingMoreComments ? '로딩 중...' : '더 보기'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </article>

          {/* Right Sidebar – 목차 / 인기 글 / 저자 다른 글 */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-8 space-y-6">
              {/* Table of Contents */}
              {tableOfContents.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    목차
                  </h3>
                  <nav>
                    <ul className="space-y-1.5">
                      {tableOfContents.map((heading, index) => (
                        <li
                          key={heading.id}
                          style={{
                            paddingLeft: `${(heading.level - 2) * 16}px`,
                          }}
                        >
                          <button
                            onClick={() =>
                              scrollToSection(`heading-${index}`)
                            }
                            className={`text-sm block py-2 px-3 rounded-lg transition-all text-left w-full ${
                              activeSection === `heading-${index}`
                                ? 'text-blue-700 bg-blue-50 font-semibold shadow-sm'
                                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                            }`}
                          >
                            {index + 1}. {heading.text}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              )}

              {/* Popular Articles */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-green-600" />
                  인기 아티클
                </h3>
                <div className="space-y-3">
                  {displayPost.popularArticles && displayPost.popularArticles.length > 0 ? (
                    displayPost.popularArticles.map((article) => {
                      const formatDate = (dateString?: string) => {
                        if (!dateString) return '';
                        try {
                          const date = new Date(dateString);
                          return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
                        } catch {
                          return '';
                        }
                      };
                      return (
                        <Link
                          key={article.id}
                          href={`/articles/${article.slug}`}
                          className="block group p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer bg-white hover:bg-blue-50/30"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-green-100 text-green-700 whitespace-nowrap">
                                  {article.category}
                                </span>
                                {article.viewCount !== undefined && (
                                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                                    <Eye className="w-3.5 h-3.5 text-gray-600" />
                                    <span className="text-gray-700">{article.viewCount}</span>
                                  </div>
                                )}
                                {article.likeCount !== undefined && (
                                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                                    <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                                    <span className="text-gray-700">{article.likeCount}</span>
                                  </div>
                                )}
                              </div>
                              <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1.5 line-clamp-2 leading-snug">
                                {article.title}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="font-medium">{article.author}</span>
                                {article.createdAt && (
                                  <>
                                    <span>·</span>
                                    <span>{formatDate(article.createdAt)}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </Link>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">인기 아티클이 없습니다.</p>
                  )}
                </div>
              </div>

              {/* More from Author */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Code className="w-5 h-5 text-purple-600" />
                  저자의 다른 글
                </h3>
                <div className="space-y-3">
                  {displayPost.relatedArticles && displayPost.relatedArticles.length > 0 ? (
                    displayPost.relatedArticles.map((article) => {
                      const formatDate = (dateString?: string) => {
                        if (!dateString) return '';
                        try {
                          const date = new Date(dateString);
                          return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
                        } catch {
                          return '';
                        }
                      };
                      return (
                        <Link
                          key={article.id}
                          href={`/articles/${article.slug}`}
                          className="block group p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 cursor-pointer bg-white hover:bg-purple-50/30"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-purple-100 text-purple-700 whitespace-nowrap">
                                  {article.category}
                                </span>
                                {article.viewCount !== undefined && (
                                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                                    <Eye className="w-3.5 h-3.5 text-gray-600" />
                                    <span className="text-gray-700">{article.viewCount}</span>
                                  </div>
                                )}
                                {article.likeCount !== undefined && (
                                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                                    <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                                    <span className="text-gray-700">{article.likeCount}</span>
                                  </div>
                                )}
                              </div>
                              <h4 className="text-sm font-bold text-gray-900 group-hover:text-purple-600 transition-colors mb-1.5 line-clamp-2 leading-snug">
                                {article.title}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="font-medium">{article.author}</span>
                                {article.createdAt && (
                                  <>
                                    <span>·</span>
                                    <span>{formatDate(article.createdAt)}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </Link>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">관련 아티클이 없습니다.</p>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}