// app/aboutSSG/page.tsx
import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SSGTimeline from "./components/SSGTimeline";
import { 
  Users, 
  BookOpen,
  Server,
  Cpu,
  HardDrive,
  Monitor,
  Zap,
  Database,
  Shield,
  Network
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About SSG - Sejong Security Group',
  description: 'SSG(Sejong Security Group)는 2000년 4월에 창설된 동아리로, 정보 보안과 소프트웨어 개발에 관심이 많은 학부생들로 구성된 동아리입니다.',
};

export default function AboutSSGPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-500/3 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-secondary-500/4 rounded-full blur-2xl"></div>
      </div>

      <div className="relative">
        {/* Hero Section - Dark Theme like HeroBanner */}
        <section className="relative flex flex-col items-center justify-center px-6 text-center bg-black py-20">
          {/* Animated background grid pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(58,77,161,0.1)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
          </div>

          {/* Main content */}
          <div className="relative z-10 max-w-4xl mx-auto">
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
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 text-white">
              We Are SSG
            </h1>
            
            <div className="text-lg md:text-xl leading-relaxed mb-12 text-gray-300">
              <p className="mb-6">
                <span className="font-semibold text-secondary-300 drop-shadow-[0_0_8px_rgba(58,77,161,0.6)]">
                  SSG(Sejong Security Group)
                </span>
                <span className="text-gray-400">는 2000년 4월에 창설된 동아리로, 정보 보안과 소프트웨어 개발에 
                관심이 많은 학부생들로 구성된 동아리입니다. 부원들은 각자의 관심분야에서 학술연구 활동을 
                꾸준히 하며 다수의 프로젝트와 연구 결과를 구성원끼리 공유하는 학술 문화를 가지고 있습니다.</span>
              </p>
              <p className="text-gray-400">
                이를 통해 한국과 해외의 무대에서 
                <span className="font-semibold text-secondary-300 drop-shadow-[0_0_8px_rgba(58,77,161,0.6)]">
                  컨퍼런스 발표, 대회 수상(장관상 3회), 소프트웨어 취약점 제보, 
                  논문 및 학회 발표
                </span>
                <span className="text-gray-400"> 등 다양한 역량을 이끌어내고 있습니다.</span>
              </p>
            </div>
            
            {/* Statistics - Dark Theme */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-black/50 backdrop-blur-sm border border-primary-500/30 rounded-lg p-6 text-center hover:border-primary-500/60 transition-all duration-300 hover:bg-black/70">
                <div className="text-4xl md:text-5xl font-bold mb-2 text-secondary-300 drop-shadow-[0_0_8px_rgba(108,170,239,0.6)]">47</div>
                <div className="text-gray-400 text-sm md:text-base">국내/외 컨퍼런스 발표</div>
              </div>
              <div className="bg-black/50 backdrop-blur-sm border border-primary-500/30 rounded-lg p-6 text-center hover:border-primary-500/60 transition-all duration-300 hover:bg-black/70">
                <div className="text-4xl md:text-5xl font-bold mb-2 text-primary-400 drop-shadow-[0_0_8px_rgba(58,77,161,0.6)]">71</div>
                <div className="text-gray-400 text-sm md:text-base">국내/외 대회 수상</div>
              </div>
              <div className="bg-black/50 backdrop-blur-sm border border-primary-500/30 rounded-lg p-6 text-center hover:border-primary-500/60 transition-all duration-300 hover:bg-black/70">
                <div className="text-4xl md:text-5xl font-bold mb-2 text-secondary-300 drop-shadow-[0_0_8px_rgba(108,170,239,0.6)]">140</div>
                <div className="text-gray-400 text-sm md:text-base">국내/외 소프트웨어 취약점 제보</div>
              </div>
              <div className="bg-black/50 backdrop-blur-sm border border-primary-500/30 rounded-lg p-6 text-center hover:border-primary-500/60 transition-all duration-300 hover:bg-black/70">
                <div className="text-4xl md:text-5xl font-bold mb-2 text-primary-400 drop-shadow-[0_0_8px_rgba(58,77,161,0.6)]">28</div>
                <div className="text-gray-400 text-sm md:text-base">국내/외 논문 및 학회 발표</div>
              </div>
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


        {/* Mission & Vision Section */}
        <section className="section py-16">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-primary-700 mb-6">Our Mission</h2>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  SSG는 정보보안과 소프트웨어 개발 분야에서 학술적 연구와 실무적 경험을 통해 
                  차세대 보안 전문가를 양성하는 것을 목표로 합니다.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-6 w-6 text-primary-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-primary-700 mb-1">보안 연구</h3>
                      <p className="text-gray-600">최신 보안 위협과 대응 기술에 대한 심도있는 연구</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="h-6 w-6 text-primary-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-primary-700 mb-1">인재 양성</h3>
                      <p className="text-gray-600">실무 중심의 교육과 멘토링을 통한 전문가 육성</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Network className="h-6 w-6 text-primary-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-primary-700 mb-1">지식 공유</h3>
                      <p className="text-gray-600">연구 결과와 경험을 커뮤니티와 적극적으로 공유</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="card p-8 bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-300">
                  <h3 className="text-2xl font-bold text-primary-700 mb-4">Our Vision</h3>
                  <p className="text-gray-700 leading-relaxed">
                    세종대학교를 넘어 국내외 보안 커뮤니티에서 인정받는 학술 동아리로 성장하여, 
                    보안 분야의 혁신을 이끄는 리더들을 배출하는 것
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Research Environment Section - Compact Version */}
        <section className="relative py-12 bg-black text-white overflow-hidden">
          {/* Animated background grid pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(58,77,161,0.1)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
          </div>

          {/* Smaller floating background elements */}
          <div className="absolute top-10 left-6 opacity-10 animate-pulse text-primary-500" style={{ animationDelay: '1s' }}>
            <Server className="w-8 h-8" />
          </div>
          <div className="absolute bottom-10 right-6 opacity-10 animate-bounce text-secondary-500" style={{ animationDelay: '2s' }}>
            <Database className="w-6 h-6" />
          </div>

          <div className="relative z-10 container">
            <div className="text-center mb-10">
              {/* Compact environment badge */}
              <div className="inline-flex bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 mb-4 border border-secondary-500">
                <span className="text-xs flex items-center gap-2 whitespace-nowrap text-secondary-300">
                  <Database className="h-3 w-3 flex-shrink-0" />
                  ENVIRONMENTS
                </span>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white">
                외부 지원 및 연구 환경
              </h2>
              <p className="text-gray-400 text-sm max-w-xl mx-auto">
                최첨단 연구 장비와 인프라를 통해 실무 중심의 학습 환경을 제공합니다
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
              {/* Research Server - Compact */}
              <div className="bg-black/50 backdrop-blur-sm border border-primary-500/30 rounded-lg p-4 hover:border-primary-500/60 transition-all duration-300 hover:bg-black/70 group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-secondary-500/20 rounded-lg border border-secondary-500/30 group-hover:bg-secondary-500/30 transition-all duration-300">
                    <Server className="h-5 w-5 text-secondary-400 group-hover:text-secondary-300" />
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-secondary-300 transition-colors duration-300">
                    연구용 서버
                  </h3>
                </div>
                <div className="space-y-2 text-gray-300 text-sm">
                  <div className="flex items-center gap-2 p-2 bg-black/30 rounded">
                    <Cpu className="h-4 w-4 text-secondary-400 flex-shrink-0" />
                    <span>150+ vCPU</span>
                    <span className="text-xs text-gray-500 ml-auto">고성능</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-black/30 rounded">
                    <HardDrive className="h-4 w-4 text-secondary-400 flex-shrink-0" />
                    <span>300+ GB RAM</span>
                    <span className="text-xs text-gray-500 ml-auto">대용량</span>
                  </div>
                </div>
              </div>

              {/* Lab Equipment - Compact */}
              <div className="bg-black/50 backdrop-blur-sm border border-primary-500/30 rounded-lg p-4 hover:border-primary-500/60 transition-all duration-300 hover:bg-black/70 group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-secondary-500/20 rounded-lg border border-secondary-500/30 group-hover:bg-secondary-500/30 transition-all duration-300">
                    <Zap className="h-5 w-5 text-secondary-400 group-hover:text-secondary-300" />
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-secondary-300 transition-colors duration-300">
                    실습 장비
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2 text-gray-300 text-sm">
                  <div className="flex items-center gap-2 p-2 bg-black/30 rounded">
                    <Monitor className="h-4 w-4 text-secondary-400 flex-shrink-0" />
                    <span className="truncate">Atmega 128</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-black/30 rounded">
                    <Cpu className="h-4 w-4 text-secondary-400 flex-shrink-0" />
                    <span>Arduino</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-black/30 rounded">
                    <Network className="h-4 w-4 text-secondary-400 flex-shrink-0" />
                    <span>Oscilloscope</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-black/30 rounded">
                    <Server className="h-4 w-4 text-secondary-400 flex-shrink-0" />
                    <span>Raspberry Pi</span>
                  </div>
                </div>
              </div>

              {/* Storage & Library - Compact */}
              <div className="bg-black/50 backdrop-blur-sm border border-primary-500/30 rounded-lg p-4 hover:border-primary-500/60 transition-all duration-300 hover:bg-black/70 group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-secondary-500/20 rounded-lg border border-secondary-500/30 group-hover:bg-secondary-500/30 transition-all duration-300">
                    <Database className="h-5 w-5 text-secondary-400 group-hover:text-secondary-300" />
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-secondary-300 transition-colors duration-300">
                    도서 및 자료
                  </h3>
                </div>
                <div className="space-y-2 text-gray-300 text-sm">
                  <div className="flex items-center gap-2 p-2 bg-black/30 rounded">
                    <BookOpen className="h-4 w-4 text-secondary-400 flex-shrink-0" />
                    <span>스터디 도서지원</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-black/30 rounded">
                    <BookOpen className="h-4 w-4 text-secondary-400 flex-shrink-0" />
                    <span>IT 서적 다수 소장</span>
                  </div>
                </div>
              </div>

              {/* Lab Environment & Infrastructure - Compact */}
              <div className="bg-black/50 backdrop-blur-sm border border-primary-500/30 rounded-lg p-4 hover:border-primary-500/60 transition-all duration-300 hover:bg-black/70 group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-secondary-500/20 rounded-lg border border-secondary-500/30 group-hover:bg-secondary-500/30 transition-all duration-300">
                    <Monitor className="h-5 w-5 text-secondary-400 group-hover:text-secondary-300" />
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-secondary-300 transition-colors duration-300">
                    실습 인프라
                  </h3>
                </div>
                <div className="space-y-2 text-gray-300 text-sm">
                  <div className="flex items-center gap-2 p-2 bg-black/30 rounded">
                    <Monitor className="h-4 w-4 text-secondary-400 flex-shrink-0" />
                    <span className="truncate">RTX 2080 Ti</span>
                    <span className="text-xs text-gray-500 ml-auto">GPU</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-black/30 rounded">
                    <Server className="h-4 w-4 text-secondary-400 flex-shrink-0" />
                    <span>클라우드 서비스</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-black/30 rounded">
                    <Database className="h-4 w-4 text-secondary-400 flex-shrink-0" />
                    <span>가상 사설망</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="section py-16">
          <div className="container">
            <SSGTimeline />
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
