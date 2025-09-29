"use client";

import { useState, useMemo } from "react";
import { ProjectC } from "@/types/project";
import { mockProjects } from "@/mocks/mockProjectCards";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon-picker";
import SimpleProjectCard from "@/components/common/SimpleProjectCard";

export default function MyProjectsPage() {
  const userProjects = mockProjects;
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");

  const sortedProjects = useMemo(() => {
    return [...userProjects].sort((a, b) => {
      // Note: Using a real date field is better than ID for sorting
      const dateA = new Date(a.id).getTime();
      const dateB = new Date(b.id).getTime();
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
    });
  }, [userProjects, sortOrder]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "latest" ? "oldest" : "latest")}
            className="w-28"
          >
            <Icon
              name={sortOrder === "latest" ? "arrow-down-wide-narrow" : "arrow-up-wide-narrow"}
              className="mr-2 h-4 w-4"
            />
            {sortOrder === "latest" ? "최신순" : "오래된순"}
          </Button>
        </div>
        <Button variant="outline" size="sm">
          <Icon name="pin" className="mr-2 h-4 w-4" />
          대표 프로젝트 수정
        </Button>
      </div>

      {sortedProjects.length > 0 ? (
        // Use the new, simpler card in the grid
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedProjects.map((project) => (
            <SimpleProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-500">
          참여중인 프로젝트가 없습니다.
        </div>
      )}
    </div>
  );
}
