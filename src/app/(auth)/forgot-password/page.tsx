// app/(auth)/forgot-password/page.tsx
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

import {
  ForgotPasswordFormData,
  forgotPasswordSchema,
  PasswordResetStep,
  ResetPasswordFormData,
  resetPasswordSchema,
} from "../types/forgot-pw";

import {
  getIconInputClassName,
  getPasswordInputClassName,
  useAuthFormState,
} from "@/lib/form-utils";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { isLoading, error, setIsLoading, handleError, resetStates } = useAuthFormState();

  const [currentStep, setCurrentStep] = useState<PasswordResetStep>("email");
  const [email, setEmail] = useState("");

  const [timeLeft, setTimeLeft] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const emailForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: "", verificationCode: "", newPassword: "", confirmPassword: "" },
    mode: "onChange",
  });

  // Step 1: 이메일로 인증코드 발송
  const handleEmailSubmit = async (values: ForgotPasswordFormData) => {
    setIsLoading(true);
    resetStates();
    try {
      const res = await fetch("/api/password/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        setEmail(values.email);
        setCurrentStep("reset");
        startTimer(300);
        resetForm.reset({
          email: values.email,
          verificationCode: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        handleError(new Error(data.message || "이메일 발송에 실패했습니다."));
      }
    } catch (err) {
      handleError(err, "네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const startTimer = (seconds: number) => {
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

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleResendCode = async () => {
    if (timeLeft > 0 || !email) return;
    setIsLoading(true);
    resetStates();
    try {
      const res = await fetch("/api/password/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        startTimer(300);
      } else {
        handleError(new Error(data.message || "인증코드 재전송에 실패했습니다."));
      }
    } catch (err) {
      handleError(err, "네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: API 호출 - POST { email, randomCode, newPassword }
  const handlePasswordReset = async (values: ResetPasswordFormData) => {
    setIsLoading(true);
    resetStates();
    const randomCode = (values.verificationCode ?? "").trim().toUpperCase();
    if (randomCode.length !== 8) {
      handleError(new Error("인증코드는 8자리로 입력해주세요."));
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/password/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          randomCode,
          newPassword: values.newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(data.message || "비밀번호가 성공적으로 변경되었습니다.");
        setCurrentStep("success");
      } else {
        handleError(new Error(data.message || "비밀번호 재설정에 실패했습니다."));
      }
    } catch (err) {
      handleError(err, "비밀번호 재설정 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <div className="flex h-screen w-full items-center justify-center bg-authentication">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(58,_77,_161,_0.08)_0,_transparent_30%)]" />
      <div className="relative z-10 flex h-[550px] w-[850px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl shadow-primary-500/10">
        <div className="flex w-1/3 flex-col items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 p-10 text-center">
          <Mail className="mb-4 h-16 w-16 text-white" />
          <h2 className="mb-2 text-2xl font-bold text-white">비밀번호 찾기</h2>
          <p className="mb-6 text-primary-100">가입 시 사용한 이메일을 입력하세요</p>
          <div className="rounded-lg bg-white/20 px-4 py-2 text-sm text-white">1단계 / 2단계</div>
        </div>
        <div className="relative flex w-2/3 flex-col justify-center bg-white p-10">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="absolute right-4 top-4 text-gray-700 transition-colors hover:text-primary-600"
          >
            <X size={20} />
          </button>
          <h2 className="mb-6 text-center text-3xl font-bold text-primary-600">이메일 확인</h2>
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-6">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-primary-600">이메일 주소</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-700" />
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
                  onClick={() => router.push("/login")}
                  className="flex items-center text-sm text-gray-700 transition-colors hover:text-gray-900"
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
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </form>
          </Form>
        </div>
      </div>
    </div>
  );

  // 2단계: 이메일 · 인증코드(8자) · 새 비밀번호 · 확인 — API { email, randomCode, newPassword }
  const renderResetStep = () => (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(58,_77,_161,_0.08)_0,_transparent_30%)]" />
      <div className="relative z-10 flex max-h-[90vh] w-[850px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl shadow-primary-500/10">
        <div className="flex w-1/3 flex-col items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 p-10 text-center">
          <Lock className="mb-4 h-16 w-16 text-white" />
          <h2 className="mb-2 text-2xl font-bold text-white">비밀번호 재설정</h2>
          <p className="mb-6 text-primary-100">
            이메일로 받은 8자리 인증코드와 새 비밀번호를 입력하세요
          </p>
          <div className="rounded-lg bg-white/20 px-4 py-2 text-sm text-white">2단계 / 2단계</div>
        </div>
        <div className="relative flex w-2/3 flex-col justify-center overflow-y-auto p-10">
          <button
            type="button"
            onClick={() => setCurrentStep("email")}
            className="absolute right-4 top-4 text-gray-700 transition-colors hover:text-primary-600"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="mb-6 text-center text-3xl font-bold text-primary-600">비밀번호 재설정</h2>

          <Form {...resetForm}>
            <form onSubmit={resetForm.handleSubmit(handlePasswordReset)} className="space-y-5">
              <FormField
                control={resetForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-primary-600">이메일</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-700" />
                        <input
                          type="email"
                          readOnly
                          className={getIconInputClassName(false) + " bg-gray-50"}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-error" />
                  </FormItem>
                )}
              />

              <FormField
                control={resetForm.control}
                name="verificationCode"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-primary-600">인증코드 (8자리)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-700" />
                        <input
                          type="text"
                          maxLength={8}
                          autoComplete="one-time-code"
                          placeholder="이메일로 받은 8자리 코드 입력"
                          className={getIconInputClassName(!!fieldState.error) + " font-mono tracking-widest uppercase"}
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 8)
                            )
                          }
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-error" />
                  </FormItem>
                )}
              />

              <div className="rounded-lg bg-blue-50 p-3 text-sm text-gray-700">
                📧 인증코드를 <span className="font-semibold">{email}</span> 로 발송했습니다. 스팸
                폴더도 확인해주세요.
              </div>
              {timeLeft > 0 ? (
                <p className="flex items-center justify-center gap-1 text-sm text-gray-600">
                  <Timer size={14} />
                  {formatTime(timeLeft)} 후 재발송 가능
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="w-full text-sm font-medium text-primary-600 hover:underline disabled:opacity-50"
                >
                  인증코드 재발송
                </button>
              )}

              <FormField
                control={resetForm.control}
                name="newPassword"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-primary-600">새 비밀번호</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-700" />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="새 비밀번호 입력 (6자 이상)"
                          className={getPasswordInputClassName(!!fieldState.error)}
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((p) => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-error" />
                  </FormItem>
                )}
              />

              <FormField
                control={resetForm.control}
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-primary-600">비밀번호 확인</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-700" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="비밀번호 다시 입력"
                          className={getPasswordInputClassName(!!fieldState.error)}
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((p) => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
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
                className="btn btn-primary btn-lg mt-6 w-full disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? "설정 중..." : "비밀번호 재설정"}
              </button>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(58,_77,_161,_0.08)_0,_transparent_30%)]" />
      <div className="relative z-10 flex h-[550px] w-[850px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl shadow-primary-500/10">
        <div className="flex w-1/3 flex-col items-center justify-center bg-gradient-to-br from-green-500 to-green-700 p-10 text-center">
          <CheckCircle className="mb-4 h-16 w-16 text-white" />
          <h2 className="mb-2 text-2xl font-bold text-white">재설정 완료</h2>
          <p className="mb-6 text-green-100">새 비밀번호로 로그인하세요</p>
          <div className="rounded-lg bg-white/20 px-4 py-2 text-sm text-white">완료</div>
        </div>
        <div className="flex w-2/3 flex-col justify-center p-10">
          <h2 className="mb-6 text-center text-3xl font-bold text-green-600">비밀번호 재설정 완료!</h2>
          <div className="space-y-4 text-center">
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
            <p className="text-lg text-gray-700">
              {successMessage ?? "비밀번호가 성공적으로 변경되었습니다."}
            </p>
            <p className="text-gray-700">새로운 비밀번호로 로그인해 주세요.</p>
            <div className="mt-8 space-y-3">
              <Link
                href="/login"
                className="btn btn-primary btn-lg block w-full text-center no-underline"
              >
                로그인 페이지로 이동
              </Link>
              <Link
                href="/"
                className="btn btn-secondary btn-lg block w-full text-center no-underline"
              >
                홈으로 이동
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  switch (currentStep) {
    case "email":
      return renderEmailStep();
    case "reset":
      return renderResetStep();
    case "success":
      return renderSuccessStep();
    default:
      return renderEmailStep();
  }
}
