'use client';

import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Upload, Search, X } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { requireNotGuest } from '@/lib/role-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TipTapEditor from '@/components/editor/TipTapEditor';
import { fetchProjectDetail } from '@/lib/api/services/project-services';
import { updateProject, type UpdateProjectRequestBody } from '@/lib/api/services/project-services';
import { s3Service } from '@/lib/api/services/s3-services';
import { ProjectDetailResponse } from '@/types/services/project';
import { searchProjectsByQuery, fetchLatestProjects, type ProjectSearchItem } from '@/lib/api/services/elastic-services';
import { decodeHtmlEntities } from '@/lib/html-utils';

export default function ProjectEditPage() {
  const router = useRouter();
  const params = useParams();
  const { user: currentUser } = useCurrentUser();
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
          title: decodeHtmlEntities(data.title ?? ''),
          description: decodeHtmlEntities(data.description ?? ''),
          projectStatus: data.projectStatus ?? 'PLANNING',
          thumbnailUrl: data.thumbnailUrl ?? '',
          thumbnailKey: '',
          contentImageKeys: [],
          content: decodeHtmlEntities(data.content ?? data.contentJson ?? ''),
          parentProjectId: data.parentProjectId ?? null,
        });
        if (data.thumbnailUrl) setThumbnailPreview(data.thumbnailUrl);

        // 기존 parentProjectId가 있으면 부모 프로젝트 이름 조회
        if (data.parentProjectId) {
          setParentProjectId(data.parentProjectId);
          try {
            const parent = await fetchProjectDetail(String(data.parentProjectId));
            setParentProjectTitle(decodeHtmlEntities(parent.title ?? `프로젝트 #${data.parentProjectId}`));
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
    setParentProjectTitle(decodeHtmlEntities(project.title));
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
    if (!requireNotGuest(currentUser?.role, 'edit')) return;
    if (!projectId) return;
    if (isSubmitting) return;
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
      <div className="min-h-screen py-12 px-4">
        <div className="w-full px-3 sm:px-4 lg:px-10">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-gray-700">불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="w-full px-3 sm:px-4 lg:px-10">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-4 mb-2">
              <Link href={`/projects/${projectId}`} className="inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-4xl font-bold text-gray-900">프로젝트 수정하기</h1>
            </div>
            <p className="text-lg text-gray-700 ml-14">내용을 수정하고 업데이트해주세요</p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <div className="w-1 h-8 bg-primary-600 rounded"></div>
                기본 정보
              </h2>

              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
                  프로젝트 이름 <span className="text-red-500">*</span>
                </label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="프로젝트 이름을 입력해주세요."
                  required
                  className="py-3 bg-white focus:ring-primary-500"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-semibold text-gray-900 mb-2">
                  상태
                </label>
                <select
                  id="status"
                  value={form.projectStatus}
                  onChange={(e) => setForm((f) => ({ ...f, projectStatus: e.target.value as UpdateProjectRequestBody['projectStatus'] }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="PLANNING">계획 중</option>
                  <option value="IN_PROGRESS">진행 중</option>
                  <option value="COMPLETED">완료</option>
                </select>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
                  한 줄 설명 <span className="text-red-500">*</span>
                </label>
                <Input
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="프로젝트를 간단히 설명해주세요."
                  required
                  className="py-3 bg-white focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <div className="w-1 h-8 bg-primary-600 rounded"></div>
                썸네일 (선택)
              </h2>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary-400 transition-colors">
                <div className="flex flex-col items-center gap-4">
                  {thumbnailPreview && (
                    <div className="relative w-full max-w-xs h-40 rounded-lg overflow-hidden border-2 border-white shadow-lg">
                      <Image
                        src={thumbnailPreview}
                        alt="썸네일 미리보기"
                        fill
                        className="object-cover"
                        unoptimized={thumbnailPreview.startsWith('data:')}
                      />
                    </div>
                  )}
                  <label className="cursor-pointer flex flex-col items-center gap-2 w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />
                    <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg">
                      <Upload className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-900">클릭하여 이미지 업로드</p>
                      <p className="text-sm text-gray-700 mt-1">프로젝트 썸네일을 등록해주세요</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-4" id="form-field-content">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <div className="w-1 h-8 bg-primary-600 rounded"></div>
                상세 내용
              </h2>
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden shadow-sm min-h-[500px] w-full">
                <TipTapEditor
                  content={form.content}
                  onChange={handleEditorChange}
                  onImageUpload={handleEditorImageUpload}
                  placeholder="프로젝트에 대해 자세히 설명해주세요..."
                />
              </div>
              <p className="text-gray-700 text-sm">리치 텍스트 에디터를 사용하여 작성해주세요.</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <div className="w-1 h-8 bg-primary-600 rounded"></div>
                계승 프로젝트
              </h2>
              <p className="text-sm text-gray-500">이 프로젝트가 계승하는 원본 프로젝트를 선택하세요. (선택 사항)</p>

              {parentProjectId ? (
                <div className="flex items-center gap-3 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary-900">{parentProjectTitle}</p>
                    <p className="text-xs text-primary-700">ID: {parentProjectId}</p>
                  </div>
                  <button type="button" onClick={clearParentProject} className="text-primary-400 hover:text-primary-600">
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
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  {showParentDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                      {isLoadingParent ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500 mb-1" />
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
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-50 text-left transition-colors"
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
                              className="w-full py-2 text-xs text-primary-600 hover:bg-primary-50 text-center disabled:opacity-50"
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

            <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
              <Link href={`/projects/${projectId}`}>
                <Button
                  type="button"
                  variant="outline"
                  className="px-6 py-3 font-semibold text-gray-700 hover:bg-gray-100"
                >
                  취소
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isSubmitting || isUploadingThumbnail}
                className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting || isUploadingThumbnail ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    수정 중...
                  </div>
                ) : (
                  '프로젝트 수정하기'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}