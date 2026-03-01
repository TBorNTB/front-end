'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Upload } from 'lucide-react';
import { fetchDocument, updateDocument } from '@/lib/api/services/project-services';
import { s3Service } from '@/lib/api/services/s3-services';
import { decodeHtmlEntities } from '@/lib/html-utils';

interface EditDocumentPageProps {
  params: Promise<{ id: string; docId: string }>;
}

export default function EditDocumentPage({ params }: EditDocumentPageProps) {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string>('');
  const [docId, setDocId] = useState<string>('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentContent, setDocumentContent] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [contentImageKeys, setContentImageKeys] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  const Editor = useMemo(
    () => dynamic(() => import('@/components/editor/TipTapEditor'), { 
      ssr: false,
      loading: () => (
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            <p className="text-gray-700">에디터 로딩 중...</p>
          </div>
        </div>
      )
    }),
    []
  );

  useEffect(() => {
    params.then(async (resolvedParams) => {
      setProjectId(resolvedParams.id);
      setDocId(resolvedParams.docId);
      
      try {
        const doc = await fetchDocument(resolvedParams.docId);
        setDocumentTitle(decodeHtmlEntities(doc.title ?? ''));
        setDocumentContent(decodeHtmlEntities(doc.content ?? ''));
        setDocumentDescription(decodeHtmlEntities(doc.description ?? ''));
        if (doc.thumbnailUrl) setThumbnailPreview(doc.thumbnailUrl);
        setIsLoading(false);
      } catch (error: any) {
        console.error('Fetch error:', error);
        alert(error.message || '문서를 불러오는데 실패했습니다.');
        setIsLoading(false);
      }
    });
  }, [params]);

  // Auto-save functionality
  useEffect(() => {
    if (!documentTitle && !documentContent) return;

    const autoSaveTimer = setTimeout(() => {
      setAutoSaveStatus('saving');
      localStorage.setItem(`documentDraft_${docId}`, JSON.stringify({
        title: documentTitle,
        content: documentContent,
        description: documentDescription
      }));
      setTimeout(() => setAutoSaveStatus('saved'), 500);
    }, 2000);

    setAutoSaveStatus('unsaved');
    return () => clearTimeout(autoSaveTimer);
  }, [documentTitle, documentContent, documentDescription, docId]);

  const handleContentChange = (html: string) => {
    setDocumentContent(html);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleEditorImageUpload = useCallback(async (file: File) => {
    const result = await s3Service.uploadFile(file);
    setContentImageKeys((prev) => [...prev, result.key]);
    return result;
  }, []);

  const handleSave = async () => {
    if (!documentTitle.trim()) {
      alert('문서 제목을 입력해주세요.');
      return;
    }

    if (!docId) {
      alert('문서 ID가 없습니다.');
      return;
    }

    setIsSaving(true);
    try {
      let thumbnailKey = '';
      if (thumbnailFile) {
        const result = await s3Service.uploadFile(thumbnailFile);
        thumbnailKey = result.key;
      }
      await updateDocument(docId, {
        title: documentTitle.trim(),
        description: documentDescription?.trim() || documentTitle.trim(),
        content: documentContent,
        thumbnailKey,
        contentImageKeys,
      });
      
      localStorage.removeItem(`documentDraft_${docId}`);
      router.push(`/projects/${projectId}/documents/${docId}`);
    } catch (error: any) {
      console.error('Save error:', error);
      alert(error.message || '문서 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (documentTitle || documentContent) {
      if (confirm('작성 중인 내용이 있습니다. 정말 나가시겠습니까?')) {
        localStorage.removeItem(`documentDraft_${docId}`);
        router.push(`/projects/${projectId}/documents/${docId}`);
      }
    } else {
      router.push(`/projects/${projectId}/documents/${docId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          <p className="text-gray-700">문서를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">문서 보기로 돌아가기</span>
            </button>

            {/* Auto-save Status */}
            <div className="flex items-center gap-2 text-sm text-gray-700">
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
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12 space-y-6">
            <div>
              <label htmlFor="doc-edit-title" className="block text-sm font-medium text-gray-700 mb-2">
                문서 제목 <span className="text-red-500">*</span>
              </label>
              <input
                id="doc-edit-title"
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="문서 제목을 입력하세요"
                className="w-full px-4 py-3 text-lg font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="doc-edit-desc" className="block text-sm font-medium text-gray-700 mb-2">
                요약 (선택)
              </label>
              <input
                id="doc-edit-desc"
                type="text"
                value={documentDescription}
                onChange={(e) => setDocumentDescription(e.target.value)}
                placeholder="문서를 한 줄로 요약해주세요"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-700 placeholder:text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                썸네일 이미지 (선택)
              </label>
              <div className="flex items-center gap-4">
                {thumbnailPreview && (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-300 bg-gray-100">
                    <Image
                      src={thumbnailPreview}
                      alt="썸네일 미리보기"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg border border-gray-300">
                    <Upload className="w-4 h-4" />
                    <span>이미지 선택</span>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                본문 (이미지 붙여넣기·드래그·버튼으로 추가 가능)
              </label>
              <div className="border border-gray-300 rounded-lg overflow-hidden min-h-[500px]">
                <Editor 
                  content={documentContent}
                  onChange={handleContentChange}
                  onImageUpload={handleEditorImageUpload}
                  placeholder="내용을 입력하세요. 이미지는 붙여넣기, 드래그, 또는 툴바 버튼으로 넣을 수 있습니다."
                />
              </div>
            </div>
          </div>

          {/* Helper Shortcuts */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">⌨️ 키보드 단축키</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
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

