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

  if (variant === 'list') {
    return (
      <article className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-primary-300 hover:shadow-md transition-all duration-200 flex">
        {/* Image - Left side */}
        <div className="w-56 flex-shrink-0 relative overflow-hidden bg-gray-100">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={news.title}
              width={224}
              height={224}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
              <div className="text-primary-600 text-3xl font-bold">
                {news.title.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
        </div>

        {/* Content - Right side */}
        <div className="flex-1 p-5 flex flex-col justify-between">
          <div>
            {news.category && (
              <div className="mb-2">
                <span className="bg-primary-100 text-primary-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                  {news.category}
                </span>
              </div>
            )}
            
            <h3 className="font-bold text-base text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
              {news.title}
            </h3>
            
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {news.summary || news.content?.substring(0, 150) || ''}
            </p>
          </div>

          {/* Meta Info */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDate(news.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                <span>{news.viewCount || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" />
                <span>{news.likeCount || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Grid variant
  return (
    <article className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-primary-300 hover:shadow-lg transition-all duration-200 flex flex-col h-full">
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-100">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={news.title}
            width={400}
            height={240}
            className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-56 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <div className="text-primary-600 text-4xl font-bold">
              {news.title.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
        {news.category && (
          <div className="absolute top-3 left-3">
            <span className="bg-primary-600 text-white px-2.5 py-1 rounded-full text-xs font-semibold">
              {news.category}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex-1 mb-4">
          <h3 className="font-semibold text-base text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {news.title}
          </h3>
          
          <p className="text-sm text-gray-600 line-clamp-3">
            {news.summary || news.content?.substring(0, 150) || ''}
          </p>
        </div>

        {/* Tags */}
        {news.tags && news.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {news.tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Meta Info */}
        <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(news.createdAt)}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              <span>{news.viewCount || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" />
              <span>{news.likeCount || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
