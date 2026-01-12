// app/(pages)/topics/LearningTopics.tsx
"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Star, Users, Clock, ArrowRight, Globe, Shield, Code, Lock, Search, Wifi, Cpu, Key } from 'lucide-react';
import TitleBanner from '@/components/layout/TitleBanner';
import type { LucideIcon } from 'lucide-react';
import { categoryService, CategoryItem } from '@/lib/api/services/category-services';
import { CategoryType, CategorySlugs, CategoryDisplayNames, CategoryDescriptions } from '@/types/services/category';

// Icon mapping for each category
const CategoryIcons: Record<CategoryType, LucideIcon> = {
  [CategoryType.WEB_HACKING]: Code,
  [CategoryType.REVERSING]: Search,
  [CategoryType.SYSTEM_HACKING]: Lock,
  [CategoryType.DIGITAL_FORENSICS]: Shield,
  [CategoryType.NETWORK_SECURITY]: Wifi,
  [CategoryType.IOT_SECURITY]: Cpu,
  [CategoryType.CRYPTOGRAPHY]: Key,
};

// Color mapping for each category
const CategoryColors: Record<CategoryType, string> = {
  [CategoryType.WEB_HACKING]: 'bg-blue-500',
  [CategoryType.REVERSING]: 'bg-purple-500',
  [CategoryType.SYSTEM_HACKING]: 'bg-red-500',
  [CategoryType.DIGITAL_FORENSICS]: 'bg-green-500',
  [CategoryType.NETWORK_SECURITY]: 'bg-indigo-500',
  [CategoryType.IOT_SECURITY]: 'bg-orange-500',
  [CategoryType.CRYPTOGRAPHY]: 'bg-yellow-500',
};

// 카테고리 이름으로 CategoryType을 찾는 헬퍼 함수
const getCategoryTypeByName = (name: string): CategoryType | null => {
  const entry = Object.entries(CategoryDisplayNames).find(([_, displayName]) => displayName === name);
  return entry ? (entry[0] as CategoryType) : null;
};

// API 응답을 컴포넌트에서 사용하는 형식으로 변환
interface CategoryDisplayData {
  id: number;
  name: string;
  slug: string;
  articles: number;
  projects: number;
  type: CategoryType;
  description: string;
  longDescription: string;
}

