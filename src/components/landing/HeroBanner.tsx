'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, Code, Shield } from 'lucide-react';
import Image from 'next/image';

export default function HeroBanner() {
  return (
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
            세종대학교 정보보안동아리
          </span>
        </div>

        {/* 메인 문구 */}
        <h2 className="mb-3 flex justify-center items-center text-3xl text-white font-extrabold md:text-5xl">
          Welcome to <Image src={"/logo-white.svg"} width={120} height={60} className="px-3" alt={''} /> HUB
        </h2>

        {/* Enhanced description with glow */}
        <p className="max-w-4xl text-base md:text-lg lg:text-xl text-gray-300 leading-relaxed mb-6">
          <span className="font-semibold text-secondary-300 drop-shadow-[0_0_8px_rgba(58,77,161,0.6)]">
            SSG HUB(허브)
          </span>
          <span className="text-gray-400"> 모든 보안관련 지식, 세종대학교 정보보안 동아리인! </span>
          <span className="font-semibold text-secondary-300 drop-shadow-[0_0_8px_rgba(58,77,161,0.6)]">
            Sejong Security Group(SSG)
          </span>
          <span className="text-gray-400">에서의 공식 허브 사이트입니다. 정보보안 학습자료, 프로젝트, 아티클을 공유하며 함께 성장하는 공간입니다.</span>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
          <Link 
            href="/topics"
            className="text-primary-700 px-6 py-3 rounded-lg font-bold text-base transition-all shadow-lg glow-button flex items-center justify-center space-x-2 bg-gradient-to-r from-secondary-500 to-secondary-100 hover:bg-gradient-to-r hover:from-secondary-500 hover:to-secondary-100 shadow-primary-500/30 hover:shadow-primary-500/50"
          >
            <BookOpen size={20} />
            <span>학습 보기</span>
            <ArrowRight size={16} />
          </Link>
          
          <Link 
            href="/community"
            className="bg-black/70 px-6 py-3 rounded-lg font-bold text-base transition-all shadow-lg glow-button-secondary flex items-center justify-center space-x-2 border-2 border-primary-500 text-secondary-300 shadow-primary-500/20 hover:bg-black/50 hover:border-primary-600 hover:shadow-primary-500/40"
          >
            <Code size={20} />
            <span>커뮤니티 보기</span>
          </Link>
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
  );
}
