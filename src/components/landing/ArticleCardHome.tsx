'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, Eye } from 'lucide-react';

interface ArticleCardHomeProps {
  article: {
    id: string;
    title: string;
    description: string;
    author: {
      name: string;
      profileImage: string;
    };
    category: string;
    thumbnailImage: string;
    likes: number;
    views: number;
    tags?: string[];
  };
}

// URL 유효성 검사 함수
const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== 'string') return false;
  if (url.trim() === '' || url === 'string' || url === 'null' || url === 'undefined') return false;
  
  // 상대 경로는 유효함 (/, /images/...)
  if (url.startsWith('/')) return true;
  
  // 절대 URL 검사
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export function ArticleCardHome({ article }: ArticleCardHomeProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Security': return 'bg-red-500';
      case 'AI Security': return 'bg-blue-500';
      case 'MT': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const hasValidImage = isValidImageUrl(article.thumbnailImage);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
      {/* Article Image */}
      <div className="relative h-48 overflow-hidden">
        {hasValidImage ? (
          <Image
            src={article.thumbnailImage}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized={article.thumbnailImage.startsWith('http')}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <span className="text-4xl text-primary-600 font-bold">
              {article.title.charAt(0)}
            </span>
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-white text-xs font-medium ${getCategoryColor(article.category)}`}>
            {article.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Author */}
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
            {article.author.profileImage ? (
              <Image
                src={article.author.profileImage}
                alt={article.author.name}
                width={32}
                height={32}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary-500 flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {article.author.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <span className="text-gray-700 text-sm font-medium">{article.author.name}</span>
        </div>

        {/* Title */}
        <Link href={`/articles/${article.id}`}>
          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors cursor-pointer">
            {article.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {article.description}
        </p>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-1 text-red-500">
              <Heart className="w-4 h-4 fill-red-500" />
              <span className="text-sm font-medium">{article.likes}</span>
            </div>
            <div className="flex items-center gap-1 text-blue-500">
              <Eye className="w-4 h-4 fill-blue-500" />
              <span className="text-sm font-medium">{article.views}</span>
            </div>
          </div>
          
          <Link href={`/articles/${article.id}`}>
            <span className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors cursor-pointer">
              Read More →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}