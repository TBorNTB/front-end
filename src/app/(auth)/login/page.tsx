"use client";

import { AuthUser } from "@/app/(auth)/types/auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Eye, EyeOff, Github, Lock, User, X } from "lucide-react";
import Image from 'next/image';
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { BASE_URL } from "@/lib/api/config";
import { USER_ENDPOINTS } from '@/lib/api/endpoints/user-endpoints';
import {
  getIconInputClassName,
  getPasswordInputClassName,
  makeAuthenticatedRequest,
  useAuthFormState
} from "@/lib/form-utils";

const API_URL = "/api/auth/login";

const formSchema = z.object({
  email: z.string().email({ message: "올바른 이메일 형식을 입력해주세요." }),
  password: z.string().min(6, { message: "비밀번호 입력해주세요." }),
  keepSignedIn: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

function LogInPageInner() {
  const { isLoading, error, setIsLoading, handleError } = useAuthFormState();
  const [showPassword, setShowPassword] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const oauthRedirectingRef = useRef(false); // 중복 클릭 방지
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextParam = searchParams.get('next');
  const safeNextPath = nextParam && nextParam.startsWith('/') ? nextParam : null;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "", keepSignedIn: true },
  });

  // ✅ Development bypass - Mock user login
  const handleMockLogin = () => {
  // ✅ Check the environment variable instead
  if (process.env.NEXT_PUBLIC_ENABLE_DEV_BYPASS !== 'true') {
    alert('⚠️ This feature is only available in development/preview environments');
    return;
  }

  const mockUser: AuthUser = {
    nickname: "Dev User",
    full_name: "Development User",
    email: "dev@example.com",
    role: UserRole.GUEST,
    profile_image: undefined,
  };

  login(mockUser, true);
  console.log("🔓 DEV MODE: Bypassing authentication with mock user");
  router.push(safeNextPath || "/");
};


  // ✅ Fetch user profile using token
  const fetchUserProfileWithToken = async (): Promise<AuthUser | null> => {
    try {
      const response = await makeAuthenticatedRequest('/api/auth/user', {
        method: 'GET',
        cache: 'no-store',
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('✅ User profile authorized by token:', userData);
        
        if (userData.authenticated && userData.user) {
          const authUser: AuthUser = {
            nickname: userData.user.nickname || "user",
            full_name: userData.user.realName || userData.user.fullName || userData.user.nickname || "user",
            email: userData.user.email || "",
            role: userData.user.role as UserRole || UserRole.GUEST,
            profile_image: userData.user.profileImageUrl || userData.user.profileImage,
          };

          return authUser;
        }
      }

      return null;
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      return null;
    }
  };

  async function onSubmit(values: FormData) {
    setIsLoading(true);

    console.log('Login request payload:', { ...values, password: '[REDACTED]' });

    try {
      const response = await makeAuthenticatedRequest(API_URL, {
        method: "POST",
        body: JSON.stringify(values),
      });

      // ✅ Parse response data before checking response.ok
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('❌ Failed to parse response:', parseError);
        throw new Error("서버 응답을 처리할 수 없습니다.");
      }

      console.log('Backend login response:', data);

      // ✅ Better error handling with detailed messages
      if (!response.ok) {
        const errorMessage = data?.message || data?.error || "로그인에 실패했습니다.";
        console.error('❌ Login failed: status=' + response.status + ', message=' + errorMessage);
        throw new Error(errorMessage);
      }

      if (data.message === "로그인 성공" || data.authenticated) {
        console.log('✅ Login successful! Processing user data...');
        
        const backendUser = data.user || data;
        
        const authUser: AuthUser = {
          nickname: backendUser.nickname || "user",
          full_name: backendUser.realName || backendUser.fullName || backendUser.nickname || "user",
          email: backendUser.email || values.email,
          role: backendUser.role as UserRole || UserRole.GUEST,
          profile_image: backendUser.profileImageUrl || backendUser.profileImage,
        };
        
        console.log('AuthUser created:', authUser);

        // ✅ Fetch fresh user data with token
        setTimeout(async () => {
          try {
            console.log('✅ Fetching fresh user data with token...');
            
            const freshUserData = await fetchUserProfileWithToken();
            if (freshUserData) {
              console.log('✅ Using fresh user data:', freshUserData);
              login(freshUserData, values.keepSignedIn);
            } else {
              console.log('⚠️ Using initial user data from login response');
              login(authUser, values.keepSignedIn);
            }

            router.push(safeNextPath || "/");
          } catch (timeoutError) {
            console.error('❌ Error during post-login processing:', timeoutError);
            // Still login with initial data if fresh fetch fails
            login(authUser, values.keepSignedIn);
            router.push(safeNextPath || "/");
          }
        }, 100);
        
      } else {
        throw new Error(data?.message || "로그인에 실패했습니다.");
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      
      // ✅ Better error message extraction
      const errorMessage = err instanceof Error 
        ? err.message 
        : "알 수 없는 오류가 발생했습니다.";
      
      handleError(err, errorMessage);
    } finally {
      setIsLoading(false); // ✅ Always reset loading state
    }
  }

  const handleGithubLogin = () => {
    // 중복 클릭 방지
    if (oauthRedirectingRef.current || isOAuthLoading) {
      console.log('OAuth redirect already in progress, ignoring click');
      return;
    }

    // 리다이렉트 시작 플래그 설정
    oauthRedirectingRef.current = true;
    setIsOAuthLoading(true);

    try {
      // OAuth 리다이렉트 플래그 설정 (홈페이지에서 콜백 감지용)
      sessionStorage.setItem('oauth_redirecting', 'true');
      
      const oauthUrl = `${BASE_URL}${USER_ENDPOINTS.USER.OAUTH_GITHUB}`;
      console.log('Redirecting to GitHub OAuth:', oauthUrl);
      
      // 리다이렉트 실행
      window.location.href = oauthUrl;
    } catch (error) {
      console.error('OAuth redirect error:', error);
      // 에러 발생 시 플래그 리셋
      sessionStorage.removeItem('oauth_redirecting');
      oauthRedirectingRef.current = false;
      setIsOAuthLoading(false);
      handleError(error instanceof Error ? error : new Error('OAuth redirect failed'));
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-authentication">
      <div className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(circle_at_center,_rgba(58,_77,_161,_0.08)_0,_transparent_30%)]" />
      <div className="flex w-full max-w-[850px] mx-4 rounded-xl bg-white shadow-xl shadow-primary-500/10 overflow-hidden z-10 border border-gray-200">

        {/* Left Panel - 모바일에서 숨김 */}
        <div className="hidden md:flex flex-col items-center justify-center w-1/3 bg-gradient-to-br from-primary-500 to-primary-700 p-10 text-center">
          <Link href="/" className="flex items-center gap-1.5 p-2 font-bold hover:cursor-pointer">
            <Image src="/logo-white.svg" alt="SSG Logo" width={100} height={100} className="filter" />
          </Link>
          <h2 className="mb-2 text-2xl font-bold text-white">처음이신가요?</h2>
          <p className="mb-6 text-primary-100">회원가입 하세요!</p>
          <Link
            href="/signup"
            className="btn btn-primary btn-lg w-full bg-white text-primary-600 hover:bg-gray-50 no-underline"
          >
            회원가입
          </Link>
        </div>

        {/* Right Panel */}
        <div className="flex flex-col justify-center p-8 md:p-10 w-full md:w-2/3 bg-white relative">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="absolute top-4 right-4 text-gray-700 hover:text-primary-600 transition-colors"
          >
            <X size={20} />
          </button>

          <h2 className="mb-6 text-3xl font-bold text-primary-600 text-center">로그인</h2>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-primary-600">이메일</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-700" />
                        <input
                          type="email"
                          placeholder="이메일을 입력하세요"
                          className={getIconInputClassName(!!fieldState.error)}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-error" />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-primary-600">패스워드</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-700" />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="패스워드를 입력하세요"
                          className={getPasswordInputClassName(!!fieldState.error)}
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-error" />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    {...form.register("keepSignedIn")}
                  />
                  <div className="flex items-center justify-center rounded w-4 h-4 bg-gray-100 border-2 border-gray-300 ring-offset-background peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500 peer-focus-visible:ring-offset-2 transition-all duration-300 peer-checked:bg-primary-50 peer-checked:border-primary-500 cursor-pointer">
                    <Check
                      className={`h-3 w-3 text-primary-600 transition-opacity duration-300 ${
                        form.watch("keepSignedIn") ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </div>
                  <span className="text-gray-700 select-none text-sm">로그인 상태 유지</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-primary-600 text-sm font-medium no-underline hover:text-primary-700"
                >
                  비밀번호 찾기
                </Link>
              </div>

              <button type="submit" className="btn btn-primary btn-lg w-full" disabled={isLoading}>
                {isLoading ? "로그인 중..." : "로그인"}
              </button>

              {/* ✅ Error display with better formatting */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 whitespace-pre-line">{error}</p>
                </div>
              )}
            </form>
          </Form>

          {/* ✅ Development-only mock login button */}
          {/* ✅ Show button based on environment variable */}
            {process.env.NEXT_PUBLIC_ENABLE_DEV_BYPASS === 'true' && (
              <div className="mt-4 space-y-2">
                <button 
                  onClick={handleMockLogin}
                  className="btn btn-lg w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold border-2 border-yellow-600"
                  type="button"
                >
                  🔓 개발 모드: 인증 건너뛰기
                </button>
                <p className="text-xs text-center text-yellow-700 bg-yellow-50 py-1 px-2 rounded">
                  ⚠️ 개발 환경에서만 표시됩니다
                </p>
              </div>
            )}


          <div className="my-5 flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 flex-shrink text-gray-700 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <button
            onClick={handleGithubLogin}
            disabled={isLoading || isOAuthLoading}
            type="button"
            className={`w-full h-12 px-6 text-base bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-primary-500 hover:text-primary-600 transition-colors rounded-lg font-medium flex items-center justify-center flex-shrink-0 ${
              isLoading || isOAuthLoading 
                ? 'opacity-50 cursor-not-allowed' 
                : 'cursor-pointer'
            }`}
          >
            <Github className="mr-2 h-4 w-4" />
            {isOAuthLoading ? '리다이렉트 중...' : '깃허브로 간편 로그인'}
          </button>

          {/* 모바일 회원가입 링크 */}
          <p className="md:hidden mt-6 text-center text-sm text-gray-500">
            계정이 없으신가요?{" "}
            <Link href="/signup" className="text-primary-600 font-medium no-underline hover:text-primary-700">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LogInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-authentication-background">
          <div className="text-sm text-gray-700">로딩 중...</div>
        </div>
      }
    >
      <LogInPageInner />
    </Suspense>
  );
}
