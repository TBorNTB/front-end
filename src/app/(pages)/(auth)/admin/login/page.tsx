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
  const { login } = useAuth(); // ✅ Remove refreshUser and user - they're broken
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      email: "", 
      password: "", 
      keepSignedIn: true
    },
  });

  // ✅ JWT Parser Function (same as regular login)
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

  // ✅ Extract Access Token from Cookies
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
        
        // ✅ FIX: Use JWT parsing instead of broken refreshUser
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

          // ✅ FIX: Create user data from both backend + JWT
          const backendUser = data.user || data;
          
          const authUser: AuthUser = {
            nickname: backendUser?.nickname || username,
            full_name: backendUser?.realName || username,
            email: backendUser?.email || values.email,
            role: userRole, // ✅ Use role from JWT
            profile_image: backendUser?.profileImageUrl,
          };

          console.log('🔥 ADMIN USER DATA:');
          console.log('- Nickname:', authUser.nickname);
          console.log('- Role:', authUser.role);
          console.log('- Expected role:', UserRole.ADMIN);

          // ✅ FIX: Check admin role immediately
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
          router.push("/admin/dashboard");
          
        }, 100); // Small delay for cookies to be set
        
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
        ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
        : 'border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500'
    }`;
  };

  return (
    <>
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex h-[550px] w-[850px] rounded-xl bg-white shadow-xl shadow-red-500/10 overflow-hidden z-10 border border-gray-200">
          
          {/* Left Panel - Admin theme */}
          <div className="flex flex-col items-center justify-center w-1/3 bg-gradient-to-br from-red-600 to-red-800 p-10 text-center">
            <Shield className="w-24 h-24 mx-auto mb-6 text-white opacity-90" />
            <h2 className="mb-2 text-2xl font-bold text-white">관리자 전용</h2>
            <p className="mb-6 text-red-100">Administrator Access</p>
            <div className="w-full py-3 px-4 rounded-lg text-center bg-red-700/50 text-red-100 border border-red-600/50">
              <span className="font-medium">ADMIN ONLY</span>
            </div>
            
            {/* Back to regular login */}
            <div className="mt-4 pt-4 border-t border-red-400/30 w-full">
              <p className="text-red-200 text-xs mb-2">일반 사용자이신가요?</p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-100 bg-red-800/50 hover:bg-red-800 border border-red-600/50 hover:border-red-600 rounded-md transition-all duration-200"
              >
                일반 로그인
              </Link>
            </div>
          </div>

          {/* Right Panel */}
          <div className="flex flex-col justify-center p-10 w-2/3 bg-white relative">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-red-600 mr-3" />
              <h2 className="text-3xl font-bold text-red-600">관리자 로그인</h2>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-red-700">관리자 이메일</FormLabel>
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
                      <FormMessage className="text-red-600" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-red-700">패스워드</FormLabel>
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
                      <FormMessage className="text-red-600" />
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
                    <div className="flex items-center justify-center rounded w-4 h-4 bg-gray-100 border-2 border-gray-300 ring-offset-background peer-focus-visible:ring-2 peer-focus-visible:ring-red-500 peer-focus-visible:ring-offset-2 transition-all duration-300 peer-checked:bg-red-50 peer-checked:border-red-500 cursor-pointer">
                      <Check
                        className={`h-3 w-3 text-red-600 transition-opacity duration-300 ${
                          form.watch("keepSignedIn") ? "opacity-100" : "opacity-0"
                        }`}
                      />
                    </div>
                    <span className="text-gray-600 select-none text-sm">로그인 상태 유지</span>
                  </label>
                  <Link
                    href="/auth/forgot"
                    className="text-red-600 text-sm font-medium no-underline hover:text-red-700"
                  >
                    비밀번호 찾기
                  </Link>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-medium transition-colors btn-lg" 
                  disabled={isLoading}
                >
                  {isLoading ? "로그인 중..." : "관리자 로그인"}
                </button>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <div className="flex items-start">
                      <Shield className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-700 font-medium whitespace-pre-line text-left">{error}</p>
                    </div>
                  </div>
                )}
              </form>
            </Form>

            {/* Admin Notice */}
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 mb-1">⚠️ 관리자 접근 안내</h4>
                  <p className="text-xs text-red-700 mb-2">
                    <span className="font-medium">ADMIN (운영진)</span> 권한이 있는 계정만 접근할 수 있습니다.
                  </p>
                  <p className="text-xs text-red-600">
                    일반 사용자는 <Link href="/login" className="underline hover:no-underline font-medium">일반 로그인</Link>을 사용하세요.
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
