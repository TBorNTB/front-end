import { NextRequest, NextResponse } from 'next/server';
import { projectsStore } from '../store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.description || !Array.isArray(body.categories) || body.categories.length === 0) {
      return NextResponse.json(
        { message: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // Validate tech stacks
    if (!Array.isArray(body.techStacks) || body.techStacks.length === 0) {
      return NextResponse.json(
        { message: '최소 하나의 기술 스택이 필요합니다.' },
        { status: 400 }
      );
    }

    const projectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const currentDate = new Date().toISOString();

    // Format period from dates
    const period = body.startedAt && body.endedAt
      ? `${String(body.startedAt).substring(0, 7)} ~ ${String(body.endedAt).substring(0, 10)}`
      : '';

    // Create complete project object
    const newProject = {
      id: projectId,
      title: body.title,
      subtitle: body.description,
      description: body.content || body.description,
      category: body.categories?.[0] || '',
      status: body.projectStatus || 'PLANNING',
      author: {
        username: 'current-user', // Should be replaced with actual user from auth
        name: '현재 사용자',
        avatar: null,
      },
      createdAt: currentDate.substring(0, 10),
      updatedAt: currentDate.substring(0, 10),
      period: period,
      github: '',
      projectUrl: '',
      thumbnailUrl: body.thumbnail || '',
      tags: body.techStacks,
      technologies: body.techStacks,
      team: body.collaborators || [],
      documents: [],
      stats: {
        views: 0,
        likes: 0,
        comments: 0,
      },
      relatedProjects: [],
    };

    // Store in memory (replace with database in production)
    projectsStore.set(projectId, newProject);
    console.log('Project created and stored with ID:', projectId);
    console.log('Total projects in store:', projectsStore.getAll().length);

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { message: '프로젝트 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
