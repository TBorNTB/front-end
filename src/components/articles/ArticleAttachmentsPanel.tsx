'use client';

import { Paperclip, Upload, X, Link2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { AttachmentInfo } from '@/lib/api/services/article-services';
import {
  ARTICLE_ATTACHMENT_MAX_LABEL,
  MAX_ARTICLE_ATTACHMENT_BYTES,
  type ExternalResourceLink,
} from '@/lib/article-external-links';

export interface ArticleAttachmentsPanelProps {
  pendingAttachments: { file: File; name: string }[];
  setPendingAttachments: React.Dispatch<
    React.SetStateAction<{ file: File; name: string }[]>
  >;
  externalLinks: ExternalResourceLink[];
  setExternalLinks: React.Dispatch<React.SetStateAction<ExternalResourceLink[]>>;
  existingAttachments?: AttachmentInfo[];
  attachmentKeysToDelete?: string[];
  setAttachmentKeysToDelete?: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function ArticleAttachmentsPanel({
  pendingAttachments,
  setPendingAttachments,
  externalLinks,
  setExternalLinks,
  existingAttachments = [],
  attachmentKeysToDelete = [],
  setAttachmentKeysToDelete,
}: ArticleAttachmentsPanelProps) {
  const visibleExisting = existingAttachments.filter((att) => !attachmentKeysToDelete.includes(att.fileKey));

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const next: { file: File; name: string }[] = [];
    for (const f of Array.from(files)) {
      if (f.size > MAX_ARTICLE_ATTACHMENT_BYTES) {
        toast.error(
          `「${f.name}」은(는) 용량이 초과되었습니다. ${ARTICLE_ATTACHMENT_MAX_LABEL} 이하의 파일만 업로드할 수 있습니다.`
        );
        continue;
      }
      next.push({ file: f, name: f.name });
    }
    if (next.length) {
      setPendingAttachments((prev) => [...prev, ...next]);
    }
  };

  const addExternalLinkRow = () => {
    setExternalLinks((prev) => [...prev, { url: '', label: '' }]);
  };

  const updateExternalLink = (index: number, field: 'url' | 'label', value: string) => {
    setExternalLinks((prev) => {
      const copy = [...prev];
      const row = copy[index];
      if (!row) return prev;
      copy[index] = { ...row, [field]: value };
      return copy;
    });
  };

  const removeExternalLink = (index: number) => {
    setExternalLinks((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <div className="w-1 h-8 bg-primary-600 rounded" />
        첨부파일 (선택)
      </h2>

      <p className="text-sm text-gray-700 leading-relaxed rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
        <span className="font-semibold text-amber-900">파일 업로드:</span>{' '}
        {ARTICLE_ATTACHMENT_MAX_LABEL} 이하의 파일만 업로드할 수 있습니다. 더 큰 용량은 아래{' '}
        <span className="font-medium text-amber-900">참고 링크</span>에 외부 공유 URL을 등록해 주세요.
      </p>

      <div className="space-y-2">
        {visibleExisting.map((att) => (
          <div
            key={att.fileKey}
            className="flex items-center gap-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <Paperclip className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="text-sm text-gray-800 truncate flex-1">{att.originalFileName}</span>
            {setAttachmentKeysToDelete && (
              <button
                type="button"
                onClick={() => setAttachmentKeysToDelete((prev) => [...prev, att.fileKey])}
                className="text-gray-700 hover:text-red-500 transition-colors"
                aria-label="첨부 제거"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        {pendingAttachments.map((att, idx) => (
          <div
            key={`${att.name}-${idx}`}
            className="flex items-center gap-3 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
          >
            <Paperclip className="w-4 h-4 text-gray-700 flex-shrink-0" />
            <span className="text-sm text-gray-800 truncate flex-1">{att.name}</span>
            <span className="text-xs text-gray-600 flex-shrink-0">
              {(att.file.size / 1024 / 1024).toFixed(2)} MB
            </span>
            <button
              type="button"
              onClick={() => setPendingAttachments((prev) => prev.filter((_, i) => i !== idx))}
              className="text-gray-700 hover:text-red-500 transition-colors"
              aria-label="제거"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-400 transition-colors w-fit">
          <input
            type="file"
            multiple
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = '';
            }}
            className="hidden"
          />
          <Upload className="w-4 h-4 text-gray-700" />
          <span className="text-sm text-gray-700 font-medium">파일 추가 ({ARTICLE_ATTACHMENT_MAX_LABEL} 이하)</span>
        </label>
      </div>

      <div className="pt-4 border-t border-gray-200 space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Link2 className="w-5 h-5 text-primary-600" />
          참고 링크
        </h3>
        <p className="text-sm text-gray-700">
          원하는 웹 주소를 붙여넣을 수 있습니다. (http/https 등 표준 URL)
        </p>
        {externalLinks.length === 0 && (
          <Button type="button" variant="outline" size="sm" onClick={addExternalLinkRow} className="gap-1">
            <Plus className="w-4 h-4" />
            링크 추가
          </Button>
        )}
        <div className="space-y-3">
          {externalLinks.map((row, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2 items-end p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">URL</label>
                <Input
                  type="url"
                  placeholder="https://..."
                  value={row.url}
                  onChange={(e) => updateExternalLink(index, 'url', e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">표시 이름 (선택)</label>
                <Input
                  type="text"
                  placeholder="예: 스터디 자료 모음"
                  value={row.label}
                  onChange={(e) => updateExternalLink(index, 'label', e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="flex gap-2 justify-end pb-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => removeExternalLink(index)}
                >
                  삭제
                </Button>
              </div>
            </div>
          ))}
        </div>
        {externalLinks.length > 0 && (
          <Button type="button" variant="outline" size="sm" onClick={addExternalLinkRow} className="gap-1">
            <Plus className="w-4 h-4" />
            링크 추가
          </Button>
        )}
      </div>
    </div>
  );
}
