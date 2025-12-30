import { NextRequest, NextResponse } from 'next/server';
import { projectsStore } from '../store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.category || !body.description) {
      return NextResponse.json(
        { message: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // Validate tags
    if (!body.tags || body.tags.length === 0) {
      return NextResponse.json(
        { message: '최소 하나의 태그가 필요합니다.' },
        { status: 400 }
      );
    }

    const projectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const currentDate = new Date().toISOString();

    // Format period from dates
    const period = body.startDate && body.endDate
      ? `${body.startDate.substring(0, 7)} ~ ${body.endDate}`
      : '';

    // Create complete project object
    const newProject = {
      id: projectId,
      title: body.title,
      subtitle: body.description,
      description: body.details || body.description,
      category: body.category,
      status: body.status || 'PLANNING',
      author: {
        username: 'current-user', // Should be replaced with actual user from auth
        name: '현재 사용자',
        avatar: null,
      },
      createdAt: currentDate.substring(0, 10),
      updatedAt: currentDate.substring(0, 10),
      period: period,
      github: body.repositoryUrl || '',
      projectUrl: body.projectUrl || '',
      thumbnailUrl: body.thumbnailUrl || '',
      tags: body.tags,
      technologies: body.tags, // Using tags as technologies for now
      team: body.collaborators || [],
      documents: body.documents?.map((doc: any, index: number) => ({
        id: `${projectId}_doc_${index}`,
        name: doc.name || `Document ${index + 1}`,
        type: doc.type || 'file',
        size: doc.size ? `${(doc.size / 1024).toFixed(1)}KB` : 'Unknown',
        uploadedAt: currentDate.substring(0, 10),
        createdBy: '현재 사용자',
      })) || [],
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
