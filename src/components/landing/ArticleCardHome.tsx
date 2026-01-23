'use client';

import Link from 'next/link';
import { Heart, Eye, Calendar } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

interface ArticleCardHomeProps {
  article: {
    id: string;
    title: string;
    description?: string;
    excerpt?: string;
    author: {
      name: string;
      profileImage: string;
    };
    category: string;
    thumbnailImage: string;
    likes: number;
    views: number;
    tags?: string[];
    createdAt?: string;
  };
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export function ArticleCardHome({ article }: ArticleCardHomeProps) {
  const defaultAvatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face';

  return (
    <Link href={`/community/news/${article.id}`}>
      <article className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-primary hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
        {/* Image */}
        <div className="relative h-56 overflow-hidden">
          <ImageWithFallback
            src={article.thumbnailImage}
            fallbackSrc="/images/placeholder/article.png"
            alt={article.title}
            width={400}
            height={224}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          
          {/* Category Badge */}
          {article.category && (
            <div className="absolute top-3 left-3">
              <span className="bg-white/90 backdrop-blur-sm border border-gray-200 text-primary px-2 py-1 rounded-full text-xs font-medium">
                {article.category}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex-1 mb-4">
            <h3 className="font-semibold text-base text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
              {article.title}
            </h3>
            
            <p className="text-sm text-gray-600 line-clamp-3">
              {article.excerpt || article.description || ''}
            </p>
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {article.tags.slice(0, 2).map((tag, index) => (
                <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Author */}
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-white bg-gray-200">
                <ImageWithFallback
                  src={article.author.profileImage}
                  fallbackSrc="/images/placeholder/default-avatar.svg"
                  alt={article.author.name}
                  width={28}
                  height={28}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs text-gray-700 font-medium">
                {article.author.name}
              </span>
            </div>
          </div>

          {/* Meta Info */}
          <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(article.createdAt)}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                <span>{article.views || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" />
                <span>{article.likes || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
