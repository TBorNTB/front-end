'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ThumbsUp, Eye, Crown, Users, MessageCircle } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { decodeHtmlEntities } from '@/lib/html-utils';
import { fetchLikeStatus } from '@/lib/api/services/user-services';
import { getProjectStatusKorean, getProjectStatusColor } from '@/types/services/project';
import {
  PROJECT_LIKE_UPDATED_EVENT_NAME,
  ProjectLikeUpdatedDetail,
  isProjectLikedFromCache,
  setProjectLikedInCache,
} from '@/lib/article-like-sync';

interface ProjectCardHomeProps {
  project: {
    id: string;
    title: string;
    description: string;
    status: string;
    category: string;
    collaborators: { profileImage: string; username?: string; nickname?: string; realname?: string }[];
    likes: number;
    views?: number;
    comments?: number;
    techStacks?: string[];
    owner?: {
      username?: string;
      nickname?: string;
      realname?: string;
      avatarUrl?: string;
    };
    thumbnailUrl?: string;
  };
}

// Avatar Stack Component
const AvatarStack = ({
  owner,
  collaborators,
  maxVisible = 3
}: {
  owner?: { username?: string; nickname?: string; realname?: string; profileImageUrl?: string };
  collaborators: { profileImage: string; username?: string; nickname?: string; realname?: string }[];
  maxVisible?: number;
}) => {
  const visibleContributors = collaborators.slice(0, maxVisible);
  const remainingCount = collaborators.length - maxVisible;

  const ownerName = owner?.nickname || owner?.realname || owner?.username || 'Unknown';

  return (
  <div className="space-y-2 flex items-center justify-between">
  {/* Owner Section */}
  {owner && (
    <div className="flex items-center gap-2 relative">
      <div className="relative inline-block" title={ownerName}>
        {/* Avatar */}
        <ImageWithFallback
          src={owner.profileImageUrl || ''}
          fallbackSrc="/images/placeholder/default-avatar.svg"
          alt={ownerName}
                width={24}
                height={24}
                className="w-6 h-6 rounded-full border-2 border-yellow-400 bg-gray-200 shadow-sm"
        />
        {/* Crown above avatar */}
        <Crown
        size={12}
        className="absolute -top-1.5 right-0.5 text-yellow-500 fill-yellow-500 drop-shadow transform"
        style={{ rotate: '20deg' }}
      />
      </div>
      <span
        className="text-xs text-gray-700 font-medium"
        title={ownerName}
      >
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
            <div
              key={index}
              className="relative inline-block"
              title={contributor.nickname || contributor.realname || contributor.username || '협력자'}
            >
              <ImageWithFallback
                src={contributor.profileImage || ''}
                fallbackSrc="/images/placeholder/default-avatar.svg"
                alt={contributor.nickname || contributor.realname || contributor.username || '협력자'}
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

export function ProjectCardHome({ project }: ProjectCardHomeProps) {
  const [likedState, setLikedState] = useState<boolean>(false);

  useEffect(() => {
    setLikedState(isProjectLikedFromCache(project.id));
  }, [project.id]);

  useEffect(() => {
    let mounted = true;

    if (isProjectLikedFromCache(project.id)) return;

    fetchLikeStatus(project.id, 'PROJECT')
      .then((res) => {
        if (!mounted) return;
        const nextLiked = res.status === 'LIKED';
        setLikedState(nextLiked);
        if (nextLiked) {
          setProjectLikedInCache(project.id, true);
        }
      })
      .catch(() => {
        // Ignore like-status failures for guests/network issues
      });

    return () => {
      mounted = false;
    };
  }, [project.id]);

  useEffect(() => {
    const onLikeUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<ProjectLikeUpdatedDetail>;
      if (String(customEvent.detail.projectId) !== String(project.id)) return;
      setLikedState(customEvent.detail.isLiked);
    };

    window.addEventListener(PROJECT_LIKE_UPDATED_EVENT_NAME, onLikeUpdated as EventListener);
    return () => {
      window.removeEventListener(PROJECT_LIKE_UPDATED_EVENT_NAME, onLikeUpdated as EventListener);
    };
  }, [project.id]);

  return (
    <Link href={`/projects/${project.id}`} className="block">
      <div className="group relative bg-white border border-gray-300 ring-1 ring-gray-200 rounded-xl overflow-hidden shadow-sm hover:border-primary-300 hover:ring-primary-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        {/* Image */}
        <div className="relative overflow-hidden h-56">
          <ImageWithFallback
            src={project.thumbnailUrl || ''}
            fallbackSrc="/images/placeholder/project.png"
            alt={decodeHtmlEntities(project.title)}
            type="project"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute top-3 left-3">
            <span className="bg-white/90 backdrop-blur-sm border border-gray-200 text-primary px-2 py-1 rounded-full text-xs font-medium">
              {decodeHtmlEntities(project.category)}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 rounded-full text-xs border font-semibold ${getProjectStatusColor(project.status)}`}>
              {getProjectStatusKorean(project.status)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col bg-white border-t border-gray-100">
          <h3 className="font-semibold text-base text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {decodeHtmlEntities(project.title)}
          </h3>
          <p className="text-gray-700 mb-3 leading-relaxed line-clamp-3 text-sm">
            {decodeHtmlEntities(project.description)}
          </p>

          {/* Tags */}
          {project.techStacks && project.techStacks.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {project.techStacks.slice(0, 5).map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-white text-gray-700 text-xs rounded-md border border-gray-300"
                >
                  {decodeHtmlEntities(tag)}
                </span>
              ))}
              {project.techStacks.length > 5 && (
                <span className="px-2 py-1 bg-white text-gray-700 text-xs rounded-md border border-gray-300">
                  +{project.techStacks.length - 5}
                </span>
              )}
            </div>
          )}

          {/* Contributors */}
          <div className="mb-3">
            <AvatarStack
              owner={project.owner}
              collaborators={project.collaborators}
            />
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mb-3 pt-3 border-t border-gray-200 text-sm text-gray-700">
              <div className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                <span>{project.views || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <ThumbsUp className={`h-3.5 w-3.5 ${likedState ? 'fill-secondary-500 text-secondary-500' : 'text-gray-600'}`} />
                <span>{project.likes || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-3.5 w-3.5" />
                <span className="font-medium ">{project.comments || 0}</span>
              </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
