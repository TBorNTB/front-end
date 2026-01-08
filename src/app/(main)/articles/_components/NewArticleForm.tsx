'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TipTapEditor from '@/components/editor/TipTapEditor';
import Image from 'next/image';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const ARTICLE_CATEGORIES = [
  '웹 해킹',
  '리버싱',
  '시스템 해킹',
  '디지털 포렌식',
  '네트워크 보안',
  'IoT보안',
  '암호학',
];

interface FormData {
  title: string;
  category: string;
  excerpt: string;
  content: string;
  tags: string[];
  thumbnailUrl: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function NewArticleForm() {
  const router = useRouter();
  const { user: currentUser, isLoading: userLoading } = useCurrentUser();
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    category: '',
    excerpt: '',
    content: '',
    tags: [],
    thumbnailUrl: '',
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    }

    if (!formData.category) {
      newErrors.category = '카테고리를 선택해주세요.';
    }

    if (!formData.excerpt.trim()) {
      newErrors.excerpt = '요약을 입력해주세요.';
    }

    if (!formData.content.trim()) {
      newErrors.content = '내용을 작성해주세요.';
    }

    if (formData.tags.length === 0) {
      newErrors.tags = '최소 하나의 태그를 추가해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
      if (errors.tags) {
        setErrors((prev) => ({
          ...prev,
          tags: '',
        }));
      }
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
        setFormData((prev) => ({
          ...prev,
          thumbnailUrl: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditorChange = (html: string) => {
    setFormData((prev) => ({
      ...prev,
      content: html,
    }));
    if (errors.content) {
      setErrors((prev) => ({
        ...prev,
        content: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/articles/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '글 작성에 실패했습니다.');
      }

      const data = await response.json();
      alert('글이 성공적으로 작성되었습니다!');
      router.push(`/articles/${data.id}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : '글 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Loading state for user authentication */}
      {userLoading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      )}

      {/* Not authenticated state */}
      {!userLoading && !currentUser && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600 mb-4">글을 작성하려면 먼저 로그인해주세요.</p>
            <Link href="/login">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                로그인
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Main form - only show when user is loaded and authenticated */}
      {!userLoading && currentUser && (
        <>
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/articles" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">새 글 쓰기</h1>
              <p className="text-gray-600 mt-1">지식과 경험을 공유해주세요.</p>
            </div>
          </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">기본 정보</h2>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              제목 <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="제목을 입력해주세요."
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              카테고리 <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">카테고리를 선택하세요</option>
              {ARTICLE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>

          {/* Excerpt */}
          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
              한 줄 요약 <span className="text-red-500">*</span>
            </label>
            <Input
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              placeholder="글을 간단히 요약해주세요."
              className={errors.excerpt ? 'border-red-500' : ''}
            />
            {errors.excerpt && <p className="text-red-500 text-sm mt-1">{errors.excerpt}</p>}
          </div>
        </div>

        {/* Thumbnail Upload */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">썸네일 이미지</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              글 썸네일 (선택)
            </label>
            <div className="flex items-center gap-4">
              {thumbnailPreview && (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-300">
                  <Image
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    fill
                    className="object-cover"
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

        {/* Content Editor */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">내용 <span className="text-red-500">*</span></h2>

          <div>
            <div className="border border-gray-300 rounded-lg overflow-hidden min-h-[400px]">
              <TipTapEditor
                content={formData.content}
                onChange={handleEditorChange}
                placeholder="글 내용을 작성해주세요..."
              />
            </div>
            {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">태그</h2>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              태그 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 mb-3">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="태그를 입력하고 Enter를 누르세요"
                className={errors.tags ? 'border-red-500' : ''}
              />
              <Button
                type="button"
                onClick={addTag}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {errors.tags && <p className="text-red-500 text-sm mb-3">{errors.tags}</p>}

            {/* Tags Display */}
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-blue-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 justify-end">
          <Link href="/articles">
            <Button type="button" variant="outline" className="text-gray-700">
              취소
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? '작성 중...' : '글 작성'}
          </Button>
        </div>
      </form>
        </>
      )}
    </div>
  );
}