// longDescription 매핑 (기존 설명 유지)
const longDescriptions: Record<CategoryType, string> = {
  [CategoryType.WEB_HACKING]: `웹 해킹은 웹 애플리케이션에서 발생할 수 있는 다양한 보안 취약점을 실습하고 분석하는 분야입니다. 

SQL 인젝션, XSS(Cross-Site Scripting), CSRF(Cross-Site Request Forgery) 등의 공격 기법과 이에 대한 방어 매커니즘을 실습합니다. 자동화된 취약점 스캐너 개발, 웹 애플리케이션 펜테스팅 도구 사용법, 그리고 현실적인 공격 시나리오 분석을 다룹니다.`,
  [CategoryType.REVERSING]: `리버싱(역공학)은 컴파일된 바이너리 파일을 분석하여 원본 코드의 로직과 구조를 이해하는 기술입니다.

IDA Pro, Ghidra, x64dbg와 같은 전문 도구를 사용하여 바이너리를 분석하고, 어셈블리어를 해독하며, 프로그램의 실행 흐름을 파악합니다. 또한 패킹된 악성코드 언패킹, 프로텍션 우회, 크랙미 문제 해결 등의 실습을 진행합니다.`,
  [CategoryType.SYSTEM_HACKING]: `시스템 해킹은 운영체제와 시스템 레벨에서 발생하는 취약점을 분석하고 익스플로잇을 개발하는 분야입니다.

Buffer Overflow, Format String Bug, Use-After-Free와 같은 메모리 corruption 취약점을 실습하고, ROP(Return-Oriented Programming), JOP(Jump-Oriented Programming) 등의 고급 익스플로잇 기법을 학습합니다. 또한 ASLR, DEP, Stack Canary와 같은 보안 메커니즘 우회 기법도 다룹니다.`,
  [CategoryType.DIGITAL_FORENSICS]: `디지털 포렌식은 사이버 범죄나 보안 사고 발생 시 디지털 증거를 수집하고 분석하는 전문 분야입니다.

파일 시스템 분석, 메모리 덤프 분석, 네트워크 패킷 분석을 통해 침해 흔적을 추적하고 사고 원인을 규명합니다. Volatility, Autopsy, Wireshark 등의 전문 도구를 활용하여 실제 사고 시나리오를 분석하고, 법정에서 인정받을 수 있는 증거 수집 절차를 학습합니다.`,
  [CategoryType.NETWORK_SECURITY]: `네트워크 보안은 네트워크를 통한 공격과 방어에 대한 전반적인 보안 기술을 다루는 분야입니다.

패킷 분석을 통한 네트워크 트래픽 모니터링, IDS/IPS 시스템 구축 및 운영, 방화벽 정책 설계, 그리고 무선 네트워크 보안을 실습합니다. 또한 네트워크 스캐닝, 포트 스캐닝, 네트워크 기반 공격 기법들과 이에 대한 탐지 및 차단 방법을 학습합니다.`,
  [CategoryType.IOT_SECURITY]: `IoT 보안은 점점 증가하는 사물인터넷 기기들의 보안 취약점을 분석하고 대응하는 새로운 보안 분야입니다.

임베디드 시스템 보안, 펌웨어 분석, 하드웨어 해킹, 무선 통신 프로토콜 보안을 다룹니다. 실제 IoT 기기를 대상으로 펌웨어 추출, 바이너리 분석, 통신 패킷 분석을 실습하고, UART, JTAG와 같은 하드웨어 인터페이스를 활용한 분석 기법을 학습합니다.`,
  [CategoryType.CRYPTOGRAPHY]: `암호학은 정보 보안의 핵심 이론과 기술을 다루는 근본적인 보안 분야입니다.

대칭키/비대칭키 암호, 해시 함수, 디지털 서명의 이론적 배경과 실제 구현을 학습합니다. RSA, AES, ECC와 같은 주요 암호 알고리즘의 동작 원리와 보안성을 분석하고, TLS/SSL, PKI와 같은 실제 보안 프로토콜의 설계와 취약점을 연구합니다.`,
};

// 범용 slug 생성 함수 - 어떤 카테고리 이름이 와도 자동으로 처리
const createSlugFromName = (name: string, id: number): string => {
  // 영문/숫자만 있는 경우: 공백을 하이픈으로, 소문자 변환
  if (/^[a-zA-Z0-9\s-]+$/.test(name)) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  
  // 한글이나 특수문자가 포함된 경우: ID 기반 slug 사용 (안정적이고 고유함)
  // 예: "임시" -> "category-0", "임시2" -> "category-1"
  return `category-${id}`;
};

const transformCategoryData = (apiCategory: CategoryItem): CategoryDisplayData | null => {
  // API 응답의 name을 제목으로 사용
  const type = getCategoryTypeByName(apiCategory.name);
  
  // 타입을 찾지 못해도 기본값으로 처리 (필터링되지 않도록)
  // 알 수 없는 카테고리는 첫 번째 타입을 기본값으로 사용
  const defaultType = type || CategoryType.WEB_HACKING;
  
  // slug 생성: 타입이 있으면 해당 slug, 없으면 ID 기반으로 생성
  const slug = type 
    ? CategorySlugs[type]
    : createSlugFromName(apiCategory.name, apiCategory.id);

  // 타입을 찾지 못한 경우 경고만 출력하고 계속 진행
  if (!type) {
    console.log(`New category detected: "${apiCategory.name}" (ID: ${apiCategory.id}). Using auto-generated slug: "${slug}"`);
  }

  return {
    id: apiCategory.id,
    name: apiCategory.name, // API 응답의 name을 제목으로 사용
    slug: slug,
    articles: 0, // API에서 제공되지 않으면 기본값 0
    projects: 0, // API에서 제공되지 않으면 기본값 0
    type: defaultType,
    description: apiCategory.description || (type ? CategoryDescriptions[type] : apiCategory.description || ''),
    longDescription: type ? longDescriptions[type] : apiCategory.description || '',
  };
};

