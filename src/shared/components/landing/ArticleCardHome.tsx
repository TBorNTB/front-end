'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageCircle } from 'lucide-react';

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
    comments: number;
  };
}

export function ArticleCardHome({ article }: ArticleCardHomeProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Security': return 'bg-red-500';
      case 'AI Security': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
      {/* Article Image */}
      <div className="relative h-48 overflow-hidden">
        {article.thumbnailImage ? (
          <Image
            src={article.thumbnailImage}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
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

        {/* Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-gray-500">
            <div className="flex items-center">
              <Heart className="w-4 h-4 mr-1" />
              <span className="text-sm">{article.likes}</span>
            </div>
            <div className="flex items-center">
              <MessageCircle className="w-4 h-4 mr-1" />
              <span className="text-sm">{article.comments}</span>
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
