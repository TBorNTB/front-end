"use client";

import { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Mail, ShieldOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { newsletterService } from '@/lib/api/services/newsletter-services';

interface NewsletterUnsubscribeProps {
  className?: string;
}

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function NewsletterUnsubscribe({ className = '' }: NewsletterUnsubscribeProps) {
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRequestCode = async () => {
    if (!email) {
      setError('이메일을 입력해주세요.');
      return;
    }

    if (!isValidEmail(email)) {
      setError('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 먼저 구독 상태를 조회해서 (미등록/이미 해제) 케이스를 걸러냅니다.
      const status = await newsletterService.status(email);

      if (!status.registered) {
        setError(status.message || '등록된 구독자가 없습니다.');
        return;
      }

      if (!status.active) {
        setError(status.message || '구독 해제 상태입니다.');
        return;
      }

      const response = await newsletterService.cancelSendCode({ email });
      setSuccess(response.message || '구독 해제용 인증 코드가 이메일로 전송되었습니다.');
      setStep('verify');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '인증 코드 요청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!code) {
      setError('인증 코드를 입력해주세요.');
      return;
    }

    if (code.length < 5) {
      setError('인증 코드를 확인해주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await newsletterService.cancelConfirm({ email, code });
      setSuccess(response.message || '구독 해제가 완료되었습니다.');

      setTimeout(() => {
        setStep('request');
        setEmail('');
        setCode('');
        setError(null);
        setSuccess(null);
      }, 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '구독 해제 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      <div className="bg-white rounded-lg shadow-lg border border-primary-100 p-6 md:p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
            <ShieldOff className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-primary-800 mb-2">구독 해제</h2>
          <p className="text-gray-700">
            {step === 'request' ? '해제 전 이메일 인증이 필요해요' : '이메일로 받은 인증 코드를 입력해주세요'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {step === 'request' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="unsubscribe-email" className="block text-sm font-medium text-gray-700 mb-2">
                이메일 주소 <span className="text-red-500">*</span>
              </label>
              <Input
                id="unsubscribe-email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRequestCode();
                }}
              />
            </div>

            <Button onClick={handleRequestCode} disabled={loading} className="w-full" size="lg">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  처리 중...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  인증 코드 받기
                </>
              )}
            </Button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="unsubscribe-code" className="block text-sm font-medium text-gray-700 mb-2">
                인증 코드 <span className="text-red-500">*</span>
              </label>
              <Input
                id="unsubscribe-code"
                type="text"
                placeholder="인증 코드 입력"
                value={code}
                onChange={(e) => setCode(e.target.value.trim())}
                disabled={loading}
                className="w-full text-center text-xl tracking-widest font-mono"
              />
              <p className="text-xs text-gray-700 mt-2 text-center">{email}로 전송된 인증 코드를 입력해주세요</p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                disabled={loading}
                onClick={() => {
                  setStep('request');
                  setCode('');
                  setError(null);
                  setSuccess(null);
                }}
              >
                <ArrowLeft className="w-4 h-4" />
                이전
              </Button>

              <Button
                onClick={handleConfirmCancel}
                disabled={loading || code.length === 0}
                className="flex-1"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    확인 중...
                  </>
                ) : (
                  '구독 해제'
                )}
              </Button>
            </div>

            <p className="text-xs text-gray-700 text-center">
              해제 후에도 언제든지 다시 구독할 수 있어요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
