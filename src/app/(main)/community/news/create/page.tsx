'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, X, Upload, Search, UserCircle, AtSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import TipTapEditor from '@/components/editor/TipTapEditor';
import Image from 'next/image';
import { fetchCategories } from '@/lib/api/services/project-services';
import { createNews } from '@/lib/api/services/news-services';
import { memberService, CursorUserResponse } from '@/lib/api/services/user-services';
import { s3Service } from '@/lib/api/services/user-services';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface FormData {
  title: string;
  category: string;
  summary: string;
  content: string;
  tags: string[];
  participantIds: string[];
  thumbnailPath: string;
}

interface FormErrors {
  [key: string]: string;
}

const NEWS_CATEGORIES = ['MT', 'ST', 'ET', 'CT', 'OT'];

export default function NewNewsForm() {
  const router = useRouter();
  const { user: currentUser, isLoading: userLoading } = useCurrentUser();
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  
  // User search states
  const [allUsers, setAllUsers] = useState<CursorUserResponse[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<CursorUserResponse[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nicknameSearch, setNicknameSearch] = useState('');
  const [realNameSearch, setRealNameSearch] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [nextCursorId, setNextCursorId] = useState<number>(0);
  const [hasNext, setHasNext] = useState<boolean>(true);
  const [searchNextCursorId, setSearchNextCursorId] = useState<number>(0);
  const [searchHasNext, setSearchHasNext] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const userSearchRef = useRef<HTMLDivElement>(null);
  const userListRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    category: '',
    summary: '',
    content: '',
    tags: [],
    participantIds: [],
    thumbnailPath: '',
  });

  // Load initial users
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      setIsLoadingUsers(true);
      const response = await memberService.getMembersByCursorByName({ 
        cursorId: 0, 
        size: 10, 
        direction: 'ASC' 
      });
      
      setAllUsers(response.content);
      setFilteredUsers(response.content);
      setNextCursorId(response.nextCursorId);
      setHasNext(response.hasNext);
    } catch (error) {
      console.error('Failed to load users:', error);
      setAllUsers([]);
      setFilteredUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  const loadMoreUsers = useCallback(async () => {
    if (isLoadingMore || !hasNext) return;
    
    try {
      setIsLoadingMore(true);
      const response = await memberService.getMembersByCursorByName({ 
        cursorId: nextCursorId, 
        size: 10, 
        direction: 'ASC' 
      });
      
      setAllUsers(prev => [...prev, ...response.content]);
      setFilteredUsers(prev => [...prev, ...response.content]);
      setNextCursorId(response.nextCursorId);
      setHasNext(response.hasNext);
    } catch (error) {
      console.error('Failed to load more users:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextCursorId, hasNext, isLoadingMore]);

  const searchUsers = useCallback(async () => {
    if (!nicknameSearch.trim() && !realNameSearch.trim()) {
      handleResetSearch();
      return;
    }
    
    try {
      setIsLoadingUsers(true);
      setIsSearching(true);
      setIsSearchMode(true);
      
      const response = await memberService.getMembersByCursorByName({ 
        cursorId: 0, 
        size: 7, 
        direction: 'ASC',
        nickname: nicknameSearch.trim() || undefined,
        realName: realNameSearch.trim() || undefined
      });
      
      setFilteredUsers(response.content);
      setSearchNextCursorId(response.nextCursorId);
      setSearchHasNext(response.hasNext);
    } catch (error) {
      console.error('Failed to search users:', error);
      setFilteredUsers([]);
      setSearchHasNext(false);
    } finally {
      setIsLoadingUsers(false);
      setIsSearching(false);
    }
  }, [nicknameSearch, realNameSearch]);

  const handleResetSearch = useCallback(() => {
    setNicknameSearch('');
    setRealNameSearch('');
    setFilteredUsers(allUsers);
    setSearchHasNext(false);
    setSearchNextCursorId(0);
    setIsSearchMode(false);
  }, [allUsers]);

  const loadMoreUsersRef = useRef(loadMoreUsers);
  useEffect(() => {
    loadMoreUsersRef.current = loadMoreUsers;
  }, [loadMoreUsers]);

  useEffect(() => {
    const handleScroll = () => {
      if (!userListRef.current || isLoadingMore) return;
      
      const { scrollTop, scrollHeight, clientHeight } = userListRef.current;
      const threshold = 10;
      if (scrollTop + clientHeight >= scrollHeight - threshold) {
        loadMoreUsersRef.current();
      }
    };

    const listElement = userListRef.current;
    if (listElement) {
      listElement.addEventListener('scroll', handleScroll, { passive: true });
      return () => listElement.removeEventListener('scroll', handleScroll);
    }
  }, [isLoadingMore]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userSearchRef.current && !userSearchRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    }

    if (!formData.category) {
      newErrors.category = '카테고리를 선택해주세요.';
    }

    if (!formData.summary.trim()) {
      newErrors.summary = '요약을 입력해주세요.';
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

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
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

  const addParticipant = (user: CursorUserResponse) => {
    const isAlreadyAdded = formData.participantIds.includes(user.username);

    if (!isAlreadyAdded) {
      setFormData((prev) => ({
        ...prev,
        participantIds: [...prev.participantIds, user.username],
      }));
      setNicknameSearch('');
      setRealNameSearch('');
      setShowUserDropdown(false);
    }
  };

  const removeParticipant = (username: string) => {
    setFormData((prev) => ({
      ...prev,
      participantIds: prev.participantIds.filter((id) => id !== username),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let thumbnailPath = '';
      
      // Upload thumbnail if file exists
      if (thumbnailFile) {
        setIsUploadingThumbnail(true);
        try {
          thumbnailPath = await s3Service.uploadFile(thumbnailFile);
        } catch (uploadError) {
          console.error('Failed to upload thumbnail:', uploadError);
          alert('썸네일 업로드에 실패했습니다. 다시 시도해주세요.');
          setIsUploadingThumbnail(false);
          setLoading(false);
          return;
        } finally {
          setIsUploadingThumbnail(false);
        }
      }

      // Prepare data according to API spec
      const newsData = {
        title: formData.title,
        summary: formData.summary,
        content: formData.content,
        category: formData.category,
        participantIds: formData.participantIds,
        tags: formData.tags,
        ...(thumbnailPath && { thumbnailPath }),
      };

      const response = await createNews(newsData);
      alert('뉴스가 성공적으로 생성되었습니다!');
      router.push(`/community/news/${response.id}`);
    } catch (error: any) {
      alert(error.message || '뉴스 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {userLoading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      )}

      {!userLoading && !currentUser && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600 mb-4">뉴스를 작성하려면 먼저 로그인해주세요.</p>
            <Link href="/login">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                로그인
              </Button>
            </Link>
          </div>
        </div>
      )}

      {!userLoading && currentUser && (
        <>
          <div className="flex items-center gap-4 mb-8">
            <Link href="/community" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">새 뉴스 작성</h1>
              <p className="text-gray-600 mt-1">동아리 소식을 공유해주세요.</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리 <span className="text-red-500">*</span>
                </label>
                <div className={`border rounded-lg p-3 ${errors.category ? 'border-red-500' : 'border-gray-300'}`}>
                  <div className="grid grid-cols-2 gap-2">
                    {NEWS_CATEGORIES.map((cat) => {
                      const isSelected = formData.category === cat;
                      return (
                        <label
                          key={cat}
                          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer ${
                            isSelected ? 'bg-blue-50 border border-blue-500' : 'hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="category"
                            checked={isSelected}
                            onChange={() => {
                              setFormData((prev) => ({
                                ...prev,
                                category: cat,
                              }));
                              if (errors.category) {
                                setErrors((prev) => ({
                                  ...prev,
                                  category: '',
                                }));
                              }
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-900">{cat}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>

              {/* Summary */}
              <div>
                <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
                  요약 <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="summary"
                  name="summary"
                  value={formData.summary}
                  onChange={handleInputChange}
                  placeholder="뉴스를 간단히 요약해주세요."
                  rows={3}
                  className={errors.summary ? 'border-red-500' : ''}
                />
                {errors.summary && <p className="text-red-500 text-sm mt-1">{errors.summary}</p>}
              </div>
            </div>

            {/* Thumbnail Upload */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">썸네일 이미지</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  썸네일 (선택)
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
                    placeholder="뉴스 내용을 작성해주세요..."
                  />
                </div>
                {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
              </div>
            </div>

            {/* Participants */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">참여자</h2>

              <div className="relative" ref={userSearchRef}>
                <div className="flex gap-2 mb-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      value={nicknameSearch}
                      onChange={(e) => {
                        setNicknameSearch(e.target.value);
                        if (e.target.value.trim() || realNameSearch.trim()) {
                          searchUsers();
                        } else {
                          handleResetSearch();
                        }
                      }}
                      onFocus={() => setShowUserDropdown(true)}
                      placeholder="닉네임으로 검색..."
                      className="pl-10"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      value={realNameSearch}
                      onChange={(e) => {
                        setRealNameSearch(e.target.value);
                        if (e.target.value.trim() || nicknameSearch.trim()) {
                          searchUsers();
                        } else {
                          handleResetSearch();
                        }
                      }}
                      onFocus={() => setShowUserDropdown(true)}
                      placeholder="실명으로 검색..."
                      className="pl-10"
                    />
                  </div>
                </div>

                {showUserDropdown && (
                  <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto" ref={userListRef}>
                    {isLoadingUsers ? (
                      <div className="p-8 text-center text-gray-500">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
                        <p>{isSearching ? '검색 중...' : '사용자 목록을 불러오는 중...'}</p>
                      </div>
                    ) : filteredUsers.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        {isSearchMode ? '검색 결과가 없습니다.' : '사용자가 없습니다.'}
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {filteredUsers.map((user) => {
                          const isAlreadyAdded = formData.participantIds.includes(user.username);
                          
                          return (
                            <div
                              key={user.username}
                              className={`p-3 hover:bg-gray-50 cursor-pointer ${
                                isAlreadyAdded ? 'opacity-50' : ''
                              }`}
                              onClick={() => !isAlreadyAdded && addParticipant(user)}
                            >
                              <div className="flex items-center gap-3">
                                <UserCircle className="w-8 h-8 text-gray-400" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {user.realName || user.nickname || user.email}
                                  </p>
                                  <p className="text-xs text-gray-500">{user.username}</p>
                                </div>
                                {isAlreadyAdded && (
                                  <span className="text-xs text-blue-600">추가됨</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Selected Participants */}
                {formData.participantIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.participantIds.map((username) => {
                      const user = allUsers.find(u => u.username === username);
                      return (
                        <span
                          key={username}
                          className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {user?.realName || user?.nickname || username}
                          <button
                            type="button"
                            onClick={() => removeParticipant(username)}
                            className="hover:text-blue-900"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">태그</h2>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  태그 (선택)
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
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Tags Display */}
                {formData.tags.length > 0 && (
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
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 justify-end">
              <Link href="/community">
                <Button type="button" variant="outline" className="text-gray-700">
                  취소
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading || isUploadingThumbnail}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading || isUploadingThumbnail ? '작성 중...' : '뉴스 작성'}
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

