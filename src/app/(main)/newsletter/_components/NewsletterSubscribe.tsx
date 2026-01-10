"use client";

import { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { newsletterService, EmailFrequency } from '@/lib/api/services/newsletter-services';
import { CategoryType, CategoryDisplayNames } from '@/types/services/category';

interface NewsletterSubscribeProps {
  className?: string;
}

export default function NewsletterSubscribe({ className = "" }: NewsletterSubscribeProps) {
  const [step, setStep] = useState<'subscribe' | 'verify'>('subscribe');
  const [email, setEmail] = useState('');
  const [emailFrequency, setEmailFrequency] = useState<EmailFrequency>('DAILY');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [chasingPopularity, setChasingPopularity] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 모든 카테고리 목록
  const allCategories = Object.values(CategoryType);

  // 카테고리 토글
  const toggleCategory = (category: CategoryType) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // 구독 요청
  const handleSubscribe = async () => {
    if (!email) {
      setError('이메일을 입력해주세요.');
      return;
    }

    if (selectedCategories.length === 0) {
      setError('최소 하나 이상의 카테고리를 선택해주세요.');
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await newsletterService.subscribe({
        email,
        emailFrequency,
        selectedCategories,
        chasingPopularity,
      });

      setSuccess(response.message || '인증 코드가 이메일로 전송되었습니다.');
      setStep('verify');
      setError(null);
    } catch (err: any) {
      console.error('Subscribe error:', err);
      const errorMessage = err?.message || '구독 요청 중 오류가 발생했습니다. 다시 시도해주세요.';
      setError(errorMessage);
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  // 인증 코드 확인
  const handleVerify = async () => {
    if (!verificationCode) {
      setError('인증 코드를 입력해주세요.');
      return;
    }

    if (verificationCode.length !== 6) {
      setError('인증 코드는 6자리 숫자입니다.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await newsletterService.verify({
        email,
        code: verificationCode,
      });

      setSuccess(response.message || '뉴스레터 구독이 완료되었습니다!');
      setError(null);
      
      // 성공 후 초기화
      setTimeout(() => {
        setStep('subscribe');
        setEmail('');
        setVerificationCode('');
        setSelectedCategories([]);
        setChasingPopularity(false);
        setEmailFrequency('DAILY');
        setSuccess(null);
        setError(null);
      }, 3000);
    } catch (err: any) {
      console.error('Verify error:', err);
      const errorMessage = err?.message || '인증 코드 확인 중 오류가 발생했습니다. 코드를 확인하고 다시 시도해주세요.';
      setError(errorMessage);
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      <div className="bg-white rounded-lg shadow-lg border border-primary-100 p-6 md:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
            <Mail className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-primary-800 mb-2">
            {step === 'subscribe' ? '뉴스레터 구독' : '인증 코드 확인'}
          </h2>
          <p className="text-gray-600">
            {step === 'subscribe' 
              ? '보안 학습 콘텐츠를 이메일로 받아보세요'
              : '이메일로 전송된 인증 코드를 입력해주세요'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* Subscribe Step */}
        {step === 'subscribe' && (
          <div className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                이메일 주소 <span className="text-red-500">*</span>
              </label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full"
              />
            </div>

            {/* Email Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                이메일 수신 빈도 <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="frequency"
                    value="DAILY"
                    checked={emailFrequency === 'DAILY'}
                    onChange={() => setEmailFrequency('DAILY')}
                    disabled={loading}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-primary-600">매일</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="frequency"
                    value="WEEKLY"
                    checked={emailFrequency === 'WEEKLY'}
                    onChange={() => setEmailFrequency('WEEKLY')}
                    disabled={loading}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-primary-600">매주</span>
                </label>
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                관심 카테고리 선택 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {allCategories.map((category) => {
                  const isSelected = selectedCategories.includes(category);
                  return (
                    <label
                      key={category}
                      className={`
                        flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all
                        ${isSelected 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50/50'
                        }
                      `}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleCategory(category)}
                        disabled={loading}
                      />
                      <span className="text-sm text-gray-700 font-medium">
                        {CategoryDisplayNames[category]}
                      </span>
                    </label>
                  );
                })}
              </div>
              {selectedCategories.length === 0 && (
                <p className="text-xs text-red-500 mt-2">최소 하나 이상의 카테고리를 선택해주세요.</p>
              )}
            </div>

            {/* Chasing Popularity */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all">
                <Checkbox
                  checked={chasingPopularity}
                  onCheckedChange={(checked) => setChasingPopularity(checked === true)}
                  disabled={loading}
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">인기 콘텐츠 추적</span>
                  <p className="text-xs text-gray-500 mt-1">
                    인기 있는 프로젝트와 아티클을 우선적으로 받아보기
                  </p>
                </div>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubscribe}
              disabled={loading || selectedCategories.length === 0}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  처리 중...
                </>
              ) : (
                <>
                  구독하기
                </>
              )}
            </Button>
          </div>
        )}

        {/* Verify Step */}
        {step === 'verify' && (
          <div className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                인증 코드 <span className="text-red-500">*</span>
              </label>
              <Input
                id="code"
                type="text"
                placeholder="6자리 숫자 입력"
                value={verificationCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setVerificationCode(value);
                }}
                disabled={loading}
                className="w-full text-center text-2xl tracking-widest font-mono"
                maxLength={6}
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                {email}로 전송된 인증 코드를 입력해주세요
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setStep('subscribe');
                  setVerificationCode('');
                  setError(null);
                  setSuccess(null);
                }}
                variant="outline"
                className="flex-1"
                disabled={loading}
              >
                <ArrowLeft className="w-4 h-4" />
                이전
              </Button>
              <Button
                onClick={handleVerify}
                disabled={loading || verificationCode.length !== 6}
                className="flex-1"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    확인 중...
                  </>
                ) : (
                  '인증하기'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
