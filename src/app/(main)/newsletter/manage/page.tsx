'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Mail, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Settings,
  ArrowLeft,
  AlertCircle,
  Trash2,
  RefreshCw,
  Bell,
  BellOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import NewsletterSubscriberStatus from '../_components/NewsletterSubscriberStatus';
import NewsletterUnsubscribe from '../_components/NewsletterUnsubscribe';

// Mock data - replace with actual API calls
const mockSubscriptionData = {
  isSubscribed: true,
  email: 'user@example.com',
  subscribedAt: '2026-01-15',
  categories: ['웹해킹', '리버싱', 'CTF'],
  totalEmailsSent: 23,
  lastEmailSent: '2026-02-06',
  deliveryStatus: 'active', // 'active', 'bounced', 'unsubscribed'
};

const availableCategories = [
  { id: 1, name: '웹해킹', description: 'SQL Injection, XSS, CSRF 등 웹 취약점 분석' },
  { id: 2, name: '리버싱', description: '바이너리 분석, 디버깅, 악성코드 분석' },
  { id: 3, name: '포렌식', description: '디지털 증거 수집, 메모리/디스크 분석' },
  { id: 4, name: 'CTF', description: 'CTF 문제 풀이, Write-up, 대회 정보' },
  { id: 5, name: '시스템 해킹', description: '버퍼 오버플로우, ROP, 쉘코드' },
  { id: 6, name: '암호학', description: '암호화 알고리즘, 프로토콜 분석' },
];

