// components/SSGTimeline.tsx
'use client';

import { useState } from 'react';
import { 
  Trophy,
  Users,
  BookOpen,
  Shield,
  Award,
  ChevronLeft,
  ChevronRight,
  Star,
  Globe,
  Code
} from 'lucide-react';

interface TimelineEvent {
  id: number;
  year: string;
  title: string;
  description: string;
  category: 'founding' | 'achievement' | 'milestone' | 'expansion';
  icon: any;
  details?: string[];
}

const timelineEvents: TimelineEvent[] = [
  {
    id: 1,
    year: '2000',
    title: 'SSG 창설',
    description: '세종대학교 정보보안 동아리 SSG가 4월에 창설되었습니다.',
    category: 'founding',
    icon: Users,
    details: ['정보보안 전문 동아리로 시작', '세종대학교 공식 동아리 승인']
  },
  {
    id: 2,
    year: '2005',
    title: '첫 번째 대회 수상',
    description: '국내 보안 경진대회에서 첫 번째 수상을 기록했습니다.',
    category: 'achievement',
    icon: Trophy,
    details: ['보안 경진대회 우수상 수상', '실력 인정받는 계기']
  },
  {
    id: 3,
    year: '2010',
    title: '해외 컨퍼런스 진출',
    description: '첫 해외 보안 컨퍼런스에서 연구 결과를 발표했습니다.',
    category: 'milestone',
    icon: Globe,
    details: ['국제 무대 첫 진출', '글로벌 네트워크 구축 시작']
  },
  {
    id: 4,
    year: '2015',
    title: '연구 환경 확장',
    description: '전용 연구실과 고성능 서버 인프라를 구축했습니다.',
    category: 'expansion',
    icon: Shield,
    details: ['전용 연구실 확보', '고성능 서버 도입']
  },
  {
    id: 5,
    year: '2018',
    title: '장관상 수상',
    description: '국가 차원의 보안 경진대회에서 장관상을 수상했습니다.',
    category: 'achievement',
    icon: Award,
    details: ['과학기술정보통신부 장관상', '국가 인정 보안 전문가 그룹']
  },
  {
    id: 6,
    year: '2020',
    title: 'SSG HUB 출범',
    description: '온라인 플랫폼 SSG HUB를 통해 지식 공유를 시작했습니다.',
    category: 'milestone',
    icon: Code,
    details: ['온라인 플랫폼 개발', '지식 공유 체계화']
  },
  {
    id: 7,
    year: '2023',
    title: '글로벌 네트워크',
    description: '해외 보안 커뮤니티와의 협력 네트워크를 구축했습니다.',
    category: 'expansion',
    icon: Star,
    details: ['해외 대학과 MOU 체결', '글로벌 보안 네트워크 참여']
  },
  {
    id: 8,
    year: '2025',
    title: '25주년 기념',
    description: '창설 25주년을 맞아 새로운 도약을 준비하고 있습니다.',
    category: 'milestone',
    icon: BookOpen,
    details: ['25주년 기념 행사', '차세대 보안 리더 양성']
  }
];

