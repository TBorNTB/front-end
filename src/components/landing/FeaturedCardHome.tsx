'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, Eye } from 'lucide-react';

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