// Mock data for categories
const mockCategories: CategoryDisplayData[] = [
  {
    id: 1,
    name: '웹 해킹',
    slug: 'web-hacking',
    articles: 12,
    projects: 8,
    type: CategoryType.WEB_HACKING,
    description: '웹 애플리케이션의 보안 취약점을 실습하고 분석합니다.',
    longDescription: longDescriptions[CategoryType.WEB_HACKING],
  },
  {
    id: 2,
    name: '리버싱',
    slug: 'reversing',
    articles: 9,
    projects: 6,
    type: CategoryType.REVERSING,
    description: '바이너리 파일 분석 및 역공학 기술을 습득합니다.',
    longDescription: longDescriptions[CategoryType.REVERSING],
  },
  {
    id: 3,
    name: '시스템 해킹',
    slug: 'system-hacking',
    articles: 11,
    projects: 7,
    type: CategoryType.SYSTEM_HACKING,
    description: '운영체제 레벨의 취약점을 분석합니다.',
    longDescription: longDescriptions[CategoryType.SYSTEM_HACKING],
  },
  {
    id: 4,
    name: '디지털 포렌식',
    slug: 'digital-forensics',
    articles: 8,
    projects: 5,
    type: CategoryType.DIGITAL_FORENSICS,
    description: '디지털 증거 수집 및 분석 기술을 배웁니다.',
    longDescription: longDescriptions[CategoryType.DIGITAL_FORENSICS],
  },
  {
    id: 5,
    name: '네트워크 보안',
    slug: 'network-security',
    articles: 10,
    projects: 9,
    type: CategoryType.NETWORK_SECURITY,
    description: '네트워크 공격과 방어 기술을 습득합니다.',
    longDescription: longDescriptions[CategoryType.NETWORK_SECURITY],
  },
  {
    id: 6,
    name: 'IoT 보안',
    slug: 'iot-security',
    articles: 7,
    projects: 4,
    type: CategoryType.IOT_SECURITY,
    description: '임베디드 시스템 및 IoT 기기의 보안을 다룹니다.',
    longDescription: longDescriptions[CategoryType.IOT_SECURITY],
  },
  {
    id: 7,
    name: '암호학',
    slug: 'cryptography',
    articles: 13,
    projects: 6,
    type: CategoryType.CRYPTOGRAPHY,
    description: '암호화 알고리즘과 프로토콜을 이해합니다.',
    longDescription: longDescriptions[CategoryType.CRYPTOGRAPHY],
  },
];

