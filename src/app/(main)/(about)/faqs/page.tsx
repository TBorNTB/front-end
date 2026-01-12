"use client";

import TitleBanner from '@/components/layout/TitleBanner';

export default function FAQs() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TitleBanner
        title="FAQs"
        description="자주 묻는 질문과 답변을 한 곳에서 확인하세요."
        backgroundImage="/images/BgHeader.png"
      />
      <main className="container mx-auto px-4 py-8 flex-1">
        {/* Test your custom colors */}
        <p className="text-foreground text-base">
          This is the FAQs SSG page
        </p>
      </main>
    </div>
  );
}