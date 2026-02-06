'use client';

import { useState } from 'react';
import { Mail, Shield, Clock, BookOpen, Users, ChevronDown, ChevronUp, CheckCircle, Calendar, TrendingUp, Link, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import NewsletterSubscribe from './_components/NewsletterSubscribe';

const testimonials = [
  {
    name: '김**',
    role: '사이버보안 전공생',
    comment: 'SSG 뉴스레터의 실전 보안 케이스 스터디 덕분에 이론으로만 알고 있던 취약점들을 실제로 이해할 수 있었어요.',
    rating: 5,
  },
  {
    name: '이**',
    role: '정보보안 취업 준비생',
    comment: 'SSG 뉴스레터를 매일 읽다보니 보안 트렌드와 최신 해킹 기법에 대한 지식이 자연스럽게 쌓였어요!',
    rating: 5,
  },
  {
    name: '박**',
    role: '화이트햇 해커',
    comment: 'SSG 뉴스레터의 CTF 문제와 해설이 실제 해킹 대회에서 큰 도움이 되었습니다!',
    rating: 5,
  },
  {
    name: '최**',
    role: 'SOC 분석가',
    comment: 'SSG 뉴스레터 덕분에 새로운 보안 위협과 분석 기법에 대한 인사이트를 얻을 수 있어요.',
    rating: 5,
  }
];

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
    answer: '메일 하단에 위치한 구독 취소 버튼을 통해 언제든지 취소할 수 있습니다. 또는 웹사이트의 구독 관리 페이지(/newsletter/manage)에서 직접 관리할 수도 있어요.'
  },
  {
    question: '구독 상태를 확인하고 싶어요.',
    answer: '로그인 후 구독 관리 페이지(/newsletter/manage)에서 현재 구독 중인 카테고리와 발송 내역을 확인할 수 있습니다.'
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
          <section className="relative flex flex-col items-center justify-center px-6 text-center bg-black" style={{ height: '400px' }}>
      {/* Animated background grid pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(58,77,161,0.1)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {/* Security icons floating */}
        <div className="absolute -top-16 -left-16 opacity-30 animate-pulse text-primary-500">
          <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        
        <div className="absolute -top-8 -right-20 opacity-20 animate-bounce text-primary-500" style={{ animationDelay: '1s' }}>
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </div>
   
        {/* Security badge with fitted border */}
        <div className="inline-flex bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 mb-4 border border-primary-500">
          <span className="text-xs flex items-center gap-2 whitespace-nowrap text-secondary-300">
            <Shield className="h-3 w-3 flex-shrink-0" />
            정보보안동아리 SSG 뉴스레터
          </span>
        </div>

        {/* 메인 문구 */}
        <h2 className="mb-3 flex justify-center items-center text-3xl text-white font-extrabold md:text-5xl">
          Welcome to <Image src={"/logo-white.svg"} width={120} height={60} className="px-3" alt={''} /> Newsletter
        </h2>

        {/* Enhanced description with glow */}
        <p className="max-w-4xl text-base md:text-lg lg:text-xl text-gray-300 leading-relaxed mb-6">
          <span className="font-semibold text-secondary-300 drop-shadow-[0_0_8px_rgba(58,77,161,0.6)]">
            SSG NEWSLETTER
          </span>
          <span className="text-gray-400"> 모든 보안관련 지식, 세종대학교 정보보안 동아리인! </span>
          <span className="font-semibold text-secondary-300 drop-shadow-[0_0_8px_rgba(58,77,161,0.6)]">
            Sejong Security Group(SSG)
          </span>
          <span className="text-gray-400">에서의 공식 허브 사이트입니다. 정보보안 학습자료, 프로젝트, 아티클을 공유하며 함께 성장하는 공간입니다.</span>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">

        {/* Primary CTA */}
          <a 
            href="#subscribe-form"
            className="inline-flex items-center justify-center gap-2 text-primary-700 bg-gradient-to-r from-secondary-500 to-secondary-100 hover:bg-gradient-to-r hover:from-secondary-500 hover:to-secondary-100 px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105"
          >
            <Mail className="w-5 h-5" />
            <span>무료로 구독하기</span>
          </a>
        </div>
      </div>

      {/* Stats */}
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-white/90 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span className="font-semibold">3,247+ 구독자</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span className="font-semibold">매일 아침 9시 발송</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">100% 무료</span>
            </div>
          </div>

      {/* Additional floating elements */}
      <div className="absolute top-1/2 left-8 opacity-20 animate-pulse text-primary-500" style={{ animationDelay: '2s' }}>
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <div className="absolute bottom-1/3 right-12 opacity-15 animate-bounce text-primary-500" style={{ animationDelay: '3s' }}>
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
        </svg>
      </div>
      
    </section>

      {/* How It Works */}
      <section className="section py-20 bg-white">
        <div className="container">
          <h2 className="text-3xl font-bold text-center text-primary-800 mb-12">
            어떻게 동작하나요?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div className="card p-8 h-full hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-primary-600" />
                </div>
                <div className="mb-4">
                  <span className="text-sm font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                    STEP 1
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  매일 아침 9시 발송
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  내가 선택한 보안 분야의 최신 지식과 실습 문제를 메일로 받아보세요
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="card p-8 h-full hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-8 h-8 text-secondary-600" />
                </div>
                <div className="mb-4">
                  <span className="text-sm font-semibold text-secondary-600 bg-secondary-50 px-3 py-1 rounded-full">
                    STEP 2
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  학습 및 실습
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  상세한 해설과 참고 자료를 통해 실무에 적용할 수 있는 지식을 습득하세요
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="card p-8 h-full hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <div className="mb-4">
                  <span className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    STEP 3
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  아카이브 활용
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  지금까지 받은 모든 콘텐츠를 웹사이트에서 체계적으로 다시 확인할 수 있어요
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section py-20 bg-gray-50">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-primary-800 mb-4">
            SSG Newsletter와 함께 매일 성장하세요
          </h2>
          <p className="text-gray-600 text-lg mb-12">
            꾸준한 학습이 전문가를 만듭니다
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="card p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-lg font-bold mb-3 text-gray-900">매일 한 문제씩</h3>
              <p className="text-gray-600">꾸준한 보안 학습 루틴을 형성하고 실력을 쌓아가세요</p>
            </div>

            <div className="card p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-secondary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-secondary-600" />
              </div>
              <h3 className="text-lg font-bold mb-3 text-gray-900">이메일 기반</h3>
              <p className="text-gray-600">푸시 피로감 없이 편안하게 학습 루틴을 유지하세요</p>
            </div>

            <div className="card p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-lg font-bold mb-3 text-gray-900">실전 중심 콘텐츠</h3>
              <p className="text-gray-600">실제 보안 업무와 유사한 문제로 실전 감각을 키우세요</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section py-20 bg-white">
        <div className="container">
          <h2 className="text-3xl font-bold text-center text-primary-800 mb-12">
            구독자들의 생생한 후기
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-lg">★</span>
                      ))}
                    </div>
                    <p className="text-gray-700 mb-3 leading-relaxed">
                      "{testimonial.comment}"
                    </p>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="section py-16 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-center">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              지금까지 <span className="text-yellow-300">3,247명</span>의 보안 전문가가
            </h2>
            <h3 className="text-2xl font-bold mb-6">
              SSG Newsletter를 구독하고 성장하고 있어요
            </h3>
            <p className="text-lg text-white/90 mb-8">
              매일 쌓이는 보안 지식이 분명 성장의 발판이 될 거예요
            </p>
            <a 
              href="#subscribe-form"
              className="inline-flex items-center gap-2 bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105"
            >
              <Mail className="w-5 h-5" />
              <span>지금 바로 시작하기</span>
            </a>
          </div>
        </div>
      </section>

      {/* Subscription Form Section - Public Access */}
      <section id="subscribe-form" className="section py-20 bg-white">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-800 mb-4">
                오늘부터 시작하세요
              </h2>
              <p className="text-gray-600 text-lg">
                이메일 주소만 입력하면 매일 아침 9시에 보안 지식을 받아볼 수 있어요
              </p>
            </div>

            {/* Newsletter Subscribe Component */}
            <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-primary-100 rounded-2xl p-8 shadow-xl">
              <NewsletterSubscribe />
            </div>

            {/* Additional Info and Links */}
            <div className="mt-8 space-y-4">
              {/* Manage Subscription Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  이미 구독 중이신가요?{' '}
                  <a 
                    href="/newsletter/manage" 
                    className="text-primary-600 hover:text-primary-700 font-semibold underline"
                  >
                    구독 관리하기
                  </a>
                </p>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center gap-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>스팸 없음</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-primary-600" />
                  <span>개인정보 보호</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4 text-secondary-600" />
                  <span>언제든 구독 취소 가능</span>
                </div>
              </div>
            </div>
          </div>
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
              <div key={index} className="card overflow-hidden hover:shadow-lg transition-shadow">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  aria-expanded={expandedFaq === index}
                >
                  <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
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

      {/* Final CTA */}
      <section className="section py-16 bg-gradient-to-br from-primary-800 via-primary-700 to-secondary-600 text-white text-center">
        <div className="container max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            보안 전문가로의 여정, 오늘부터 시작하세요
          </h2>
          <p className="text-lg text-white/90 mb-8">
            매일 아침 9시, 당신의 성장을 응원합니다
          </p>
          <a 
            href="#subscribe-form"
            className="inline-flex items-center gap-2 bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105"
          >
            <Mail className="w-5 h-5" />
            <span>무료 구독 시작하기</span>
          </a>
        </div>
      </section>
    </div>
  );
}
