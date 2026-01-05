'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, Eye } from 'lucide-react';

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
  };
}

export function ProjectCardHome({ project }: ProjectCardHomeProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-500';
      case 'In Progress': return 'bg-yellow-500';
      case 'Planning': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-slate-800 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group">
      {/* Status Badge */}
      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(project.status)}`}>
          {project.status}
        </span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-red-400">
            <Heart className="w-4 h-4 fill-red-400" />
            <span className="text-sm font-medium">{project.likes}</span>
          </div>
          {project.views !== undefined && (
            <div className="flex items-center gap-1 text-blue-400">
              <Eye className="w-4 h-4 fill-blue-400" />
              <span className="text-sm font-medium">{project.views}</span>
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <Link href={`/projects/${project.id}`}>
        <h3 className="text-lg font-bold mb-3 group-hover:text-primary-400 transition-colors cursor-pointer">
          {project.title}
        </h3>
      </Link>

      {/* Description */}
      <p className="text-gray-300 text-sm mb-4 line-clamp-2">
        {project.description}
      </p>

      {/* Tech Stacks */}
      {project.techStacks && project.techStacks.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {project.techStacks.slice(0, 4).map((tech, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-slate-700 text-gray-300 text-xs rounded-md"
            >
              {tech}
            </span>
          ))}
          {project.techStacks.length > 4 && (
            <span className="px-2 py-1 bg-slate-700 text-gray-300 text-xs rounded-md">
              +{project.techStacks.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Bottom Section */}
      <div className="flex items-center justify-between">
        {/* Collaborators */}
        <div className="flex items-center">
          <div className="flex -space-x-2">
            {project.collaborators.slice(0, 3).map((collaborator, index) => (
              <div key={index} className="w-6 h-6 rounded-full overflow-hidden border-2 border-slate-800">
                {collaborator.profileImage ? (
                  <Image
                    src={collaborator.profileImage}
                    alt="Collaborator"
                    width={24}
                    height={24}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary-500 flex items-center justify-center">
                    <span className="text-xs text-white font-bold">U</span>
                  </div>
                )}
              </div>
            ))}
            {project.collaborators.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-gray-600 border-2 border-slate-800 flex items-center justify-center">
                <span className="text-xs text-white">+{project.collaborators.length - 3}</span>
              </div>
            )}
          </div>
        </div>

        {/* Arrow Icon */}
        <Link href={`/projects/${project.id}`}>
          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center group-hover:bg-primary-600 transition-colors cursor-pointer">
            <span className="text-white text-sm">→</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
