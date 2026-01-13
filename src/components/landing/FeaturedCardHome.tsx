'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, Eye, Crown, Users } from 'lucide-react';

interface FeaturedProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    technologies: string[];
    thumbnailImage: string;
    viewText: string;
    likes?: number;
    views?: number;
    owner?: {
      username?: string;
      nickname?: string;
      realname?: string;
      avatarUrl?: string;
    };
    collaborators?: Array<{
      username?: string;
      nickname?: string;
      realname?: string;
      avatarUrl?: string;
    }>;
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

export function FeaturedProjectCard({ project }: FeaturedProjectCardProps) {
  const hasValidImage = isValidImageUrl(project.thumbnailImage);
  
  return (
    <div className="relative overflow-hidden rounded-2xl shadow-lg group">
      {/* Background Image */}
      <div className="relative h-80 bg-gradient-to-br from-slate-800 to-slate-900">
        {hasValidImage ? (
          <Image
            src={project.thumbnailImage}
            alt={project.title}
            fill
            className="object-cover opacity-80"
            unoptimized={project.thumbnailImage.startsWith('http')}
            onError={(e) => {
              // 이미지 로드 실패 시 기본 그라데이션만 표시
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : null}
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Status Badge and Stats */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <span className="px-3 py-1 bg-primary-500 text-white text-sm font-medium rounded-full">
            {project.status}
          </span>
          
          {/* Likes and Views */}
          {(project.likes !== undefined || project.views !== undefined) && (
            <div className="flex items-center gap-3">
              {project.likes !== undefined && (
                <div className="flex items-center gap-1 px-3 py-1 bg-red-500/80 backdrop-blur-sm text-white text-sm rounded-full font-medium">
                  <Heart className="w-4 h-4 fill-white" />
                  <span>{project.likes}</span>
                </div>
              )}
              {project.views !== undefined && (
                <div className="flex items-center gap-1 px-3 py-1 bg-blue-500/80 backdrop-blur-sm text-white text-sm rounded-full font-medium">
                  <Eye className="w-4 h-4 fill-white" />
                  <span>{project.views}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <h3 className="text-xl font-bold mb-3 leading-tight">
            {project.title}
          </h3>
          <p className="text-gray-200 text-sm mb-4 line-clamp-2">
            {project.description}
          </p>
          
          {/* Technologies */}
          <div className="flex flex-wrap gap-2 mb-4">
            {project.technologies.slice(0, 4).map((tech, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-md"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Owner and Collaborators */}
          {(project.owner || (project.collaborators && project.collaborators.length > 0)) && (
            <div className="mb-4 space-y-2">
              {/* Owner */}
              {project.owner && (
                <div className="flex items-center gap-2">
                  <Crown size={14} className="text-yellow-400" />
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden border-2 border-yellow-400 bg-gray-200">
                      <Image
                        src={project.owner.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'}
                        alt={project.owner.nickname || project.owner.realname || 'Owner'}
                        width={24}
                        height={24}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-white text-xs font-medium">
                      {project.owner.nickname || project.owner.realname || project.owner.username || '소유자'}
                    </span>
                  </div>
                </div>
              )}

              {/* Collaborators */}
              {project.collaborators && project.collaborators.length > 0 && (
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-blue-300" />
                  <div className="flex items-center gap-1.5">
                    <div className="flex -space-x-2">
                      {project.collaborators.slice(0, 3).map((collab, index) => (
                        <div 
                          key={index}
                          className="w-6 h-6 rounded-full overflow-hidden border-2 border-white/50 bg-gray-200"
                        >
                          <Image
                            src={collab.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'}
                            alt={collab.nickname || collab.realname || 'Collaborator'}
                            width={24}
                            height={24}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {project.collaborators.length > 3 && (
                        <div className="w-6 h-6 rounded-full border-2 border-white/50 bg-white/20 flex items-center justify-center">
                          <span className="text-white text-xs font-medium">+{project.collaborators.length - 3}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-white/80 text-xs">
                      {project.collaborators.length}명
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* View More Button */}
          <Link
            href={`/projects/${project.id}`}
            className="inline-flex items-center text-white hover:text-primary-300 transition-colors font-medium"
          >
            {project.viewText} →
          </Link>
        </div>
      </div>
    </div>
  );
}
