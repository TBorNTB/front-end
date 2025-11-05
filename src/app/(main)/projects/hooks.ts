/*import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { projectsApi } from './api';
import { Project, ProjectFilters, ProjectFormData } from './types';

export function useProjects(initialFilters?: ProjectFilters) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filters, setFilters] = useState<ProjectFilters>(initialFilters || {});
  const router = useRouter();

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await projectsApi.getProjects(filters);
      setProjects(response.projects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createProject = async (projectData: ProjectFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      const project = await projectsApi.createProject(projectData);
      router.push(`/projects/${project.id}`);
      return project;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProject = async (id: string, projectData: Partial<ProjectFormData>) => {
    try {
      setIsLoading(true);
      setError(null);
      const project = await projectsApi.updateProject(id, projectData);
      return project;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await projectsApi.deleteProject(id);
      router.push('/projects');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    projects,
    isLoading,
    error,
    filters,
    setFilters,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
}*/