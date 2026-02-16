'use client';

import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Upload } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TipTapEditor from '@/components/editor/TipTapEditor';
import { fetchProjectDetail } from '@/lib/api/services/project-services';
import { updateProject, type UpdateProjectRequestBody } from '@/lib/api/services/project-services';
import { s3Service } from '@/lib/api/services/s3-services';
import { ProjectDetailResponse } from '@/types/services/project';

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
  });

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
        });
        if (data.thumbnailUrl) setThumbnailPreview(data.thumbnailUrl);
      } catch (e: any) {
        setErrorMessage(e?.message || '프로젝트를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [projectId]);

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
          <p className="text-gray-600">불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header - 프로젝트 생성과 동일한 톤 */}
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/projects/${projectId}`} className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">프로젝트 수정</h1>
          <p className="text-gray-600 mt-1">프로젝트 정보를 수정하고 저장하세요.</p>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 - 생성 폼과 동일 카드 스타일 */}
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

        {/* 썸네일 이미지 - 생성 폼과 동일 */}
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

        {/* 설명 - 생성 폼과 동일 카드 */}
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
            <p className="text-gray-500 text-sm mt-1">리치 텍스트 에디터를 사용하여 작성해주세요.</p>
          </div>
        </div>

        {/* 폼 액션 - 생성 폼과 동일 */}
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
