"use client";

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Calendar, User, Eye, MessageCircle, Tag } from 'lucide-react';

const articles = [
  {
    id: 1,
    title: 'SQL Injection 공격의 이해와 방어 기법',
    excerpt: 'SQL Injection은 웹 애플리케이션에서 가장 흔히 발생하는 보안 취약점 중 하나입니다. 이 글에서는 SQL Injection의 원리와 다양한 공격 기법, 그리고 효과적인 방어 방법에 대해 알아보겠습니다.',
    content: '웹 애플리케이션 보안에서 SQL Injection은 여전히 중요한 위협 요소입니다...',
    author: '김민준',
    date: '2024.01.20',
    readTime: '8분',
    views: 1247,
    comments: 23,
    tags: ['웹해킹', 'SQL Injection', '보안'],
    category: '웹 보안',
    image: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 2,
    title: '리버스 엔지니어링을 통한 악성코드 분석',
    excerpt: '악성코드 분석은 보안 전문가에게 필수적인 기술입니다. 이 글에서는 IDA Pro와 Ghidra를 활용한 정적 분석 기법과 실제 악성코드 샘플 분석 과정을 소개합니다.',
    content: '악성코드 분석은 현대 사이버 보안의 핵심 기술 중 하나입니다...',
    author: '최유진',
    date: '2024.01.18',
    readTime: '12분',
    views: 892,
    comments: 17,
    tags: ['리버싱', '악성코드', 'IDA Pro', 'Ghidra'],
    category: '악성코드 분석',
    image: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 3,
    title: 'Buffer Overflow 익스플로잇 개발 가이드',
    excerpt: 'Buffer Overflow는 시스템 해킹의 기초가 되는 취약점입니다. 스택 기반 Buffer Overflow의 원리부터 실제 익스플로잇 코드 작성까지 단계별로 설명합니다.',
    content: 'Buffer Overflow는 메모리 관리의 취약점을 이용한 공격 기법입니다...',
    author: '박준호',
    date: '2024.01.15',
    readTime: '15분',
    views: 1456,
    comments: 31,
    tags: ['포너블', 'Buffer Overflow', '익스플로잇'],
    category: '시스템 해킹',
    image: 'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 4,
    title: 'RSA 암호화 알고리즘의 수학적 원리',
    excerpt: 'RSA는 현대 암호학의 기초가 되는 공개키 암호화 알고리즘입니다. 수학적 원리부터 실제 구현까지, RSA의 모든 것을 알아보겠습니다.',
    content: 'RSA 암호화는 큰 수의 소인수분해 문제의 어려움에 기반합니다...',
    author: '이서연',
    date: '2024.01.12',
    readTime: '10분',
    views: 734,
    comments: 19,
    tags: ['암호학', 'RSA', '수학'],
    category: '암호학',
    image: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 5,
    title: '스마트 컨트랙트 보안 감사 방법론',
    excerpt: '블록체인 기술의 발전과 함께 스마트 컨트랙트의 보안이 중요해지고 있습니다. 효과적인 보안 감사 방법론과 도구들을 소개합니다.',
    content: '스마트 컨트랙트는 블록체인 상에서 실행되는 자동화된 계약입니다...',
    author: '정현우',
    date: '2024.01.10',
    readTime: '11분',
    views: 623,
    comments: 14,
    tags: ['블록체인', '스마트 컨트랙트', 'Solidity'],
    category: '블록체인 보안',
    image: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 6,
    title: 'AWS 클라우드 보안 모범 사례',
    excerpt: '클라우드 환경에서의 보안은 전통적인 온프레미스 환경과 다른 접근이 필요합니다. AWS 환경에서의 보안 모범 사례를 알아보겠습니다.',
    content: '클라우드 보안은 공유 책임 모델을 기반으로 합니다...',
    author: '한소영',
    date: '2024.01.08',
    readTime: '9분',
    views: 567,
    comments: 12,
    tags: ['클라우드', 'AWS', '보안'],
    category: '클라우드 보안',
    image: 'https://images.pexels.com/photos/1181316/pexels-photo-1181316.jpeg?auto=compress&cs=tinysrgb&w=800'
  }
];

const getCategoryColor = (category: string) => {
  const colors = [
    'bg-gradient-to-r from-cyan-400 to-blue-500',
    'bg-gradient-to-r from-purple-400 to-pink-500',
    'bg-gradient-to-r from-green-400 to-cyan-500',
    'bg-gradient-to-r from-yellow-400 to-orange-500',
    'bg-gradient-to-r from-red-400 to-pink-500',
    'bg-gradient-to-r from-indigo-400 to-purple-500'
  ];
  return colors[Math.abs(category.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % colors.length];
};

export default function Articles() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        {/* Test your custom colors */}
        <p className="text-foreground text-base">
          This is the article page
        </p>
      </main>
      <Footer />
    </div>
  );
}