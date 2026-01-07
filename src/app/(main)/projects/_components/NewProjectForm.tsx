'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, X, Upload, FileText, User, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import TipTapEditor from '@/components/editor/TipTapEditor';
import Image from 'next/image';
import { fetchCategories, createProject } from '@/lib/api/endpoints/project';
import { fetchUsers, User as UserType } from '@/lib/api/endpoints/user';

const TECH_STACK_CATEGORIES = [
  'LANGUAGE',
  'FRAMEWORK',
  'DATABASE',
  'TOOL',
  'PLATFORM',
];

interface FormData {
  title: string;
  categories: string[];
  description: string;
  details: string;
  tags: string[];
  subGoals: string[];
  projectUrl: string;
  repositoryUrl: string;
  status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED';
  startDate: string;
  endDate: string;
  thumbnailUrl: string;
  documents: File[];
  collaborators: Array<{ name: string; email: string; role: string }>;
}

interface FormErrors {
  [key: string]: string;
}

export default function NewProjectForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [subGoalInput, setSubGoalInput] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [collaboratorInput, setCollaboratorInput] = useState({ name: '', email: '', role: 'CONTRIBUTOR' });
  
  // API data states
  const [categories, setCategories] = useState<Array<{ id: number; name: string; description: string }>>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userSearchRef = useRef<HTMLDivElement>(null);
  
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
    thumbnailUrl: '',
    documents: [],
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

  // Load users when search query changes
  useEffect(() => {
    const loadUsers = async () => {
      if (!userSearchQuery.trim()) {
        setUsers([]);
        return;
      }

      try {
        setIsLoadingUsers(true);
        const response = await fetchUsers(0, 100, 'ASC', 'createdAt');
        // Filter users by search query (name, nickname, username)
        const filtered = response.data.filter(
          (user) =>
            user.realName?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
            user.nickname?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
            user.username?.toLowerCase().includes(userSearchQuery.toLowerCase())
        );
        setUsers(filtered);
        setShowUserDropdown(true);
      } catch (error) {
        console.error('Failed to load users:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    const debounceTimer = setTimeout(loadUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [userSearchQuery]);

  // Close dropdown when clicking outside
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

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFormData((prev) => ({
        ...prev,
        documents: [...prev.documents, ...Array.from(files)],
      }));
    }
  };

  const removeDocument = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  const addCollaborator = (user: UserType) => {
    // Check if user is already added
    const isAlreadyAdded = formData.collaborators.some(
      (collab) => collab.email === user.email || collab.name === user.username
    );

    if (!isAlreadyAdded) {
      setFormData((prev) => ({
        ...prev,
        collaborators: [
          ...prev.collaborators,
          {
            name: user.realName || user.nickname || user.username,
            email: user.username, // Store username in email field for API
            role: 'CONTRIBUTOR',
          },
        ],
      }));
      setUserSearchQuery('');
      setShowUserDropdown(false);
    }
  };

  const removeCollaborator = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      collaborators: prev.collaborators.filter((_, i) => i !== index),
    }));
  };

  const handleEditorChange = (html: string) => {
    setFormData((prev) => ({
      ...prev,
      details: html,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '프로젝트 생성에 실패했습니다.');
      }

      const data = await response.json();
      alert('프로젝트가 성공적으로 생성되었습니다!');
      router.push(`/projects/${data.id}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : '프로젝트 생성에 실패했습니다.');
      // Prepare data according to API spec
      const projectData = {
        title: formData.title,
        description: formData.description,
        thumbnail: formData.thumbnailUrl || 'string',
        content: formData.details || '',
        projectStatus: formData.status,
        categories: formData.categories,
        collaborators: formData.collaborators.map((collab) => collab.email), // email field contains username
        techStacks: formData.tags,
        subGoals: formData.subGoals,
        createdAt: formData.startDate ? new Date(formData.startDate).toISOString() : new Date().toISOString(),
        endedAt: formData.endDate ? new Date(formData.endDate).toISOString() : new Date().toISOString(),
      };

      const response = await createProject(projectData);
      alert(response.message || '프로젝트가 성공적으로 생성되었습니다!');
      router.push('/projects');
    } catch (error: any) {
      alert(error.message || '프로젝트 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/projects" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">새 프로젝트 만들기</h1>
          <p className="text-gray-600 mt-1">새로운 프로젝트를 등록하고 협력자들과 함께 작업하세요.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">기본 정보</h2>

          {/* Project Name */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              프로젝트 이름 <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="프로젝트 이름을 입력해주세요."
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리 <span className="text-red-500">*</span>
            </label>
            {isLoadingCategories ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                <span className="text-gray-500">카테고리 로딩 중...</span>
              </div>
            ) : (
              <>
                <div className={`border rounded-lg p-3 min-h-[120px] max-h-[200px] overflow-y-auto ${
                  errors.categories ? 'border-red-500' : 'border-gray-300'
                }`}>
                  {categories.length === 0 ? (
                    <p className="text-gray-500 text-sm">카테고리가 없습니다</p>
                  ) : (
                    <div className="space-y-2">
                      {categories.map((cat) => {
                        const isSelected = formData.categories.includes(cat.name);
                        return (
                          <label
                            key={cat.id}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleCategory(cat.name)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
                      {formData.categories.map((categoryName) => (
                        <span
                          key={categoryName}
                          className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {categoryName}
                          <button
                            type="button"
                            onClick={() => toggleCategory(categoryName)}
                            className="hover:text-blue-900"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="PLANNING">계획 중</option>
              <option value="IN_PROGRESS">진행 중</option>
              <option value="COMPLETED">완료</option>
            </select>
          </div>

          {/* Project Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                시작일
              </label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                종료일
              </label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* Thumbnail Upload */}
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

        {/* Description */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">설명</h2>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              한 줄 설명 <span className="text-red-500">*</span>
            </label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="프로젝트를 간단히 설명해주세요."
              className={errors.description ? 'border-red-500' : ''}
            />
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
                placeholder="프로젝트에 대해 자세히 설명해주세요..."
              />
            </div>
            <p className="text-gray-500 text-sm mt-1">리치 텍스트 에디터를 사용하여 작성해주세요.</p>
          </div>
        </div>

        {/* Tags and Tech Stack */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">태그</h2>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              기술 스택 / 태그 <span className="text-red-500">*</span>
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

          {/* Sub Goals */}
          <div>
            <label htmlFor="subGoals" className="block text-sm font-medium text-gray-700 mb-2">
              서브 목표
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
              />
              <Button
                type="button"
                onClick={addSubGoal}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Sub Goals Display */}
            <div className="flex flex-wrap gap-2">
              {formData.subGoals.map((goal) => (
                <span
                  key={goal}
                  className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {goal}
                  <button
                    type="button"
                    onClick={() => removeSubGoal(goal)}
                    className="hover:text-green-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">팀원</h2>

          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <Input
                placeholder="이름"
                value={collaboratorInput.name}
                onChange={(e) => setCollaboratorInput({ ...collaboratorInput, name: e.target.value })}
              />
              <Input
                placeholder="이메일"
                type="email"
                value={collaboratorInput.email}
                onChange={(e) => setCollaboratorInput({ ...collaboratorInput, email: e.target.value })}
              />
              <div className="flex gap-2">
                <select
                  value={collaboratorInput.role}
                  onChange={(e) => setCollaboratorInput({ ...collaboratorInput, role: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="OWNER">소유자</option>
                  <option value="ADMIN">관리자</option>
                  <option value="CONTRIBUTOR">기여자</option>
                  <option value="VIEWER">뷰어</option>
                </select>
                <Button
                  type="button"
                  onClick={addCollaborator}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            {/* User Search */}
            <div className="relative" ref={userSearchRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="이름 또는 닉네임으로 검색..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  onFocus={() => userSearchQuery && setShowUserDropdown(true)}
                  className="pl-10"
                />
              </div>

              {/* User Dropdown */}
              {showUserDropdown && (userSearchQuery.trim() || users.length > 0) && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {isLoadingUsers ? (
                    <div className="p-4 text-center text-gray-500">검색 중...</div>
                  ) : users.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">검색 결과가 없습니다.</div>
                  ) : (
                    users.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => addCollaborator(user)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center gap-3"
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          {user.profileImageUrl ? (
                            <img
                              src={user.profileImageUrl}
                              alt={user.nickname}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {user.realName || user.nickname || user.username}
                          </p>
                          <p className="text-sm text-gray-500 truncate">@{user.username}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Collaborators List */}
            <div className="space-y-2">
              {formData.collaborators.map((collaborator, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{collaborator.name}</p>
                      <p className="text-sm text-gray-500">@{collaborator.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {collaborator.role}
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
              ))}
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">문서</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              프로젝트 문서 업로드
            </label>
            <label className="cursor-pointer">
              <input
                type="file"
                multiple
                onChange={handleDocumentUpload}
                className="hidden"
              />
              <div className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg border border-gray-300 w-fit">
                <FileText className="w-4 h-4" />
                <span>문서 추가</span>
              </div>
            </label>

            {/* Documents List */}
            <div className="mt-3 space-y-2">
              {formData.documents.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{doc.name}</span>
                    <span className="text-xs text-gray-500">({(doc.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDocument(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">링크</h2>

          <div>
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
              className={errors.repositoryUrl ? 'border-red-500' : ''}
            />
            {errors.repositoryUrl && (
              <p className="text-red-500 text-sm mt-1">{errors.repositoryUrl}</p>
            )}
          </div>

          <div>
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
              className={errors.projectUrl ? 'border-red-500' : ''}
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
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? '생성 중...' : '프로젝트 생성'}
          </Button>
        </div>
      </form>
    </div>
  );
}
