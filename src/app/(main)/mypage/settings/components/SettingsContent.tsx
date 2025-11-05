// app/profile/settings/components/SettingsContent.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Shield, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  CheckCircle,
  Bell,
  Lock,
  Trash2,
  Save
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface UserData {
  id: number;
  username: string;
  full_name: string;
  nickname?: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  role: string;
  membership_status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  email_verified: boolean;
  phone_verified: boolean;
}

interface FormData {
  email: string;
  phone: string;
  location: string;
  bio: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  emailNotifications: boolean;
  browserNotifications: boolean;
  securityAlerts: boolean;
}

export default function SettingsContent() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    phone: '',
    location: '',
    bio: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    emailNotifications: true,
    browserNotifications: false,
    securityAlerts: true
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Mock user data - replace with actual API call
  useEffect(() => {
    const mockUserData: UserData = {
      id: 1,
      username: 'minsu_kim',
      full_name: '김민수',
      nickname: '김민수',
      email: 'minsu.kim@ssg.ac.kr',
      phone: '010-1234-5678',
      location: '서울, 대한민국',
      bio: '웹 보안과 침투 테스팅에 관심이 많은 보안 연구원입니다.',
      role: 'MEMBER',
      membership_status: 'active',
      created_at: '2023-03-15',
      email_verified: true,
      phone_verified: false
    };

    setUserData(mockUserData);
    setFormData({
      email: mockUserData.email,
      phone: mockUserData.phone || '',
      location: mockUserData.location || '',
      bio: mockUserData.bio || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      emailNotifications: true,
      browserNotifications: false,
      securityAlerts: true
    });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleProfileSave = async () => {
    setIsLoading(true);
    try {
      // API call would go here
      console.log('Saving profile data:', formData);
      alert('프로필이 성공적으로 업데이트되었습니다.');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('프로필 업데이트 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (formData.newPassword.length < 8) {
      alert('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    setIsLoading(true);
    try {
      // API call would go here
      console.log('Changing password');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      alert('비밀번호가 성공적으로 변경되었습니다.');
    } catch (error) {
      console.error('Error changing password:', error);
      alert('비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountDelete = async () => {
    if (showDeleteConfirm) {
      setIsLoading(true);
      try {
        // API call would go here
        console.log('Deleting account');
        alert('계정이 삭제되었습니다.');
      } catch (error) {
        console.error('Error deleting account:', error);
        alert('계정 삭제 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
        setShowDeleteConfirm(false);
      }
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const getMembershipStatusBadge = () => {
    if (!userData) return null;

    switch (userData.membership_status) {
      case 'active':
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-900">현재 등급: 정회원</p>
                <p className="text-sm text-blue-700 mt-1">현재 등급에 따라 일부 기능 접근이 제한될 수 있습니다.</p>
              </div>
            </div>
            <button className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium">
              등급 변경 요청
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  if (!userData) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">설정 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Membership Status */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">회원 등급</h2>
        {getMembershipStatusBadge()}
      </div>

      {/* Account Information */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">계정 정보</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이메일 주소
              {userData.email_verified && (
                <CheckCircle className="inline h-4 w-4 text-green-600 ml-1" />
              )}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                       focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 
                       transition-all duration-300"
              placeholder="이메일 주소를 입력하세요"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호 변경
            </label>
            <button 
              onClick={() => {/* Handle password change modal */}}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              비밀번호 변경하기
            </button>
          </div>
        </div>
      </div>

      {/* Account Deletion */}
      <div>
        <h2 className="text-xl font-semibold text-red-600 mb-4">회원 탈퇴</h2>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800 text-sm">
            회원 탈퇴 시 모든 활동 기록이 삭제되며, 복구할 수 없습니다.
          </p>
        </div>
        
        <button 
          onClick={handleAccountDelete}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg 
                   transition-colors duration-300 text-sm font-medium"
        >
          회원 탈퇴
        </button>
      </div>
    </div>
  );
}
