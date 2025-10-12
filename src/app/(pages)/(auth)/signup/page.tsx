"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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

const API_URL = "/api/auth/signup";

const formSchema = z.object({
  nickname: z.string().min(2, { message: "유저네임는 최소 2글자 이상이어야 합니다." }),
  password: z.string().min(6, { message: "비밀번호는 최소 6글자 이상이어야 합니다." }),
  confirmPassword: z.string().min(6, { message: "비밀번호 확인을 입력해주세요." }),
  realName: z.string().min(1, { message: "성명을 입력해주세요." }),
  email: z.string().email({ message: "올바른 이메일 형식을 입력해주세요." }),
  description: z.string().optional(),
  githubUrl: z.string().url({ message: "올바른 URL 형식을 입력해주세요." }).optional().or(z.literal("")),
  linkedinUrl: z.string().url({ message: "올바른 URL 형식을 입력해주세요." }).optional().or(z.literal("")),
  blogUrl: z.string().url({ message: "올바른 URL 형식을 입력해주세요." }).optional().or(z.literal("")),
  profileImageUrl: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다.",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof formSchema>;

// Extended interface for submission data (for combined approach)
interface SubmitData extends Omit<FormData, 'confirmPassword'> {
  fileData?: string;
  fileName?: string;
  fileType?: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
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

  // Handle file selection (just store file, don't upload yet)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setError("JPG, PNG, GIF 형식의 이미지만 업로드 가능합니다.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("이미지 크기는 5MB 이하여야 합니다.");
        return;
      }

      setProfileImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setProfileImagePreview(previewUrl);
      setError("");
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

  // Combined approach: Send file data with signup data
  async function onSubmit(values: FormData) {
    setIsLoading(true);
    setError("");

    try {
      const { confirmPassword, ...baseSubmitData } = values;
      
      // Create submission data with proper typing
      const submitData: SubmitData = { ...baseSubmitData };
      
      // Add file data if image is selected (for combined approach)
      if (profileImageFile) {
        console.log('🖼️ Converting file to base64...');
        
        // Convert file to base64
        const fileBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("파일 읽기 실패"));
          reader.readAsDataURL(profileImageFile);
        });
        
        submitData.fileData = fileBase64;
        submitData.fileName = profileImageFile.name;
        submitData.fileType = profileImageFile.type;
        
        console.log('📦 Sending file data with signup:', {
          fileName: submitData.fileName,
          fileType: submitData.fileType,
          fileSize: fileBase64.length
        });
      }
      
      console.log('📤 Submitting to combined signup endpoint...');
      
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData), // Contains file data + user data
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
      setError(err instanceof Error ? err.message : "회원가입 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  const getInputClassName = (fieldName: keyof FormData) => {
    const hasError = form.formState.errors[fieldName];
    return `h-10 w-full pl-10 pr-4 bg-gray-50 rounded-lg text-gray-900 focus:outline-none transition-colors ${
      hasError 
        ? 'border-error focus:border-error focus:ring-1 focus:ring-error' 
        : 'border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500'
    }`;
  };

  const getInputClassNameNoPadding = (fieldName: keyof FormData) => {
    const hasError = form.formState.errors[fieldName];
    return `h-10 w-full px-3 bg-gray-50 rounded-lg text-gray-900 focus:outline-none transition-colors ${
      hasError 
        ? 'border-error focus:border-error focus:ring-1 focus:ring-error' 
        : 'border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500'
    }`;
  };

  const getTextareaClassName = (fieldName: keyof FormData) => {
    const hasError = form.formState.errors[fieldName];
    return `w-full p-3 text-sm bg-gray-50 rounded-lg text-gray-900 focus:outline-none transition-colors resize-none ${
      hasError 
        ? 'border-error focus:border-error focus:ring-1 focus:ring-error' 
        : 'border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500'
    }`;
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background py-8">
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        유저네임 <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="유저네임를 입력하세요"
                            className={getInputClassName("nickname")}
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        성명 <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <BookUser className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="성명을 입력하세요"
                            className={getInputClassName("realName")}
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
                render={({ field }) => (
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
                          className={getInputClassName("email")}
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
                  render={({ field }) => (
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
                            className={`${getInputClassName("password")} pr-10`}
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
                  render={({ field }) => (
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
                            className={`${getInputClassName("confirmPassword")} pr-10`}
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">자기소개</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="자신에 대해 소개해주세요..."
                        className={getTextareaClassName("description")}
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

              {/* Social Links */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="githubUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">GitHub URL</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://github.com/username"
                          className={getInputClassNameNoPadding("githubUrl")}
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">LinkedIn URL</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://linkedin.com/in/username"
                          className={getInputClassNameNoPadding("linkedinUrl")}
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">블로그/웹사이트 URL</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://yourblog.com"
                          className={getInputClassNameNoPadding("blogUrl")}
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
