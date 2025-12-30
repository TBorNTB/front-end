'use client';

import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import DocumentModal from '../_components/DocumentModal';

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  
  // Dropdown states
  const [openSections, setOpenSections] = useState<{[key: string]: boolean}>({
    info: true,
    team: false,
    documents: true, // Open by default
    related: false,
  });

  useEffect(() => {
    params.then((resolvedParams) => {
      setProjectId(resolvedParams.id);
<<<<<<< HEAD
      setIsLoading(false);
    });
  }, [params]);

  // TODO: Replace with actual API call
  const [project, setProject] = useState({
    id: projectId,
    title: 'XSS 필터 규칙 테스트 스크립트',
    subtitle: 'Python 기반으로 작성된 URL에서 반사(Reflected) XSS 취약점을 자동으로 테스트 스크립트',
    category: '프로젝트',
    author: {
      username: 'kimdonghyun',
      name: '김동현',
      avatar: null,
    },
    createdAt: '2024-02-20',
    updatedAt: '2024-03-15',
    period: '2025-03 ~ 2025-05-31',
    github: 'https://github.com/username/xss-filter-test',
    tags: ['웹 해킹', '보안', '프로젝트'],
    technologies: ['Python', 'Scanner', 'XSS'],
    stats: {
      views: 126,
      likes: 10,
      comments: 2,
    },
    description: `이 프로젝트는 웹 애플리케이션의 XSS(Cross-Site Scripting) 취약점을 테스트하기 위한 자동화 도구입니다.`,
    team: [
      { name: '김동현', role: 'Team Leader', username: 'kimdonghyun' },
      { name: '이진우', role: 'Backend Developer', username: 'leejinwoo' },
    ],
    documents: [
      { id: '1', name: '프로젝트 기획서', type: 'pdf', size: '2.5MB', uploadedAt: '2025-03-01', createdBy: '김동현' },
      { id: '2', name: '1주차 회의록', type: 'pdf', size: '1.2MB', uploadedAt: '2025-03-08', createdBy: '이진우' },
      { id: '3', name: 'API 명세서', type: 'pdf', size: '3.1MB', uploadedAt: '2025-03-15', createdBy: '김동현' },
      { id: '4', name: 'Final-Report.pdf', type: 'pdf', size: '4.8MB', uploadedAt: '2025-05-31', createdBy: '김동현' },
    ],
    relatedProjects: [
      { id: '2', title: '새로운 프로젝트', version: 'v1.1 업데이트 개발 중' },
      { id: '3', title: 'v1.2 DCM기반 탐지 v1', version: 'v1.2 DCM기반 탐지 v1 추가' },
    ],
  });
