'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Eye, ThumbsUp, User, Crown, Users, MessageCircle } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { formatDateText } from '@/components/ui/date';
import { decodeHtmlEntities } from '@/lib/html-utils';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content?: string;
  thumbnailUrl?: string;
  writerId: string;
  writer?: {
    username: string;
    nickname: string;
    realname: string;
    avatar: string;
  };
  participants?: Array<{
    username: string;
    nickname: string;
    realname: string;
    avatar: string;
  }>;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  viewCount: number;
  commentsCount: number;
  category?: string;
}

interface NewsCardProps {
  news: NewsItem;
  variant?: 'grid' | 'list';
}

// Avatar Stack Component for Owner and Participants
const AvatarStack = ({
  writer,
  participants,
  maxVisible = 3
}: {
  writer: { username: string; nickname: string; realname: string; avatar: string };
  participants: { username: string; nickname: string; realname: string; avatar: string }[];
  maxVisible?: number;
}) => {
  const owner = writer;
  const collaborators = participants;
  const visibleContributors = collaborators.slice(0, maxVisible);
  const remainingCount = collaborators.length - maxVisible;
  const ownerName = owner?.nickname || owner?.realname || owner?.username || 'Unknown';

  return (
    <div className="space-y-2 flex items-center justify-between">
      {/* Owner Section */}
      {owner && (
        <div className="flex items-center gap-2 relative">
          <div className="relative inline-block" title={ownerName}>
            <ImageWithFallback
              src={owner.avatar || ''}
              fallbackSrc="/images/placeholder/default-avatar.svg"
              alt={ownerName}
              width={24}
              height={24}
              className="w-6 h-6 rounded-full border-2 border-yellow-400 bg-gray-200 shadow-sm"
            />
            <Crown
              size={12}
              className="absolute -top-1.5 right-0.5 text-yellow-500 fill-yellow-500 drop-shadow transform"
              style={{ rotate: '20deg' }}
            />
          </div>
          <span className="text-xs text-gray-700 font-medium" title={ownerName}>
            {ownerName}
          </span>
        </div>
      )}

      {/* Collaborators Section */}
      {collaborators.length > 0 && (
        <div className="flex items-center gap-2">
          <Users size={14} className="text-secondary-500" />
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-2">
              {visibleContributors.map((contributor, index) => (
                <div key={index} className="relative inline-block">
                  <ImageWithFallback
                    src={contributor.avatar || ''}
                    fallbackSrc="/images/placeholder/default-avatar.svg"
                    alt="Collaborator"
                    width={24}
                    height={24}
                    className="w-6 h-6 rounded-full border-2 border-white bg-gray-200"
                  />
                </div>
              ))}
              {remainingCount > 0 && (
                <div
                  className="w-6 h-6 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center relative"
                  title={`+${remainingCount} more contributors`}
                >
                  <span className="text-xs font-medium text-gray-700">
                    +{remainingCount}
                  </span>
                </div>
              )}
            </div>
            <span className="text-xs text-gray-700">
              {collaborators.length}명
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export function NewsCard({ news, variant = 'grid' }: NewsCardProps) {
  const formatDate = (dateString: string) => {
    return formatDateText(dateString, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Default writer and participants
  const writer = news.writer || {
    username: '',
    nickname: news.writerId || 'Unknown',
    realname: '',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
  };
  const participants = news.participants || [];

  if (variant === 'list') {
    return (
      <Link href={`/community/news/${news.id}`}>
        <article className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-primary-300 hover:shadow-md transition-all duration-200 flex cursor-pointer">
        {/* Image - Left side */}
        <div className="w-56 flex-shrink-0 relative overflow-hidden bg-gray-100">
          <ImageWithFallback
            src={news.thumbnailUrl || ''}
            type="news"
            alt={news.title}
            width={224}
            height={224}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>

        {/* Content - Right side */}
        <div className="flex-1 p-5 flex flex-col justify-between">
          <div>
            {news.category && (
              <div className="mb-2">
                <span className="bg-primary-100 text-primary-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                  {decodeHtmlEntities(news.category)}
                </span>
              </div>
            )}
            
            <h3 className="font-bold text-base text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
              {decodeHtmlEntities(news.title)}
            </h3>
            
            <p className="text-sm text-gray-700 mb-3 line-clamp-2">
              {decodeHtmlEntities(news.summary || news.content?.substring(0, 150) || '')}
            </p>
          </div>

          {/* Owner and Participants */}
          <div className="mb-3">
            <AvatarStack writer={writer} participants={participants} />
          </div>

          {/* Meta Info */}
          <div className="flex items-center justify-between text-xs text-gray-700">
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
                <ThumbsUp className="h-3.5 w-3.5" />
                <span>{news.likeCount || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-gray-700" />
                <span className="font-medium text-gray-700">{news.commentsCount || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </article>
      </Link>
    );
  }

  // Grid variant
  return (
    <Link href={`/community/news/${news.id}`}>
      <article className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-primary-300 hover:shadow-lg transition-all duration-200 flex flex-col h-full cursor-pointer">
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-100 h-56">
        <ImageWithFallback
          src={news.thumbnailUrl || ''}
          type="news"
          alt={news.title}
          width={400}
          height={240}
          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-200"
        />
        {news.category && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-primary-600 text-white px-2.5 py-1 rounded-full text-xs font-semibold">
              {decodeHtmlEntities(news.category)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex-1 mb-4">
          <h3 className="font-semibold text-base text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {decodeHtmlEntities(news.title)}
          </h3>
          
          <p className="text-sm text-gray-700 line-clamp-3">
            {decodeHtmlEntities(news.summary || news.content?.substring(0, 150) || '')}
          </p>
        </div>

        {/* Tags */}
        {news.tags && news.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {news.tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                #{decodeHtmlEntities(tag)}
              </span>
            ))}
          </div>
        )}

        {/* Owner and Participants */}
        <div className="mb-3">
          <AvatarStack writer={writer} participants={participants} />
        </div>

        {/* Meta Info */}
        <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-xs text-gray-700">
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
              <ThumbsUp className="h-3.5 w-3.5" />
              <span>{news.likeCount || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-gray-700" />
              <span className="font-medium text-gray-700">{news.commentsCount || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
    </Link>
  );
}
