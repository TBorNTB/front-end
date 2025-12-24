'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

interface NewDocumentPageProps {
  params: Promise<{ id: string }>;
}

export default function NewDocumentPage({ params }: NewDocumentPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [projectId, setProjectId] = useState<string>('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentContent, setDocumentContent] = useState(''); // Changed to string
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  const Editor = useMemo(
    () => dynamic(() => import('@/components/editor/TipTapEditor'), { 
      ssr: false,
      loading: () => (
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            <p className="text-gray-500">에디터 로딩 중...</p>
          </div>
        </div>
      )
    }),
    []
  );

  useEffect(() => {
    params.then((resolvedParams) => {
      setProjectId(resolvedParams.id);
    });

    // Load draft from localStorage
    const draft = localStorage.getItem('documentDraft');
    if (draft) {
      const { title, content } = JSON.parse(draft);
      setDocumentTitle(title || '');
      setDocumentContent(content || '');
      localStorage.removeItem('documentDraft');
    }

    // Get title from URL params
    const titleParam = searchParams.get('title');
    if (titleParam) {
      setDocumentTitle(titleParam);
    }
  }, [params, searchParams]);

  // Auto-save functionality
  useEffect(() => {
    if (!documentTitle && !documentContent) return;

    const autoSaveTimer = setTimeout(() => {
      setAutoSaveStatus('saving');
      localStorage.setItem('documentDraft', JSON.stringify({
        title: documentTitle,
        content: documentContent
      }));
      setTimeout(() => setAutoSaveStatus('saved'), 500);
    }, 2000);

    setAutoSaveStatus('unsaved');
    return () => clearTimeout(autoSaveTimer);
  }, [documentTitle, documentContent]);

  const handleContentChange = (html: string) => {
    setDocumentContent(html);
  };

  const handleSave = async () => {
    if (!documentTitle.trim()) {
      alert('문서 제목을 입력해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          title: documentTitle,
          content: documentContent
        })
      });

      if (response.ok) {
        const { documentId } = await response.json();
        localStorage.removeItem('documentDraft');
        router.push(`/projects/${projectId}/documents/${documentId}`);
      } else {
        throw new Error('Failed to save document');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('문서 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (documentTitle || documentContent) {
      if (confirm('작성 중인 내용이 있습니다. 정말 나가시겠습니까?')) {
        localStorage.removeItem('documentDraft');
        router.push(`/projects/${projectId}`);
      }
    } else {
      router.push(`/projects/${projectId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">프로젝트로 돌아가기</span>
            </button>

            {/* Auto-save Status */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {autoSaveStatus === 'saving' && (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  저장 중...
                </>
              )}
              {autoSaveStatus === 'saved' && (
                <>
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-600">임시 저장됨</span>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !documentTitle.trim()}
                className="px-6 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-sm"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    저장 중...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    문서 저장
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Container */}
      <div className="container py-12">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            {/* Title Input */}
            <input
              type="text"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              placeholder="문서 제목을 입력하세요..."
              className="w-full text-4xl font-bold border-none outline-none focus:ring-0 mb-8 px-0 placeholder:text-gray-400"
              autoFocus
            />

            {/* Metadata Info */}
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-200">
              <span>작성자: 김동현</span>
              <span>•</span>
              <span>프로젝트: XSS 필터 규칙 테스트</span>
              <span>•</span>
              <span>{new Date().toLocaleDateString('ko-KR')}</span>
            </div>

            {/* TipTap Editor */}
            <div className="min-h-[700px]">
              <Editor 
                content={documentContent}
                onChange={handleContentChange}
              />
            </div>
          </div>

          {/* Helper Shortcuts */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">⌨️ 키보드 단축키</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div><kbd className="px-2 py-1 bg-white rounded border">Ctrl + B</kbd> 굵게</div>
              <div><kbd className="px-2 py-1 bg-white rounded border">Ctrl + I</kbd> 기울임</div>
              <div><kbd className="px-2 py-1 bg-white rounded border">Ctrl + Z</kbd> 실행 취소</div>
              <div><kbd className="px-2 py-1 bg-white rounded border">Ctrl + Y</kbd> 다시 실행</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
