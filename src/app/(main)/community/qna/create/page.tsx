"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import TitleBanner from '@/components/layout/TitleBanner';
import { Tag, X, AlertCircle } from 'lucide-react';
import { categoryService, type CategoryItem } from '@/lib/api/services/category-services';
import { questionService } from '@/lib/api/services/question-services';

interface TechTag {
  id: string;
  name: string;
  color: string;
}

const TAG_COLOR_PALETTE = [
  'bg-red-100 text-red-700',
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700',
  'bg-yellow-100 text-yellow-700',
  'bg-pink-100 text-pink-700',
  'bg-indigo-100 text-indigo-700',
  'bg-orange-100 text-orange-700',
] as const;

const colorForCategory = (name: string): string => {
  const hash = Array.from(name).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return TAG_COLOR_PALETTE[hash % TAG_COLOR_PALETTE.length];
};

export default function CreateQuestionPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<TechTag[]>([]);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; content?: string; tags?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [categories, setCategories] = useState<CategoryItem[]>([]);

  const availableTechTags: TechTag[] = useMemo(() => {
    return (categories ?? []).map((c) => ({
      id: c.name,
      name: c.name,
      color: colorForCategory(c.name),
    }));
  }, [categories]);

  // Current user role (should come from auth context)
  const currentUserRole: 'guest' | 'member' | 'admin' = 'member' as 'guest' | 'member' | 'admin';

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await categoryService.getCategories();
        if (cancelled) return;
        setCategories(res.categories ?? []);
      } catch (e) {
        console.error('Failed to load categories:', e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Only members can create questions
  if (currentUserRole === 'guest') {
    return (
      <div className="min-h-screen bg-background">
        <TitleBanner
          title="Q&A"
          description="기술 질문과 답변을 공유하는 공간입니다."
          backgroundImage="/images/BgHeader.png"
        />
        <main className="max-w-4xl mx-auto px-4 py-10">
          <div className="bg-white border border-red-200 rounded-xl p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              권한이 필요합니다
            </h2>
            <p className="text-gray-600 mb-6">
              질문을 작성하려면 정회원으로 로그인해야 합니다.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              로그인하기
            </button>
          </div>
        </main>
      </div>
    );
  }

  const handleToggleTag = (tag: TechTag) => {
    if (selectedTags.find((t) => t.id === tag.id)) {
      setSelectedTags(selectedTags.filter((t) => t.id !== tag.id));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
    setErrors((prev) => ({ ...prev, tags: undefined }));
  };

  const handleRemoveTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter((t) => t.id !== tagId));
  };

  const validate = () => {
    const newErrors: { title?: string; content?: string; tags?: string } = {};

    if (!title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    } else if (title.length < 10) {
      newErrors.title = '제목은 최소 10자 이상이어야 합니다.';
    }

    if (!content.trim()) {
      newErrors.content = '내용을 입력해주세요.';
    } else if (content.length < 20) {
      newErrors.content = '내용은 최소 20자 이상이어야 합니다.';
    }

    if (selectedTags.length === 0) {
      newErrors.tags = '최소 1개 이상의 기술 태그를 선택해주세요.';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      const order = ['title', 'content', 'tags'] as const;
      const first = order.find((k) => newErrors[k]);
      if (first) {
        requestAnimationFrame(() => {
          document.getElementById(`form-field-${first}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      }
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const created = await questionService.createQuestion({
        title: title.trim(),
        categories: selectedTags.map((t) => t.name),
        description: (description.trim() || title.trim()).slice(0, 200),
        content: content.trim(),
      });

      router.push(`/community/qna/${created.id}`);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : '질문 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TitleBanner
        title="질문하기"
        description="기술 관련 질문을 작성해주세요."
        backgroundImage="/images/BgHeader.png"
      />

      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white border border-gray-200 rounded-xl p-8">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">질문 작성 가이드</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>구체적이고 명확한 제목을 작성해주세요.</li>
                  <li>문제 상황, 시도한 방법, 기대 결과를 자세히 설명해주세요.</li>
                  <li>관련된 기술 태그를 최소 1개 이상 선택해주세요.</li>
                  <li>코드가 있다면 마크다운 형식으로 작성해주세요.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">설명</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="질문 요약(선택)"
              className="w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 border-gray-300 focus:ring-primary-500"
            />
            <p className="mt-1 text-xs text-gray-500">비워두면 제목을 기반으로 자동 생성됩니다.</p>
          </div>

          {/* Title */}
          <div className="mb-6" id="form-field-title">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              placeholder="질문 제목을 입력하세요 (최소 10자)"
              className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                errors.title
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-primary-500'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Tech Tags */}
          <div className="mb-6" id="form-field-tags">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              기술 태그 <span className="text-red-500">*</span>
            </label>
            
            {/* Selected Tags */}
            <div className="flex flex-wrap gap-2 mb-3 min-h-[40px] p-2 border border-gray-300 rounded-lg">
              {selectedTags.length === 0 ? (
                <span className="text-sm text-gray-400 self-center">
                  기술 태그를 선택해주세요
                </span>
              ) : (
                selectedTags.map((tag) => (
                  <span
                    key={tag.id}
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded ${tag.color}`}
                  >
                    <span className="text-sm font-medium">{tag.name}</span>
                    <button
                      onClick={() => handleRemoveTag(tag.id)}
                      className="hover:opacity-70"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Tag Selector Button */}
            <button
              type="button"
              onClick={() => setShowTagSelector(!showTagSelector)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Tag className="w-4 h-4" />
              {showTagSelector ? '태그 선택 닫기' : '태그 선택'}
            </button>

            {/* Tag Selector */}
            {showTagSelector && (
              <div className="mt-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex flex-wrap gap-2">
                  {availableTechTags.map((tag) => {
                    const isSelected = selectedTags.find((t) => t.id === tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className={`px-3 py-2 rounded text-sm font-medium transition-all ${
                          isSelected
                            ? `${tag.color} ring-2 ring-offset-2 ring-primary-500`
                            : 'bg-white text-gray-700 border border-gray-300 hover:border-primary-500'
                        }`}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
                {availableTechTags.length === 0 && (
                  <p className="mt-2 text-sm text-gray-500">카테고리를 불러오는 중이거나, 카테고리가 없습니다.</p>
                )}
              </div>
            )}

            {errors.tags && (
              <p className="mt-1 text-sm text-red-600">{errors.tags}</p>
            )}
          </div>

          {/* Content */}
          <div className="mb-6" id="form-field-content">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              내용 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setErrors((prev) => ({ ...prev, content: undefined }));
              }}
              placeholder="질문 내용을 자세히 작성해주세요 (최소 20자)&#10;&#10;• 문제 상황&#10;• 시도한 방법&#10;• 기대 결과"
              className={`w-full h-64 px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 resize-none ${
                errors.content
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-primary-500'
              }`}
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              마크다운 형식을 지원합니다. 코드 블록은 ```언어 로 작성하세요.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
            >
              {isSubmitting ? '등록 중...' : '질문 등록'}
            </button>
          </div>

          {submitError && <p className="mt-4 text-sm text-red-600">{submitError}</p>}
        </div>
      </main>
    </div>
  );
}
