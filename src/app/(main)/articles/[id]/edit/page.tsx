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
import { fetchArticleById, updateArticle } from '@/lib/api/services/article-services';

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

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default function EditArticlePage({ params }: EditPageProps) {
  const router = useRouter();
  const { user: currentUser, isLoading: userLoading } = useCurrentUser();
  const [articleId, setArticleId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isLoadingArticle, setIsLoadingArticle] = useState(true);
  const [tagInput, setTagInput] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  
  // API data states
  const [categories, setCategories] = useState<Array<{ id: number; name: string; description: string }>>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    category: '',
    excerpt: '',
    content: '',
    tags: [],
    thumbnailUrl: '',
  });

  // ✅ Next.js 15: params는 Promise라 언랩 필요
  useEffect(() => {
    let mounted = true;

    params.then((resolvedParams) => {
      if (!mounted) return;
      setArticleId(resolvedParams.id);
    });

    return () => {
      mounted = false;
    };
  }, [params]);

  // Load categories on mount
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

  // Load article data on mount
  useEffect(() => {
    if (!articleId) return;

    const loadArticle = async () => {
      try {
        setIsLoadingArticle(true);
        const articleData = await fetchArticleById(articleId);
        
        if (articleData) {
          setFormData({
            title: articleData.title || '',
            category: articleData.category || '',
            excerpt: '', // excerpt is not returned from API, keep it empty for edit
            content: articleData.content || '',
            tags: [], // tags is not returned from API, keep it empty for edit
            thumbnailUrl: articleData.thumbnail || '',
          });

          if (articleData.thumbnail) {
            setThumbnailPreview(articleData.thumbnail);
          }
        }
      } catch (error) {
        console.error('Failed to load article:', error);
        alert('아티클을 불러오는데 실패했습니다.');
        router.push('/articles');
      } finally {
        setIsLoadingArticle(false);
      }
    };

    loadArticle();
  }, [articleId, router]);

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
      // API 요청 데이터 준비 (API 스펙에 맞게)
      const articleData = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
      };

      await updateArticle(articleId, articleData);
      
      // 수정 성공 시 상세 페이지로 이동
      alert('글이 성공적으로 수정되었습니다!');
      router.push(`/articles/${articleId}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : '글 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="w-full px-3 sm:px-4 lg:px-10">
      {/* Loading state for user authentication or article data */}
      {(userLoading || isLoadingArticle) && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600">데이터 불러오는 중...</p>
          </div>
        </div>
      )}

      {/* Not authenticated state */}
      {!userLoading && !currentUser && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600 mb-4">글을 수정하려면 먼저 로그인해주세요.</p>
            <Link href="/login">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                로그인
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Main form - only show when user is loaded and authenticated and article is loaded */}
      {!userLoading && !isLoadingArticle && currentUser && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-4 mb-2">
              <Link href={`/articles/${articleId}`} className="inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-4xl font-bold text-gray-900">글 수정하기</h1>
            </div>
            <p className="text-lg text-gray-600 ml-14">내용을 수정하고 업데이트해주세요</p>
          </div>

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

            {/* Tags Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <div className="w-1 h-8 bg-primary-600 rounded"></div>
                태그 <span className="text-red-500">*</span>
              </h2>

              <div className="flex gap-2">
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
                  placeholder="태그 입력 후 Enter 또는 버튼 클릭"
                  className={`py-3 bg-white ${errors.tags && formData.tags.length === 0 ? 'border-red-500 focus:ring-red-500' : 'focus:ring-primary-500'}`}
                />
                <Button
                  type="button"
                  onClick={addTag}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 font-semibold"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
              {errors.tags && formData.tags.length === 0 && <p className="text-red-500 text-sm flex items-center gap-1">✕ {errors.tags}</p>}

              {/* Tags Display */}
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <div
                    key={tag}
                    className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-gray-900 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
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
              <Link href={`/articles/${articleId}`}>
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
                    수정 중...
                  </div>
                ) : (
                  '글 수정하기'
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
      </div>
    </div>
  );
}
