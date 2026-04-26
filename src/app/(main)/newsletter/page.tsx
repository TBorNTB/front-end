'use client';

import { useState } from 'react';
import { Mail, Shield, Clock, BookOpen, Users, ChevronDown, ChevronUp, TrendingUp, CalendarDays } from 'lucide-react';
import Image from 'next/image';
import NewsletterSubscribe from './_components/NewsletterSubscribe';
import NewsletterSubscriberStatus from './_components/NewsletterSubscriberStatus';
import NewsletterUnsubscribe from './_components/NewsletterUnsubscribe';

// Newsletter Tabs Component
function NewsletterTabs() {
  const [activeTab, setActiveTab] = useState<'subscribe' | 'status' | 'unsubscribe'>('subscribe');

  const tabs = [
    {
      id: 'subscribe' as const,
      label: '구독하기',
      icon: Mail,
      description: '보안 학습 콘텐츠를 이메일로 받아보세요',
    },
    {
      id: 'status' as const,
      label: '구독 상태 확인',
      icon: Shield,
      description: '이메일이 구독되어 있는지 확인할 수 있어요',
    },
    {
      id: 'unsubscribe' as const,
      label: '구독 해제',
      icon: Users,
      description: '해제 전 이메일 인증이 필요해요',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-3 justify-center border-b border-gray-200 pb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-t-lg font-medium transition-all
                  ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="card p-8">
        {activeTab === 'subscribe' && (
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">뉴스레터 구독</h3>
            <p className="text-gray-700 mb-6">{tabs[0].description}</p>
            <NewsletterSubscribe />
          </div>
        )}

        {activeTab === 'status' && (
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">구독 상태 확인</h3>
            <p className="text-gray-700 mb-6">{tabs[1].description}</p>
            <NewsletterSubscriberStatus />
          </div>
        )}

        {activeTab === 'unsubscribe' && (
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">구독 해제</h3>
            <p className="text-gray-700 mb-6">{tabs[2].description}</p>
            <NewsletterUnsubscribe />
          </div>
        )}
      </div>
    </div>
  );
}

const faqs = [
  {
    question: 'SSG 뉴스레터는 무료인가요?',
    answer: '네, 완전 무료 서비스입니다. 보안 지식을 함께 나누고 사이버보안 커뮤니티를 성장시키기 위한 취지로 운영됩니다. 페이지 하단의 GitHub 스타를 눌러주시면 서비스 유지에 큰 도움이 됩니다! 🛡️'
  },
  {
    question: '콘텐츠는 누가 작성하나요?',
    answer: 'SSG 동아리 멤버들과 보안 전문가들이 직접 콘텐츠를 큐레이팅하고 작성합니다. 실무 경험과 최신 보안 트렌드를 바탕으로 양질의 정보만을 선별하여 제공합니다.'
  },
  {
    question: '메일이 오지 않아요.',
    answer: '메일이 간혹 스팸으로 분류되는 경우가 있습니다. 스팸 메일함과 프로모션 탭도 확인해보시고, 없다면 ssg.newsletter@gmail.com으로 문의 주시면 즉시 처리해 드리겠습니다.'
  },
  {
    question: '구독을 취소하고 싶어요.',
    answer: '메일 하단에 위치한 구독 취소 버튼을 통해 언제든지 취소할 수 있습니다. 또는 웹사이트에서 직접 구독을 관리할 수도 있어요.'
  }
];

export default function SSGNewsletter() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-background">      
      {/* Hero Section */}
    <section className="relative flex flex-col items-center justify-center px-6 text-center bg-black" style={{ height: '500px' }}>
      {/* Animated background grid pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(58,77,161,0.1)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      </div>

      {/* Floating security icons */}
      <div className="absolute -top-16 -left-16 opacity-30 animate-pulse text-primary-500">
        <Mail className="w-12 h-12" />
      </div>
      
      <div className="absolute -top-8 -right-20 opacity-20 animate-bounce text-primary-500" style={{ animationDelay: '1s' }}>
        <Shield className="w-8 h-8" />
      </div>

      <div className="absolute top-1/2 left-8 opacity-20 animate-pulse text-primary-500" style={{ animationDelay: '2s' }}>
        <BookOpen className="w-6 h-6" />
      </div>
      
      <div className="absolute bottom-1/3 right-12 opacity-15 animate-bounce text-primary-500" style={{ animationDelay: '3s' }}>
        <Users className="w-10 h-10" />
      </div>

      {/* Main content */}
         {/* Security badge with fitted border */}
        <div className="inline-flex bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 mb-4 border border-primary-500">
          <span className="text-xs flex items-center gap-2 whitespace-nowrap text-secondary-300">
            <Shield className="h-3 w-3 flex-shrink-0" />
            세종대학교 SSG의 뉴스레터
          </span>
        </div>

        {/* Main title with logo integration */}
        <h2 className="mb-3 flex justify-center items-center text-3xl text-white font-extrabold md:text-5xl">
          <Image src={"/logo-white.svg"} width={120} height={60} className="px-3" alt={''} /> NEWSLETTER
        </h2>
        
        <p className="text-2xl text-secondary-300 drop-shadow-[0_0_8px_rgba(58,77,161,0.6)] mb-4">
          사이버보안 지식 메일링 서비스
        </p>
        
        {/* Enhanced description with glow effects */}
        <p className="max-w-4xl text-base md:text-lg text-gray-300 leading-relaxed mb-4">
          <span className="text-gray-700">바쁜 보안 전문가와 학습자분들을 위해</span><br />
          <span className="font-semibold text-secondary-300 drop-shadow-[0_0_8px_rgba(58,77,161,0.6)]">
            웹해킹, 리버싱, 포렌식, CTF
          </span>
          <span className="text-gray-700"> 분야에 맞는</span><br />
          <span className="text-gray-700">최신 보안 지식과 실습 문제를 직접 큐레이팅하여 보내드려요</span>
        </p>

        {/* Glowing subscription CTA */}
        <div className="flex justify-center">
          <a 
            href="#subscribe-form"
            className="inline-flex items-center justify-center gap-2 text-black px-6 py-2.5 rounded-lg font-bold text-base transition-all shadow-lg glow-button bg-gradient-to-r from-primary-500 to-secondary-300 hover:from-primary-600 hover:to-secondary-200 shadow-primary-500/30 hover:shadow-primary-500/50 whitespace-nowrap"
          >
            <Mail size={16} />
            <span>구독하기</span>
          </a>
        </div>

      {/* Floating newsletter icons */}
      <div className="absolute bottom-20 left-16 opacity-25 animate-pulse text-secondary-300" style={{ animationDelay: '4s' }}>
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
        </svg>
      </div>

      <div className="absolute top-20 right-24 opacity-20 animate-bounce text-secondary-300" style={{ animationDelay: '5s' }}>
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414-1.414L9 5.586 7.707 4.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 10-1.414-1.414L10 4.586l-1.293-1.293z" clipRule="evenodd" />
        </svg>
      </div>
    </section>

      {/* Benefits */}
      <section className="section py-20 bg-gray-50">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-primary-800 mb-4">
            두 가지 방식으로 보안 지식을 받아보세요
          </h2>
          <p className="text-gray-600 mb-14 text-base">
            관심 분야는 원하는 주기로, 인기 콘텐츠는 매주 정리해서 드려요
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* 관심 카테고리 */}
            <div className="card p-8 text-left">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">관심 카테고리</h3>
                  <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700">매일 또는 매주 선택</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                웹해킹, 리버싱, 포렌식, CTF 등<br />
                내가 고른 분야의 최신 콘텐츠와<br />
                실습 문제를 원하는 주기로 받아보세요
              </p>
            </div>

            {/* 인기 콘텐츠 추적 */}
            <div className="card p-8 text-left border-amber-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">인기 콘텐츠 추적</h3>
                  <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">매주 고정 발송</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                커뮤니티에서 주목받은<br />
                인기 프로젝트·아티클을<br />
                매주 한 번 정리해서 보내드려요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Form */}
      <section id="subscribe-form" className="section py-20">
        <div className="container">
          <NewsletterTabs />
        </div>
      </section>

      {/* FAQ */}
      <section className="section py-20 bg-gray-50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center text-primary-800 mb-12">
            자주 묻는 질문
          </h2>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="card overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-primary-600 flex-shrink-0" />
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
        </div>
      </section>
    </div>
  );
}
