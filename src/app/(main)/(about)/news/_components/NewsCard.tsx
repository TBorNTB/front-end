'use client';

import Image from 'next/image';
import { Calendar, Eye, Heart, User } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content?: string;
  thumbnailPath?: string;
  writerId: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  viewCount: number;
  category?: string;
}

interface NewsCardProps {
  news: NewsItem;
  variant?: 'grid' | 'list';
}

export function NewsCard({ news, variant = 'grid' }: NewsCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isValidImageUrl = (url?: string): string | null => {
    if (!url || url === 'null' || url === 'undefined') return null;
    if (url.startsWith('/')) return url;
    try {
      new URL(url);
      return url;
    } catch {
      return null;
    }
  };

  const thumbnailUrl = isValidImageUrl(news.thumbnailPath);

  return (
    <article className={`group bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-primary hover:shadow-lg transition-all duration-200 hover:-translate-y-1 ${
      variant === 'list' ? 'flex gap-6' : ''
    }`}>
      {/* Image */}
      <div className={`relative ${variant === 'list' ? 'w-64 flex-shrink-0' : ''}`}>
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={news.title}
            width={400}
            height={250}
            className={`w-full object-cover ${variant === 'list' ? 'h-full' : 'h-48'}`}
          />
        ) : (
          <div className={`w-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center ${variant === 'list' ? 'h-full' : 'h-48'}`}>
            <div className="text-primary-600 text-4xl font-bold">
              {news.title.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
        {news.category && (
          <div className="absolute top-3 left-3">
            <span className="bg-primary text-white px-2 py-1 rounded-full text-xs font-medium">
              {news.category}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className={`font-bold text-gray-900 mb-2 line-clamp-2 ${
            variant === 'list' ? 'text-xl' : 'text-lg'
          }`}>
            {news.title}
          </h3>
          
          <p className={`text-gray-600 mb-4 leading-relaxed ${
            variant === 'list' ? 'line-clamp-2' : 'line-clamp-3 text-sm'
          }`}>
            {news.summary || news.content?.substring(0, 150) || ''}
          </p>
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{news.writerId || '작성자'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(news.createdAt)}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{news.viewCount || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              <span>{news.likeCount || 0}</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        {news.tags && news.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {news.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                {tag}
              </span>
            ))}
            {news.tags.length > 3 && (
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                +{news.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
