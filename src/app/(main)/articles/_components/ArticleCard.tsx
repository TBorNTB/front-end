'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, Eye, MessageCircle } from 'lucide-react';

type Article = {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  topicSlug: string;
  author: {
    nickname: string;
    bio?: string;
    avatarUrl?: string;
  };
  date: string;
  readTime: string;
  views: number;
  likes: number;
  comments: number;
  tags: string[];
  image: string;
};

interface ArticleCardProps {
  article: Article;
  viewMode: 'grid' | 'list';
}

export default function ArticleCard({ article, viewMode }: ArticleCardProps) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Link
      href={`/articles/${article.id}`}
      className="block h-full group"
    >
      {children}
    </Link>
  );

  return (
    <Wrapper>
      <article
        className={`bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-primary-500 hover:shadow-lg transition-all duration-200 ${
          viewMode === 'list' ? 'flex gap-4' : ''
        }`}
      >
        {/* 썸네일 */}
        <div className={viewMode === 'list' ? 'w-64 flex-shrink-0 relative' : 'relative w-full h-48'}>
          <Image
            src={article.image}
            alt={article.title}
            fill={viewMode !== 'list'}
            width={viewMode === 'list' ? 256 : undefined}
            height={viewMode === 'list' ? 160 : undefined}
            className={`object-cover ${viewMode === 'list' ? 'h-full w-full' : ''}`}
          />
        </div>

        {/* 내용 */}
        <div className="p-5 flex-1 flex flex-col">
          {/* 카테고리 배지 */}
          {article.category && (
            <div className="mb-2">
              <span className="inline-block px-2.5 py-1 rounded-md bg-primary-50 text-primary-700 text-xs font-semibold">
                {article.category}
              </span>
            </div>
          )}

          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {article.title}
          </h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {article.excerpt}
          </p>

          {/* 태그 */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs hover:bg-gray-200 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* 통계 정보 (좋아요, 조회수, 댓글) */}
          <div className="flex items-center gap-4 mb-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 transition-colors">
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <span className="text-sm font-semibold text-red-700">{article.likes || 0}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
              <Eye className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold text-blue-700">{article.views || 0}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
              <MessageCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-semibold text-green-700">{article.comments || 0}</span>
            </div>
          </div>

          {/* 하단 메타 */}
          <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">
                {article.author.nickname}
              </span>
              {article.author.bio && (
                <span className="line-clamp-1 max-w-[160px]">
                  {article.author.bio}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span>{article.date}</span>
              <span>· {article.readTime}</span>
            </div>
          </div>
        </div>
      </article>
    </Wrapper>
  );
}
