'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, X, Upload, User, Search, UserCircle, AtSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TipTapEditor from '@/components/editor/TipTapEditor';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { fetchCategories, createProject } from '@/lib/api/services/project-services';
import { memberService, CursorUserResponse } from '@/lib/api/services/user-services';
import { s3Service } from '@/lib/api/services/s3-services';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { requireNotGuest } from '@/lib/role-utils';
import { searchProjectsByQuery, fetchLatestProjects, type ProjectSearchItem } from '@/lib/api/services/elastic-services';
import { PROJECT_STATUS_API_OPTIONS, getProjectStatusKorean, type ProjectStatusApiValue } from '@/types/services/project';

interface FormData {
  title: string;
  categories: string[];
  description: string;
  details: string;
  tags: string[];
  subGoals: string[];
  projectUrl: string;
  repositoryUrl: string;
  status: ProjectStatusApiValue;
  startDate: string;
  endDate: string;
  collaborators: Array<{ name: string; email: string; role: string }>;
}


interface FormErrors {
  [key: string]: string;
}

export default function NewProjectForm() {
    const router = useRouter();
    const { user: currentUser, isLoading: userLoading } = useCurrentUser();
    const [loading, setLoading] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const [subGoalInput, setSubGoalInput] = useState('');
    const [errors, setErrors] = useState<FormErrors>({});
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>('');
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailKey, setThumbnailKey] = useState<string>('');
    const [contentImageKeys, setContentImageKeys] = useState<string[]>([]);
    const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
    const [categorySearchQuery, setCategorySearchQuery] = useState('');
  
  // API data states
  const [categories, setCategories] = useState<Array<{ id: number; name: string; description: string }>>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [allUsers, setAllUsers] = useState<CursorUserResponse[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<CursorUserResponse[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nicknameSearch, setNicknameSearch] = useState('');
  const [realNameSearch, setRealNameSearch] = useState('');
  const [nextCursorId, setNextCursorId] = useState<number>(0);
  const [hasNext, setHasNext] = useState<boolean>(true);
  const [searchNextCursorId, setSearchNextCursorId] = useState<number>(0);
  const [searchHasNext, setSearchHasNext] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const userSearchRef = useRef<HTMLDivElement>(null);
  const userListRef = useRef<HTMLDivElement>(null);

  // 부모 프로젝트 검색
  const [parentProjectId, setParentProjectId] = useState<number | null>(null);
  const [parentProjectTitle, setParentProjectTitle] = useState<string>('');
  const [parentQuery, setParentQuery] = useState('');
  const [parentResults, setParentResults] = useState<ProjectSearchItem[]>([]);
  const [isLoadingParent, setIsLoadingParent] = useState(false);
  const [parentPage, setParentPage] = useState(0);
  const [parentHasNext, setParentHasNext] = useState(false);
  const [showParentDropdown, setShowParentDropdown] = useState(false);
  const parentSearchRef = useRef<HTMLDivElement>(null);
  const parentListRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    categories: [],
    description: '',
    details: '',
    tags: [],
    subGoals: [],
    projectUrl: '',
    repositoryUrl: '',
    status: 'PLANNING',
    startDate: '',
    endDate: '',
    collaborators: [],
  });

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await fetchCategories();
        setCategories(response.categories);
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  // Load initial users with cursor pagination
  useEffect(() => {
    const loadInitialUsers = async () => {
      try {
        setIsLoadingUsers(true);
        setNextCursorId(0);
        setHasNext(true);
        
        const response = await memberService.getMembersByCursor({ 
          cursorId: 0, 
          size: 7, 
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
    };
    loadInitialUsers();
  }, []);

// Load initial users with cursor pagination
  useEffect(() => {
    const loadInitialUsers = async () => {
      try {
        setIsLoadingUsers(true);
        setNextCursorId(0);
        setHasNext(true);
        
        const response = await memberService.getMembersByCursor({ 
          cursorId: 0, 
          size: 7, 
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
    };
    loadInitialUsers();
  }, []);

  // Load more users when scrolling to bottom
  const loadMoreUsers = useCallback(async () => {
    if (isLoadingMore || isLoadingUsers) return;

    // If searching, use search API
    if (isSearchMode) {
      if (!searchHasNext) return;
      
      try {
        setIsLoadingMore(true);
        const response = await memberService.getMembersByCursorByName({ 
          cursorId: searchNextCursorId, 
          size: 7, 
          direction: 'ASC',
          nickname: nicknameSearch.trim() || undefined,
          realName: realNameSearch.trim() || undefined
        });
        
        setFilteredUsers(prev => [...prev, ...response.content]);
        setSearchNextCursorId(response.nextCursorId);
        setSearchHasNext(response.hasNext);
      } catch (error) {
        console.error('Failed to load more search results:', error);
      } finally {
        setIsLoadingMore(false);
      }
    } else {
      // Normal pagination
      if (!hasNext) return;
      
      try {
        setIsLoadingMore(true);
        const response = await memberService.getMembersByCursor({ 
          cursorId: nextCursorId, 
          size: 7, 
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
    }
  }, [hasNext, isLoadingMore, isLoadingUsers, nextCursorId, isSearchMode, nicknameSearch, realNameSearch, searchHasNext, searchNextCursorId]);

  // Search users function (called when search button is clicked)
  const handleSearchUsers = useCallback(async () => {
    // Reset search if both fields are empty
    if (!nicknameSearch.trim() && !realNameSearch.trim()) {
      setFilteredUsers(allUsers);
      setSearchHasNext(false);
      setSearchNextCursorId(0);
      setIsSearchMode(false);
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
  }, [nicknameSearch, realNameSearch, allUsers]);

  // Reset search and show all users
  const handleResetSearch = useCallback(() => {
    setNicknameSearch('');
    setRealNameSearch('');
    setFilteredUsers(allUsers);
    setSearchHasNext(false);
    setSearchNextCursorId(0);
    setIsSearchMode(false);
  }, [allUsers]);

  // 부모 프로젝트: 최신 목록 로드 (빈 검색 시 페이지네이션)
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

  // 부모 프로젝트: 이름으로 검색
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

  // Store loadMoreUsers in ref to avoid recreating scroll handler
  const loadMoreUsersRef = useRef(loadMoreUsers);
  useEffect(() => {
    loadMoreUsersRef.current = loadMoreUsers;
  }, [loadMoreUsers]);

  // Infinite scroll handler - load more when scrolled to bottom
  useEffect(() => {
    const handleScroll = () => {
      if (!userListRef.current || isLoadingMore) return;
      
      const { scrollTop, scrollHeight, clientHeight } = userListRef.current;
      // Load more when scrolled to bottom (with small threshold for smooth loading)
      const threshold = 10; // 10px threshold
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userSearchRef.current && !userSearchRef.current.contains(event.target as Node)) {
        setIsSearchMode(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const FORM_FIELD_ORDER = ['title', 'categories', 'description', 'tags', 'projectUrl', 'repositoryUrl'] as const;

  const scrollToFirstError = (errorKeys: string[]) => {
    const first = FORM_FIELD_ORDER.find((k) => errorKeys.includes(k));
    if (first) {
      requestAnimationFrame(() => {
        document.getElementById(`form-field-${first}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = '프로젝트 이름을 입력해주세요.';
    }

    if (formData.categories.length === 0) {
      newErrors.categories = '최소 하나의 카테고리를 선택해주세요.';
    }

    if (!formData.description.trim()) {
      newErrors.description = '프로젝트 설명을 입력해주세요.';
    }

    if (formData.tags.length === 0) {
      newErrors.tags = '최소 하나의 태그를 추가해주세요.';
    }

    if (formData.projectUrl && !isValidUrl(formData.projectUrl)) {
      newErrors.projectUrl = '유효한 URL을 입력해주세요.';
    }

    if (formData.repositoryUrl && !isValidUrl(formData.repositoryUrl)) {
      newErrors.repositoryUrl = '유효한 URL을 입력해주세요.';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      scrollToFirstError(Object.keys(newErrors));
    }
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    setErrors((prev) => {
      if (prev[name]) {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
      return prev;
    });
  }, []);

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

  const toggleCategory = (categoryName: string) => {
    setFormData((prev) => {
      const isSelected = prev.categories.includes(categoryName);
      return {
        ...prev,
        categories: isSelected
          ? prev.categories.filter((c) => c !== categoryName)
          : [...prev.categories, categoryName],
      };
    });
    // Clear error for this field
    if (errors.categories) {
      setErrors((prev) => ({
        ...prev,
        categories: '',
      }));
    }
  };

  const addSubGoal = () => {
    if (subGoalInput.trim() && !formData.subGoals.includes(subGoalInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        subGoals: [...prev.subGoals, subGoalInput.trim()],
      }));
      setSubGoalInput('');
    }
  };

  const removeSubGoal = (goal: string) => {
    setFormData((prev) => ({
      ...prev,
      subGoals: prev.subGoals.filter((g) => g !== goal),
    }));
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailKey('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnailPreview(null);
    setThumbnailFile(null);
    setThumbnailKey('');
  };

  const addCollaborator = (user: CursorUserResponse) => {
    // 만드는 사람(본인)은 협력자에 넣지 않음
    if (currentUser && user.username === currentUser.username) {
      toast.error('본인은 협력자로 넣을 수 없습니다.');
      return;
    }

    // Check if user is already added
    const isAlreadyAdded = formData.collaborators.some(
      (collab) => collab.email === user.username || collab.name === (user.realName || user.nickname || user.email)
    );

    if (!isAlreadyAdded) {
      setFormData((prev) => ({
        ...prev,
        collaborators: [
          ...prev.collaborators,
          {
            name: user.realName || user.nickname || user.email,
            email: user.username, // Store username in email field for API
            role: 'CONTRIBUTOR',
          },
        ],
      }));
      setNicknameSearch('');
      setRealNameSearch('');
      setIsSearchMode(false);
    }
  };

  const removeCollaborator = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      collaborators: prev.collaborators.filter((_, i) => i !== index),
    }));
  };

  const handleEditorImageUpload = useCallback(async (file: File) => {
    const result = await s3Service.uploadFile(file);
    setContentImageKeys(prev => [...prev, result.key]);
    return result;
  }, []);

  const handleEditorChange = useCallback((html: string) => {
    setFormData((prev) => ({
      ...prev,
      details: html,
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;
    if (!requireNotGuest(currentUser?.role, 'create', 'project')) return;
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let uploadedThumbnailKey = thumbnailKey;

      // Upload thumbnail if file exists and not yet uploaded
      if (thumbnailFile && !thumbnailKey) {
        setIsUploadingThumbnail(true);
        try {
          const result = await s3Service.uploadFile(thumbnailFile);
          uploadedThumbnailKey = result.key;
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
      const projectData = {
        title: formData.title,
        description: formData.description,
        thumbnail: '',
        content: formData.details || '',
        projectStatus: formData.status,
        categories: formData.categories,
        collaborators: formData.collaborators
          .map((collab) => collab.email)
          .filter((email) => email !== currentUser?.username),
        techStacks: formData.tags,
        subGoals: formData.subGoals,
        startedAt: formData.startDate ? new Date(formData.startDate).toISOString() : new Date().toISOString(),
        endedAt: formData.endDate ? new Date(formData.endDate).toISOString() : new Date().toISOString(),
        thumbnailKey: uploadedThumbnailKey || null,
        contentImageKeys: contentImageKeys,
        parentProjectId: parentProjectId ?? null,
      };

      const response = await createProject(projectData);
      alert(response.message || '프로젝트가 성공적으로 생성되었습니다!');
      router.push(`/projects/${response.id}`);
    } catch (error: any) {
      alert(error.message || '프로젝트 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="w-full mx-auto">
      {/* Loading state for user authentication */}
      {userLoading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      )}

      {/* Not authenticated state */}
      {!userLoading && !currentUser && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600 mb-4">프로젝트를 생성하려면 먼저 로그인해주세요.</p>
            <Link href="/login">
              <Button className="bg-primary-600 hover:bg-primary-700 text-white">
                로그인
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Main form - only show when user is loaded and authenticated */}
      {!userLoading && currentUser && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="mb-8 pb-6 ">
            <div className="flex items-center gap-4 mb-2">
              <Link
                href="/projects"
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-4xl font-bold text-gray-900">새 프로젝트 만들기</h1>
            </div>
            <p className="text-lg text-gray-600 ml-14">새로운 프로젝트를 등록하고 협력자들과 함께 작업하세요.</p>
          </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white space-y-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 border-l-4 border-primary-600 pl-3">기본 정보</h2>

          {/* Project Name */}
          <div id="form-field-title">
            <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
              프로젝트 이름 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="프로젝트 이름을 입력해주세요."
              maxLength={50}
              className={errors.title ? 'border-red-500' : 'border-primary-200 focus:ring-secondary-500'}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-700 pointer-events-none font-medium">
                    {formData.title.length}/50
            </span>
            </div>
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Categories */}
          <div id="form-field-categories">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              카테고리 <span className="text-red-500">*</span>
            </label>
            {isLoadingCategories ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                <span className="text-gray-500">카테고리 로딩 중...</span>
              </div>
            ) : (
              <>
                {/* Category Search Input */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary-400" />
                  <Input
                    placeholder="카테고리 검색..."
                    value={categorySearchQuery}
                    onChange={(e) => setCategorySearchQuery(e.target.value)}
                    className="pl-10 border-primary-200 focus:ring-secondary-500"
                  />
                </div>
                <p className="text-xs text-primary-600 mb-2">카테고리는 최대 3개까지 선택할 수 있습니다.</p>
                <div className={`border rounded-lg p-3 min-h-[120px] max-h-[200px] overflow-y-auto ${
                  errors.categories ? 'border-red-500' : 'border-gray-300'
                }`}>
                  {categories.length === 0 ? (
                    <p className="text-gray-500 text-sm">카테고리가 없습니다</p>
                  ) : (
                    <div className="space-y-2">
                      {categories
                        .filter((cat) =>
                          cat.name.toLowerCase().includes(categorySearchQuery.toLowerCase()) ||
                          cat.description?.toLowerCase().includes(categorySearchQuery.toLowerCase())
                        )
                        .map((cat) => {
                          const isSelected = formData.categories.includes(cat.name);
                          const disabled = !isSelected && formData.categories.length >= 3;
                          return (
                            <label
                              key={cat.id}
                              className={`flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <input
                                type="checkbox"
                                name="categories"
                                value={cat.name}
                                checked={isSelected}
                                disabled={disabled}
                                onChange={() => toggleCategory(cat.name)}
                                className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-secondary-500"
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
                  )}
                </div>
                {/* Selected Categories Display */}
                {formData.categories.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-600 mb-2">선택된 카테고리:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.categories.map((cat) => (
                        <span key={cat} className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                          {cat}
                          <button
                            type="button"
                            onClick={() => toggleCategory(cat)}
                            className="hover:text-primary-900"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            {errors.categories && <p className="text-red-500 text-sm mt-1">{errors.categories}</p>}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              상태
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className=" text-sm w-full px-3 py-2 text-gray-900 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
            >
              {PROJECT_STATUS_API_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {getProjectStatusKorean(status)}
                </option>
              ))}
            </select>
          </div>

          {/* Project Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm text-gray-700 mb-2">
                시작일
              </label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
                className='border-primary-200 focus:ring-secondary-500'
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm text-gray-700 mb-2">
                종료일
              </label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleInputChange}
                className='border-primary-200 focus:ring-secondary-500'
              />
            </div>
          </div>
        </div>

        {/* Thumbnail Upload */}
        <div className="bg-white space-y-6 ">
        <h2 className="text-2xl font-semibold text-gray-900 border-l-4 border-primary-600 pl-3">썸네일 이미지</h2>
          <label className="block text-sm font-medium text-gray-700 mb-2">
             프로젝트 썸네일 이미지 
        </label>
        <div>
          <div className="flex flex-col gap-4">
            {/* Upload Button */}
            <label className="cursor-pointer inline-block">
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="hidden"
            />
            <div className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg border border-gray-300 w-auto">
              <Upload className="w-4 h-4" />
              <span>이미지 업로드</span>
            </div>
          </label>

            {/* Thumbnail Preview below button */}
            {thumbnailPreview && (
              <div className="relative w-full lg:w-9/12 h-96 mb-8 rounded-xl overflow-hidden bg-gray-100 border border-gray-300">
                <Image
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  fill
                  className="object-cover"
                />
                {/* X button to remove thumbnail */}
                <button
                  type="button"
                  onClick={handleRemoveThumbnail}
                  className="absolute top-2 right-2 bg-white/70 text-red-500 rounded-full p-2 hover:bg-white shadow-md"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

        {/* Description */}
        <div className="bg-white space-y-4 border-b border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900 border-l-4 border-primary-600 pl-3">설명</h2>

          <div id="form-field-description">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              프로젝트 요약 <span className="text-red-500">*</span>
            </label>
          <div className="relative">
             <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="프로젝트를 간단히 설명해주세요."
              maxLength={100}
              className={`${
                        errors.description
                          ? 'border-red-500 focus-visible:ring-red-500'
                          : 'border-primary-200 focus-visible:ring-secondary-500'
                      } `}
                    />
            <span className="absolute right-3 bottom-2 text-xs text-gray-700 pointer-events-none font-medium">
              {formData.description.length}/100
            </span>
          </div>
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>
           
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상세 설명
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <TipTapEditor
                content={formData.details}
                onChange={handleEditorChange}
                onImageUpload={handleEditorImageUpload}
                placeholder="프로젝트에 대해 자세히 설명해주세요..."
              />
            </div>
            <p className="text-gray-700 text-sm mt-1">리치 텍스트 에디터를 사용하여 작성해주세요.</p>
          </div>
        </div>

        {/* Tags and Tech Stack */}
        <div className="bg-white space-y-4 border-b border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900 border-l-4 border-primary-600 pl-3">기술 스택 <span className="text-red-500">*</span></h2>

          <div id="form-field-tags">
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              프로젝트를 생성할 때 관련된 기술태그 입력하세요. 
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
                placeholder="태그를 입력하고 Enter를 누르세요 (예: React, Node.js)"
                className={`${errors.tags ? 'border-red-500' : 'border-primary-200'} focus:ring-secondary-500`}
              />
              <Button
                type="button"
                onClick={addTag}
                className="bg-primary-500 hover:bg-primary-600 text-white"
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
                  className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium "
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-primary-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Sub Goals */}
        <h2 className="text-2xl font-semibold text-gray-900 border-l-4 border-primary-600 pl-3">서브 목표</h2>

          <div>
            <label htmlFor="subGoals" className="block text-sm font-medium text-gray-700 mb-2">
              프로젝트를 생성할 때 달성하고 싶은 서브 목표 체크리스트를 입력하세요.
            </label>
            <div className="flex gap-2 mb-3">
              <Input
                id="subGoals"
                value={subGoalInput}
                onChange={(e) => setSubGoalInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSubGoal();
                  }
                }}
                placeholder="서브 목표를 입력하고 Enter를 누르세요"
                className="border-primary-200 focus:ring-secondary-500"
              />
              <Button
                type="button"
                onClick={addSubGoal}
                className="bg-primary-500 hover:bg-primary-600 text-white "
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Sub Goals Checklist Display */}
            <div className="flex flex-col gap-2 mb-2">
              {formData.subGoals.map((goal, idx) => (
                <label key={goal} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={false} // Will be managed in project details page
                    disabled
                    className="w-4 h-4 text-green-600 border-gray-300"
                  />
                  <span className="text-sm text-gray-900">{goal}</span>
                  <button
                    type="button"
                    onClick={() => removeSubGoal(goal)}
                    className="hover:text-green-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Team Members */}
        <h2 className="text-2xl font-semibold text-gray-900 border-l-4 border-primary-600 pl-3 mb-0">
          팀원
        </h2>
        <div className="bg-white rounded-lg space-y-4">
           <label htmlFor="members" className="block text-sm font-medium text-gray-700 mt-4">
          함께할 팀 멤버를 추가하세요.
        </label>
          <div className="space-y-4">
          {/* User Search */}
          <div className="relative" ref={userSearchRef}>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                {/* 닉네임 검색 */}
                <div className="space-y-2 md:col-span-1">
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary-500" />
                    <Input
                      placeholder="닉네임을 입력하세요"
                      value={nicknameSearch}
                      onChange={(e) => setNicknameSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSearchUsers();
                        }
                      }}
                      className="pl-10 border-primary-200  focus:ring-secondary-500"
                    />
                  </div>
                </div>

                {/* 실명 검색 */}
                <div className="space-y-2 md:col-span-1">
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                    <Input
                      placeholder="실명을 입력하세요"
                      value={realNameSearch}
                      onChange={(e) => setRealNameSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSearchUsers();
                        }
                      }}
                      className="pl-10 border-primary-200  focus:ring-secondary-500"
                    />
                  </div>
                </div>

                {/* 버튼 영역 – 같은 행, 오른쪽 정렬 */}
                <div className="flex items-center justify-end gap-2 md:col-span-1 mt-2 md:mt-0">
                  <Button
                    type="button"
                    onClick={handleSearchUsers}
                    disabled={isLoadingUsers}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-4 whitespace-nowrap"
                  >
                    {isLoadingUsers ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        조회 중...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        조회하기
                      </>
                    )}
                  </Button>

                  {isSearchMode && (
                    <Button
                      type="button"
                      onClick={handleResetSearch}
                      variant="outline"
                      className="px-3 border-gray-300 whitespace-nowrap"
                    >
                      <X className="w-4 h-4 mr-1" />
                      초기화
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
            {/* User List - Scrollable */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div 
                ref={userListRef}
                className="max-h-96 overflow-y-auto"
                style={{ 
                  cursor: 'grab',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#cbd5e0 #f7fafc'
                }}
                onMouseDown={(e) => {
                  if (userListRef.current && e.button === 0) {
                    e.preventDefault();
                    const startY = e.clientY;
                    const startScrollTop = userListRef.current.scrollTop;
                    let isDragging = true;

                    userListRef.current.style.cursor = 'grabbing';
                    userListRef.current.style.userSelect = 'none';

                    const handleMouseMove = (e: MouseEvent) => {
                      if (isDragging && userListRef.current) {
                        const deltaY = e.clientY - startY;
                        userListRef.current.scrollTop = startScrollTop - deltaY;
                      }
                    };

                    const handleMouseUp = () => {
                      isDragging = false;
                      if (userListRef.current) {
                        userListRef.current.style.cursor = 'grab';
                        userListRef.current.style.userSelect = 'auto';
                      }
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };

                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }
                }}
              >
                {isLoadingUsers ? (
                  <div className="p-8 text-center text-gray-700">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mb-2"></div>
                    <p>{isSearching ? '검색 중...' : '사용자 목록을 불러오는 중...'}</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-8 text-center text-gray-700">
                    {isSearchMode ? '검색 결과가 없습니다.' : '사용자가 없습니다.'}
                  </div>
                ) : (
                  <>
                    <div className="divide-y divide-gray-200">
                      {filteredUsers.map((user) => {
                        const isAlreadyAdded = formData.collaborators.some(
                          (collab) => collab.email === user.username || collab.name === (user.realName || user.nickname || user.email)
                        );
                        
                        return (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => {
                              if (!isAlreadyAdded) {
                                addCollaborator(user);
                              }
                            }}
                            disabled={isAlreadyAdded}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                              isAlreadyAdded ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'cursor-pointer'
                            }`}
                          >
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {user.profileImageUrl ? (
                                <img
                                  src={user.profileImageUrl}
                                  alt={user.nickname}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <User className="w-5 h-5 text-primary-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {user.realName || user.nickname || user.email}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {user.nickname && user.nickname !== (user.realName || user.email) && (
                                  <p className="text-sm text-gray-700 truncate">{user.nickname}</p>
                                )}
                                <p className="text-xs text-gray-700 truncate">{user.email}</p>
                              </div>
                            </div>
                            {isAlreadyAdded && (
                              <div className="flex-shrink-0">
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                  추가됨
                                </span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {/* Loading more indicator */}
                    {isLoadingMore && (
                      <div className="p-4 text-center text-gray-700">
                        <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600 mb-2"></div>
                        <p className="text-sm">
                          {isSearchMode ? '더 많은 검색 결과를 불러오는 중...' : '더 많은 사용자를 불러오는 중...'}
                        </p>
                      </div>
                    )}
                    {!isLoadingMore && filteredUsers.length > 0 && (
                      <div className="p-4 text-center text-gray-700 text-sm">
                        {isSearchMode 
                          ? (!searchHasNext ? '모든 검색 결과를 불러왔습니다.' : '')
                          : (!hasNext ? '모든 사용자를 불러왔습니다.' : '')
                        }
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Selected Collaborators List */}
            {formData.collaborators.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">선택된 팀원</h3>
                {formData.collaborators.map((collaborator, index) => {
                  const user = allUsers.find(
                    (u) => u.username === collaborator.email || 
                           (u.realName || u.nickname || u.email) === collaborator.name
                  );
                  
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
                          {user?.profileImageUrl ? (
                            <img
                              src={user.profileImageUrl}
                              alt={user.nickname || user.realName}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-4 h-4 text-primary-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{collaborator.name}</p>
                          <p className="text-sm text-gray-700">@{user?.username || collaborator.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                          {collaborator.role === 'OWNER' ? '소유자' :
                           collaborator.role === 'ADMIN' ? '관리자' :
                           collaborator.role === 'CONTRIBUTOR' ? '기여자' :
                           collaborator.role === 'VIEWER' ? '뷰어' : collaborator.role}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeCollaborator(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 계승 프로젝트 */}
        <div className="bg-white space-y-4 ">
        <h2 className="text-2xl font-semibold text-gray-900 border-l-4 border-primary-600 pl-3">계승 프로젝트</h2>
          <div>
            <p className="text-sm text-gray-800 mt-1">이 프로젝트가 계승하는 원본 프로젝트를 선택하세요. </p>
          </div>

          {parentProjectId ? (
            <div className="flex items-center gap-3 p-3 bg-secondary-50 border border-secondary-200 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-secondary-900">{parentProjectTitle}</p>
                <p className="text-xs text-secondary-600">ID: {parentProjectId}</p>
              </div>
              <button type="button" onClick={clearParentProject} className="text-red-500 hover:text-red-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="relative" ref={parentSearchRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
                <input
                  type="text"
                  value={parentQuery}
                  onChange={handleParentQueryChange}
                  onFocus={() => { setShowParentDropdown(true); if (!parentQuery.trim()) loadParentProjects(0); }}
                  placeholder="프로젝트 이름으로 검색..."
                  className="w-full pl-10 pr-4 py-2 border border-primary-200 rounded-lg text-sm focus:outline-none focus:ring-secondary-500"
                />
              </div>

              {showParentDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto" ref={parentListRef}>
                  {isLoadingParent ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-secondary-500 mb-1" />
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
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary-50 text-left transition-colors"
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
                          className="w-full py-2 text-xs text-secondary-600 hover:bg-secondary-50 text-center disabled:opacity-50"
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

        {/* Links */}
        <div className="bg-white space-y-4 border-b border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900 border-l-4 border-primary-600 pl-3">팀원</h2>

          <div id="form-field-repositoryUrl">
            <label htmlFor="repositoryUrl" className="block text-sm font-medium text-gray-700 mb-2">
              리포지토리 URL
            </label>
            <Input
              id="repositoryUrl"
              name="repositoryUrl"
              type="url"
              value={formData.repositoryUrl}
              onChange={handleInputChange}
              placeholder="예: https://github.com/username/project"
              className={errors.repositoryUrl ? 'border-red-500' : 'border-primary-200focus:ring-secondary-500'}
            />
            {errors.repositoryUrl && (
              <p className="text-red-500 text-sm mt-1">{errors.repositoryUrl}</p>
            )}
          </div>

          <div id="form-field-projectUrl">
            <label htmlFor="projectUrl" className="block text-sm font-medium text-gray-700 mb-2">
              프로젝트 URL (데모)
            </label>
            <Input
              id="projectUrl"
              name="projectUrl"
              type="url"
              value={formData.projectUrl}
              onChange={handleInputChange}
              placeholder="예: https://myproject.com"
              className={errors.projectUrl ? 'border-red-500' : 'border-primary-200focus:ring-secondary-500'}
            />
            {errors.projectUrl && <p className="text-red-500 text-sm mt-1">{errors.projectUrl}</p>}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 justify-end">
          <Link href="/projects">
            <Button type="button" variant="outline" className="text-gray-700">
              취소
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading}
            className="bg-primary-600 hover:bg-primary-700 text-white"
          >
            {loading ? '생성 중...' : '프로젝트 생성'}
          </Button>
        </div>
      </form>
        </div>
      )}
    </div>
    </div>
  );
}
