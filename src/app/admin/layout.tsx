// src/app/admin/layout.tsx
import type { Metadata } from "next";
import "../../styles/admin.css";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader"; 

export const metadata: Metadata = {
  title: "Admin - SSG Hub",
  description: "Admin panel for SSG Hub",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="admin-container min-h-screen bg-gray-200">
      {/* Main Content */}
     

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
