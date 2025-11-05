"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Check, User, Lock, Github, X, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { AuthUser } from "@/app/(main)/(auth)/types/auth";
import { UserRole } from "@/types/core";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

// Import your form utilities
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

export default function LogInPage() {
  // Use centralized form state management
  const { isLoading, error, setIsLoading, handleError } = useAuthFormState();
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "", keepSignedIn: true },
  });

  // ✅ Fetch user profile using token for authorization (using form-utils)
  const fetchUserProfileWithToken = async (): Promise<AuthUser | null> => {
    try {
      const response = await makeAuthenticatedRequest('/api/auth/user', {
        method: 'GET',
        cache: 'no-store',
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('✅ User profile authorized by token, data from response:', userData);
        
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
      } else {
        console.log('❌ Token authorization failed or expired');
      }

      return null;
    } catch (error) {
      console.error('❌ Error fetching user profile with token authorization:', error);
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

      const data = await response.json();
      console.log('Backend login response:', data);

      if (!response.ok) {
        throw new Error(data?.message || "로그인에 실패했습니다.");
      }

      if (data.message === "로그인 성공" || data.authenticated) {
        console.log('Login successful! Processing user data from response...');
        
        const backendUser = data.user || data;
        
        const authUser: AuthUser = {
          nickname: backendUser.nickname || "user",
          full_name: backendUser.realName || backendUser.fullName || backendUser.nickname || "user",
          email: backendUser.email || values.email,
          role: backendUser.role as UserRole || UserRole.GUEST,
          profile_image: backendUser.profileImageUrl || backendUser.profileImage,
        };
        
        console.log('AuthUser created from response:', authUser);

        // ✅ Now token is set in HTTP-only cookies, make authorized API calls
        setTimeout(async () => {
          console.log('✅ Making authorized API call using token...');
          
          const freshUserData = await fetchUserProfileWithToken();
          if (freshUserData) {
            console.log('✅ Fresh user data authorized by token:', freshUserData);
            login(freshUserData, values.keepSignedIn);
          } else {
            login(authUser, values.keepSignedIn);
          }

          // Example: Make other authorized API calls using form-utils
          try {
            const profileResponse = await makeAuthenticatedRequest('/api/user/profile');
            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              console.log('✅ Profile data from authorized API call:', profileData);
            }

            const settingsResponse = await makeAuthenticatedRequest('/api/user/settings');
            if (settingsResponse.ok) {
              const settingsData = await settingsResponse.json();
              console.log('✅ Settings data from authorized API call:', settingsData);
            }
          } catch (error) {
            console.error('❌ Error making authorized API calls:', error);
          }

          router.push("/");
        }, 100);
        
      } else {
        throw new Error(data?.message || "로그인에 실패했습니다.");
      }
    } catch (err) {
      console.error('Login error:', err);
      // Use centralized error handling
      handleError(err, "로그인에 실패했습니다.");
    }
  }

  const handleGithubLogin = async () => {
    try {
      setIsLoading(true);
      // await signIn("github", { callbackUrl: "/mypage" });
    } catch (error) {
      handleError(error, "GitHub 로그인에 실패했습니다.");
    }
  };

  return (
    <>
      <div className="flex h-screen w-full items-center justify-center bg-gradient-background">
        <div className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(circle_at_center,_rgba(58,_77,_161,_0.08)_0,_transparent_30%)]" />
        <div className="flex h-[550px] w-[850px] rounded-xl bg-white shadow-xl shadow-primary-500/10 overflow-hidden z-10 border border-gray-200">
          
          {/* Left Panel */}
          <div className="flex flex-col items-center justify-center w-1/3 bg-gradient-to-br from-primary-500 to-primary-700 p-10 text-center">
            <Link href="/" className="flex items-center gap-1.5 p-2 font-bold hover:cursor-pointer">
              <img src="/logo-white.svg" alt="SSG Logo" className="w-24 h-24 filter" />
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
          <div className="flex flex-col justify-center p-10 w-2/3 bg-white relative">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="absolute top-4 right-4 text-gray-400 hover:text-primary-600 transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="mb-6 text-3xl font-bold text-primary-600 text-center">로그인</h2>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* Email Field - using form-utils */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-primary-600">이메일</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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

                {/* Password Field - using form-utils */}
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
                  {isLoading ? "로그인 중..." : "로그인"}
                </button>

                {/* Centralized error display */}
                {error && <p className="text-sm text-error text-center">{error}</p>}
              </form>
            </Form>

            <div className="my-5 flex items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-4 flex-shrink text-gray-500 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <button
              onClick={handleGithubLogin}
              disabled={isLoading}
              className="w-full btn-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-primary-500 hover:text-primary-600 transition-colors rounded-lg font-medium flex items-center justify-center cursor-pointer"
            >
              <Github className="mr-2 h-4 w-4" />
              깃허브로 간편 로그인
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
