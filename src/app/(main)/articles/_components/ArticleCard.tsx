'use client';

import Link from 'next/link';
import { ThumbsUp, Eye, MessageCircle, User } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

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
    username?: string;
    realname?: string;
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
        <div className={`${viewMode === 'list' ? 'w-64 h-40 flex-shrink-0' : 'w-full h-48'} relative`}>
          {/* 카테고리 배지 */}
          {article.category && (
            <div className="absolute top-3 right-3 z-10">
              <span className="inline-block px-2.5 py-1 rounded-md bg-white/90 backdrop-blur text-primary-700 text-xs font-semibold border border-primary-100 shadow-sm">
                {article.category}
              </span>
            </div>
          )}
          <ImageWithFallback
            src={article.image}
            type="article"
            alt={article.title}
            fill={viewMode !== 'list'}
            width={viewMode === 'list' ? 256 : undefined}
            height={viewMode === 'list' ? 160 : undefined}
            className={viewMode === 'list' ? 'w-full h-full' : ''}
          />
        </div>

        {/* 내용 */}
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {article.title}
          </h3>
          <p className="text-sm text-gray-700 mb-4 line-clamp-2">
            {article.excerpt}
          </p>

          {/* 통계 + 작성자 한 줄 (좌측 작성자, 우측 통계) */}
          <div className="flex items-center justify-between gap-3 text-sm text-gray-700 mb-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                {article.author.avatarUrl ? (
                  <ImageWithFallback
                    src={article.author.avatarUrl}
                    type="avatar"
                    width={28}
                    height={28}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-3.5 h-3.5 text-blue-600" />
                )}
              </div>
              <span className="text-xs text-gray-700 font-medium">
                {article.author.nickname || article.author.realname || '작성자'}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-gray-700" />
                <span className="font-medium text-gray-700">{article.views || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-gray-700" />
                <span className="font-medium text-gray-700">{article.likes || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-gray-700" />
                <span className="font-medium text-gray-700">{article.comments || 0}</span>
              </div>
            </div>
          </div>

          {/* 태그 */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs hover:bg-gray-200 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* 하단 메타 */}
          <div className="mt-auto flex items-center justify-between text-xs text-gray-700 pt-3 border-t border-gray-100">
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
