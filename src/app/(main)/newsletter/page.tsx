'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Mail, Shield, Clock, BookOpen, Users, ChevronDown, ChevronUp, Check } from 'lucide-react';
import Image from 'next/image';
import NewsletterSubscribe from '@/components/newsletter/NewsletterSubscribe';

const testimonials = [
  {
    name: '김**',
    role: '사이버보안 전공생',
    comment: 'SSG 뉴스레터의 실전 보안 케이스 스터디 덕분에 이론으로만 알고 있던 취약점들을 실제로 이해할 수 있었어요.',
    avatar: '/api/placeholder/40/40'
  },
  {
    name: '이**',
    role: '정보보안 취업 준비생',
    comment: 'SSG 뉴스레터를 매일 읽다보니 보안 트렌드와 최신 해킹 기법에 대한 지식이 자연스럽게 쌓였어요!',
    avatar: '/api/placeholder/40/40'
  },
  {
    name: '박**',
    role: '화이트햇 해커',
    comment: 'SSG 뉴스레터의 CTF 문제와 해설이 실제 해킹 대회에서 큰 도움이 되었습니다!',
    avatar: '/api/placeholder/40/40'
  },
  {
    name: '최**',
    role: 'SOC 분석가',
    comment: 'SSG 뉴스레터 덕분에 새로운 보안 위협과 분석 기법에 대한 인사이트를 얻을 수 있어요.',
    avatar: '/api/placeholder/40/40'
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
      <Header />
      
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
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Security badge with fitted border */}
        <div className="inline-flex bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 mb-6 border border-primary-500">
          <span className="text-xs flex items-center gap-2 whitespace-nowrap text-secondary-300">
            <Shield className="h-3 w-3 flex-shrink-0" />
            세종대학교 정보보안동아리 뉴스레터
          </span>
        </div>

        {/* Main title with logo integration */}
        <h1 className="mb-4 flex justify-center items-center text-3xl text-white font-extrabold md:text-5xl">
          <Image src="/logo-white.svg" alt="Description" width={100} height={50} />
          Newsletter
        </h1>
        
        <p className="text-2xl text-secondary-300 drop-shadow-[0_0_8px_rgba(58,77,161,0.6)] mb-6">
          사이버보안 지식 메일링 서비스
        </p>
        
        {/* Enhanced description with glow effects */}
        <p className="max-w-4xl text-base md:text-lg text-gray-300 leading-relaxed mb-8">
          <span className="text-gray-400">바쁜 보안 전문가와 학습자분들을 위해</span><br />
          <span className="font-semibold text-secondary-300 drop-shadow-[0_0_8px_rgba(58,77,161,0.6)]">
            웹해킹, 리버싱, 포렌식, CTF
          </span>
          <span className="text-gray-400"> 분야에 맞는</span><br />
          <span className="text-gray-400">최신 보안 지식과 실습 문제를 직접 큐레이팅하여 보내드려요</span>
        </p>

        {/* Glowing subscription CTA */}
        <div className="max-w-md mx-auto">
          <a 
            href="#subscribe-form"
            className="block text-center text-black px-6 py-3 rounded-lg font-bold text-base transition-all shadow-lg glow-button flex items-center justify-center space-x-2 bg-gradient-to-r from-primary-500 to-secondary-300 hover:from-primary-600 hover:to-secondary-200 shadow-primary-500/30 hover:shadow-primary-500/50 whitespace-nowrap"
          >
            <Mail size={16} />
            <span>구독하기</span>
          </a>
        </div>

        {/* Additional CTA hint */}
        <p className="text-gray-500 text-sm mt-6">
          매일 아침 9시, 당신의 메일함에서 보안 지식을 만나보세요
        </p>
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


      {/* How It Works */}
      <section className="section py-20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="card p-8 h-full">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">
                  지식 확인
                </h3>
                <p className="text-4xl font-bold text-primary-600 mb-2">매일 아침 9시</p>
                <p className="text-gray-600 mb-4">메일함을 확인해보세요</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  내가 선택한 보안 분야의<br />
                  최신 보안 지식과 실습 문제를<br />
                  확인하고 스스로 학습해보세요
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="card p-8 h-full">
                <div className="w-16 h-16 bg-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-8 h-8 text-secondary-600" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">
                  해설 자료
                </h3>
                <p className="text-4xl font-bold text-secondary-600 mb-2">상세한 설명도</p>
                <p className="text-gray-600 mb-4">함께 보내드리고 있어요</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  단순한 문제가 아닌<br />
                  실무에 적용할 수 있는<br />
                  상세한 해설과 참고 자료까지
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="card p-8 h-full">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">
                  지식 아카이브
                </h3>
                <p className="text-4xl font-bold text-green-600 mb-2">매일 쌓인 지식은</p>
                <p className="text-gray-600 mb-4">따로 정리해놨어요</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  웹사이트에서 지금까지 받은<br />
                  모든 보안 지식과 문제들을<br />
                  체계적으로 정리해서 제공
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section py-20 bg-gray-50">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-primary-800 mb-16">
            SSG Newsletter와 함께 매일매일 성장해요!
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-8">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold mb-3">매일 한 문제씩</h3>
              <p className="text-gray-600 text-sm">꾸준한 보안 학습 루틴 형성</p>
            </div>

            <div className="card p-8">
              <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-secondary-600" />
              </div>
              <h3 className="text-lg font-semibold mb-3">이메일 기반으로</h3>
              <p className="text-gray-600 text-sm">푸시 피로감 없이 루틴화</p>
            </div>

            <div className="card p-8">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-3">실제 보안 업무와 유사한 톤으로</h3>
              <p className="text-gray-600 text-sm">실전 대비에 최적인 콘텐츠 구성</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section py-20">
        <div className="container">
          <h2 className="text-3xl font-bold text-center text-primary-800 mb-16">
            SSG Newsletter로 성장한 구독자들의 이야기
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card p-6">
                <div className="flex items-start gap-4">
                  <Image 
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={40}
                    height={40}
                    className="rounded-full bg-gray-200"
                  />
                  <div className="flex-1">
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {testimonial.comment}
                    </p>

                    <div>
                      <div className="font-semibold text-primary-700">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscriber Count */}
      <section className="section py-20 bg-primary text-white text-center">
        <div className="container">
          <h2 className="text-3xl font-bold mb-4">
            지금까지 <span className="text-4xl text-yellow-300">3,247명</span>의 보안 전문가가
          </h2>
          <h3 className="text-2xl font-bold mb-8">
            SSG Newsletter를 구독했어요!
          </h3>
          <p className="text-xl opacity-90">
            매일 쌓이는 보안 지식이 분명 성장의 발판이 될 거예요
          </p>
        </div>
      </section>

      {/* Subscription Form */}
      <section id="subscribe-form" className="section py-20">
        <div className="container">
          <NewsletterSubscribe />
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

      <Footer />
    </div>
  );
}
