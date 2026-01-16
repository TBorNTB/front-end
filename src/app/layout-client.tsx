'use client';

import { usePathname } from "next/navigation";
import ChatBot from "@/app/(main)/chatbot/ChatBot";

export default function RootLayoutClient({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  
  // Hide chatbot only on login and signup pages
  const isLoginOrSignup = pathname === '/login' || pathname === '/signup' || pathname === '/admin' || pathname === '/forgot-password';
  const shouldShowChatBot = !isLoginOrSignup;

  return (
    <>
      <main className="flex-grow w-full">{children}</main>
      {shouldShowChatBot && <ChatBot />}
    </>
  );
}
