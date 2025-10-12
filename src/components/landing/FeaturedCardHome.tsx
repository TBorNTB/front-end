'use client';

import Image from 'next/image';
import Link from 'next/link';

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
  };
}

export function FeaturedProjectCard({ project }: FeaturedProjectCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl shadow-lg group">
      {/* Background Image */}
      <div className="relative h-80 bg-gradient-to-br from-slate-800 to-slate-900">
        {project.thumbnailImage && (
          <Image
            src={project.thumbnailImage}
            alt={project.title}
            fill
            className="object-cover opacity-80"
          />
        )}
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-primary-500 text-white text-sm font-medium rounded-full">
            {project.status}
          </span>
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
