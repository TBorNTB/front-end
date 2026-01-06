// components/landing/QuickActions.tsx
"use client";

import Link from "next/link";
import { Plus, PenSquare, Users } from "lucide-react";

const actions = [
  {
    icon: Plus,
    title: "Create Project",
    description: "Start a new cybersecurity initiative",
    href: "/projects/new",
  },
  {
    icon: PenSquare,
    title: "Write CS Blog",
    description: "Share your expertise and insights",
    href: "/articles/new",
  },
  {
    icon: Users,
    title: "Join Newsletter",
    description: "Get our latest news",
    href: "/newsletter",
  },
];

export function QuickActions() {
  return (
    <section className="w-full bg-[#dbeafe] py-10">
      <div className="container mx-auto px-4">
        <div className="rounded-2xl bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 p-6 sm:p-8 shadow-lg">
          <h2 className="text-white font-semibold text-lg mb-4">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group rounded-xl bg-slate-900/70 hover:bg-slate-900 transition-colors px-5 py-4 flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-primary-100/10 p-2">
                      <Icon className="h-4 w-4 text-secondary-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {action.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-300">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
