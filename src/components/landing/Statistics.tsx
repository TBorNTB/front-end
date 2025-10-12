"use client";

import { useEffect, useState } from 'react';

interface StatisticItemProps {
  number: string;
  label: string;
  description: string;
  delay?: number;
}

const StatisticItem = ({ number, label, description, delay = 0 }: StatisticItemProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className="text-center">
      <div 
        className={`text-3xl md:text-4xl font-bold text-primary-600 mb-1 transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
        }`}
      >
        {number}
      </div>
      <div 
        className={`text-base md:text-lg font-semibold text-foreground mb-1 transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
        }`}
        style={{ transitionDelay: `${delay + 200}ms` }}
      >
        {label}
      </div>
      <div 
        className={`text-sm text-gray-500 transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
        }`}
        style={{ transitionDelay: `${delay + 400}ms` }}
      >
        {description}
      </div>
    </div>
  );
};

interface StatisticsSectionProps {
  className?: string;
}

export default function StatisticsSection({ className = "" }: StatisticsSectionProps) {
  const statistics = [
    {
      number: '250+',
      label: 'Active Projects',
      description: '활성 프로젝트'
    },
    {
      number: '1.2k+',
      label: 'Articles Published',
      description: '게시된 아티클'
    },
    {
      number: '5k+',
      label: '함께 멤버',
      description: '활발한 커뮤니티'
    },
    {
      number: '15+',
      label: 'Learning Topics',
      description: '학습 주제'
    }
  ];

  return (
    <section className={`py-8 md:py-12 bg-white ${className}`}>
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {statistics.map((stat, index) => (
            <StatisticItem
              key={index}
              number={stat.number}
              label={stat.label}
              description={stat.description}
              delay={index * 150} // Stagger animation
            />
          ))}
        </div>
      </div>
    </section>
  );
}
