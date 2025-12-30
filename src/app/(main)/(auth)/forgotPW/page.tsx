// app/(main)/(auth)/forgot-password/page.tsx
"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle, Eye, EyeOff, Lock, Mail, Send, Timer, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

// Import co-located types and components
import {
  ForgotPasswordFormData,
  forgotPasswordSchema,
  PasswordResetStep,
  ResetPasswordFormData,
  resetPasswordSchema,
  VerifyCodeFormData,
  verifyCodeSchema
} from "../types/forgot-pw";

// Import form utilities
import {
  getIconInputClassName,
  getPasswordInputClassName,
  useAuthFormState,
  validatePasswordStrength
} from "@/lib/form-utils";

// Import OTP component
import { OTPInput } from "../_components/OTPInput";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { isLoading, error, setIsLoading, handleError, resetStates } = useAuthFormState();
  
  const [currentStep, setCurrentStep] = useState<PasswordResetStep>('email');
  const [email, setEmail] = useState('');

  const [timeLeft, setTimeLeft] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form instances for each step
  const emailForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const codeForm = useForm<VerifyCodeFormData>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: { email: "", verificationCode: "" },
  });

  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: "", verificationCode: "", newPassword: "", confirmPassword: "" },
  });

  // Timer for resend functionality
  const startTimer = (seconds: number = 300) => { // 5 minutes default
    setTimeLeft(seconds);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1: Send password reset email - NOW CALLS YOUR API
  const handleEmailSubmit = async (values: ForgotPasswordFormData) => {
    setIsLoading(true);
    resetStates();

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmail(values.email);
        setCurrentStep('verification');
        startTimer(300); // 5 minutes
        codeForm.setValue('email', values.email);
      } else {
        handleError(new Error(data.message || "이메일 발송에 실패했습니다."));
      }
    } catch (err) {
      handleError(err, "네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (values: VerifyCodeFormData) => {
    setCurrentStep('reset');
    resetForm.setValue('email', values.email);
    resetForm.setValue('verificationCode', values.verificationCode);
  };

  // Step 3: Reset password - NOW CALLS YOUR API
  const handlePasswordReset = async (values: ResetPasswordFormData) => {
    setIsLoading(true);
    resetStates();

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          verificationCode: values.verificationCode,
          newPassword: values.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentStep('success');
      } else {
        handleError(new Error(data.message || "비밀번호 재설정에 실패했습니다."));
      }
    } catch (err) {
      handleError(err, "비밀번호 재설정 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend verification code
  const handleResendCode = async () => {
    if (timeLeft > 0) return;
    
    setIsLoading(true);
    try {
      await handleEmailSubmit({ email } as ForgotPasswordFormData);
    } catch (err) {
      handleError(err, "재전송에 실패했습니다.");
    }
  };

  // Format timer display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get password strength for display
  const passwordStrength = resetForm.watch('newPassword') 
    ? validatePasswordStrength(resetForm.watch('newPassword'))
    : null;

  // Render different steps
  const renderEmailStep = () => (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-background">
      <div className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(circle_at_center,_rgba(58,_77,_161,_0.08)_0,_transparent_30%)]" />
      <div className="flex h-[550px] w-[850px] rounded-xl bg-white shadow-xl shadow-primary-500/10 overflow-hidden z-10 border border-gray-200">
        
        {/* Left Panel */}
        <div className="flex flex-col items-center justify-center w-1/3 bg-gradient-to-br from-primary-500 to-primary-700 p-10 text-center">
          <Mail className="w-16 h-16 text-white mb-4" />
          <h2 className="mb-2 text-2xl font-bold text-white">비밀번호 찾기</h2>
          <p className="mb-6 text-primary-100">가입 시 사용한 이메일을 입력하세요</p>
          <div className="px-4 py-2 bg-white/20 rounded-lg text-white text-sm">
            1단계 / 3단계
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex flex-col justify-center p-10 w-2/3 bg-white relative">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="absolute top-4 right-4 text-gray-400 hover:text-primary-600 transition-colors"
          >
            <X size={20} />
          </button>

          <h2 className="mb-6 text-3xl font-bold text-primary-600 text-center">이메일 확인</h2>

          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-6">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem>
                    {/* @ts-expect-error - Type inference issue with FormLabel */}
                    <FormLabel className="text-sm font-medium text-primary-600">이메일 주소</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="email"
                          placeholder="가입 시 사용한 이메일 주소"
                          className={getIconInputClassName(!!fieldState.error)}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-error" />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="text-gray-500 text-sm hover:text-gray-700 flex items-center"
                >
                  <ArrowLeft size={16} className="mr-1" />
                  로그인으로 돌아가기
                </button>
              </div>

              <button type="submit" className="btn btn-primary btn-lg w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Send className="mr-2 h-4 w-4 animate-spin" />
                    전송 중...
                  </>
                ) : (
                  "인증코드 발송"
                )}
              </button>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </form>
          </Form>
        </div>
      </div>
    </div>
  );

  const renderVerificationStep = () => (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-background">
      <div className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(circle_at_center,_rgba(58,_77,_161,_0.08)_0,_transparent_30%)]" />
      <div className="flex h-[550px] w-[850px] rounded-xl bg-white shadow-xl shadow-primary-500/10 overflow-hidden z-10 border border-gray-200">
        
        {/* Left Panel */}
        <div className="flex flex-col items-center justify-center w-1/3 bg-gradient-to-br from-blue-500 to-blue-700 p-10 text-center">
          <Send className="w-16 h-16 text-white mb-4" />
          <h2 className="mb-2 text-2xl font-bold text-white">인증코드 입력</h2>
          <p className="mb-6 text-blue-100">이메일로 발송된 8자리 코드를 입력하세요</p>
          <div className="px-4 py-2 bg-white/20 rounded-lg text-white text-sm">
            2단계 / 3단계
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex flex-col justify-center p-10 w-2/3 bg-white relative">
          <button
            type="button"
            onClick={() => setCurrentStep('email')}
            className="absolute top-4 right-4 text-gray-400 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>

          <h2 className="mb-6 text-3xl font-bold text-primary-600 text-center">인증코드 확인</h2>

          <div className="text-center mb-6">
            <p className="text-gray-600 mb-2">
              <span className="font-semibold text-primary-600">{email}</span>로 발송된
            </p>
            <p className="text-gray-600">8자리 인증코드를 입력해주세요</p>
          </div>

          <Form {...codeForm}>
            <form onSubmit={codeForm.handleSubmit(handleCodeSubmit)} className="space-y-6">
              <FormField
                control={codeForm.control}
                name="verificationCode"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormControl>
                      <div className="space-y-4">
                        <OTPInput
                          length={8}
                          value={field.value || ''}
                          onChange={field.onChange}
                          onComplete={(code) => {
                            field.onChange(code);
                            // Auto-submit when code is complete (optional)
                            if (code.length === 8) {
                              setTimeout(() => {
                                codeForm.handleSubmit(handleCodeSubmit)();
                              }, 500);
                            }
                          }}
                          hasError={!!fieldState.error}
                          disabled={isLoading}
                          autoFocus
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-error text-center" />
                  </FormItem>
                )}
              />

              {/* Timer and Resend */}
              <div className="text-center">
                {timeLeft > 0 ? (
                  <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                    <Timer size={14} />
                    {formatTime(timeLeft)} 후 재발송 가능
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    disabled={isLoading}
                  >
                    인증코드 재발송
                  </button>
                )}
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-lg w-full" 
                disabled={isLoading || codeForm.watch('verificationCode')?.length !== 8}
              >
                {isLoading ? "확인 중..." : "인증코드 확인"}
              </button>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </form>
          </Form>
        </div>
      </div>
    </div>
  );

  const renderResetStep = () => (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-background">
      <div className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(circle_at_center,_rgba(58,_77,_161,_0.08)_0,_transparent_30%)]" />
      <div className="flex h-[550px] w-[850px] rounded-xl bg-white shadow-xl shadow-primary-500/10 overflow-hidden z-10 border border-gray-200">
        
        {/* Left Panel */}
        <div className="flex flex-col items-center justify-center w-1/3 bg-gradient-to-br from-green-500 to-green-700 p-10 text-center">
          <Lock className="w-16 h-16 text-white mb-4" />
          <h2 className="mb-2 text-2xl font-bold text-white">새 비밀번호</h2>
          <p className="mb-6 text-green-100">안전한 새 비밀번호를 설정하세요</p>
          <div className="px-4 py-2 bg-white/20 rounded-lg text-white text-sm">
            3단계 / 3단계
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex flex-col justify-center p-10 w-2/3 bg-white relative">
          <button
            type="button"
            onClick={() => setCurrentStep('verification')}
            className="absolute top-4 right-4 text-gray-400 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>

          <h2 className="mb-6 text-3xl font-bold text-primary-600 text-center">새 비밀번호 설정</h2>

          <Form {...resetForm}>
            <form onSubmit={resetForm.handleSubmit(handlePasswordReset)} className="space-y-5">
              {/* New Password */}
              <FormField
                control={resetForm.control}
                name="newPassword"
                render={({ field, fieldState }) => (
                  <FormItem>
                    {/* @ts-expect-error - Type inference issue with FormLabel children prop */}
                    <FormLabel className="text-sm font-medium text-primary-600">새 비밀번호</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          id="newPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="새 비밀번호 입력"
                          className={getPasswordInputClassName(!!fieldState.error)}
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-error" />
                    
                    {/* Password Strength Indicator */}
                    {passwordStrength && field.value && (
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">강도:</span>
                          <span className={`text-xs font-medium ${passwordStrength.color}`}>
                            {passwordStrength.level}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div 
                            className={`h-1 rounded-full transition-all duration-300 ${
                              passwordStrength.strength >= 4 ? 'bg-green-500' :
                              passwordStrength.strength >= 3 ? 'bg-blue-500' :
                              passwordStrength.strength >= 2 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                          />
                        </div>
                        {passwordStrength.feedback.length > 0 && (
                          <div className="text-xs text-gray-500">
                            추천: {passwordStrength.feedback.join(', ')}
                          </div>
                        )}
                      </div>
                    )}
                  </FormItem>
                )}
              />

              {/* Confirm Password */}
              <FormField
                control={resetForm.control}
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <FormItem>
                    {/* @ts-expect-error - Type inference issue with FormLabel children prop */}
                    <FormLabel className="text-sm font-medium text-primary-600">비밀번호 확인</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="비밀번호 다시 입력"
                          className={getPasswordInputClassName(!!fieldState.error)}
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-error" />
                  </FormItem>
                )}
              />

              <button 
                type="submit" 
                className="btn btn-primary btn-lg w-full mt-6" 
                disabled={isLoading || !passwordStrength?.isStrong}
              >
                {isLoading ? "설정 중..." : "비밀번호 재설정"}
              </button>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </form>
          </Form>
        </div>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-background">
      <div className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(circle_at_center,_rgba(58,_77,_161,_0.08)_0,_transparent_30%)]" />
      <div className="flex h-[550px] w-[850px] rounded-xl bg-white shadow-xl shadow-primary-500/10 overflow-hidden z-10 border border-gray-200">
        
        {/* Left Panel */}
        <div className="flex flex-col items-center justify-center w-1/3 bg-gradient-to-br from-green-500 to-green-700 p-10 text-center">
          <CheckCircle className="w-16 h-16 text-white mb-4" />
          <h2 className="mb-2 text-2xl font-bold text-white">재설정 완료</h2>
          <p className="mb-6 text-green-100">새 비밀번호로 로그인하세요</p>
          <div className="px-4 py-2 bg-white/20 rounded-lg text-white text-sm">
            완료
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex flex-col justify-center p-10 w-2/3 bg-white relative">
          <h2 className="mb-6 text-3xl font-bold text-green-600 text-center">비밀번호 재설정 완료!</h2>
          
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-lg text-gray-700">
              비밀번호가 성공적으로 변경되었습니다.
            </p>
            <p className="text-gray-600">
              새로운 비밀번호로 로그인해 주세요.
            </p>
            
            <div className="mt-8 space-y-3">
              <Link
                href="/login"
                className="btn btn-primary btn-lg w-full block text-center no-underline"
              >
                로그인 페이지로 이동
              </Link>
              <Link
                href="/"
                className="btn btn-secondary btn-lg w-full block text-center no-underline"
              >
                홈으로 이동
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render current step
  switch (currentStep) {
    case 'email':
      return renderEmailStep();
    case 'verification':
      return renderVerificationStep();
    case 'reset':
      return renderResetStep();
    case 'success':
      return renderSuccessStep();
    default:
      return renderEmailStep();
  }
}