export default function SSGTimeline() {
  const [activeEvent, setActiveEvent] = useState<number>(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const eventsPerSlide = 4;
  const totalSlides = Math.ceil(timelineEvents.length / eventsPerSlide);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'founding':
        return 'bg-primary-500 text-white border-primary-600';
      case 'achievement':
        return 'bg-warning text-white border-warning';
      case 'milestone':
        return 'bg-secondary-500 text-white border-secondary-600';
      case 'expansion':
        return 'bg-success text-white border-success';
      default:
        return 'bg-gray-500 text-white border-gray-600';
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const visibleEvents = timelineEvents.slice(
    currentSlide * eventsPerSlide,
    (currentSlide + 1) * eventsPerSlide
  );

  return (
    <section className="section py-6">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(58,77,161,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <div className="container relative z-10">
        {/* Header */}
        <div className="text-center mb-12">  
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary-700">
            SSG TIMELINE
          </h2>
          <p className="text-gray-700 max-w-2xl mx-auto">
            2000년 창설부터 현재까지, SSG가 걸어온 25년의 혁신과 성장의 역사를 만나보세요
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative p-10">

        {/* Timeline Line - Dark Primary Colors */}
        <div className="relative mb-8">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary-700 via-primary-800 to-primary-700 rounded-full transform -translate-y-1/2"></div>
            
            {/* Timeline Events */}
            <div className="flex justify-between items-center relative z-10">
            {visibleEvents.map((event) => {
                const IconComponent = event.icon;
                const isActive = activeEvent === event.id;
                
                return (
                <div key={event.id} className="flex flex-col items-center">
                    {/* Event Dot */}
                    <button
                    onClick={() => setActiveEvent(event.id)}
                    className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                        isActive 
                        ? getCategoryColor(event.category) + ' shadow-lg'
                        : 'bg-white border-primary-700 text-primary-700 hover:border-primary-800 hover:bg-primary-50'
                    }`}
                    >
                    <IconComponent className="h-6 w-6" />
                    </button>
                    
                    {/* Year Label */}
                    <div className={`mt-3 px-3 py-1 rounded-full text-sm font-bold transition-colors duration-300 ${
                    isActive 
                        ? 'bg-primary-800 text-white shadow-md'
                        : 'bg-white text-primary-700 border-2 border-primary-700'
                    }`}>
                    {event.year}
                    </div>
                </div>
                );
            })}
            </div>
        </div>

        {/* Event Details Card */}
        <div className="mt-12">
            {timelineEvents
            .filter(event => event.id === activeEvent || (activeEvent === 0 && event.id === 1))
            .map(event => {
                const IconComponent = event.icon;
                return (
                <div key={event.id} className="card p-8 max-w-3xl mx-auto border-2 border-primary-700 hover:border-primary-800 transition-all duration-300 shadow-lg">
                    <div className="flex items-start gap-6">
                    <div className={`p-4 rounded-lg ${getCategoryColor(event.category)} flex-shrink-0 shadow-md`}>
                        <IconComponent className="h-8 w-8" />
                    </div>
                    
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-2xl font-bold text-primary-800">{event.title}</h3>
                        <span className="text-3xl font-bold text-secondary-700">{event.year}</span>
                        </div>
                        
                        <p className="text-gray-700 text-lg mb-4 leading-relaxed">
                        {event.description}
                        </p>
                        
                        {event.details && (
                        <div className="space-y-2">
                            <h4 className="font-semibold text-primary-700 mb-2">[translate:주요 성과]</h4>
                            <ul className="space-y-1">
                            {event.details.map((detail, index) => (
                                <li key={index} className="flex items-center gap-2 text-gray-700">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary-700"></div>
                                {detail}
                                </li>
                            ))}
                            </ul>
                        </div>
                        )}
                    </div>
                    </div>
                </div>
                );
            })}
        </div>

        {/* Combined Navigation - Buttons and Indicators in One Line */}
        <div className="flex items-center justify-between mt-8 max-w-md mx-auto">
            {/* Previous Button */}
            <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="btn btn-primary btn-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-primary-700 hover:bg-primary-800"
            >
            <ChevronLeft className="h-4 w-4" />
            이전
            </button>
            
            {/* Slide Indicators - Centered */}
            <div className="flex justify-center space-x-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                    ? 'bg-primary-700 ring-2 ring-primary-300' 
                    : 'bg-primary-300 hover:bg-primary-500'
                }`}
                />
            ))}
            </div>
            
            {/* Next Button */}
            <button
            onClick={nextSlide}
            disabled={currentSlide === totalSlides - 1}
            className="btn btn-primary btn-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-primary-700 hover:bg-primary-800"
            >
            다음
            <ChevronRight className="h-4 w-4" />
            </button>
        </div>

        </div>

      </div>
    </section>
  );
}
