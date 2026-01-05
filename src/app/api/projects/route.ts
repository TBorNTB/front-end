import { NextRequest, NextResponse } from 'next/server';
import { projectsStore } from './store';

export async function GET(request: NextRequest) {
  try {
    const allProjects = projectsStore.getAll();
    
    return NextResponse.json({
      count: allProjects.length,
      projects: allProjects.map((p: any) => ({
        id: p.id,
        title: p.title,
        category: p.category,
      }))
    }, { status: 200 });
  } catch (error) {
    console.error('Error listing projects:', error);
    return NextResponse.json(
      { message: '프로젝트 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
