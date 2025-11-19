// app/(main)/articles/[blog]/page.tsx

'use client';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, createElement, useRef, JSX } from 'react';

interface BlogPostPageProps {
  params: Promise<{ blog: string }>;
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

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const [slug, setSlug] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    params.then((resolvedParams) => {
      setSlug(resolvedParams.blog);
      setIsLoading(false);
    });
  }, [params]);

  // TODO: Replace with actual API call
  const post = {
    id: '1',
    slug: slug,
    title: '시스템 해킹 기초 스터디 자료',
    category: '스터디 노트',
    subcategory: '학습일지',
    content: `## 시스템 해킹 기초 스터디 개요
이 자료는 시스템 해킹의 기초를 다루는 스터디 자료입니다. 주요 내용은 다음과 같습니다.

## 수업 내용
• 메모리 구조의 이해
• 버퍼 오버플로우 공격 원리
• 스택 오버플로우 분석
• 힙 메모리 공격 기법

## 실습 환경 구성
실습은 다음과 같은 환경에서 진행됩니다:
- OS: Ubuntu 20.04 LTS
- Debugger: GDB with PEDA
- Compiler: GCC with security flags disabled

## 주요 개념 정리
Return-to-libc: 공격자가 프로그램의 실행 흐름을 조작하여 라이브러리 함수를 호출하는 기법입니다.
코드 예제는 이후에 자세히 다루겠습니다.`,
    author: {
      username: 'kimdonghyun',
      name: '김동현',
      avatar: null,
    },
    publishedAt: '2024-03-01',
    stats: {
      views: 462,
      likes: 120,
      comments: 2,
    },
    tags: ['시스템 해킹', '보안', '학습일지'],
    // Related articles (more from author) - MOVED INSIDE post object
    relatedArticles: [
      { 
        id: '2', 
        title: 'XSS 공격의 모든 것', 
        author: '김동현',
        category: '스터디 노트',
        tags: ['웹 해킹', 'XSS', '보안'],
        slug: 'xss-deep-dive' 
      },
      { 
        id: '3', 
        title: 'JWT 인증 방식의 이해', 
        author: '김동현',
        category: '보안 가이드',
        tags: ['JWT', '인증', 'Token'],
        slug: 'jwt-auth' 
      },
      { 
        id: '4', 
        title: 'React 상태 관리 완벽 가이드', 
        author: '김동현',
        category: '개발 튜토리얼',
        tags: ['React', 'State', 'Frontend'],
        slug: 'react-state-management' 
      },
    ],
    // Popular articles
    popularArticles: [
      { id: '5', title: '초보자를 위한 SQL Injection 기초', author: '박보안', slug: 'sql-injection-basics' },
      { id: '6', title: 'Nmap 스캔 옵션 완벽 가이드', author: '최고수', slug: 'nmap-guide' },
    ],
  };

  // Auto-extract table of contents from content
  const tableOfContents = extractHeadings(post.content);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!post) {
    notFound();
  }

  // Helper function to render content with IDs
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    let headingIndex = 0;
    const elements: React.JSX.Element[] = [];
    let currentParagraph = '';

    lines.forEach((line, index) => {
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        if (currentParagraph) {
          elements.push(
            <p key={`p-${index}`} className="text-gray-700 leading-relaxed mb-4">
              {currentParagraph.trim()}
            </p>
          );
          currentParagraph = '';
        }

        const level = headingMatch[1].length;
        const text = headingMatch[2].trim();
        const tagName = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements;
        const id = `heading-${headingIndex}`;
        headingIndex++;

        const className = `font-bold text-foreground scroll-mt-24 ${
          level === 1 ? 'text-3xl mt-8 mb-4' :
          level === 2 ? 'text-2xl mt-6 mb-3' :
          'text-xl mt-4 mb-2'
        }`;

        elements.push(
          createElement(
            tagName as string,
            { key: id, id, className },
            text
          )
        );
      }
      else if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        if (currentParagraph) {
          elements.push(
            <p key={`p-${index}`} className="text-gray-700 leading-relaxed mb-4">
              {currentParagraph.trim()}
            </p>
          );
          currentParagraph = '';
        }

        const item = line.replace(/^[•\-]\s*/, '').trim();
        if (item) {
          elements.push(
            <li key={`li-${index}`} className="text-gray-700 ml-6">
              {item}
            </li>
          );
        }
      }
      else if (line.trim()) {
        currentParagraph += line + ' ';
      }
      else if (currentParagraph) {
        elements.push(
          <p key={`p-${index}`} className="text-gray-700 leading-relaxed mb-4">
            {currentParagraph.trim()}
          </p>
        );
        currentParagraph = '';
      }
    });

    if (currentParagraph) {
      elements.push(
        <p key="final-p" className="text-gray-700 leading-relaxed mb-4">
          {currentParagraph.trim()}
        </p>
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
    <div className="min-h-screen bg-background">
      {/* Back Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="container py-6">
          <Link
            href="/articles"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">목록으로 돌아가기</span>
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
                <h1 className="text-4xl font-bold text-foreground mb-4">{post.title}</h1>

                {/* Author & Metadata */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {post.author.avatar ? (
                      <Image src={post.author.avatar} alt={post.author.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-500">
                        {post.author.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{post.author.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(post.publishedAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Categories & Tags */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-secondary-100 text-secondary-700">
                    {post.category}
                  </span>
                  <span className="text-sm text-gray-500">{post.subcategory}</span>
                </div>
              </header>

              {/* Stats Bar */}
              <div className="flex items-center gap-6 py-4 border-y border-gray-200 mb-8">
                <button className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors">
                  <span className="text-lg">👁</span>
                  <span className="text-sm font-medium">{post.stats.views}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors">
                  <span className="text-lg">❤️</span>
                  <span className="text-sm font-medium">{post.stats.likes}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors">
                  <span className="text-lg">💬</span>
                  <span className="text-sm font-medium">{post.stats.comments}</span>
                </button>
              </div>

              {/* Featured Image */}
              <div className="relative w-full h-96 mb-8 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-300">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-200 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">이미지 영역</p>
                </div>
              </div>

              {/* Post Content */}
              <div ref={contentRef} className="prose prose-lg max-w-none mb-12">
                <div className="text-gray-700 leading-relaxed space-y-2">
                  {renderContent(post.content)}
                </div>
              </div>

              {/* Tags */}
              <div className="mb-12">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 mb-12 pb-12 border-b border-gray-200">
                <button className="btn btn-primary">수정</button>
                <button className="btn bg-gray-100 hover:bg-gray-200">공유</button>
              </div>

              {/* Comments Section */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-6">댓글 ({post.stats.comments})</h2>

                {/* Comment Input */}
                <div className="mb-8">
                  <textarea placeholder="댓글을 작성해주세요..." className="w-full min-h-[120px] p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none bg-white" />
                  <div className="flex justify-end mt-3">
                    <button className="btn btn-primary">댓글 등록</button>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex gap-4">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-500">김</div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-900">김보람</span>
                          <span className="text-sm text-gray-500">2024-05-18</span>
                        </div>
                        <p className="text-gray-700 mb-3">정말 유익한 자료 감사합니다!</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <button className="hover:text-primary-600 transition-colors">👍 10</button>
                          <button className="hover:text-primary-600 transition-colors">답글</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex gap-4">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-500">이</div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-900">이예인</span>
                          <span className="text-sm text-gray-500">2024-05-17</span>
                        </div>
                        <p className="text-gray-700 mb-3">너무 좋은 자료입니다!</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <button className="hover:text-primary-600 transition-colors">👍 0</button>
                          <button className="hover:text-primary-600 transition-colors">답글</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </article>

          {/* Right Sidebar */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-8 space-y-6">
              {/* Table of Contents */}
              {tableOfContents.length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-bold text-foreground mb-4">목차</h3>
                  <nav>
                    <ul className="space-y-2">
                      {tableOfContents.map((heading, index) => (
                        <li key={heading.id} style={{ paddingLeft: `${(heading.level - 2) * 12}px` }}>
                          <button onClick={() => scrollToSection(heading.id)} className={`text-sm block py-1 px-3 rounded transition-colors text-left w-full ${activeSection === heading.id ? 'text-primary-700 bg-primary-50 font-medium' : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'}`}>
                            {index + 1}. {heading.text}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              )}

              {/* Popular Articles */}
              <div className="card">
                <h3 className="text-lg font-bold text-foreground mb-4">인기 아티클</h3>
                <div className="space-y-3">
                  {post.popularArticles.map((article) => (
                    <Link key={article.id} href={`/articles/${article.slug}`} className="block group">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors mb-1">
                        {article.title}
                      </p>
                      <p className="text-xs text-gray-500">by {article.author}</p>
                    </Link>
                  ))}
                </div>
              </div>

              {/* More from Author */}
              <div className="card">
                <h3 className="text-lg font-bold text-foreground mb-4">저자의 다른 글</h3>
                <div className="space-y-4">
                  {post.relatedArticles.map((article) => (
                    <Link key={article.id} href={`/articles/${article.slug}`} className="block group pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="mb-2">
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-secondary-50 text-secondary-700">
                          {article.category}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                        {article.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
                        {article.tags.map((tag, index) => (
                          <span key={index}>#{tag}</span>
                        ))}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
