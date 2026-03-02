'use client';

import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import type { FaqItem } from '@/data/faq';

export interface FAQsSectionProps {
  faqs: FaqItem[];
  expandedFaq: number | null;
  onToggleFaq: (index: number) => void;
  /** 메인 등에서 "자세히 보기" 링크 표시 여부 */
  showMoreLink?: boolean;
}

export default function FAQsSection({
  faqs,
  expandedFaq,
  onToggleFaq,
  showMoreLink = false,
}: FAQsSectionProps) {
  return (
    <section className="section py-20 bg-gray-100">
      <div className="container">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          자주 묻는 질문
        </h2>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg overflow-hidden border border-primary-600"
            >
              <button
                onClick={() => onToggleFaq(index)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-primary-100 transition-colors"
              >
                <span className="font-semibold text-gray-900">{faq.question}</span>
                {expandedFaq === index ? (
                  <ChevronDown className="w-5 h-5 text-primary-600 flex-shrink-0 rotate-180" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-primary-600 flex-shrink-0" />
                )}
              </button>
              {expandedFaq === index && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  <p className="text-gray-700 leading-relaxed pt-4">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {showMoreLink && (
          <div className="max-w-3xl mx-auto mt-8 text-center">
            <Link
              href="/faqs"
              className="inline-flex items-center gap-1 text-primary-600 font-medium hover:text-primary-700 hover:underline"
            >
              자주 묻는 질문 더보기
              <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