export default function NewsletterManagePage() {
  const router = useRouter();
  const { user: currentUser, isLoading: userLoading } = useCurrentUser();
  
  const [subscriptionData, setSubscriptionData] = useState(mockSubscriptionData);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(mockSubscriptionData.categories);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showUnsubscribeConfirm, setShowUnsubscribeConfirm] = useState(false);
  const [unsubscribing, setUnsubscribing] = useState(false);

  // Authentication check removed

  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((cat) => cat !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleUpdatePreferences = async () => {
    setIsUpdating(true);
    try {
      // TODO: Replace with actual API call
      // await updateNewsletterPreferences({ categories: selectedCategories });
      
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      
      setSubscriptionData((prev) => ({
        ...prev,
        categories: selectedCategories,
      }));
      
      alert('구독 설정이 업데이트되었습니다.');
    } catch (error) {
      alert('설정 업데이트에 실패했습니다.');
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUnsubscribe = async () => {
    setUnsubscribing(true);
    try {
      // TODO: Replace with actual API call
      // await unsubscribeNewsletter();
      
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      
      alert('구독이 취소되었습니다.');
      router.push('/newsletter');
    } catch (error) {
      alert('구독 취소에 실패했습니다.');
      console.error(error);
    } finally {
      setUnsubscribing(false);
      setShowUnsubscribeConfirm(false);
    }
  };

  // Loading state
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <p className="text-gray-600">로그인이 필요합니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/newsletter" 
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            뉴스레터 페이지로 돌아가기
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">구독 관리</h1>
              <p className="text-gray-600">뉴스레터 구독 상태를 확인하고 설정을 변경하세요</p>
            </div>
            <Settings className="w-10 h-10 text-primary-500" />
          </div>
                <NewsletterSubscriberStatus />
        </div>

        {/* Subscription Status Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Status */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                subscriptionData.isSubscribed ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {subscriptionData.isSubscribed ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">구독 상태</h3>
                <p className={`text-sm ${
                  subscriptionData.isSubscribed ? 'text-green-600' : 'text-red-600'
                }`}>
                  {subscriptionData.isSubscribed ? '활성' : '비활성'}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              <span className="font-medium">이메일:</span> {subscriptionData.email}
            </p>
          </div>

          {/* Subscription Date */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">구독 시작일</h3>
                <p className="text-sm text-gray-600">{subscriptionData.subscribedAt}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              <span className="font-medium">마지막 발송:</span> {subscriptionData.lastEmailSent}
            </p>
          </div>

          {/* Email Stats */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-secondary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">발송 통계</h3>
                <p className="text-sm text-gray-600">총 {subscriptionData.totalEmailsSent}개 발송</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              <span className="font-medium">전달 상태:</span> 정상
            </p>
          </div>
        </div>

        {/* Category Preferences */}
        <div className="card p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">카테고리 설정</h2>
              <p className="text-gray-600">관심 있는 보안 분야를 선택하세요</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {availableCategories.map((category) => {
              const isSelected = selectedCategories.includes(category.name);
              return (
                <label
                  key={category.id}
                  className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleCategoryToggle(category.name)}
                    className="mt-1 w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Alert if no categories selected */}
          {selectedCategories.length === 0 && (
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-800">
                  카테고리를 선택하지 않으면 뉴스레터를 받을 수 없습니다.
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  최소 1개 이상의 카테고리를 선택해주세요.
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleUpdatePreferences}
              disabled={isUpdating || selectedCategories.length === 0}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3"
            >
              {isUpdating ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  업데이트 중...
                </div>
              ) : (
                '설정 저장'
              )}
            </Button>
            <Button
              onClick={() => setSelectedCategories(subscriptionData.categories)}
              variant="outline"
              className="px-6 py-3 font-semibold"
            >
              초기화
            </Button>
          </div>
        </div>

        {/* Delivery Status Alert */}
        {subscriptionData.deliveryStatus === 'bounced' && (
          <div className="card p-6 mb-8 border-l-4 border-red-500">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">이메일 전달 오류</h3>
                <p className="text-gray-600 text-sm mb-3">
                  최근 이메일 발송 시 전달 실패가 발생했습니다. 이메일 주소가 올바른지 확인해주세요.
                </p>
                <Button variant="outline" size="sm" className="text-primary-600">
                  이메일 주소 변경하기
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Subscription History */}
        <div className="card p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-secondary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">최근 발송 내역</h2>
              <p className="text-gray-600">지난 7일간 받은 뉴스레터</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { date: '2026-02-06', category: '웹해킹', title: 'SQL Injection 우회 기법', status: 'delivered' },
              { date: '2026-02-05', category: '리버싱', title: 'Anti-Debugging 무력화', status: 'delivered' },
              { date: '2026-02-04', category: 'CTF', title: 'PicoCTF 2026 Writeup', status: 'delivered' },
              { date: '2026-02-03', category: '웹해킹', title: 'XSS Filter Bypass 전략', status: 'delivered' },
            ].map((email, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-900">{email.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
                        {email.category}
                      </span>
                      <span className="text-sm text-gray-500">{email.date}</span>
                    </div>
                  </div>
                </div>
                <span className="text-sm text-green-600 font-medium">전달됨</span>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Button variant="outline" className="text-primary-600">
              전체 내역 보기
            </Button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card p-8 border-2 border-red-200">
          <div className="flex items-start gap-3 mb-6">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <BellOff className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">구독 취소</h2>
              <p className="text-gray-600">더 이상 뉴스레터를 받고 싶지 않으신가요?</p>
            </div>
          </div>

          {!showUnsubscribeConfirm ? (
            <div>
              <p className="text-gray-700 mb-4">
                구독을 취소하면 더 이상 SSG 뉴스레터를 받을 수 없습니다. 언제든지 다시 구독할 수 있습니다.
              </p>
              <Button
                onClick={() => setShowUnsubscribeConfirm(true)}
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                구독 취소하기
              </Button>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <NewsletterUnsubscribe />
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setShowUnsubscribeConfirm(false)}
                  variant="outline"
                  disabled={unsubscribing}
                >
                  돌아가기
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-3">
            문제가 있으신가요? 도움이 필요하신가요?
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="mailto:ssg.newsletter@gmail.com"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold"
            >
              <Mail className="w-4 h-4" />
              이메일 문의
            </a>
            <span className="text-gray-300">|</span>
            <Link
              href="/newsletter#faq"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold"
            >
              <Shield className="w-4 h-4" />
              FAQ 보기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
