'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { fetchDocument } from '@/lib/api/services/project-services';

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
      
      loadDocument(resolvedParams.docId);
    });
  }, [params]);

  const loadDocument = async (documentId: string) => {
    try {
      const doc = await fetchDocument(documentId);
      setDocument(doc);
    } catch (error: any) {
      console.error('Fetch error:', error);
      alert(error.message || '문서를 불러오는데 실패했습니다.');
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
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
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
            <div className="flex items-center gap-4 text-sm text-gray-700 mb-8 pb-8 border-b border-gray-200">
              <span>생성일: {new Date(document.createdAt).toLocaleDateString('ko-KR')}</span>
              {document.updatedAt !== document.createdAt && (
                <>
                  <span>•</span>
                  <span>수정일: {new Date(document.updatedAt).toLocaleDateString('ko-KR')}</span>
                </>
              )}
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
