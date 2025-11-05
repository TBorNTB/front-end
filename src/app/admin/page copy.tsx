"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Check, User, Lock, X, Eye, EyeOff, Shield } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { LoginFormData, AuthUser } from "@/app/(main)/(auth)/types/auth";
import { UserRole } from "@/types/core";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

// Import form utilities
import { 
  getIconInputClassName, 
  getPasswordInputClassName, 
  useAuthFormState, 
  makeAuthenticatedRequest 
} from "@/lib/form-utils";

const API_URL = "/api/auth/login";

const formSchema = z.object({
  email: z.string().email({ message: "올바른 이메일 형식을 입력해주세요." }),
  password: z.string().min(6, { message: "비밀번호 입력해주세요." }),
  keepSignedIn: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function AdminPage() {
  // Use centralized form state management
  const { isLoading, error, setIsLoading, handleError } = useAuthFormState();
  const [showPassword, setShowPassword] = useState(false);
  const { login, user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      keepSignedIn: true
    },
  });

  // ✅ REDIRECT IF ALREADY LOGGED IN AS ADMIN
  useEffect(() => {
    if (!loading && isAuthenticated && user?.role === UserRole.ADMIN) {
      console.log("✅ Already logged in as admin, redirecting to dashboard");
      router.replace("/admin/dashboard");
    }
  }, [loading, isAuthenticated, user, router]);

  // JWT Parser Function
  const parseJWT = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('JWT parse error:', error);
      return null;
    }
  };

  // Extract Access Token from Cookies
  const getAccessTokenFromCookies = (): string | null => {
    const cookies = document.cookie;
    const accessTokenMatch = cookies.match(/accessToken=([^;]+)/);
    return accessTokenMatch ? accessTokenMatch[1] : null;
  };

  async function onSubmit(values: FormData) {
    setIsLoading(true);

    try {
      const response = await makeAuthenticatedRequest(API_URL, {
        method: "POST",
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "로그인에 실패했습니다.");
      }

      if (data.message === "로그인 성공" || data.authenticated) {
        setTimeout(() => {
          try {
            const accessToken = getAccessTokenFromCookies();
            let userRole = UserRole.GUEST;
            let username = "admin";

            if (accessToken) {
              const jwtPayload = parseJWT(accessToken);
              if (jwtPayload) {
                userRole = jwtPayload.role as UserRole || UserRole.GUEST;
                username = jwtPayload.username || "admin";
              }
            }

            const backendUser = data.user || data;
            const authUser: AuthUser = {
              nickname: backendUser?.nickname || username,
              full_name: backendUser?.realName || username,
              email: backendUser?.email || values.email,
              role: userRole,
              profile_image: backendUser?.profileImageUrl,
            };

            if (authUser.role !== UserRole.ADMIN) {
              handleError(new Error(
                `❌ 관리자 권한이 필요합니다.\n\n` +
                `일반 사용자는 일반 로그인을 사용하세요.`
              ));
              return;
            }

            login(authUser, values.keepSignedIn);
            router.push("/admin/dashboard");
          } catch (timeoutError) {
            console.error('Timeout error:', timeoutError);
            handleError(timeoutError, "처리 중 오류가 발생했습니다.");
          }
        }, 100);
      } else {
        throw new Error(data?.message || "로그인에 실패했습니다.");
      }
    } catch (err) {
      console.error('❌ Admin login error:', err);
      handleError(err, "알 수 없는 오류가 발생했습니다.");
    }
  }

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-background">
        <div className="text-lg text-primary-600">권한 확인 중...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-background">
      <div className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(circle_at_center,_rgba(58,_77,_161,_0.08)_0,_transparent_30%)]" />
      <div className="flex h-[550px] w-[850px] rounded-xl bg-white shadow-xl shadow-primary-500/10 overflow-hidden z-10 border border-gray-200">
        
        {/* Left Panel - Admin theme with brand colors */}
        <div className="flex flex-col items-center justify-center w-1/3 bg-gradient-to-br from-primary-600 to-primary-800 p-10 text-center">
          <Shield className="w-16 h-16 text-white mb-4" />
          <h2 className="mb-2 text-2xl font-bold text-white">관리자 로그인</h2>
          <p className="mb-6 text-primary-100">관리자 권한으로 로그인하세요</p>
          <div className="px-4 py-2 bg-white/20 rounded-lg text-white text-sm">
            Admin Access
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

          <h2 className="mb-6 text-3xl font-bold text-primary-600 text-center">관리자 로그인</h2>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-primary-600">관리자 이메일</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="email"
                          placeholder="관리자 이메일을 입력하세요"
                          className={getIconInputClassName(!!fieldState.error)}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-error" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-primary-600">패스워드</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="패스워드를 입력하세요"
                          className={getPasswordInputClassName(!!fieldState.error)}
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                  <span className="text-gray-600 select-none text-sm">로그인 상태 유지</span>
                </label>
                <Link
                  href="/forgotPW"
                  className="text-primary-600 text-sm font-medium no-underline hover:text-primary-700"
                >
                  비밀번호 찾기
                </Link>
              </div>

              <button type="submit" className="btn btn-primary btn-lg w-full" disabled={isLoading}>
                {isLoading ? "로그인 중..." : "관리자 로그인"}
              </button>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 whitespace-pre-line">{error}</p>
                </div>
              )}
            </form>
          </Form>

          {/* Admin Notice with brand colors */}
          <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
            <p className="text-primary-700 text-sm font-medium mb-1">⚠️ 관리자 접근 안내</p>
            <p className="text-primary-600 text-xs">운영진 권한이 있는 계정만 접근할 수 있습니다.</p>
            <p className="text-primary-600 text-xs">일반 사용자는 일반 로그인을 사용하세요.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