=======
      fetchProjectData(resolvedParams.id);
    });
  }, [params]);

  const [project, setProject] = useState<any>(null);

  const fetchProjectData = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/projects/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }
      
      const data = await response.json();
      setProject(data);
    } catch (error) {
      console.error('Error fetching project:', error);
      // Fallback to default/mock data if API fails
      setProject({
        id: id,
        title: 'XSS 필터 규칙 테스트 스크립트',
        subtitle: 'Python 기반으로 작성된 URL에서 반사(Reflected) XSS 취약점을 자동으로 테스트 스크립트',
        category: '프로젝트',
        author: {
          username: 'kimdonghyun',
          name: '김동현',
          avatar: null,
        },
        createdAt: '2024-02-20',
        updatedAt: '2024-03-15',
        period: '2025-03 ~ 2025-05-31',
        github: 'https://github.com/username/xss-filter-test',
        tags: ['웹 해킹', '보안', '프로젝트'],
        technologies: ['Python', 'Scanner', 'XSS'],
        stats: {
          views: 126,
          likes: 10,
          comments: 2,
        },
        description: `이 프로젝트는 웹 애플리케이션의 XSS(Cross-Site Scripting) 취약점을 테스트하기 위한 자동화 도구입니다.`,
        team: [
          { name: '김동현', role: 'Team Leader', username: 'kimdonghyun' },
          { name: '이진우', role: 'Backend Developer', username: 'leejinwoo' },
        ],
        documents: [
          { id: '1', name: '프로젝트 기획서', type: 'pdf', size: '2.5MB', uploadedAt: '2025-03-01', createdBy: '김동현' },
          { id: '2', name: '1주차 회의록', type: 'pdf', size: '1.2MB', uploadedAt: '2025-03-08', createdBy: '이진우' },
          { id: '3', name: 'API 명세서', type: 'pdf', size: '3.1MB', uploadedAt: '2025-03-15', createdBy: '김동현' },
          { id: '4', name: 'Final-Report.pdf', type: 'pdf', size: '4.8MB', uploadedAt: '2025-05-31', createdBy: '김동현' },
        ],
        relatedProjects: [
          { id: '2', title: '새로운 프로젝트', version: 'v1.1 업데이트 개발 중' },
          { id: '3', title: 'v1.2 DCM기반 탐지 v1', version: 'v1.2 DCM기반 탐지 v1 추가' },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };
>>>>>>> api-merge

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!project) {
    notFound();
  }

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleDocumentAction = async (docId: string, action: 'edit' | 'delete' | 'share' | 'download') => {
    switch (action) {
      case 'edit':
        router.push(`/projects/${projectId}/documents/${docId}/edit`);
        break;
      case 'delete':
        if (confirm('이 문서를 삭제하시겠습니까?')) {
          try {
            await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
            // Refresh documents list
<<<<<<< HEAD
            setProject(prev => ({
              ...prev,
              documents: prev.documents.filter(doc => doc.id !== docId)
=======
            setProject((prev: any) => ({
              ...prev,
              documents: prev.documents.filter((doc: any) => doc.id !== docId)
>>>>>>> api-merge
            }));
          } catch (error) {
            console.error('Delete error:', error);
            alert('문서 삭제에 실패했습니다.');
          }
        }
        break;
      case 'share':
        // Copy share link to clipboard
        const shareUrl = `${window.location.origin}/projects/${projectId}/documents/${docId}`;
        navigator.clipboard.writeText(shareUrl);
        alert('공유 링크가 클립보드에 복사되었습니다!');
        break;
      case 'download':
        // Trigger download
        window.location.href = `/api/documents/${docId}/download`;
        break;
    }
  };

  const handleAddQuickDocument = () => {
    setIsDocModalOpen(true);
  };

  const handleAddFullDocument = () => {
    router.push(`/projects/${projectId}/documents/new`);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Back Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="container py-6">
            <Link
              href="/projects"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm">프로젝트 목록</span>
            </Link>
          </div>
        </div>

        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Sidebar */}
            <aside className="lg:col-span-3">
              <div className="lg:sticky lg:top-8 space-y-4">
                
                {/* Project Info Section */}
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => toggleSection('info')}
                    className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-bold text-gray-900">프로젝트 정보</span>
                    <svg
                      className={`w-5 h-5 text-gray-600 transition-transform ${
                        openSections.info ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {openSections.info && (
                    <div className="p-4 space-y-3 text-sm">
                      <div>
                        <p className="text-gray-600 mb-1">상태</p>
                        <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">
                          진행중
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">기간</p>
                        <p className="text-gray-900">{project.period}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">사용 기술</p>
                        <div className="flex flex-wrap gap-1">
<<<<<<< HEAD
                          {project.technologies.map((tech, idx) => (
=======
                          {project.technologies.map((tech: string, idx: number) => (
>>>>>>> api-merge
                            <span key={idx} className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">링크</p>
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                          <span className="text-xs">GitHub</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Team Section */}
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => toggleSection('team')}
                    className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-bold text-gray-900">팀원 ({project.team.length})</span>
                    <svg
                      className={`w-5 h-5 text-gray-600 transition-transform ${
                        openSections.team ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {openSections.team && (
                    <div className="p-4 space-y-3">
<<<<<<< HEAD
                      {project.team.map((member, idx) => (
=======
                      {project.team.map((member: any, idx: number) => (
>>>>>>> api-merge
                        <div key={idx} className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                            <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-500">
                              {member.name.charAt(0)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {member.name}
                            </p>
                            <p className="text-xs text-gray-600 truncate">
                              {member.role}
                            </p>
                          </div>
                        </div>
                      ))}
                      <button className="w-full mt-2 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        팀원 추가
                      </button>
                    </div>
                  )}
                </div>

                {/* 📄 ENHANCED DOCUMENTS SECTION */}
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => toggleSection('documents')}
                    className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-bold text-gray-900">도큐먼트 ({project.documents.length})</span>
                    <svg
                      className={`w-5 h-5 text-gray-600 transition-transform ${
                        openSections.documents ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {openSections.documents && (
                    <div className="p-4">
                      {/* Document List */}
                      <div className="space-y-1 mb-3">
<<<<<<< HEAD
                        {project.documents.map((doc) => (
=======
                        {project.documents.map((doc: any) => (
>>>>>>> api-merge
                          <div
                            key={doc.id}
                            className="group flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            {/* Document Link */}
                            <Link
                              href={`/projects/${projectId}/documents/${doc.id}`}
                              className="flex items-center gap-2 flex-1 min-w-0"
                            >
                              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900 truncate group-hover:text-primary-600 font-medium">
                                  {doc.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {doc.uploadedAt} · {doc.createdBy}
                                </p>
                              </div>
                            </Link>

                            {/* Action Menu (visible on hover) */}
                            <Menu as="div" className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                              <Menu.Button className="p-1 hover:bg-gray-200 rounded-full">
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                              </Menu.Button>
                              <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                              >
                                <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white divide-y divide-gray-100 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                  <div className="p-1">
                                    <Menu.Item>
                                      {({ active }: { active: boolean }) => (
                                        <button
                                          onClick={() => router.push(`/projects/${projectId}/documents/${doc.id}`)}
                                          className={`${
                                            active ? 'bg-gray-100' : ''
                                          } group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700`}
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                          </svg>
                                          보기
                                        </button>
                                      )}
                                    </Menu.Item>
                                    <Menu.Item>
                                      {({ active }: { active: boolean }) => (
                                        <button
                                          onClick={() => handleDocumentAction(doc.id, 'edit')}
                                          className={`${
                                            active ? 'bg-gray-100' : ''
                                          } group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700`}
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                          </svg>
                                          편집
                                        </button>
                                      )}
                                    </Menu.Item>
                                    <Menu.Item>
                                      {({ active }: { active: boolean }) => (
                                        <button
                                          onClick={() => handleDocumentAction(doc.id, 'share')}
                                          className={`${
                                            active ? 'bg-gray-100' : ''
                                          } group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700`}
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                          </svg>
                                          공유
                                        </button>
                                      )}
                                    </Menu.Item>
                                    <Menu.Item>
                                      {({ active }: { active: boolean }) => (
                                        <button
                                          onClick={() => handleDocumentAction(doc.id, 'download')}
                                          className={`${
                                            active ? 'bg-gray-100' : ''
                                          } group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700`}
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                          </svg>
                                          다운로드
                                        </button>
                                      )}
                                    </Menu.Item>
                                  </div>
                                  <div className="p-1">
                                    <Menu.Item>
                                      {({ active }: { active: boolean }) => (
                                        <button
                                          onClick={() => handleDocumentAction(doc.id, 'delete')}
                                          className={`${
                                            active ? 'bg-red-50' : ''
                                          } group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600`}
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                          삭제
                                        </button>
                                      )}
                                    </Menu.Item>
                                  </div>
                                </Menu.Items>
                              </Transition>
                            </Menu>
                          </div>
                        ))}
                      </div>

                      {/* Add Document Buttons */}
                      <div className="space-y-2 pt-2 border-t border-gray-200">
                        <button 
                          onClick={handleAddQuickDocument}
                          className="w-full py-2 text-sm text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          도큐멘트 추가
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Related Projects Section */}
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => toggleSection('related')}
                    className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-bold text-gray-900">연관 프로젝트</span>
                    <svg
                      className={`w-5 h-5 text-gray-600 transition-transform ${
                        openSections.related ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {openSections.related && (
                    <div className="p-4 space-y-2">
<<<<<<< HEAD
                      {project.relatedProjects.map((related) => (
=======
                      {project.relatedProjects.map((related: any) => (
>>>>>>> api-merge
                        <Link
                          key={related.id}
                          href={`/projects/${related.id}`}
                          className="block p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {related.title}
                          </p>
                          <p className="text-xs text-gray-600">
                            {related.version}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-9">
              <div className="card">
                {/* Project Header */}
                <header className="mb-8">
                  <h1 className="text-4xl font-bold text-foreground mb-3">
                    {project.title}
                  </h1>
                  <p className="text-lg text-gray-600 mb-4">
                    {project.subtitle}
                  </p>

                  {/* Author & Stats */}
                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
                          {project.author.name.charAt(0)}
                        </div>
                      </div>
                      <span className="font-medium">{project.author.name}</span>
                    </div>
                    <span>👁 {project.stats.views}</span>
                    <span>❤️ {project.stats.likes}</span>
                    <span>💬 {project.stats.comments}</span>
                  </div>
                </header>

                {/* Featured Image */}
                <div className="relative w-full h-96 mb-8 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-300">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-200 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">프로젝트 스크린샷</p>
                  </div>
                </div>

                {/* Description */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-foreground mb-4">프로젝트 개요</h2>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {project.description}
                    </p>
                  </div>
                </section>

                {/* Tags */}
                <section className="mb-12">
                  <div className="flex flex-wrap gap-2">
<<<<<<< HEAD
                    {project.tags.map((tag, index) => (
=======
                    {project.tags.map((tag: string, index: number) => (
>>>>>>> api-merge
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </section>

                {/* Like Button */}
                <section className="mb-12 flex justify-center py-4">
                  <button className="flex flex-col items-center gap-2 px-8 py-4 rounded-full border-2 border-gray-300 hover:border-primary-500 hover:bg-primary-50 transition-colors group">
                    <svg className="w-8 h-8 text-gray-400 group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    <span className="text-2xl font-bold text-gray-900 group-hover:text-primary-600">
                      {project.stats.likes}
                    </span>
                  </button>
                </section>

                {/* Comments Section */}
                <section>
                  <h2 className="text-2xl font-bold text-foreground mb-6">
                    댓글 ({project.stats.comments})
                  </h2>

                  {/* Comments List */}
                  <div className="space-y-4 mb-8">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex gap-4">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                          <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-500">
                            프
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">프로젝트명</span>
                              <span className="text-sm text-gray-500">2024-05-18</span>
                            </div>
                            <span className="text-sm text-gray-500">👍 12</span>
                          </div>
                          <p className="text-gray-700">
                            프로젝트 업무 맡지만 열심히 잘 합시다!!
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex gap-4">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                          <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-500">
                            기
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">기술 스택 선택</span>
                              <span className="text-sm text-gray-500">2024-05-17</span>
                            </div>
                            <span className="text-sm text-gray-500">👍 1</span>
                          </div>
                          <p className="text-gray-700">
                            기술 스택 선택 이유가 궁금해요!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comment Input */}
                  <div>
                    <textarea
                      placeholder="댓글을 작성해주세요..."
                      className="w-full min-h-[120px] p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none bg-white mb-3"
                    />
                    <div className="flex justify-end">
                      <button className="btn btn-primary">댓글 등록</button>
                    </div>
                  </div>
                </section>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Document Modal */}
      <DocumentModal 
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        projectId={projectId}
        onSuccess={() => {
          // Optionally refresh documents list
          console.log('Document created successfully');
        }}
      />
    </>
  );
}
