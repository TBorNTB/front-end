'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { 
  Save, 
  X, 
  Mail, 
  User, 
  FileText, 
  Code,
  Github, 
  Linkedin, 
  Globe, 
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { profileService, UserResponse } from '@/lib/api/services/user-services';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { validateImageFile } from '@/lib/form-utils';
import { Upload, X as XIcon } from 'lucide-react';
import { TechStackInput } from '@/components/ui/TechStackInput';

interface ProfileEditFormData {
  email: string;
  realName: string;
  description: string;
  techStack: string;
  githubUrl: string;
  linkedinUrl: string;
  blogUrl: string;
  profileImageUrl: string;
}

export default function ProfileEditForm() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [originalEmail, setOriginalEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ProfileEditFormData>({
    email: '',
    realName: '',
    description: '',
    techStack: '',
    githubUrl: '',
    linkedinUrl: '',
    blogUrl: '',
    profileImageUrl: '',
  });

  const isEmailLocked = originalEmail.trim() !== '';

  // 빈 값이나 잘못된 값 정리 함수
  const cleanValue = (value: string | null | undefined): string => {
    if (!value || typeof value !== 'string') return '';
    const trimmed = value.trim();
    // "string", "null", "undefined" 같은 잘못된 값 제거
    if (trimmed === 'string' || trimmed === 'null' || trimmed === 'undefined') return '';
    return trimmed;
  };

  // 프로필 데이터 로드
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const profileData = await profileService.getProfile();
        setProfile(profileData);
        setOriginalEmail(cleanValue(profileData.email));
        setFormData({
          email: cleanValue(profileData.email),
          realName: cleanValue(profileData.realName),
          description: cleanValue(profileData.description),
          techStack: cleanValue(profileData.techStack),
          githubUrl: cleanValue(profileData.githubUrl),
          linkedinUrl: cleanValue(profileData.linkedinUrl),
          blogUrl: cleanValue(profileData.blogUrl),
          profileImageUrl: cleanValue(profileData.profileImageUrl),
        });
      } catch (err: any) {
        console.error('Failed to load profile:', err);
        setError(err.message || '프로필 정보를 불러올 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // 에러 메시지 초기화
    if (error) setError(null);
    if (success) setSuccess(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 유효성 검사
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setError(validation.error || '유효하지 않은 파일입니다.');
      return;
    }

    setSelectedFile(file);
    setError(null);

    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      profileImageUrl: '',
    }));
    // 파일 input 초기화
    const fileInput = document.getElementById('profile-image-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleUploadImage = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      // 프로필 이미지 직접 업로드 (백엔드가 프로필도 함께 업데이트)
      const updatedProfile = await profileService.uploadProfileImage(selectedFile);
      setProfile(updatedProfile);
      setFormData(prev => ({
        ...prev,
        profileImageUrl: updatedProfile.profileImageUrl || '',
      }));
      setSelectedFile(null);
      // 이미지 미리보기는 업로드된 URL로 업데이트
      setImagePreview(updatedProfile.profileImageUrl || '');
      toast.success('프로필 이미지가 업로드되었습니다!', { duration: 2000 });
    } catch (err: any) {
      console.error('Failed to upload image:', err);
      setError(err.message || '이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    const nextEmail = formData.email.trim();
    const currentEmail = originalEmail.trim();
    if (currentEmail && nextEmail !== currentEmail) {
      setError('이메일은 한 번 설정하면 변경할 수 없습니다.');
      setIsSaving(false);
      return;
    }

    try {
      // 파일이 선택되어 있고 아직 업로드되지 않은 경우 먼저 업로드
      let finalProfileImageUrl = formData.profileImageUrl;

      if (selectedFile && !isUploading) {
        try {
          setIsUploading(true);
          const updatedProfile = await profileService.uploadProfileImage(selectedFile);
          finalProfileImageUrl = updatedProfile.profileImageUrl || '';
          setFormData(prev => ({
            ...prev,
            profileImageUrl: finalProfileImageUrl,
          }));
          setSelectedFile(null);
        } catch (uploadErr: any) {
          console.error('Failed to upload image:', uploadErr);
          setError(uploadErr.message || '이미지 업로드에 실패했습니다.');
          setIsSaving(false);
          setIsUploading(false);
          return;
        } finally {
          setIsUploading(false);
        }
      }

      // 빈 값 정리 및 필터링 (profileImageUrl은 이미 업로드로 처리됨)
      const cleanedData: Partial<ProfileEditFormData> = {
        realName: formData.realName.trim() || undefined,
        description: formData.description.trim() || undefined,
        techStack: formData.techStack.trim() || undefined,
        githubUrl: formData.githubUrl.trim() || undefined,
        linkedinUrl: formData.linkedinUrl.trim() || undefined,
        blogUrl: formData.blogUrl.trim() || undefined,
      };

      // 이메일은 최초 설정 이후에는 수정 불가
      if (!isEmailLocked) {
        cleanedData.email = nextEmail || undefined;
      }

      // 빈 값 제거 (undefined 필드는 제외)
      const filteredData = Object.fromEntries(
        Object.entries(cleanedData).filter(([_, value]) => value !== undefined && value !== '')
      ) as Partial<ProfileEditFormData>;

      // 프로필 업데이트
      const updatedProfile = await profileService.updateProfile(filteredData);
      setProfile(updatedProfile);
      setOriginalEmail(cleanValue(updatedProfile.email));
      setSuccess(true);

      // 성공 토스트 메시지 표시
      toast.success('프로필이 성공적으로 저장되었습니다!', {
        duration: 2000,
        icon: '✅',
      });

      // 잠시 후 마이페이지로 리디렉션
      setTimeout(() => {
        router.push('/mypage');
      }, 1500);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(err.message || '프로필 업데이트에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-700">프로필 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-2">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-primary mt-4"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">프로필 편집</h1>
          <p className="text-gray-700 mt-2">프로필 정보를 수정할 수 있습니다.</p>
        </div>
        <button
          onClick={handleCancel}
          className="p-2 text-gray-700 hover:text-gray-700 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          <p className="text-green-800">프로필이 성공적으로 업데이트되었습니다!</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image */}
        <div className="card">
          <h2 className="text-xl font-semibold text-foreground mb-4">프로필 이미지</h2>
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              {(imagePreview || (formData.profileImageUrl && 
               formData.profileImageUrl.trim() !== '' && 
               formData.profileImageUrl !== 'string')) ? (
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-primary-200">
                  <ImageWithFallback
                    src={imagePreview || formData.profileImageUrl}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center border-4 border-primary-200">
                  <ImageIcon className="h-12 w-12 text-primary-400" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <label 
                  htmlFor="profile-image-input"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  프로필 이미지 업로드
                </label>
                <div className="flex gap-2">
                  <input
                    id="profile-image-input"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="profile-image-input"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg 
                             hover:bg-gray-50 cursor-pointer transition-colors
                             flex items-center justify-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>파일 선택</span>
                  </label>
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={handleUploadImage}
                      disabled={isUploading}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg 
                               hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed
                               transition-colors flex items-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          업로드 중...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          업로드
                        </>
                      )}
                    </button>
                  )}
                </div>
                {selectedFile && (
                  <p className="text-xs text-gray-700 mt-2">
                    선택된 파일: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
                <p className="text-xs text-gray-700 mt-2">
                  JPG, PNG, GIF 형식만 가능하며, 최대 5MB까지 업로드 가능합니다.
                </p>
              </div>
              {formData.profileImageUrl && formData.profileImageUrl.trim() !== '' && formData.profileImageUrl !== 'string' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    현재 이미지 URL
                  </label>
                  <input
                    type="url"
                    name="profileImageUrl"
                    value={formData.profileImageUrl}
                    onChange={handleInputChange}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                             bg-gray-50 text-gray-700 cursor-not-allowed"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-foreground mb-6">기본 정보</h2>
          
          <div className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline h-4 w-4 mr-1 text-primary-600" />
                이메일
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={isEmailLocked ? undefined : handleInputChange}
                required
                readOnly={isEmailLocked}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg transition-all duration-300 ${
                  isEmailLocked
                    ? 'bg-gray-50 text-gray-700 cursor-not-allowed'
                    : 'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200'
                }`}
                placeholder="이메일 주소를 입력하세요"
              />
              {isEmailLocked && (
                <p className="text-xs text-gray-700 mt-2">이메일은 한 번 설정하면 변경할 수 없습니다.</p>
              )}
            </div>

            {/* Real Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-1 text-primary-600" />
                실명
              </label>
              <input
                type="text"
                name="realName"
                value={formData.realName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                         focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 
                         transition-all duration-300"
                placeholder="실명을 입력하세요"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline h-4 w-4 mr-1 text-primary-600" />
                자기소개
                <span className="text-xs text-gray-700 font-normal ml-2">(선택사항)</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                         focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 
                         transition-all duration-300 resize-none"
                placeholder="자기소개를 입력하세요 (선택사항)"
              />
            </div>

            {/* Tech Stack */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Code className="inline h-4 w-4 mr-1 text-primary-600" />
                기술스택
                <span className="text-xs text-gray-700 font-normal ml-2">(Enter 또는 쉼표로 추가)</span>
              </label>
              <TechStackInput
                value={formData.techStack}
                onChange={(next) => {
                  setFormData((prev) => ({ ...prev, techStack: next }));
                  if (error) setError(null);
                  if (success) setSuccess(false);
                }}
                placeholder="React 입력 후 Enter"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                         focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 
                         transition-all duration-300"
                maxLength={255}
                onMaxLengthExceeded={() => setError('기술스택은 255자 이하여야 합니다.')}
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="card">
          <h2 className="text-xl font-semibold text-foreground mb-6">소셜 링크</h2>
          
          <div className="space-y-6">
            {/* GitHub */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Github className="inline h-4 w-4 mr-1 text-primary-600" />
                GitHub URL
                <span className="text-xs text-gray-700 font-normal ml-2">(선택사항)</span>
              </label>
              <input
                type="url"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                         focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 
                         transition-all duration-300"
                placeholder="https://github.com/username (선택사항)"
              />
            </div>

            {/* LinkedIn */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Linkedin className="inline h-4 w-4 mr-1 text-primary-600" />
                LinkedIn URL
                <span className="text-xs text-gray-700 font-normal ml-2">(선택사항)</span>
              </label>
              <input
                type="url"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                         focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 
                         transition-all duration-300"
                placeholder="https://linkedin.com/in/username (선택사항)"
              />
            </div>

            {/* Blog */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="inline h-4 w-4 mr-1 text-primary-600" />
                블로그 URL
                <span className="text-xs text-gray-700 font-normal ml-2">(선택사항)</span>
              </label>
              <input
                type="url"
                name="blogUrl"
                value={formData.blogUrl}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                         focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 
                         transition-all duration-300"
                placeholder="https://blog.example.com (선택사항)"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            disabled={isSaving}
          >
            취소
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSaving || isUploading}
          >
            {(isSaving || isUploading) ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isUploading ? '업로드 중...' : '저장 중...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                저장하기
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
