"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Check, User, Lock, Github, X, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
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

export default function LogInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "", keepSignedIn: true },
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "로그인에 실패했습니다.");
      }

      if (data.message === "로그인 성공") {
        const userData = {
          name: "User",
          email: values.email,
          avatar: "undefined",
        };

        login(userData);
        router.push("/");
      } else {
        throw new Error(data?.message || "로그인에 실패했습니다.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleGithubLogin = async () => {
    try {
      setIsLoading(true);
      await signIn("github", { callbackUrl: "/mypage" });
    } catch (error) {
      setError("GitHub 로그인에 실패했습니다.");
      setIsLoading(false);
    }
  };

  // Helper function to get input styling based on error state
  const getInputClassName = (fieldName: keyof FormData) => {
    const hasError = form.formState.errors[fieldName];
    return `h-10 w-full pl-10 bg-gray-50 rounded-lg text-gray-900 focus:outline-none transition-colors ${
      hasError 
        ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]' 
        : 'border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500'
    }`;
  };

  return (
    <>
      {/* Add CSS to hide browser native password reveal buttons */}
      <style jsx>{`
        input[type="password"]::-ms-reveal {
          display: none;
        }
        input[type="password"]::-webkit-credentials-auto-fill-button {
          visibility: hidden;
          position: absolute;
          right: 0;
        }
      `}</style>
      
      <div className="flex h-screen w-full items-center justify-center bg-background">
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
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">이메일</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="email"
                            placeholder="이메일을 입력하세요"
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
                      <FormLabel className="text-sm font-medium text-gray-700">패스워드</FormLabel>
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
                        className={`h-3 w-3 text-primary-600 transition-opacity duration-300 ${
                          form.watch("keepSignedIn") ? "opacity-100" : "opacity-0"
                        }`}
                      />
                    </div>
                    <span className="text-gray-600 select-none text-sm">로그인 상태 유지</span>
                  </label>
                  <Link
                    href="/auth/forgot"
                    className="text-primary-600 text-sm font-medium no-underline hover:text-primary-700"
                  >
                    비밀번호 찾기
                  </Link>
                </div>

                <button type="submit" className="btn btn-primary btn-lg w-full" disabled={isLoading}>
                  {isLoading ? "로그인 중..." : "로그인"}
                </button>

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
              className="w-full h-10 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-primary-500 hover:text-primary-600 transition-colors rounded-lg font-medium flex items-center justify-center"
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
