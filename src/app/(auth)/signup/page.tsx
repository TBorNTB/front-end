"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { User, Lock, Mail, Eye, Upload, X, BookUser } from "lucide-react";

const API_URL = "/api/auth/signup";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [form, setForm] = useState({
    username: "",
    password: "",
    realName: "",
    email: "",
    description: "",
    githubUrl: "",
    linkedinUrl: "",
    blogUrl: "",
    profileImageUrl: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setProfileImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setProfileImagePreview(previewUrl);
      setForm(prev => ({ ...prev, profileImageUrl: "uploaded-image-placeholder" }));
    }
  };

  const removeProfileImage = () => {
    setProfileImageFile(null);
    setProfileImagePreview("");
    setForm(prev => ({ ...prev, profileImageUrl: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getProfilePreview = () => {
    if (profileImagePreview) {
      return (
        <div className="relative w-16 h-16">
          <img 
            src={profileImagePreview} 
            alt="Profile Preview" 
            className="w-full h-full rounded-full object-cover border-2 border-[#3A4DA1]"
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
    } else if (form.username) {
      return (
        <div className="w-16 h-16 bg-gradient-to-r from-[#3A4DA1] to-[#2A3B8F] rounded-full flex items-center justify-center shadow-lg">
          <span className="text-xl font-bold text-white">
            {form.username.charAt(0).toUpperCase()}
          </span>
        </div>
      );
    } else {
      return (
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
          <User size={24} className="text-gray-400" />
        </div>
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "회원가입에 실패했습니다.");
      }

      alert("회원가입 성공! 로그인 페이지로 이동합니다.");
      router.push("/login");
    } catch (err) {
      console.error("Signup error:", err);
      setError(err instanceof Error ? err.message : "회원가입 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(circle_at_center,_rgba(58,_77,_161,_0.08)_0,_transparent_30%)]" />
      
      <div className="flex w-[900px] min-h-[600px] rounded-xl bg-white shadow-xl shadow-[#3A4DA1]/10 overflow-hidden z-10 border border-gray-200">
        
        {/* Left Panel - Form (2/3 width) */}
        <div className="w-2/3 p-8 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#3A4DA1]">Create Account</h2>
          </div>
          
          <p className="text-gray-600 mb-6 text-sm">Fill in your information to join SSG and start your cybersecurity journey.</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Required Fields Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Nickname <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="username"
                    placeholder="Enter your username"
                    value={form.username}
                    onChange={handleChange}
                    className="w-full h-9 pl-8 text-sm bg-gray-50 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:border-[#3A4DA1] focus:ring-1 focus:ring-[#3A4DA1] transition-colors"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Real Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <BookUser className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="realName"
                    placeholder="Enter your real name"
                    value={form.realName}
                    onChange={handleChange}
                    className="w-full h-9 pl-8 text-sm bg-gray-50 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:border-[#3A4DA1] focus:ring-1 focus:ring-[#3A4DA1] transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full h-9 pl-8 text-sm bg-gray-50 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:border-[#3A4DA1] focus:ring-1 focus:ring-[#3A4DA1] transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password (min 6 characters)"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full h-9 pl-8 pr-8 text-sm bg-gray-50 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:border-[#3A4DA1] focus:ring-1 focus:ring-[#3A4DA1] transition-colors"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#3A4DA1] transition-colors"
                >
                  <Eye size={14} />
                </button>
              </div>
            </div>

            {/* Optional Information Header */}
            <div className="flex items-center gap-2 pt-2">
              <User className="w-4 h-4 text-gray-500" />
              <h3 className="text-base font-medium text-gray-700">Optional Information</h3>
            </div>

            {/* About You */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">About You</label>
              <textarea
                name="description"
                placeholder="Tell us about yourself, your interests in cybersecurity, etc."
                value={form.description}
                onChange={handleChange}
                rows={2}
                className="w-full p-2 text-sm bg-gray-50 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:border-[#3A4DA1] focus:ring-1 focus:ring-[#3A4DA1] transition-colors resize-none"
              />
            </div>

            {/* Profile Image Section */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Profile Image (Preview Only)
              </label>
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 h-8 px-3 text-sm bg-gray-50 border border-gray-300 text-gray-700 hover:border-[#3A4DA1] hover:bg-gray-100 transition-colors"
                >
                  <Upload size={14} />
                  Choose Image
                </Button>
                {profileImageFile && (
                  <span className="text-xs text-gray-500">
                    {profileImageFile.name.length > 20 ? 
                      profileImageFile.name.substring(0, 20) + '...' : 
                      profileImageFile.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                For preview only. Upload will be available after registration.
              </p>
            </div>

            {/* Social Links */}
            <div className="space-y-3">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  GitHub URL
                </label>
                <input
                  type="url"
                  name="githubUrl"
                  placeholder="https://github.com/yourusername"
                  value={form.githubUrl}
                  onChange={handleChange}
                  className="w-full h-9 px-3 text-sm bg-gray-50 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:border-[#3A4DA1] focus:ring-1 focus:ring-[#3A4DA1] transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  name="linkedinUrl"
                  placeholder="https://linkedin.com/in/yourusername"
                  value={form.linkedinUrl}
                  onChange={handleChange}
                  className="w-full h-9 px-3 text-sm bg-gray-50 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:border-[#3A4DA1] focus:ring-1 focus:ring-[#3A4DA1] transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Blog/Website URL
                </label>
                <input
                  type="url"
                  name="blogUrl"
                  placeholder="https://yourblog.com"
                  value={form.blogUrl}
                  onChange={handleChange}
                  className="w-full h-9 px-3 text-sm bg-gray-50 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:border-[#3A4DA1] focus:ring-1 focus:ring-[#3A4DA1] transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                className="w-full h-10 bg-[#3A4DA1] text-white font-semibold rounded-lg hover:bg-[#2A3B8F] disabled:opacity-50 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </div>
            
            {error && (
              <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}
          </form>
        </div>

        {/* Right Panel - Preview (1/3 width) */}
        <div className="w-1/3 bg-gradient-to-br from-[#3A4DA1] to-[#2A3B8F] p-8 flex flex-col items-center justify-center text-center relative">
          {/* Exit Button - Top Right */}
          <button
            type="button"
            onClick={() => router.push("/")}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          {/* Profile Preview */}
          <div className="mb-6">
            <p className="text-white mb-3 text-lg font-medium">Profile Preview</p>
            <div className="flex justify-center mb-2">
              {getProfilePreview()}
            </div>
            {form.username && !profileImagePreview && (
              <p className="text-indigo-100 text-xs">
                Using first letter of nickname
              </p>
            )}
            {profileImageFile && (
              <p className="text-indigo-100 text-xs">
                Selected: {profileImageFile.name.length > 15 ? 
                  profileImageFile.name.substring(0, 15) + '...' : 
                  profileImageFile.name}
              </p>
            )}
          </div>
          
          <h2 className="mb-2 text-xl font-bold text-white">
            이미 계정이 있으신가요?
          </h2>
          <p className="mb-6 text-indigo-100">로그인 하세요!</p>
          <Button
            type="button"
            onClick={() => router.push("/login")}
            className="w-full h-10 bg-white text-[#3A4DA1] font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            로그인
          </Button>
        </div>
      </div>
    </div>
  );
}
