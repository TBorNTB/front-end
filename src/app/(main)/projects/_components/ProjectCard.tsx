'use client';

import Link from 'next/link';
import { ThumbsUp, Eye, Crown, Users, MessageCircle } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { decodeHtmlEntities } from '@/lib/html-utils';
import { getProjectStatusKorean, getProjectStatusColor, getProjectStatusApiValue } from '@/types/services/project';

interface ProjectCard {
  project: {
    id: string;
    title: string;
    description: string;
    status: string;
    category: string;
    categories?: string[];
    collaborators: { profileImage: string }[];
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
  collaborators: { profileImage: string }[];
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
            <div key={index} className="relative inline-block">
              <ImageWithFallback
                src={contributor.profileImage || ''}
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

export function ProjectCardHome({ project }: ProjectCard) {
  const status = getProjectStatusApiValue(project.status) ?? project.status;
  const normalizedCategories = (project.categories && project.categories.length > 0
    ? project.categories
    : [project.category]
  )
    .map((category) => decodeHtmlEntities(category || '').trim())
    .filter((category, index, array) => category.length > 0 && array.indexOf(category) === index);
  const visibleCategories = normalizedCategories.slice(0, 3);
  const remainingCategoryCount = Math.max(0, normalizedCategories.length - visibleCategories.length);

  return (
    <Link href={`/projects/${project.id}`} className="block h-full">
      <div className="group relative bg-white border border-primary-500 ring-1 ring-gray-200 rounded-xl overflow-hidden shadow-sm hover:border-primary-300 hover:ring-primary-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
        {/* Image */}
        <div className="relative overflow-hidden h-48 flex-shrink-0">
          <ImageWithFallback
            src={project.thumbnailUrl || ''}
            fallbackSrc="/images/placeholder/project.png"
            alt={decodeHtmlEntities(project.title)}
            type="project"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute top-3 left-3">
            <div className="flex flex-wrap gap-1.5 max-w-[calc(100%-4.5rem)]">
              {visibleCategories.map((category) => (
                <span
                  key={category}
                  className="bg-primary-50 backdrop-blur-sm border border-primary-200 text-primary px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                >
                  {category}
                </span>
              ))}
              {remainingCategoryCount > 0 && (
                <span className="bg-primary-50 backdrop-blur-sm border border-primary-200 text-primary px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                  +{remainingCategoryCount}
                </span>
              )}
            </div>
          </div>
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 rounded-full text-xs border font-semibold ${getProjectStatusColor(status)}`}>
              {getProjectStatusKorean(status)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col bg-white border-t border-primary-200">
          <div className="h-7 overflow-hidden mb-2">
            <h3 className="font-semibold text-lg leading-7 text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
              {decodeHtmlEntities(project.title)}
            </h3>
          </div>
          <div className="h-10 overflow-hidden mb-3">
            <p className="text-gray-700 leading-5 line-clamp-2 text-sm">
              {decodeHtmlEntities(project.description)}
            </p>
          </div>

          {/* Tech Stacks */}
          {project.techStacks && project.techStacks.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {project.techStacks.slice(0, 5).map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-secondary-100 text-secondary-700 text-xs rounded-md border border-secondary-300"
                >
                  {decodeHtmlEntities(tag)}
                </span>
              ))}
              {project.techStacks.length > 5 && (
                <span className="px-2 py-1 bg-secondary-100 text-secondary-700 text-xs rounded-md border border-secondary-300">
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

          {/* Stats + 상세 보기 */}
          <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-200 text-sm text-gray-700">
            {/* Stats */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                <span>{project.views || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <ThumbsUp className="h-3.5 w-3.5 text-secondary-500" />
                <span>{project.likes || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-3.5 w-3.5" />
                <span className="font-medium">{project.comments || 0}</span>
              </div>
            </div>

            {/* 상세 보기 Button */}
            <span
              className="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors"
            >
              상세 보기
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