// Mock data for projects and articles
const projects = [
  // Web Hacking
  {
    id: 1,
    title: 'SQL 인젝션 취약점 스캐너',
    description: '자동화된 SQL 인젝션 취약점 탐지 도구',
    category: '웹 해킹',
    status: 'In Progress',
    tags: ['Python', 'Security'],
    stars: 12,
    contributors: 3,
    categorySlug: 'web-hacking'
  },
  {
    id: 2,
    title: 'XSS 방어 라이브러리',
    description: 'Cross-Site Scripting 공격을 방어하는 JavaScript 라이브러리',
    category: '웹 해킹',
    status: 'Planning',
    tags: ['JavaScript', 'Web'],
    stars: 8,
    contributors: 2,
    categorySlug: 'web-hacking'
  },
  {
    id: 3,
    title: '웹 보안 테스트 프레임워크',
    description: '종합적인 웹 애플리케이션 보안 테스트 도구',
    category: '웹 해킹',
    status: 'Completed',
    tags: ['Go', 'Testing'],
    stars: 15,
    contributors: 4,
    categorySlug: 'web-hacking'
  },
  {
    id: 4,
    title: 'CSRF 토큰 검증 시스템',
    description: 'Cross-Site Request Forgery 방어 미들웨어',
    category: '웹 해킹',
    status: 'Completed',
    tags: ['Node.js', 'Express'],
    stars: 9,
    contributors: 2,
    categorySlug: 'web-hacking'
  },
  {
    id: 5,
    title: '웹 취약점 자동 스캔 봇',
    description: '자동화된 웹 취약점 탐지 및 리포팅 시스템',
    category: '웹 해킹',
    status: 'In Progress',
    tags: ['Python', 'Selenium'],
    stars: 11,
    contributors: 3,
    categorySlug: 'web-hacking'
  },
  // Reversing
  {
    id: 6,
    title: 'Windows PE 파일 분석기',
    description: 'PE 파일 구조 분석 및 리버싱 도구',
    category: '리버싱',
    status: 'Completed',
    tags: ['C++', 'Assembly'],
    stars: 14,
    contributors: 2,
    categorySlug: 'reversing'
  },
  {
    id: 7,
    title: '악성코드 언패킹 프레임워크',
    description: '패킹된 악성코드 자동 언패킹 시스템',
    category: '리버싱',
    status: 'In Progress',
    tags: ['Python', 'Dynamorio'],
    stars: 10,
    contributors: 3,
    categorySlug: 'reversing'
  },
  // System Hacking
  {
    id: 8,
    title: '버퍼 오버플로우 익스플로잇 킷',
    description: 'BOF 취약점 개발 및 테스트용 도구 모음',
    category: '시스템 해킹',
    status: 'Completed',
    tags: ['C', 'GDB', 'Assembly'],
    stars: 13,
    contributors: 2,
    categorySlug: 'system-hacking'
  },
  {
    id: 9,
    title: 'ROP 체인 생성기',
    description: 'Return-Oriented Programming 체인 자동 생성',
    category: '시스템 해킹',
    status: 'Planning',
    tags: ['Python', 'IDA Pro'],
    stars: 7,
    contributors: 2,
    categorySlug: 'system-hacking'
  },
  // Digital Forensics
  {
    id: 10,
    title: '메모리 포렌식 분석 도구',
    description: '메모리 덤프 분석을 위한 포렌식 도구',
    category: '디지털 포렌식',
    status: 'Completed',
    tags: ['Python', 'Volatility'],
    stars: 11,
    contributors: 3,
    categorySlug: 'digital-forensics'
  },
  {
    id: 11,
    title: '파일 시스템 포렌식 수집기',
    description: '파일 시스템 증거 수집 자동화 도구',
    category: '디지털 포렌식',
    status: 'In Progress',
    tags: ['Python', 'Bash'],
    stars: 8,
    contributors: 2,
    categorySlug: 'digital-forensics'
  },
  // Network Security
  {
    id: 12,
    title: 'IDS 시스템 개발 프로젝트',
    description: 'Intrusion Detection System 구현',
    category: '네트워크 보안',
    status: 'Completed',
    tags: ['Python', 'Scapy'],
    stars: 16,
    contributors: 4,
    categorySlug: 'network-security'
  },
  {
    id: 13,
    title: '패킷 분석기 및 시각화 도구',
    description: '네트워크 패킷 분석 및 실시간 시각화',
    category: '네트워크 보안',
    status: 'In Progress',
    tags: ['C', 'Wireshark'],
    stars: 12,
    contributors: 3,
    categorySlug: 'network-security'
  },
  // IoT Security
  {
    id: 14,
    title: 'IoT 디바이스 펌웨어 추출기',
    description: '임베디드 기기 펌웨어 추출 및 분석',
    category: 'IoT 보안',
    status: 'Planning',
    tags: ['Python', 'Binwalk'],
    stars: 9,
    contributors: 2,
    categorySlug: 'iot-security'
  },
  // Cryptography
  {
    id: 15,
    title: 'RSA 암호 분석 도구',
    description: 'RSA 암호 취약점 분석 및 공격 도구',
    category: '암호학',
    status: 'Completed',
    tags: ['Python', 'Math'],
    stars: 13,
    contributors: 2,
    categorySlug: 'cryptography'
  },
  {
    id: 16,
    title: 'AES 구현 및 분석',
    description: '고급 암호화 표준(AES) 구현 및 side-channel 분석',
    category: '암호학',
    status: 'Completed',
    tags: ['C', 'Cryptography'],
    stars: 11,
    contributors: 2,
    categorySlug: 'cryptography'
  },
];

