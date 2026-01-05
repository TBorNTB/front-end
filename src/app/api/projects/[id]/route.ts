import { NextRequest, NextResponse } from 'next/server';
import { projectsStore } from '../store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log('Fetching project with ID:', id);
    console.log('All stored project IDs:', projectsStore.getAll().map((p: any) => p.id));

    // TODO: Replace with actual database query
    // For now, check in-memory store
    const project = projectsStore.get(id);

    if (!project) {
      console.log('Project not found in store');
      return NextResponse.json(
        { message: '프로젝트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    console.log('Project found:', project.title);
    return NextResponse.json(project, { status: 200 });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { message: '프로젝트를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
