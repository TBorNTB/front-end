"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Check, User, Lock, X, Eye, EyeOff, Shield } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { LoginFormData, AuthUser } from "@/features/auth/types";
import { UserRole } from "@/types/core";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

const API_URL = "/api/auth/login";

const formSchema = z.object({
  email: z.string().email({ message: "올바른 이메일 형식을 입력해주세요." }),
  password: z.string().min(6, { message: "비밀번호 입력해주세요." }),
  keepSignedIn: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      email: "", 
      password: "", 
      keepSignedIn: true
    },
  });

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
    setError("");

    console.log('Admin login request payload:', { ...values, password: '[REDACTED]' });

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify(values),
      });

      const data = await response.json();
      console.log('Admin login backend response:', data);

      if (!response.ok) {
        throw new Error(data?.message || "로그인에 실패했습니다.");
      }

      if (data.message === "로그인 성공" || data.authenticated) {
        console.log('✅ Admin login successful! Processing user data...');
        
        setTimeout(() => {
          const accessToken = getAccessTokenFromCookies();
          console.log('Access token found:', !!accessToken);
          
          let userRole = UserRole.GUEST;
          let username = "admin";
          
          if (accessToken) {
            const jwtPayload = parseJWT(accessToken);
            console.log('🎯 JWT Payload:', jwtPayload);
            
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

          console.log('🔥 ADMIN USER DATA:');
          console.log('- Nickname:', authUser.nickname);
          console.log('- Role:', authUser.role);
          console.log('- Expected role:', UserRole.ADMIN);

          if (authUser.role !== UserRole.ADMIN) {
            throw new Error(
              `❌ 관리자 권한이 필요합니다.\n\n` +
              `현재 역할: "${authUser.role}"\n` +
              `필요 역할: "${UserRole.ADMIN}"\n\n` +
              `일반 사용자는 일반 로그인을 사용하세요.`
            );
          }

          console.log('✅ Admin role confirmed, logging in...');
          login(authUser, values.keepSignedIn);
          router.push("/admin");
          
        }, 100);
        
      } else {
        throw new Error(data?.message || "로그인에 실패했습니다.");
      }
    } catch (err) {
      console.error('❌ Admin login error:', err);
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  const getInputClassName = (fieldName: keyof FormData) => {
    const hasError = form.formState.errors[fieldName];
    return `h-10 w-full pl-10 bg-gray-50 rounded-lg text-gray-900 focus:outline-none transition-colors font-normal ${
      hasError 
        ? 'border-error focus:border-error focus:ring-1 focus:ring-error' 
        : 'border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500'
    }`;
  };

  return (
    <>
      <div className="flex h-screen w-full items-center justify-center bg-gray-900">
        <div className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(circle_at_center,_rgba(58,_77,_161,_0.08)_0,_transparent_30%)]" />
        <div className="flex h-[600px] w-[850px] rounded-xl bg-gray-100 shadow-xl shadow-primary-500/10 overflow-hidden z-10">
          
          {/* Left Panel - Admin theme with brand colors */}
          <div className="flex flex-col items-center justify-center w-1/3 p-10 text-center transition-colors bg-primary-900">
            <Link href="/" className="flex items-center gap-1.5 p-2 font-bold">
              <img src="/logo-white.svg" alt="SSG Logo" className="w-24 h-24" />
            </Link>
            <h2 className="mb-2 text-2xl font-bold transition-colors text-primary-100">관리자 로그인</h2>
            <p className="mb-6 transition-colors text-primary-100">관리자 권한으로 로그인하세요</p>
            <div className="w-full py-3 px-4 rounded-lg text-center transition-colors bg-primary-700 text-primary-100 border border-primary-600">
              <Shield className="inline w-5 h-5 mr-2" />
              <span className="font-medium">Admin Access</span>
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

            <h2 className="mb-6 text-3xl font-bold text-primary-900 text-center">관리자 로그인</h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-primary-900">관리자 이메일</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="email"
                            placeholder="관리자 이메일을 입력하세요"
                            className={`${getInputClassName("email")} pr-4`}
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-primary-900">패스워드</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="패스워드를 입력하세요"
                            className={`${getInputClassName("password")} pr-10`}
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
                        className={`h-3 w-3 text-primary-900 transition-opacity duration-300 ${
                          form.watch("keepSignedIn") ? "opacity-100" : "opacity-0"
                        }`}
                      />
                    </div>
                    <span className="text-gray-600 select-none text-sm">로그인 상태 유지</span>
                  </label>
                  <Link
                    href="/auth/forgot"
                    className="text-primary-900 text-sm font-medium no-underline hover:text-primary-700"
                  >
                    비밀번호 찾기
                  </Link>
                </div>

                <button type="submit" className="btn btn-primary btn-lg w-full" disabled={isLoading}>
                  {isLoading ? "로그인 중..." : "관리자 로그인"}
                </button>

                {error && (
                  <div className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-lg border border-red-200 whitespace-pre-line">
                    {error}
                  </div>
                )}
              </form>
            </Form>

            {/* Admin Notice with brand colors */}
            <div className="mt-6 p-4 bg-gray-100 rounded-lg border-l-4 border-primary-900">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-primary-900 mr-3 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">⚠️ 관리자 접근 안내</h4>
                  <p className="text-xs text-gray-600">
                    <span className="font-medium text-primary-600">운영진</span> 권한이 있는 계정만 접근할 수 있습니다. 
                    일반 사용자는 <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">일반 로그인</Link>을 사용하세요.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
