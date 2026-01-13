'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, Eye, Crown, Users } from 'lucide-react';

interface ProjectCardHomeProps {
  project: {
    id: string;
    title: string;
    description: string;
    status: string;
    category: string;
    collaborators: { profileImage: string }[];
    likes: number;
    views?: number;
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

const getStatusColor = (status: string) => {
  switch (status) {
    case '완료': return 'bg-green-100 text-green-700 border-green-300';
    case '계획중': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case '진행중': return 'bg-blue-100 text-blue-700 border-blue-300';
    default: return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

const getValidImageUrl = (url: string | null | undefined): string => {
  const defaultImageUrl = 'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=800';
  if (!url || typeof url !== 'string' || !url.trim()) return defaultImageUrl;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) return url;
  return defaultImageUrl;
};

// Avatar Stack Component
const AvatarStack = ({
  owner,
  collaborators,
  maxVisible = 3
}: {
  owner?: { username?: string; nickname?: string; realname?: string; avatarUrl?: string };
  collaborators: { profileImage: string }[];
  maxVisible?: number;
}) => {
  const visibleContributors = collaborators.slice(0, maxVisible);
  const remainingCount = collaborators.length - maxVisible;

  const ownerAvatar = owner?.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face';
  const ownerName = owner?.nickname || owner?.realname || owner?.username || 'Unknown';

  return (
    <div className="space-y-2">
      {/* Owner Section */}
      {owner && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Crown size={14} className="text-yellow-500" />
            <span className="text-xs font-medium text-gray-600">소유자</span>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="relative inline-block"
              title={ownerName}
            >
              <Image
                src={ownerAvatar}
                alt={ownerName}
                width={28}
                height={28}
                className="w-7 h-7 rounded-full border-2 border-yellow-400 bg-gray-200 hover:z-10 relative shadow-sm"
              />
            </div>
            <span 
              className="text-xs text-gray-700 font-medium"
              title={ownerName}
            >
              {ownerName}
            </span>
          </div>
        </div>
      )}

      {/* Collaborators Section */}
      {collaborators.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Users size={14} className="text-blue-500" />
            <span className="text-xs font-medium text-gray-600">협력자</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-2">
              {visibleContributors.map((contributor, index) => (
                <div 
                  key={index} 
                  className="relative inline-block"
                >
                  <Image
                    src={contributor.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'}
                    alt="Collaborator"
                    width={24}
                    height={24}
                    className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 hover:z-10 relative"
                  />
                </div>
              ))}
              {remainingCount > 0 && (
                <div
                  className="w-6 h-6 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center relative"
                  title={`+${remainingCount} more contributors`}
                >
                  <span className="text-xs font-medium text-gray-600">+{remainingCount}</span>
                </div>
              )}
            </div>
            <span className="text-xs text-gray-500">
              {collaborators.length}명
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export function ProjectCardHome({ project }: ProjectCardHomeProps) {
  const projectImage = getValidImageUrl(project.thumbnailUrl);

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-primary hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
        {/* Image */}
        <div className="relative overflow-hidden">
          <Image
            src={projectImage}
            alt={project.title}
            width={400}
            height={240}
            className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute top-3 left-3">
            <span className="bg-white/90 backdrop-blur-sm border border-gray-200 text-primary px-2 py-1 rounded-full text-xs font-medium">
              {project.category}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="font-semibold text-base text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {project.title}
          </h3>
          <p className="text-gray-600 mb-3 leading-relaxed line-clamp-3 text-sm">
            {project.description}
          </p>

          {/* Tags */}
          {project.techStacks && project.techStacks.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {project.techStacks.slice(0, 5).map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md border border-gray-200"
                >
                  {tag}
                </span>
              ))}
              {project.techStacks.length > 5 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md border border-gray-200">
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
          <div className="flex items-center gap-4 mb-3 text-sm">
            <div className="flex items-center gap-1 text-gray-700 font-medium">
              <Heart size={16} className="text-red-500 fill-red-500" />
              <span>{project.likes || 0}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-700 font-medium">
              <Eye size={16} className="text-blue-600" />
              <span>{project.views || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
