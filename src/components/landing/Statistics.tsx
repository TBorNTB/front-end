"use client";

import { useEffect, useState } from 'react';
import { BASE_URL } from '@/lib/api/config';
import { USE_MOCK_DATA } from '@/lib/api/env';
import { MOCK_PROJECTS, MOCK_ARTICLES, MOCK_CATEGORIES } from '@/lib/mock-data';

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
  csCount: number;
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
      label: '함께 멤버',
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
      // Mock path: short-circuit API and use local counts to avoid fetch errors in dev
      if (USE_MOCK_DATA) {
        setStatistics([
          {
            number: formatNumber(MOCK_PROJECTS.length),
            label: 'Active Projects',
            description: '활성 프로젝트'
          },
          {
            number: formatNumber(MOCK_ARTICLES.length),
            label: 'Articles Published',
            description: '게시된 아티클'
          },
          {
            number: formatNumber(120), // mock members
            label: '함께 멤버',
            description: '활발한 커뮤니티'
          },
          {
            number: formatNumber(MOCK_CATEGORIES.length),
            label: 'Learning Topics',
            description: '학습 주제'
          }
        ]);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${BASE_URL}/meta-service/api/meta/count`,
      try {
        const response = await fetch(
          `${BASE_URL}/user-service/api/meta/count`,
          {
            method: 'GET',
            headers: {
              'accept': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
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
            label: '함께 멤버',
            description: '활발한 커뮤니티'
          },
          {
            number: formatNumber(data.csCount),
            label: 'Learning Topics',
            description: '학습 주제'
          }
        ]);
      } catch (error) {
        console.error('Error fetching statistics:', error);
        // Fall back to mock data on error
        setStatistics([
          {
            number: formatNumber(MOCK_PROJECTS.length),
            label: 'Active Projects',
            description: '활성 프로젝트'
          },
          {
            number: formatNumber(MOCK_ARTICLES.length),
            label: 'Articles Published',
            description: '게시된 아티클'
          },
          {
            number: formatNumber(120), // mock members
            label: '함께 멤버',
            description: '활발한 커뮤니티'
          },
          {
            number: formatNumber(MOCK_CATEGORIES.length),
            label: 'Learning Topics',
            description: '학습 주제'
          }
        ]);
        // 에러 발생 시 기본값 유지
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
