"use client";

import { 
  Trophy, 
  BookOpen,
  Users,
  Smile,
  Presentation,
  Terminal,
} from 'lucide-react';

import TitleBanner from '@/components/layout/TitleBanner';

export default function Activities() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TitleBanner
        title="Activities"
        description="SSG의 주요 활동과 활동 타임라인을 소개합니다."
        backgroundImage="/images/BgHeader.png"
      />
      <main className="container mx-auto px-4 py-8 flex-1">
        
        {/* Activities Section */}
        <section className="section py-16">
          <div className="container">
            {/* First row: two long description cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="card text-center hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <div className="p-4 bg-primary-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-md">
                  <BookOpen className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-primary-700 mb-3 tracking-tight">스터디</h3>
                <p className="text-gray-700 leading-relaxed text-base">
                  관심 분야에 따라 단발성으로 스터디를 진행합니다.<br />
                  운영체제, 프로그래밍, 네트워크와 같이 컴퓨터 전반적인 지식을 다루기도 하고, 웹 해킹, 리버싱, <br /> 포너블, 암호학처럼 정보 보안과 관련된 스터디를 진행합니다.<br />
                  물론 임베디드, 기계학습, 안드로이드처럼 개발과 관련된 스터디도 있습니다.
                </p>
              </div>
              <div className="card text-center hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <div className="p-4 bg-secondary-100 rounded-full w-14 h-16 mx-auto mb-4 flex items-center justify-center shadow-md">
                  <Terminal className="h-8 w-8 text-secondary-600" />
                </div>
                <h3 className="text-xl font-semibold text-primary-700 mb-3 tracking-tight">해킹/개발 프로젝트</h3>
                <p className="text-gray-700 leading-relaxed text-base">
                  다양한 동기에 의해 프로젝트를 설정하여 이를 수행합니다.<br />
                  버그 헌팅, Automatic Exploit Generator, WinAFL 등의 Fuzzing Framework를 이용한 Fuzzing 고도화 와 같이 학술적인 프로젝트뿐만 아니라, Pwnable.kr <br />Top 100안에 들기처럼 개인의 목표를 프로젝트로 설정하기도 합니다.
                  또는 에그머니나! (살충제 계란 판독), 교내 조교 배정 솔루션 과 같이 시의성에 따라 개발 프로젝트를 진행하기도 합니다.
                </p>
              </div>
            </div>
            {/* Second row: four short cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="card text-center hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <div className="p-4 bg-warning/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-md">
                  <Trophy className="h-8 w-8 text-warning" />
                </div>
                <h3 className="text-xl font-semibold text-primary-700 mb-3 tracking-tight">해킹대회/공모전 참가</h3>
                <p className="text-gray-700 leading-relaxed text-base">
                  국가 암호 공모전, SW 개발보안 경진대회, Codegate CTF 등 국내외 각종 공모전과 대회에 참가합니다.<br />
                </p>
              </div>
              <div className="card text-center hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <div className="p-4 bg-primary-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-md">
                  <Presentation className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-primary-700 mb-3 tracking-tight">논문/학회 발표</h3>
                <p className="text-gray-700 leading-relaxed text-base">
                  개인/팀 연구 주제에 대한 내용을 국내외 학회에서 발표/ 논문 투고를 합니다.<br />
                </p>
              </div>
              <div className="card text-center hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <div className="p-4 bg-secondary-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-md">
                  <Users className="h-8 w-8 text-secondary-600" />
                </div>
                <h3 className="text-xl font-semibold text-primary-700 mb-3 tracking-tight">행사 운영</h3>
                <p className="text-gray-700 leading-relaxed text-base">
                  SSG CTF, 빵빵빵 기술세미나 등 SSG에서 자체적으로 개최하는 행사들의 운영을 맡아서 진행합니다.<br />
                </p>
              </div>
              <div className="card text-center hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <div className="p-4 bg-warning/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-md">
                  <Smile className="h-8 w-8 text-warning" />
                </div>
                <h3 className="text-xl font-semibold text-primary-700 mb-3 tracking-tight">기타</h3>
                <p className="text-gray-700 leading-relaxed text-base">
                  소모임, 홈커밍데이, MT, 회식 등 다양한 활동을 합니다.<br />
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="section py-16 bg-gradient-background rounded-lg shadow-md p-8">
          <div className="timeline-container ">
            <h2 className="text-2xl font-bold text-secondary-300 mb-16 text-center">
              선발 이후 활동 타임라인
            </h2>
            <div className="flex flex-col lg:flex-row items-center justify-between relative">
              {/* Timeline line */}
              <div className="hidden lg:block absolute top-2 left-0 w-full border-t-4 border-primary-200"></div>

              {/* Step 1 */}
              <div className="relative flex flex-col items-center text-center lg:w-1/6 mb-10">
                <div className="flex items-center justify-center w-12 h-12 bg-primary-500 rounded-full ring-4 ring-primary-100 mb-6 z-10 -mt-6">
                  <span className="text-white font-bold">1</span>
                </div>
                <h3 className="font-semibold text-lg text-secondary-300 mb-2">수습 회원 선발</h3>
                <ul className="list-disc text-gray-600 text-sm text-left">
                  <li>서류 검토</li>
                  <li>면접 평가</li>
                </ul>
              </div>

              {/* Step 2 */}
              <div className="relative flex flex-col items-center text-center lg:w-1/6 mb-10 lg:mb-0">
                <div className="flex items-center justify-center w-12 h-12 bg-primary-500 rounded-full ring-4 ring-primary-100 mb-6 z-10 -mt-6">
                  <span className="text-white font-bold">2</span>
                </div>
                <h3 className="font-semibold text-lg text-secondary-300 mb-2">기초 학습</h3>
                <ul className="list-disc text-gray-600 text-sm text-left">
                  <li>C, Python 및 자료구조</li>
                  <li>컴퓨터 구조, 운영체제</li>
                  <li>웹 개발</li>
                  <li>Assembly</li>
                </ul>
              </div>

              {/* Step 3 */}
              <div className="relative flex flex-col items-center text-center lg:w-1/6 mb-10 lg:mb-0">
                <div className="flex items-center justify-center w-12 h-12 bg-primary-500 rounded-full ring-4 ring-primary-100 mb-6 z-10 -mt-6">
                  <span className="text-white font-bold">3</span>
                </div>
                <h3 className="font-semibold text-lg text-secondary-300 mb-2">심화 학습</h3>
                <ul className="list-disc text-gray-600 text-sm text-left">
                  <li>Reversing</li>
                  <li>Web Hacking</li>
                  <li>Pwnable(System Hacking)</li>
                </ul>
              </div>

              {/* Step 4 */}
              <div className="relative flex flex-col items-center text-center lg:w-1/6 mb-10 lg:mb-0">
                <div className="flex items-center justify-center w-12 h-12 bg-primary-500 rounded-full ring-4 ring-primary-100 mb-6 z-10 -mt-6">
                  <span className="text-white font-bold">4</span>
                </div>
                <h3 className="font-semibold text-lg text-secondary-300 mb-2">응용 학습</h3>
                <ul className="list-disc text-gray-600 text-sm text-left">
                  <li>여름/겨울 세미나</li>
                  <li>스터디 주제 결정</li>
                </ul>
              </div>

              {/* Step 5 */}
              <div className="relative flex flex-col items-center text-center lg:w-1/6 mb-10 lg:mb-0">
                <div className="flex items-center justify-center w-12 h-12 bg-primary-500 rounded-full ring-4 ring-primary-100 mb-6 z-10 -mt-6">
                  <span className="text-white font-bold">5</span>
                </div>
                <h3 className="font-semibold text-lg text-secondary-300 mb-2">스터디 진행</h3>
                <ul className="list-disc text-gray-600 text-sm text-left">
                  <li>연구 환경 제공</li>
                  <li>스터디 멘토 배정</li>
                  <li>스터디 진행</li>
                </ul>
              </div>

              {/* Step 6 */}
              <div className="relative flex flex-col items-center text-center lg:w-1/6 mb-10 lg:mb-0">
                <div className="flex items-center justify-center w-12 h-12 bg-primary-500 rounded-full ring-4 ring-primary-100 mb-6 z-10 -mt-6">
                  <span className="text-white font-bold">6</span>
                </div>
                <h3 className="font-semibold text-lg text-secondary-300 mb-2">자유 연구</h3>
                <ul className="list-disc text-gray-600 text-sm text-left">
                  <li>2년 의무 활동</li>
                  <li>개인/팀 자율 주제 연구</li>
                  <li>개인/팀 스터디</li>
                  <li>CTF 대회, 공모전 참가</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}