const articles = [
  // Web Hacking
  {
    id: 1,
    title: 'OWASP Top 10 2024 분석',
    description: '최신 웹 애플리케이션 보안 위험 분석',
    category: '웹 해킹',
    author: '김보안',
    publishDate: '2024-01-20',
    readTime: '5분 읽기',
    views: 245,
    comments: 12,
    categorySlug: 'web-hacking'
  },
  {
    id: 2,
    title: 'JWT 토큰 보안 가이드',
    description: 'JSON Web Token의 안전한 구현 방법',
    category: '웹 해킹',
    author: '임해커',
    publishDate: '2024-01-18',
    readTime: '8분 읽기',
    views: 189,
    comments: 8,
    categorySlug: 'web-hacking'
  },
  {
    id: 3,
    title: 'CSP 헤더 설정 완벽 가이드',
    description: 'Content Security Policy를 통한 XSS 방어',
    category: '웹 해킹',
    author: '김민준',
    publishDate: '2024-01-15',
    readTime: '12분 읽기',
    views: 156,
    comments: 7,
    categorySlug: 'web-hacking'
  },
  {
    id: 4,
    title: 'SQL 인젝션 실전 공략집',
    description: '다양한 SQL 인젝션 기법 및 방어 전략',
    category: '웹 해킹',
    author: '박해킹',
    publishDate: '2024-01-12',
    readTime: '15분 읽기',
    views: 312,
    comments: 14,
    categorySlug: 'web-hacking'
  },
  {
    id: 5,
    title: '웹 API 보안 체크리스트',
    description: 'REST API 개발 시 고려할 보안 사항',
    category: '웹 해킹',
    author: '이안전',
    publishDate: '2024-01-10',
    readTime: '9분 읽기',
    views: 167,
    comments: 6,
    categorySlug: 'web-hacking'
  },
  // Reversing
  {
    id: 6,
    title: '리버싱 시작 가이드',
    description: 'IDA Pro를 이용한 바이너리 분석 입문',
    category: '리버싱',
    author: '최리버싱',
    publishDate: '2024-01-19',
    readTime: '10분 읽기',
    views: 198,
    comments: 9,
    categorySlug: 'reversing'
  },
  {
    id: 7,
    title: '어셈블리어 이해하기',
    description: 'x86-64 어셈블리 기본 개념 및 실습',
    category: '리버싱',
    author: '조어셈블리',
    publishDate: '2024-01-17',
    readTime: '14분 읽기',
    views: 234,
    comments: 11,
    categorySlug: 'reversing'
  },
  // System Hacking
  {
    id: 8,
    title: '버퍼 오버플로우 완전 정복',
    description: 'Stack 기반 BOF 공격 및 방어 기법',
    category: '시스템 해킹',
    author: '이시스템',
    publishDate: '2024-01-16',
    readTime: '18분 읽기',
    views: 278,
    comments: 13,
    categorySlug: 'system-hacking'
  },
  {
    id: 9,
    title: 'ASLR 우회 기법',
    description: 'Address Space Layout Randomization 우회 방법',
    category: '시스템 해킹',
    author: '박우회',
    publishDate: '2024-01-14',
    readTime: '11분 읽기',
    views: 145,
    comments: 5,
    categorySlug: 'system-hacking'
  },
  // Digital Forensics
  {
    id: 10,
    title: '포렌식 분석 기초',
    description: '디지털 포렌식의 개념과 절차',
    category: '디지털 포렌식',
    author: '정포렌식',
    publishDate: '2024-01-13',
    readTime: '7분 읽기',
    views: 123,
    comments: 4,
    categorySlug: 'digital-forensics'
  },
  // Network Security
  {
    id: 11,
    title: '패킷 분석 마스터',
    description: 'Wireshark를 이용한 네트워크 분석',
    category: '네트워크 보안',
    author: '윤네트워크',
    publishDate: '2024-01-11',
    readTime: '13분 읽기',
    views: 267,
    comments: 10,
    categorySlug: 'network-security'
  },
  {
    id: 12,
    title: 'Nmap 고급 사용법',
    description: '네트워크 스캔 및 포트 스캐닝 기법',
    category: '네트워크 보안',
    author: '강스캔',
    publishDate: '2024-01-09',
    readTime: '9분 읽기',
    views: 198,
    comments: 8,
    categorySlug: 'network-security'
  },
  // Cryptography
  {
    id: 13,
    title: 'RSA 암호화 이해하기',
    description: '비대칭키 암호의 원리와 구현',
    category: '암호학',
    author: '성암호',
    publishDate: '2024-01-21',
    readTime: '16분 읽기',
    views: 289,
    comments: 15,
    categorySlug: 'cryptography'
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed': return 'bg-green-100 text-green-700 border-green-300';
    case 'Planning': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-300';
    default: return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'Completed': return '완료';
    case 'Planning': return '계획중';
    case 'In Progress': return '진행중';
    default: return status;
  }
};

