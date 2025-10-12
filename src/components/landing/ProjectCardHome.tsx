'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';

interface ProjectCardHomeProps {
  project: {
    id: string;
    title: string;
    description: string;
    status: string;
    category: string;
    collaborators: { profileImage: string }[];
    likes: number;
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
        <div className="flex items-center text-gray-400">
          <Heart className="w-4 h-4 mr-1" />
          <span className="text-sm">{project.likes}</span>
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
