// src/components/admin/AdminHeader.tsx - MEDIUM SIZE VERSION
"use client";

import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Bell, User, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function AdminHeader() {
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = user?.nickname || user?.full_name || "관리자";
  const displayEmail = user?.email || "admin@ssg.kr";
  const userInitial = displayName?.charAt(0)?.toUpperCase() || "A";

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-18 px-7">
        {/* Left: Site Navigation */}
        <div className="flex items-center space-x-5">
          <Link
            href="/"
            className="flex items-center px-3.5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4.5 w-4.5 mr-2.5" />
            메인 사이트
          </Link>
        </div>

        {/* Right: Notifications & User Menu */}
        <div className="flex items-center space-x-5">
          {/* Notifications */}
          <button className="p-2.5 text-gray-400 hover:text-gray-600 relative rounded-lg hover:bg-gray-100 transition-colors">
            <Bell className="h-5.5 w-5.5" />
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              <span className="w-2 h-2 bg-white rounded-full"></span>
            </span>
          </button>
         {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {userInitial}
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">{displayName}</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute top-full right-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                      {userInitial}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{displayName}</p>
                      <p className="text-sm text-gray-600">{displayEmail}</p>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    권한: 운영진 (관리자)
                  </div>
                </div>
                
                <div className="py-1">
                  <Link 
                    href="/admin/profile" 
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    프로필 설정
                  </Link>
                  
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    로그아웃
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
