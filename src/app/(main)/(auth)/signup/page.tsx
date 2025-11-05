// app/(main)/(auth)/signup/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, Mail, Eye, EyeOff, Upload, X, BookUser } from "lucide-react";
import Link from "next/link";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Import from co-located auth types and utilities
import { 
  signupSchema,
  SignupFormData,
  SignupSubmitData,
  mapSignupFormToRequest
} from "../types/auth";

// Import form utilities
import { 
  getIconInputClassName, 
  getPasswordInputClassName, 
  getInputClassName,
  getTextareaClassName,
  useAuthFormState, 
  validateImageFile,
  fileToBase64,
  makeAuthenticatedRequest 
} from "@/lib/form-utils";

const API_URL = "/api/auth/signup";

export default function SignupPage() {
  const router = useRouter();
  
  // Use centralized form state management
  const { isLoading, error, setIsLoading, handleError } = useAuthFormState();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      nickname: "",
      password: "",
      confirmPassword: "",
      realName: "",
      email: "",
      description: "",
      githubUrl: "",
      linkedinUrl: "",
      blogUrl: "",
      profileImageUrl: "",
    },
  });

  // Handle file selection using form-utils validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateImageFile(file);
      
      if (!validation.isValid) {
        handleError(new Error(validation.error!));
        return;
      }

      setProfileImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setProfileImagePreview(previewUrl);
    }
  };

  const removeProfileImage = () => {
    setProfileImageFile(null);
    setProfileImagePreview("");
    form.setValue("profileImageUrl", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getProfilePreview = () => {
    const nickname = form.watch("nickname");
    
    if (profileImagePreview) {
      return (
        <div className="relative w-16 h-16">
          <img 
            src={profileImagePreview} 
            alt="Profile Preview" 
            className="w-full h-full rounded-full object-cover border-2 border-primary-500"
          />
          <button
            type="button"
            onClick={removeProfileImage}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
          >
            <X size={10} />
          </button>
        </div>
      );
    } else if (nickname) {
      return (
        <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-700 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-xl font-bold text-white">
            {nickname.charAt(0).toUpperCase()}
          </span>
        </div>
      );
    } else {
      return (
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
          <User size={24} className="text-gray-900" />
        </div>
      );
    }
  };

  async function onSubmit(values: SignupFormData) {
    setIsLoading(true);

    try {
      // Prepare file data if present
      let fileData: { fileData: string; fileName: string; fileType: string } | undefined;
      
      if (profileImageFile) {
        console.log('🖼️ Converting file to base64...');
        
        // Use form-utils file conversion
        const fileBase64 = await fileToBase64(profileImageFile);
        
        fileData = {
          fileData: fileBase64,
          fileName: profileImageFile.name,
          fileType: profileImageFile.type,
        };
        
        console.log('📦 File prepared for submission:', {
          fileName: fileData.fileName,
          fileType: fileData.fileType,
          fileSize: fileBase64.length
        });
      }
      
      // Use type mapper from co-located auth types
      const submitData: SignupSubmitData = mapSignupFormToRequest(values, fileData);
      
      console.log('📤 Submitting to signup endpoint...');
      
      // Use form-utils API call
      const response = await makeAuthenticatedRequest(API_URL, {
        method: "POST",
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Signup failed:', data);
        throw new Error(data.message || "회원가입에 실패했습니다.");
      }

      console.log('✅ Signup success!');
      alert("회원가입 성공! 로그인 페이지로 이동합니다.");
      router.push("/login");
    } catch (err) {
      console.error('💥 Frontend error:', err);
      handleError(err, "회원가입 중 오류가 발생했습니다.");
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-background py-8">
      <div className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(circle_at_center,_rgba(58,_77,_161,_0.08)_0,_transparent_30%)]" />
      
      <div className="flex w-[900px] min-h-[650px] rounded-xl bg-white shadow-xl shadow-primary-500/10 overflow-hidden z-10 border border-gray-200">
        
        {/* Left Panel - Form (2/3 width) */}
        <div className="w-2/3 p-8 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-primary-600">회원가입</h2>
            <p className="text-gray-600 mt-2 text-sm">SSG에 참여하여 사이버보안 여정을 시작하세요.</p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              
              {/* Required Fields Row */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nickname"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        유저네임 <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="유저네임을 입력하세요"
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
                  name="realName"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        성명 <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <BookUser className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="성명을 입력하세요"
                            className={getIconInputClassName(!!fieldState.error)}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-error" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      이메일 <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
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

              {/* Password Fields Row */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        패스워드 <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="패스워드 (최소 6자)"
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
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        패스워드 확인 <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="패스워드 다시 입력"
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
              </div>

              {/* Optional Information Header */}
              <div className="flex items-center gap-2 pt-2">
                <User className="w-4 h-4 text-gray-500" />
                <h3 className="text-base font-medium text-gray-700">선택 정보</h3>
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">자기소개</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="자신에 대해 소개해주세요..."
                        className={getTextareaClassName(!!fieldState.error)}
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-error" />
                  </FormItem>
                )}
              />

              {/* Profile Image */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">프로필 이미지</label>
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 h-10 px-4 bg-gray-50 border border-gray-300 text-gray-700 hover:border-primary-500 hover:bg-gray-100 transition-colors rounded-lg"
                  >
                    <Upload size={14} />
                    이미지 선택
                  </button>
                  {profileImageFile && (
                    <span className="text-sm text-gray-500">
                      {profileImageFile.name.length > 20 ? 
                        profileImageFile.name.substring(0, 20) + '...' : 
                        profileImageFile.name}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF (최대 5MB)</p>
              </div>

              {/* Social Links - Using standard input className */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="githubUrl"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">GitHub URL</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://github.com/username"
                          className={getInputClassName(!!fieldState.error)}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-error" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="linkedinUrl"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">LinkedIn URL</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://linkedin.com/in/username"
                          className={getInputClassName(!!fieldState.error)}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-error" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="blogUrl"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">블로그/웹사이트 URL</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://yourblog.com"
                          className={getInputClassName(!!fieldState.error)}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-error" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary btn-lg w-full"
                disabled={isLoading}
              >
                {isLoading ? "회원가입 중..." : "회원가입"}
              </button>
              
              {/* Centralized error display */}
              {error && (
                <p className="text-sm text-error text-center">{error}</p>
              )}
            </form>
          </Form>
        </div>

        {/* Right Panel - Preview (1/3 width) */}
        <div className="w-1/3 bg-gradient-to-br from-primary-500 to-primary-700 p-8 flex flex-col items-center justify-center text-center relative">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          <div className="mb-6">
            <p className="text-white mb-3 text-lg font-medium">프로필 미리보기</p>
            <div className="flex justify-center mb-2">
              {getProfilePreview()}
            </div>
            {form.watch("nickname") && !profileImagePreview && (
              <p className="text-primary-100 text-xs">유저네임 첫 글자 사용</p>
            )}
          </div>
          
          <h2 className="mb-2 text-xl font-bold text-white">이미 계정이 있으신가요?</h2>
          <p className="mb-6 text-primary-100">로그인 하세요!</p>
          <Link href="/login" className="btn btn-primary btn-lg w-full bg-white text-primary-600 hover:bg-gray-50">
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
