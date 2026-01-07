'use client';

import { Dialog, Transition } from '@headlessui/react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Fragment, useState, useMemo } from 'react';
import { createDocument } from '@/lib/api/endpoints/project';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSuccess?: () => void;
}

export default function DocumentModal({ 
  isOpen, 
  onClose, 
  projectId,
  onSuccess 
}: DocumentModalProps) {
  const router = useRouter();
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentContent, setDocumentContent] = useState(''); // Changed from Block[] to string
  const [documentDescription, setDocumentDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveOption, setSaveOption] = useState<'save' | 'continue'>('save');

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

  const handleSave = async () => {
    if (!documentTitle.trim()) {
      alert('문서 제목을 입력해주세요.');
      return;
    }

    if (!projectId) {
      alert('프로젝트 ID가 없습니다.');
      return;
    }

    setIsSaving(true);
    try {
      const document = await createDocument(projectId, {
        title: documentTitle,
        content: documentContent,
        description: documentDescription || documentTitle,
        thumbnailUrl: '',
      });
      
      if (saveOption === 'continue') {
        router.push(`/projects/${projectId}/documents/${document.id}/edit`);
      } else {
        onClose();
        onSuccess?.();
        resetForm();
      }
    } catch (error: any) {
      console.error('Save error:', error);
      alert(error.message || '문서 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenFullEditor = () => {
    if (documentTitle || documentContent) {
      localStorage.setItem('documentDraft', JSON.stringify({
        title: documentTitle,
        content: documentContent
      }));
    }
    router.push(`/projects/${projectId}/documents/new`);
    onClose();
  };

  const resetForm = () => {
    setDocumentTitle('');
    setDocumentContent('');
    setDocumentDescription('');
    setSaveOption('save');
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <Dialog.Title className="text-xl font-bold text-gray-900">
                    도쿠멘트 추가
                  </Dialog.Title>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleOpenFullEditor}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      전체 에디터로 전환
                    </button>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-100"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-4">
                  {/* Title Input */}
                  <input
                    type="text"
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    placeholder="문서 제목을 입력하세요..."
                    className="w-full text-2xl font-bold border-none outline-none focus:ring-0 px-0 placeholder:text-gray-400"
                    autoFocus
                  />

                  {/* Description Input */}
                  <input
                    type="text"
                    value={documentDescription}
                    onChange={(e) => setDocumentDescription(e.target.value)}
                    placeholder="문서 설명을 입력하세요 (선택사항)..."
                    className="w-full text-sm text-gray-600 border-none outline-none focus:ring-0 px-0 placeholder:text-gray-400"
                  />

                  <div className="border-t border-gray-200" />

                  {/* Editor */}
                  <div className="h-96 overflow-auto">
                    <Editor 
                      content={documentContent}
                      onChange={setDocumentContent}
                    />
                  </div>

                  {/* Info Message */}
                  <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">💡 팁</p>
                      <p>복잡한 문서는 <strong>전체 에디터</strong>를 사용하면 더 많은 기능을 사용할 수 있습니다.</p>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="saveOption"
                        value="save"
                        checked={saveOption === 'save'}
                        onChange={(e) => setSaveOption(e.target.value as 'save')}
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">저장 후 닫기</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="saveOption"
                        value="continue"
                        checked={saveOption === 'continue'}
                        onChange={(e) => setSaveOption(e.target.value as 'continue')}
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">저장 후 계속 편집</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving || !documentTitle.trim()}
                      className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                        '문서 저장'
                      )}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
