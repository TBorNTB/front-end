"use client";

import { useEffect, useState } from 'react';
import { getApiUrl } from '@/lib/api/config';
import { META_ENDPOINTS } from '@/lib/api/endpoints/meta-endpoints';

interface StatisticItemProps {
  number: string;
  label: string;
  description: string;
  delay?: number;
}

interface ApiCountResponse {
  userCount: number;
  projectCount: number;
  articleCount: number;
  categoryCount: number;
}

// 숫자 포맷팅 함수
const formatNumber = (num: number): string => {
  if (num >= 1000) {
    const k = Math.floor(num / 1000);
    const remainder = num % 1000;
    if (remainder >= 100) {
      return `${k}.${Math.floor(remainder / 100)}k+`;
    }
    return `${k}k+`;
  }
  return `${num}+`;
};

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
  const [statistics, setStatistics] = useState([
    {
      number: '0+',
      label: 'Active Projects',
      description: '활성 프로젝트'
    },
    {
      number: '0+',
      label: 'Articles Published',
      description: '게시된 아티클'
    },
    {
      number: '0+',
      label: 'Active Members',
      description: '활발한 커뮤니티'
    },
    {
      number: '0+',
      label: 'Learning Topics',
      description: '학습 주제'
    }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const url = getApiUrl(META_ENDPOINTS.META.COUNT);
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch statistics: ${response.status}`);
        }

        const data: ApiCountResponse = await response.json();

        setStatistics([
          {
            number: formatNumber(data.projectCount),
            label: 'Active Projects',
            description: '활성 프로젝트'
          },
          {
            number: formatNumber(data.articleCount),
            label: 'Articles Published',
            description: '게시된 아티클'
          },
          {
            number: formatNumber(data.userCount),
            label: 'Active Members',
            description: '활발한 커뮤니티'
          },
          {
            number: formatNumber(data.categoryCount),
            label: 'Learning Topics',
            description: '학습 주제'
          }
        ]);
      } catch (error) {
        // On error, keep default zero values
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to fetch statistics:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

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
