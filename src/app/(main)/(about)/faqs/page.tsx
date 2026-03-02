'use client';

import { useState } from 'react';
import TitleBanner from '@/components/layout/TitleBanner';
import { FAQsSection } from '@/components/landing';
import { faqs } from '@/data/faq';

export default function FAQs() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const onToggleFaq = (index: number) => {
    setExpandedFaq((prev) => (prev === index ? null : index));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TitleBanner
        title="FAQs"
        description="자주 묻는 질문과 답변을 한 곳에서 확인하세요."
        backgroundImage="/images/BgHeader.png"
      />
      <main className="container mx-auto px-4 py-8 flex-1">
        <FAQsSection
          faqs={faqs}
          expandedFaq={expandedFaq}
          onToggleFaq={onToggleFaq}
        />
      </main>
    </div>
  );
}
