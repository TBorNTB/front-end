"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Shield, Wifi, Zap, Search, Cloud, AlertTriangle, ArrowRight } from 'lucide-react';

const topicsData = [
  {
    id: 1,
    title: 'Network Security',
    slug: 'network-security',
    description: 'Learn about firewalls, intrusion detection, and network protection strategies',
    projects: 24,
    articles: 18,
    icon: Shield,
    color: 'bg-blue-500',
    darkBg: 'bg-gray-900'
  },
  {
    id: 2,
    title: 'Penetration Testing',
    slug: 'penetration-testing',
    description: 'Master ethical hacking techniques and vulnerability assessment',
    projects: 31,
    articles: 22,
    icon: Zap,
    color: 'bg-pink-500',
    darkBg: 'bg-gray-900'
  },
  {
    id: 3,
    title: 'Cryptography',
    slug: 'cryptography',
    description: 'Explore encryption algorithms and secure communication protocols',
    projects: 19,
    articles: 15,
    icon: Wifi,
    color: 'bg-blue-600',
    darkBg: 'bg-gray-900'
  },
  {
    id: 4,
    title: 'Digital Forensics',
    slug: 'digital-forensics',
    description: 'Learn incident response and digital evidence analysis techniques',
    projects: 16,
    articles: 12,
    icon: Search,
    color: 'bg-yellow-500',
    darkBg: 'bg-gray-900'
  },
  {
    id: 5,
    title: 'Cloud Security',
    slug: 'cloud-security',
    description: 'Secure cloud infrastructure and understand cloud-native security',
    projects: 28,
    articles: 20,
    icon: Cloud,
    color: 'bg-purple-500',
    darkBg: 'bg-gray-900'
  },
  {
    id: 6,
    title: 'Incident Response',
    slug: 'incident-response',
    description: 'Handle security breaches and develop response strategies',
    projects: 21,
    articles: 17,
    icon: AlertTriangle,
    color: 'bg-red-500',
    darkBg: 'bg-gray-900'
  },
    {
    id: 7,
    title: 'Digital Forensics',
    slug: 'digital-forensics',
    description: 'Learn incident response and digital evidence analysis techniques',
    projects: 16,
    articles: 12,
    icon: Search,
    color: 'bg-yellow-500',
    darkBg: 'bg-gray-900'
  },
  {
    id: 8,
    title: 'Cloud Security',
    slug: 'cloud-security',
    description: 'Secure cloud infrastructure and understand cloud-native security',
    projects: 28,
    articles: 20,
    icon: Cloud,
    color: 'bg-purple-500',
    darkBg: 'bg-gray-900'
  },
  {
    id: 9,
    title: 'Incident Response',
    slug: 'incident-response',
    description: 'Handle security breaches and develop response strategies',
    projects: 21,
    articles: 17,
    icon: AlertTriangle,
    color: 'bg-red-500',
    darkBg: 'bg-gray-900'
  }
];

interface TopicsSectionProps {
  showHeader?: boolean;
  className?: string;
}

export default function TopicsSection({ 
  showHeader = true,
  className = "" 
}: TopicsSectionProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const itemsPerPage = 6; // 3x2 grid
  const totalPages = Math.ceil(topicsData.length / itemsPerPage);

  
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const handleTopicClick = (slug: string) => {
    router.push(`/topics?category=${slug}`);
  };

  const getCurrentItems = () => {
    const startIndex = currentIndex * itemsPerPage;
    return topicsData.slice(startIndex, startIndex + itemsPerPage);
  };

  return (
    <section className={`section bg-background ${className}`}>
      <div className="container">
        {/* Header Section */}
        {showHeader && (
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Learning Topics
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover cybersecurity topics tailored to your interests
            </p>
          </div>
        )}

        {/* Carousel Container */}
        <div className="relative">
          {/* Topics Grid */}
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            {getCurrentItems().map((topic) => {
              const IconComponent = topic.icon;
              
              return (
                <div
                  key={topic.id}
                  className="relative group cursor-pointer"
                  onClick={() => handleTopicClick(topic.slug)}
                >
                  <div className={`
                    relative h-56 rounded-2xl overflow-hidden
                    ${topic.darkBg} hover:shadow-xl
                  `}>
                    
                    {/* Content */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-between">
                      {/* Icon and Title */}
                      <div className="flex items-center space-x-3">
                        <div className={`
                          w-12 h-12 rounded-lg ${topic.color} 
                          flex items-center justify-center
                        `}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-white">
                          {topic.title}
                        </h3>
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 flex flex-col justify-center">
                        <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                          {topic.description}
                        </p>
                      </div>

                      {/* Bottom Section */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>{topic.projects} Projects</span>
                          <span>•</span>
                          <span>{topic.articles} Articles</span>
                        </div>
                        
                        <div className="flex items-center justify-center w-8 h-8">
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    {/* Subtle border effect */}
                    <div className="absolute inset-0 rounded-2xl border border-transparent hover:border-primary-400/30 hover:shadow-lg hover:shadow-primary-500/10" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-8
                     w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md
                     hover:bg-gray-50 hover:shadow-lg
                     flex items-center justify-center text-gray-600 hover:text-primary-600"
            disabled={totalPages <= 1}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-8
                     w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md
                     hover:bg-gray-50 hover:shadow-lg
                     flex items-center justify-center text-gray-600 hover:text-primary-600"
            disabled={totalPages <= 1}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Pagination Dots */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full ${
                  index === currentIndex 
                    ? 'bg-primary-600 scale-125' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
