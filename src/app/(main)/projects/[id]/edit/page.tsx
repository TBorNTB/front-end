'use client';

import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Upload, Search, X } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TipTapEditor from '@/components/editor/TipTapEditor';
import { fetchProjectDetail } from '@/lib/api/services/project-services';
import { updateProject, type UpdateProjectRequestBody } from '@/lib/api/services/project-services';
import { s3Service } from '@/lib/api/services/s3-services';
import { ProjectDetailResponse } from '@/types/services/project';
import { searchProjectsByQuery, fetchLatestProjects, type ProjectSearchItem } from '@/lib/api/services/elastic-services';

export default function ProjectEditPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = String(params?.id ?? '');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [form, setForm] = useState<UpdateProjectRequestBody>({
    title: '',
    description: '',
    projectStatus: 'PLANNING',
    thumbnailUrl: '',
    thumbnailKey: '',
    contentImageKeys: [],
    content: '',
    parentProjectId: null,
  });

  // 계승 프로젝트 상태
  const [parentProjectId, setParentProjectId] = useState<number | null>(null);
  const [parentProjectTitle, setParentProjectTitle] = useState<string>('');
  const [parentQuery, setParentQuery] = useState('');
  const [parentResults, setParentResults] = useState<ProjectSearchItem[]>([]);
  const [isLoadingParent, setIsLoadingParent] = useState(false);
  const [parentPage, setParentPage] = useState(0);
  const [parentHasNext, setParentHasNext] = useState(false);
  const [showParentDropdown, setShowParentDropdown] = useState(false);
  const parentSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!projectId) return;
    const load = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const data: ProjectDetailResponse = await fetchProjectDetail(projectId);
        setForm({
          title: data.title ?? '',
          description: data.description ?? '',
          projectStatus: data.projectStatus ?? 'PLANNING',
          thumbnailUrl: data.thumbnailUrl ?? '',
          thumbnailKey: '',
          contentImageKeys: [],
          content: data.content ?? data.contentJson ?? '',
          parentProjectId: data.parentProjectId ?? null,
        });
        if (data.thumbnailUrl) setThumbnailPreview(data.thumbnailUrl);

        // 기존 parentProjectId가 있으면 부모 프로젝트 이름 조회
        if (data.parentProjectId) {
          setParentProjectId(data.parentProjectId);
          try {
            const parent = await fetchProjectDetail(String(data.parentProjectId));
            setParentProjectTitle(parent.title ?? `프로젝트 #${data.parentProjectId}`);
          } catch {
            setParentProjectTitle(`프로젝트 #${data.parentProjectId}`);
          }
        }
      } catch (e: any) {
        setErrorMessage(e?.message || '프로젝트를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [projectId]);

  // 부모 프로젝트: 최신 목록 (빈 검색 시 페이지네이션)
  const loadParentProjects = useCallback(async (page = 0) => {
    setIsLoadingParent(true);
    try {
      const data = await fetchLatestProjects(6, page);
      if (page === 0) setParentResults(data);
      else setParentResults(prev => [...prev, ...data]);
      setParentHasNext(data.length === 6);
      setParentPage(page);
    } catch {
    } finally {
      setIsLoadingParent(false);
    }
  }, []);

  // 부모 프로젝트: 이름 검색
  const handleParentQueryChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setParentQuery(val);
    if (!val.trim()) {
      loadParentProjects(0);
    } else {
      setIsLoadingParent(true);
      try {
        const results = await searchProjectsByQuery(val.trim(), 10);
        setParentResults(results);
        setParentHasNext(false);
        setParentPage(0);
      } catch {
      } finally {
        setIsLoadingParent(false);
      }
    }
  }, [loadParentProjects]);

  const selectParentProject = useCallback((project: ProjectSearchItem) => {
    setParentProjectId(project.id);
    setParentProjectTitle(project.title);
    setShowParentDropdown(false);
    setParentQuery('');
  }, []);

  const clearParentProject = useCallback(() => {
    setParentProjectId(null);
    setParentProjectTitle('');
  }, []);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (parentSearchRef.current && !parentSearchRef.current.contains(e.target as Node)) {
        setShowParentDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    setForm((prev) => ({
      ...prev,
      contentImageKeys: [...(prev.contentImageKeys || []), result.key],
    }));
    return result;
  }, []);

  const handleEditorChange = useCallback((html: string) => {
    setForm((prev) => ({ ...prev, content: html }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    setErrorMessage(null);
    try {
      setIsSubmitting(true);
      let thumbnailUrl = form.thumbnailUrl;
      let thumbnailKey = form.thumbnailKey;

      if (thumbnailFile) {
        setIsUploadingThumbnail(true);
        try {
          const result = await s3Service.uploadFile(thumbnailFile);
          thumbnailKey = result.key;
          thumbnailUrl = result.url;
        } catch (uploadError: any) {
          setErrorMessage(uploadError?.message || '썸네일 업로드에 실패했습니다.');
          setIsUploadingThumbnail(false);
          setIsSubmitting(false);
          return;
        } finally {
          setIsUploadingThumbnail(false);
        }
      }

      await updateProject(projectId, {
        ...form,
        thumbnailUrl,
        thumbnailKey: thumbnailKey || '',
        contentImageKeys: Array.isArray(form.contentImageKeys) ? form.contentImageKeys : [],
        parentProjectId: parentProjectId ?? null,
      });
      router.push(`/projects/${projectId}`);
    } catch (e: any) {
      setErrorMessage(e?.message || '프로젝트 수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
          <p className="text-gray-700">불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/projects/${projectId}`} className="text-gray-700 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">프로젝트 수정</h1>
          <p className="text-gray-700 mt-1">프로젝트 정보를 수정하고 저장하세요.</p>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">기본 정보</h2>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              프로젝트 이름 <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="프로젝트 이름을 입력해주세요."
              required
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              상태
            </label>
            <select
              id="status"
              value={form.projectStatus}
              onChange={(e) => setForm((f) => ({ ...f, projectStatus: e.target.value as UpdateProjectRequestBody['projectStatus'] }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="PLANNING">계획 중</option>
              <option value="IN_PROGRESS">진행 중</option>
              <option value="COMPLETED">완료</option>
            </select>
          </div>
        </div>

        {/* 썸네일 이미지 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">썸네일 이미지</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              프로젝트 썸네일
            </label>
            <div className="flex items-center gap-4">
              {thumbnailPreview && (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-300">
                  <Image
                    src={thumbnailPreview}
                    alt="썸네일 미리보기"
                    fill
                    className="object-cover"
                    unoptimized={thumbnailPreview.startsWith('data:')}
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
                  <span>이미지 업로드</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* 설명 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">설명</h2>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              한 줄 설명 <span className="text-red-500">*</span>
            </label>
            <Input
              id="description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="프로젝트를 간단히 설명해주세요."
              required
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상세 설명
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <TipTapEditor
                content={form.content}
                onChange={handleEditorChange}
                onImageUpload={handleEditorImageUpload}
                placeholder="프로젝트에 대해 자세히 설명해주세요..."
              />
            </div>
            <p className="text-gray-700 text-sm mt-1">리치 텍스트 에디터를 사용하여 작성해주세요.</p>
          </div>
        </div>

        {/* 계승 프로젝트 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">계승 프로젝트</h2>
            <p className="text-sm text-gray-500 mt-1">이 프로젝트가 계승하는 원본 프로젝트를 선택하세요. (선택 사항)</p>
          </div>

          {parentProjectId ? (
            <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-purple-900">{parentProjectTitle}</p>
                <p className="text-xs text-purple-600">ID: {parentProjectId}</p>
              </div>
              <button type="button" onClick={clearParentProject} className="text-purple-400 hover:text-purple-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="relative" ref={parentSearchRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={parentQuery}
                  onChange={handleParentQueryChange}
                  onFocus={() => { setShowParentDropdown(true); if (!parentQuery.trim()) loadParentProjects(0); }}
                  placeholder="프로젝트 이름으로 검색..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                />
              </div>

              {showParentDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {isLoadingParent ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500 mb-1" />
                      <p>불러오는 중...</p>
                    </div>
                  ) : parentResults.length === 0 ? (
                    <p className="p-4 text-sm text-gray-500 text-center">결과가 없습니다.</p>
                  ) : (
                    <>
                      {parentResults.map((project) => (
                        <button
                          key={project.id}
                          type="button"
                          onClick={() => selectParentProject(project)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 text-left transition-colors"
                        >
                          {project.thumbnailUrl ? (
                            <img src={project.thumbnailUrl} alt={project.title} className="w-8 h-8 rounded object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded bg-gray-100 flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{project.title}</p>
                            <p className="text-xs text-gray-500 truncate">{project.description}</p>
                          </div>
                        </button>
                      ))}
                      {!parentQuery.trim() && parentHasNext && (
                        <button
                          type="button"
                          onClick={() => loadParentProjects(parentPage + 1)}
                          disabled={isLoadingParent}
                          className="w-full py-2 text-xs text-purple-600 hover:bg-purple-50 text-center disabled:opacity-50"
                        >
                          더 보기
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 폼 액션 */}
        <div className="flex gap-4 justify-end">
          <Link href={`/projects/${projectId}`}>
            <Button type="button" variant="outline" className="text-gray-700">
              취소
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting || isUploadingThumbnail}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting || isUploadingThumbnail ? '저장 중...' : '수정 완료'}
          </Button>
        </div>
      </form>
    </div>
  );
}