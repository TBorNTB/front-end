"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ChatBot from "@/app/(main)/chatbot/ChatBot";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <ChatBot />
      <Footer />
    </>
  );
}
