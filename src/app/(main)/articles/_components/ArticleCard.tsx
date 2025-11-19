'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Article } from '../types/CSnotes';
import { Calendar, Eye, Heart, Clock, MessageCircle } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  variant?: 'grid' | 'list' | 'featured';
}

export function ArticleCard({ article, variant = 'grid' }: ArticleCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCardClassName = () => {
    switch (variant) {
      case 'featured':
        return 'card md:flex md:flex-row gap-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1';
      case 'list':
        return 'card flex flex-col sm:flex-row gap-4 hover:shadow-lg transition-shadow duration-300';
      default:
        return 'card group hover:shadow-lg transition-all duration-300 hover:-translate-y-1';
    }
  };

  return (
    <article className={getCardClassName()}>
      {/* Article Image */}
      <div className={`relative overflow-hidden rounded-lg ${
        variant === 'featured' 
          ? 'md:w-2/5 h-64 md:h-80'
          : variant === 'list'
          ? 'sm:w-1/3 h-48 sm:h-full'
          : 'h-48 mb-4'
      }`}>
        {article.thumbnailImage ? (
          <Image
            src={article.thumbnailImage}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-secondary-100 to-secondary-200 flex items-center justify-center">
            <div className="text-secondary-600 text-4xl font-bold">
              {article.title.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
        
        {/* Featured Badge */}
        {article.featured && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 bg-primary-500 text-white rounded-full text-xs font-medium">
              Featured
            </span>
          </div>
        )}
      </div>

      {/* Article Content */}
      <div className={
        variant === 'featured' 
          ? 'md:w-3/5 flex flex-col justify-between'
          : variant === 'list'
          ? 'sm:w-2/3 flex flex-col'
          : ''
      }>
        {/* Category & Read Time */}
        <div className="flex items-center justify-between mb-3">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium text-secondary-700 bg-secondary-100">
            {article.category.name}
          </span>
          <div className="flex items-center text-gray-500 text-sm">
            <Clock className="w-4 h-4 mr-1" />
            {article.readTime} min read
          </div>
        </div>

        {/* Title */}
        <Link href={`/articles/${article.id}`} className="group">
          <h3 className={`font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors ${
            variant === 'featured' ? 'text-2xl' : 'text-xl'
          }`}>
            {article.title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">
          {article.excerpt}
        </p>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {article.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-primary-50 text-primary-600 rounded-md text-xs font-medium hover:bg-primary-100 transition-colors cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
              {article.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                  +{article.tags.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Author Info */}
        <div className="flex items-center mb-4">
          <div className="flex items-center space-x-3">
            {article.author.profileImage ? (
              <Image
                src={article.author.profileImage}
                alt={article.author.nickname}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {article.author.nickname.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">
                {article.author.nickname}
              </p>
              {article.author.bio && (
                <p className="text-xs text-gray-500 line-clamp-1">
                  {article.author.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDate(article.publishedAt || article.createdAt)}
            </div>
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {article.viewCount || 0}
            </div>
            <div className="flex items-center">
              <Heart className="w-4 h-4 mr-1" />
              {article.likeCount || 0}
            </div>
            <div className="flex items-center">
              <MessageCircle className="w-4 h-4 mr-1" />
              {article.commentCount || 0}
            </div>
          </div>
          
          <Link 
            href={`/articles/${article.id}`}
            className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            Read More →
          </Link>
        </div>
      </div>
    </article>
  );
}
