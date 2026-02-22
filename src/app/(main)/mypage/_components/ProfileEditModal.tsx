'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { X, Loader2, Mail, User, FileText, Code, Github, Linkedin, Globe, Save, AlertCircle } from 'lucide-react';

import { profileService, UserResponse } from '@/lib/api/services/user-services';
import { TechStackInput } from '@/components/ui/TechStackInput';

type ProfileEditModalProps = {
  open: boolean;
  profile: UserResponse;
  onClose: () => void;
  onUpdated: (next: UserResponse) => void;
};

type FormState = {
  email: string;
  realName: string;
  description: string;
  techStack: string;
  githubUrl: string;
  linkedinUrl: string;
  blogUrl: string;
};

const cleanValue = (value: string | null | undefined): string => {
  if (!value || typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (trimmed === 'string' || trimmed === 'null' || trimmed === 'undefined') return '';
  return trimmed;
};

export default function ProfileEditModal({ open, profile, onClose, onUpdated }: ProfileEditModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialForm = useMemo<FormState>(() => {
    return {
      email: cleanValue(profile.email),
      realName: cleanValue(profile.realName),
      description: cleanValue(profile.description),
      techStack: cleanValue(profile.techStack),
      githubUrl: cleanValue(profile.githubUrl),
      linkedinUrl: cleanValue(profile.linkedinUrl),
      blogUrl: cleanValue(profile.blogUrl),
    };
  }, [profile]);

  const [form, setForm] = useState<FormState>(initialForm);

  useEffect(() => {
    if (!open) return;
    setForm(initialForm);
    setError(null);
  }, [open, initialForm]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      setError(null);

      // 이메일은 UI/서버 모두에서 변경 불가: payload에 포함하지 않음
      const cleaned = {
        realName: form.realName.trim() || undefined,
        description: form.description.trim() || undefined,
        techStack: form.techStack.trim() || undefined,
        githubUrl: form.githubUrl.trim() || undefined,
        linkedinUrl: form.linkedinUrl.trim() || undefined,
        blogUrl: form.blogUrl.trim() || undefined,
      } as const;

      const filtered = Object.fromEntries(
        Object.entries(cleaned).filter(([_, v]) => v !== undefined && v !== '')
      ) as Partial<UserResponse>;

      const updated = await profileService.updateProfile(filtered);
      onUpdated(updated);

      toast.success('프로필이 저장되었습니다!', { duration: 1800, icon: '✅' });
      onClose();
    } catch (e: any) {
      const msg = e?.message || '프로필 저장에 실패했습니다.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="닫기"
        onClick={onClose}
      />

      <div className="relative w-[92vw] max-w-xl max-h-[90vh] rounded-2xl bg-white shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">프로필 편집</h2>
            <p className="text-sm text-gray-700 mt-1">필요한 정보만 빠르게 수정할 수 있어요.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-700 hover:text-gray-700 transition-colors"
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-5 touch-pan-y">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline h-4 w-4 mr-1 text-primary-600" />
                이메일 (수정 불가)
              </label>
              <input
                type="email"
                value={form.email}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
              />
              <p className="text-xs text-gray-700 mt-2">한 번 설정된 이메일은 변경할 수 없습니다.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-1 text-primary-600" />
                실명
              </label>
              <input
                type="text"
                value={form.realName}
                onChange={(e) => setForm((prev) => ({ ...prev, realName: e.target.value }))}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all duration-300"
                placeholder="실명을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline h-4 w-4 mr-1 text-primary-600" />
                자기소개
                <span className="text-xs text-gray-700 font-normal ml-2">(선택)</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all duration-300 resize-none"
                placeholder="자기소개를 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Code className="inline h-4 w-4 mr-1 text-primary-600" />
                기술스택
              </label>
              <TechStackInput
                value={form.techStack}
                onChange={(next) => setForm((prev) => ({ ...prev, techStack: next }))}
                placeholder="React 입력 후 Enter"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all duration-300"
                maxLength={255}
                onMaxLengthExceeded={() => setError('기술스택은 255자 이하여야 합니다.')}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Github className="inline h-4 w-4 mr-1 text-primary-600" />
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={form.githubUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, githubUrl: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all duration-300"
                  placeholder="https://github.com/username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Linkedin className="inline h-4 w-4 mr-1 text-primary-600" />
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={form.linkedinUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, linkedinUrl: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all duration-300"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="inline h-4 w-4 mr-1 text-primary-600" />
                  블로그 URL
                </label>
                <input
                  type="url"
                  value={form.blogUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, blogUrl: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all duration-300"
                  placeholder="https://blog.example.com"
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 bg-white flex items-center justify-end gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  저장
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
