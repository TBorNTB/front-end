"use client";

import { Shield, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  // Redirect directly to dashboard
  const handleDirectAccess = () => {
    router.push("/admin/dashboard");
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-background">
      <div className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(circle_at_center,_rgba(58,_77,_161,_0.08)_0,_transparent_30%)]" />
      <div className="flex h-[550px] w-[850px] rounded-xl bg-white shadow-xl shadow-primary-500/10 overflow-hidden z-10 border border-gray-200">
        
        {/* Left Panel - Admin theme with brand colors */}
        <div className="flex flex-col items-center justify-center w-1/3 bg-gradient-to-br from-primary-600 to-primary-800 p-10 text-center">
          <Shield className="w-16 h-16 text-white mb-4" />
          <h2 className="mb-2 text-2xl font-bold text-white">관리자 패널</h2>
          <p className="mb-6 text-primary-100">관리자 대시보드에 접근하세요</p>
          <div className="px-4 py-2 bg-white/20 rounded-lg text-white text-sm">
            Direct Access
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

          <h2 className="mb-6 text-3xl font-bold text-primary-600 text-center">관리자 대시보드</h2>
          
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                관리자 대시보드에 직접 접근할 수 있습니다.
              </p>
              
              <button 
                onClick={handleDirectAccess}
                className="btn btn-primary btn-lg w-full"
              >
                대시보드 접근
              </button>
            </div>

            {/* Admin Notice with brand colors */}
            <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
              <p className="text-primary-700 text-sm font-medium mb-1">ℹ️ 직접 접근 모드</p>
              <p className="text-primary-600 text-xs">인증 없이 관리자 대시보드에 접근합니다.</p>
              <p className="text-primary-600 text-xs">개발 환경에서만 사용하세요.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
