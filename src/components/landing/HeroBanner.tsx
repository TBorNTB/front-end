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
            SSG HUB
          </span>
          <span className="text-gray-700"> 모든 보안관련 지식, 세종대학교 정보보안 동아리인! </span>
          <span className="font-semibold text-secondary-300 drop-shadow-[0_0_8px_rgba(58,77,161,0.6)]">
            Sejong Security Group
          </span>
          <span className="text-gray-700">에서의 공식 허브 사이트입니다. 정보보안 학습자료, 프로젝트, 아티클을 공유하며 함께 성장하는 공간입니다.</span>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
          <Link
            href="/topics"
            className="text-black px-6 py-3 rounded-lg font-bold text-base transition-all shadow-lg glow-button flex items-center justify-center space-x-2 bg-gradient-to-r from-primary-500 to-secondary-300 hover:from-primary-600 hover:to-secondary-200  shadow-primary-500/30 hover:shadow-primary-500/50"
          >
            <BookOpen size={20} />
            <span>학습 보기</span>
            <ArrowRight size={16} />
          </Link>

          <Link
            href="https://ssg.sejong.ac.kr/apply/#contact"
            className="bg-black/70 px-6 py-3 rounded-lg font-bold text-base transition-all shadow-lg glow-button-secondary flex items-center justify-center space-x-2 border-2 border-primary-500 text-secondary-300 shadow-primary-500/20 hover:bg-black/50 hover:border-primary-600 hover:shadow-primary-500/40"
          >
            <Code size={20} />
            <span>SSG 지원하기</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
