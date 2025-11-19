'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

interface DocumentViewerProps {
  params: Promise<{ id: string; docId: string }>;
}

export default function DocumentViewer({ params }: DocumentViewerProps) {
  const router = useRouter();
  const [projectId, setProjectId] = useState('');
  const [docId, setDocId] = useState('');
  const [document, setDocument] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const Editor = useMemo(
    () => dynamic(() => import('@/components/editor/TipTapEditor'), { 
      ssr: false,
      loading: () => (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      )
    }),
    []
  );

  useEffect(() => {
    params.then((resolvedParams) => {
      setProjectId(resolvedParams.id);
      setDocId(resolvedParams.docId);
      
      fetchDocument(resolvedParams.docId);
    });
  }, [params]);

  const fetchDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`);
      if (response.ok) {
        const data = await response.json();
        setDocument(data);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!document) {
    return <div className="container py-12 text-center">문서를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link
              href={`/projects/${projectId}`}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">프로젝트로 돌아가기</span>
            </Link>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`/projects/${projectId}/documents/${docId}/edit`)}
                className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                편집
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className="container py-12">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {document.title}
            </h1>

            {/* Metadata */}
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                  {document.createdBy?.charAt(0) || 'U'}
                </div>
                <span>{document.createdBy || '작성자'}</span>
              </div>
              <span>•</span>
              <span>{document.createdAt}</span>
              <span>•</span>
              <span>👁 {document.views || 0} 조회</span>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <Editor 
                content={document.content}
                editable={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
