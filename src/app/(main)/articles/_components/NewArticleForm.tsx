'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, X, Upload, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import TipTapEditor from '@/components/editor/TipTapEditor';
import TableOfContents from '@/components/editor/TableOfContents';
import Image from 'next/image';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { fetchCategories } from '@/lib/api/services/project-services';
import { createArticle } from '@/lib/api/services/article-services';

interface FormData {
  title: string;
  category: string;
  excerpt: string;
  content: string;
  thumbnailUrl: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function NewArticleForm() {
  const router = useRouter();
  const { user: currentUser, isLoading: userLoading } = useCurrentUser();
  const [loading, setLoading] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  
  const [categories, setCategories] = useState<Array<{ id: number; name: string; description: string }>>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    category: '',
    excerpt: '',
    content: '',
    thumbnailUrl: '',
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await fetchCategories();
        setCategories(response.categories);
      } catch (error) {
        console.error('Failed to load categories:', error);
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

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
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
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
      const articleData = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
      };

      const response = await createArticle(articleData);
      
      alert('글이 성공적으로 작성되었습니다!');
      router.push(`/articles/${response.id}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : '글 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Authentication loading state
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // Authentication check
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">로그인이 필요합니다.</p>
          <Link href="/login">
            <Button className="bg-primary-600 hover:bg-primary-700">로그인하러 가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-background">
      <div className="w-full mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header with Back Button */}
          <div className="mb-8">
          <Link 
            href="/articles" 
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            목록으로 돌아가기
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">새 글 작성</h1>
        </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <div className="w-1 h-8 bg-primary-600 rounded"></div>
              기본 정보
            </h2>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
                제목 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="글의 제목을 입력해주세요"
                  maxLength={50}
                  className={`py-3 pr-16 bg-white ${errors.title ? 'border-red-500 focus:ring-red-500' : 'focus:ring-primary-500'}`}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 pointer-events-none font-medium">
                  {formData.title.length}/50
                </span>
              </div>
              {errors.title && <p className="text-red-500 text-sm mt-2 flex items-center gap-1">✕ {errors.title}</p>}
            </div>

            {/* Category and Excerpt Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  카테고리 <span className="text-red-500">*</span>
                </label>
                {isLoadingCategories ? (
                  <div className="w-full py-2 px-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                    로딩 중...
                  </div>
                ) : (
                  <>
                    {/* Search Bar */}
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        placeholder="카테고리 검색..."
                        className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div className={`border rounded-lg p-3 min-h-[120px] max-h-[200px] overflow-y-auto ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}>
                      {(() => {
                        const filteredCategories = categories.filter(cat => 
                          cat.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
                          (cat.description && cat.description.toLowerCase().includes(categorySearch.toLowerCase()))
                        );
                        
                        if (filteredCategories.length === 0) {
                          return (
                            <p className="text-gray-500 text-sm">
                              {categorySearch ? '검색 결과가 없습니다' : '카테고리가 없습니다'}
                            </p>
                          );
                        }
                        
                        return (
                          <div className="space-y-2">
                            {filteredCategories.map((cat) => {
                              const isSelected = formData.category === cat.name;
                              return (
                                <label
                                  key={cat.id}
                                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                                >
                                  <input
                                    type="radio"
                                    name="category"
                                    checked={isSelected}
                                    onChange={() => {
                                      setFormData((prev) => ({
                                        ...prev,
                                        category: cat.name,
                                      }));
                                      setCategorySearch('');
                                      if (errors.category) {
                                        setErrors((prev) => ({
                                          ...prev,
                                          category: '',
                                        }));
                                      }
                                    }}
                                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                  />
                                  <div className="flex-1">
                                    <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                                    {cat.description && (
                                      <p className="text-xs text-gray-500 mt-0.5">{cat.description}</p>
                                    )}
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                    {/* Selected Category Display */}
                    {formData.category && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-600 mb-2">선택된 카테고리:</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                            {formData.category}
                            <button
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  category: '',
                                }));
                              }}
                              className="hover:text-primary-900"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </span>
                        </div>
                      </div>
                    )}
                    {errors.category && <p className="text-red-500 text-sm mt-2 flex items-center gap-1">✕ {errors.category}</p>}
                  </>
                )}
              </div>

              {/* Excerpt */}
              <div>
                <label htmlFor="excerpt" className="block text-sm font-semibold text-gray-900 mb-2">
                  아티클 요약 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Textarea
                    id="excerpt"
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    placeholder="글의 내용을 간단히 설명해주세요"
                    maxLength={100}
                    className={`${
                      errors.excerpt
                        ? 'border-red-500 focus-visible:ring-red-500'
                        : 'focus-visible:ring-primary-500'
                    } min-h-24 pr-14`}
                  />
                  <span className="absolute right-3 bottom-2 text-xs text-gray-500 pointer-events-none font-medium">
                    {formData.excerpt.length}/100
                  </span>
                </div>
                {errors.excerpt && <p className="text-red-500 text-sm mt-2 flex items-center gap-1">✕ {errors.excerpt}</p>}
              </div>
            </div>
          </div>

          {/* Thumbnail Section */}
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
                      alt="Thumbnail preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setThumbnailPreview('');
                        setFormData((prev) => ({ ...prev, thumbnailUrl: '' }));
                      }}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
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
                    <p className="text-sm text-gray-600 mt-1">또는 드래그 앤 드롭</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Content Editor Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <div className="w-1 h-8 bg-primary-600 rounded"></div>
              내용 <span className="text-red-500">*</span>
            </h2>
            <div className="lg:flex lg:gap-6">
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden shadow-sm min-h-[500px] lg:w-2/3 w-full">
                <TipTapEditor
                  content={formData.content}
                  onChange={handleEditorChange}
                  placeholder="글의 내용을 자유롭게 작성해주세요..."
                />
              </div>
              <aside className="mt-4 lg:mt-0 lg:w-1/3 w-full">
                <TableOfContents contentHtml={formData.content} />
              </aside>
            </div>
            {errors.content && <p className="text-red-500 text-sm flex items-center gap-1">✕ {errors.content}</p>}
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
            <Link href="/articles">
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
              disabled={loading}
              className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  작성 중...
                </div>
              ) : (
                '글 작성하기'
              )}
            </Button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
}
