// components/landing/QuickActions.tsx
"use client";

import { useRouter } from "next/navigation";
import { Plus, PenSquare, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

const actions = [
  {
    icon: Plus,
    title: "Create Project",
    description: "Start a new cybersecurity initiative",
    href: "/projects/create",
    requiresAuth: true,
  },
  {
    icon: PenSquare,
    title: "Write Article",
    description: "Share your expertise and insights",
    href: "/articles/create",
    requiresAuth: true,
  },
  {
    icon: Users,
    title: "Join Newsletter",
    description: "Get our latest news",
    href: "/newsletter",
    requiresAuth: false,
  },
];

export function QuickActions() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleActionClick = (action: typeof actions[0], e: React.MouseEvent) => {
    // 인증이 필요한 액션이고 사용자가 로그인하지 않은 경우
    if (action.requiresAuth && !isAuthenticated) {
      e.preventDefault();
      toast.error("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    // 인증이 필요 없거나 로그인한 경우 정상적으로 이동
    router.push(action.href);
  };

  return (
    <section className="w-full py-10">
      <div className="container mx-auto px-4">
        <div className="rounded-2xl bg-gradient-background p-6 sm:p-8 shadow-lg">
          <h2 className="text-white font-semibold text-lg mb-4 relative z-10">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.title}
                  onClick={(e) => handleActionClick(action, e)}
                  className="group rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors px-5 py-4 flex flex-col justify-between w-full text-left cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-primary-100/20 p-2">
                      <Icon className="h-4 w-4 text-secondary-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {action.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-200">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