export function LearningTopics() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedCategory = searchParams.get('category') || '';
  
  const [categories, setCategories] = useState<CategoryDisplayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API에서 카테고리 데이터 가져오기 (실패 시 mock data 사용)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await categoryService.getCategories();
        
        const transformedCategories = response.categories
          .map(transformCategoryData)
          .filter((cat): cat is CategoryDisplayData => cat !== null);
        
        setCategories(transformedCategories);
      } catch (err) {
        console.error('Failed to fetch categories, using mock data:', err);
        // Fallback to mock data
        setCategories(mockCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);
  
  const handleCategoryClick = (categorySlug: string) => {
    if (categorySlug === selectedCategory) {
      router.push('/topics');
    } else {
      router.push(`/topics?category=${categorySlug}`);
    }
  };

  // Filter projects and articles based on selected category
  const filteredProjects = selectedCategory 
    ? projects.filter(project => project.categorySlug === selectedCategory)
    : projects;
    
  const filteredArticles = selectedCategory 
    ? articles.filter(article => article.categorySlug === selectedCategory)
    : articles;

  const currentCategory = categories.find(cat => cat.slug === selectedCategory);
  
  // 선택된 카테고리가 없으면 상세 페이지를 표시하지 않음
  if (selectedCategory && !currentCategory) {
    console.warn(`Category not found for slug: "${selectedCategory}"`);
  }

  const renderAllCategories = () => (
    <div className="space-y-8">
      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          // 알 수 없는 카테고리도 기본 아이콘/색상 사용 (확장성 고려)
          const IconComponent = CategoryIcons[category.type] || Shield;
          const colorClass = CategoryColors[category.type] || 'bg-gray-500';
          
          return (
            <div 
              key={category.slug} 
              className="card cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              onClick={() => handleCategoryClick(category.slug)}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary-600 transition-colors">
                  {category.name}
                </h3>
              </div>
              
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                {category.description || '설명이 없습니다.'}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                    <span className="text-gray-600">{category.projects}개 프로젝트</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-secondary-500"></div>
                    <span className="text-gray-600">{category.articles}개 CS지식</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderCategoryDetail = () => {
    const cat = currentCategory;
    return (
      <div className="space-y-6">
        <div className="flex gap-8 items-start">
          {/* Sidebar - Sticky */}
          <div className="w-64 flex-shrink-0">
            <div className="sticky top-8 bg-white rounded-xl shadow-sm border border-gray-200">
              <button
                onClick={() => router.push('/topics')}
                className="w-full p-4 border-b border-gray-200 text-left hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <h3 className="text-base font-semibold text-gray-900">전체 카테고리</h3>
              </button>
              <div className="p-2 max-h-[calc(100vh-10rem)] overflow-y-auto">
                {categories.map((category) => {
                  const isActive = selectedCategory === category.slug;
                  return (
                    <button
                      key={category.slug}
                      onClick={() => handleCategoryClick(category.slug)}
                      className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm transition-all ${
                        isActive
                          ? 'bg-primary-600 text-white font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{category.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        isActive
                          ? 'bg-white bg-opacity-20 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {category.articles + category.projects}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Side Content */}
          <div className="flex-1 space-y-6">
            {/* Category Header - Without background */}
            {cat ? (
              <div className="pb-4 border-b border-gray-200">
                <div className="flex items-start space-x-4">
                  <div className={`w-14 h-14 rounded-xl ${CategoryColors[cat.type]} flex items-center justify-center flex-shrink-0`}>
                    {(() => {
                      const Icon = CategoryIcons[cat.type];
                      return <Icon className="w-7 h-7 text-white" />;
                    })()}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-foreground mb-2">{cat.name}</h1>
                    <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-line">
                      {cat.longDescription}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="pb-6 mb-6 border-b border-gray-200">
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 rounded-xl bg-gray-400 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-foreground mb-2">카테고리를 찾을 수 없습니다</h1>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      선택하신 카테고리 정보를 불러올 수 없습니다.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Content Area with white background */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              {/* Content Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Projects Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground">프로젝트</h2>
                    <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                      {filteredProjects.length}개
                    </span>
                  </div>

                  <div className="space-y-4">
                    {filteredProjects.length > 0 ? (
                      filteredProjects.map((project) => (
                        <div key={project.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-200">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-base font-bold text-foreground flex-1">{project.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs border ml-3 flex-shrink-0 ${getStatusColor(project.status)}`}>
                              {getStatusText(project.status)}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-4">{project.description}</p>
                          <div className="flex items-center space-x-2 mb-4">
                            {project.tags.map((tag, index) => (
                              <span key={index} className="bg-white text-gray-700 px-2 py-1 rounded text-xs border border-gray-200">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Star size={12} />
                                <span>{project.stars}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users size={12} />
                                <span>{project.contributors}</span>
                              </div>
                            </div>
                            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                              자세히 보기 →
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
                        <p className="text-gray-600">이 카테고리에 등록된 프로젝트가 없습니다.</p>
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <button
                      onClick={() => router.push(`/projects?topic=${cat?.slug}`)}
                      className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-2 mx-auto text-sm"
                    >
                      <span>모든 프로젝트 보기</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Articles Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground">아티클</h2>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      {filteredArticles.length}개
                    </span>
                  </div>

                  <div className="space-y-4">
                    {filteredArticles.length > 0 ? (
                      filteredArticles.map((article) => (
                        <div key={article.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-200">
                          <h3 className="text-base font-bold text-foreground mb-2">{article.title}</h3>
                          <p className="text-gray-600 text-sm mb-4">{article.description}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                            <span>by {article.author}</span>
                            <span>{article.publishDate}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Globe size={12} />
                                <span>{article.views}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock size={12} />
                                <span>{article.readTime}</span>
                              </div>
                            </div>
                            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                              읽어보기 →
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
                        <p className="text-gray-600">이 카테고리에 등록된 CS지식이 없습니다.</p>
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <button
                      onClick={() => router.push(`/articles?topic=${cat?.slug}`)}
                      className="text-green-600 hover:text-green-700 font-medium flex items-center space-x-2 mx-auto text-sm"
                    >
                      <span>모든 CS지식 보기</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };


  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <div className="text-center mb-8">
            <div className="h-10 bg-gray-200 rounded animate-pulse mb-4 max-w-md mx-auto"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse max-w-2xl mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TitleBanner
        title="Learning Topics"
        description="사이버보안의 다양한 분야를 탐구하고 실무 경험을 쌓을 수 있는 학습 주제들을 확인하세요."
        backgroundImage="/images/BgHeader.png"
      />
      <div className="container py-8">
        {selectedCategory && currentCategory ? renderCategoryDetail() : renderAllCategories()}
      </div>
    </div>
  );
}
