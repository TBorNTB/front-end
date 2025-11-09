// src/app/admin/layout.tsx
"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation"; // ✅ Add useRouter here
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types/core";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter(); // ✅ Now properly imported
  const pathname = usePathname();
  const { user, isAuthenticated, loading } = useAuth();

  // ✅ Check if current page is the main admin page (login)
  const isAdminLoginPage = pathname === "/admin";

   
  // Authentication checks disabled for direct access
  useEffect(() => {
    // Skip protection for main admin page (login)
    if (isAdminLoginPage || loading) {
      return;
    }

    // Check authentication and admin role for protected pages
    if (!isAuthenticated || user?.role !== UserRole.ADMIN) {
      console.log("❌ Redirecting to admin login");
      router.replace("/admin");
    }
  }, [router, pathname, user, isAuthenticated, loading, isAdminLoginPage]);
  

  // ✅ ADMIN LOGIN PAGE: Show directly - no loading, no checks
  if (isAdminLoginPage) {
    return <>{children}</>;
  }

   
  // ✅ LOADING STATE: Only for protected pages while checking auth
  if (loading || !isAuthenticated || user?.role !== UserRole.ADMIN) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">관리자 권한 확인 중...</p>
        </div>
      </div>
    );
  }
  
  // ✅ AUTHORIZED ADMIN: Show full admin layout (now accessible to all)
  return (
    <div className="min-h-screen bg-gray-200">
      {/* Sidebar - Fixed position with responsive width */}
      <div className="fixed inset-y-0 left-0 z-50 w-16 md:w-56 bg-primary-900">
        <AdminSidebar />
      </div>
      
      {/* Main content - With proper responsive margin */}
      <div className="ml-16 md:ml-56 min-h-screen">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Admin Header */}
          <AdminHeader />
          
          <main className="p-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
