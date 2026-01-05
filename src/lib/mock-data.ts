import { USE_MOCK_DATA } from '@/lib/api/env';
import { CategoryType, CategoryDisplayNames, CategoryDescriptions } from '@/app/(main)/topics/types/category';

export type Project = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  projectStatus: 'IN_PROGRESS' | 'COMPLETED' | 'PLANNING' | 'ARCHIVED';
  projectCategories: string[];
  projectTechStacks: string[];
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  viewCount: number;
};

export type Article = {
  id: string;
  content: {
    title: string;
    summary: string;
    content: string;
    category: string;
  };
  thumbnailPath: string;
  writerId: string;
  participantIds: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  viewCount: number;
};

export type CategoryItem = {
  id: number;
  name: string;
  description: string;
};

export type Statistics = {
  projectCount: number;
  articleCount: number;
  userCount: number;
  csCount: number;
};

const now = new Date().toISOString();

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'Cloud SIEM Automation',
    description: 'Serverless pipeline that ingests multi-cloud logs and auto-triages alerts.',
    thumbnailUrl: '/images/projects/cloud-siem.jpg',
    projectStatus: 'IN_PROGRESS',
    projectCategories: ['WEB_HACKING'],
    projectTechStacks: ['AWS Lambda', 'Python', 'Terraform'],
    createdAt: now,
    updatedAt: now,
    likeCount: 42,
    viewCount: 1280,
  },
  {
    id: 'proj-2',
    title: 'Malware Sandbox',
    description: 'Isolated analysis lab with dynamic behavior capture and YARA tagging.',
    thumbnailUrl: '/images/projects/malware-sandbox.jpg',
    projectStatus: 'COMPLETED',
    projectCategories: ['REVERSING'],
    projectTechStacks: ['Go', 'gRPC', 'PostgreSQL'],
    createdAt: now,
    updatedAt: now,
    likeCount: 58,
    viewCount: 1911,
  },
  {
    id: 'proj-3',
    title: 'Threat Intel Aggregator',
    description: 'Feeds-based indicator collector with enrichment and scoring.',
    thumbnailUrl: '/images/projects/threat-intel.jpg',
    projectStatus: 'PLANNING',
    projectCategories: ['NETWORK_SECURITY'],
    projectTechStacks: ['TypeScript', 'Next.js', 'Redis'],
    createdAt: now,
    updatedAt: now,
    likeCount: 21,
    viewCount: 830,
  },
  {
    id: 'proj-4',
    title: 'Crypto Wallet Auditor',
    description: 'Static + dynamic analyzer for wallet binaries and signing flows.',
    thumbnailUrl: '/images/projects/crypto-wallet.jpg',
    projectStatus: 'IN_PROGRESS',
    projectCategories: ['CRYPTOGRAPHY'],
    projectTechStacks: ['Rust', 'WASM', 'React'],
    createdAt: now,
    updatedAt: now,
    likeCount: 36,
    viewCount: 1240,
  },
];

export const MOCK_ARTICLES: Article[] = [
  {
    id: 'art-1',
    content: {
      title: '워크플로 분석 실제 가이드',
      summary: '워크플로를 체계적으로 분석하고 최적화하는 방법.',
      content: '워크플로 분석은 업무 프로세스를 개선하는데 필수적...',
      category: 'web-hacking',
    },
    thumbnailPath: '/images/articles/workflow.jpg',
    writerId: '김민수',
    participantIds: [],
    tags: ['워크플로', '분석'],
    createdAt: now,
    updatedAt: now,
    likeCount: 23,
    viewCount: 342,
  },
  {
    id: 'art-2',
    content: {
      title: 'OSINT를 활용한 디지털 포렌식',
      summary: '공개 정보 기반 포렌식 조사 절차와 주요 도구.',
      content: 'OSINT(Open Source Intelligence)는 공개 정보를...',
      category: 'digital-forensics',
    },
    thumbnailPath: '/images/articles/osint.jpg',
    writerId: '최수진',
    participantIds: [],
    tags: ['OSINT', '포렌식'],
    createdAt: now,
    updatedAt: now,
    likeCount: 15,
    viewCount: 198,
  },
  {
    id: 'art-3',
    content: {
      title: '리버싱 기초 가이드',
      summary: 'IDA Pro와 Ghidra를 활용한 바이너리 분석 입문.',
      content: '리버싱(역공학)은 컴파일된 바이너리 파일을 분석하여...',
      category: 'reversing',
    },
    thumbnailPath: '/images/articles/reversing.jpg',
    writerId: '박지영',
    participantIds: [],
    tags: ['리버싱', 'Ghidra'],
    createdAt: now,
    updatedAt: now,
    likeCount: 18,
    viewCount: 156,
  },
  {
    id: 'art-4',
    content: {
      title: '시스템 해킹 실전 기법',
      summary: 'Buffer Overflow와 ROP 체인 활용 익스플로잇.',
      content: '시스템 해킹은 운영체제와 시스템 레벨에서 발생하는...',
      category: 'system-hacking',
    },
    thumbnailPath: '/images/articles/system-hack.jpg',
    writerId: '이준호',
    participantIds: [],
    tags: ['시스템 해킹', 'ROP'],
    createdAt: now,
    updatedAt: now,
    likeCount: 31,
    viewCount: 289,
  },
];

export const MOCK_CATEGORIES: CategoryItem[] = Object.values(CategoryType).map((type, idx) => ({
  id: idx + 1,
  name: CategoryDisplayNames[type],
  description: CategoryDescriptions[type],
}));

export const MOCK_STATISTICS: Statistics = {
  projectCount: MOCK_PROJECTS.length,
  articleCount: MOCK_ARTICLES.length,
  userCount: 120,
  csCount: Object.keys(CategoryType).length,
};

export async function getProjects(): Promise<Project[]> {
  if (USE_MOCK_DATA) {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_PROJECTS;
  }
  return MOCK_PROJECTS;
}

export async function getArticles(): Promise<Article[]> {
  if (USE_MOCK_DATA) {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_ARTICLES;
  }
  return MOCK_ARTICLES;
}

export async function getCategories(): Promise<CategoryItem[]> {
  if (USE_MOCK_DATA) {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_CATEGORIES;
  }
  return MOCK_CATEGORIES;
}

export async function getStatistics(): Promise<Statistics> {
  if (USE_MOCK_DATA) {
    await new Promise((r) => setTimeout(r, 150));
    return MOCK_STATISTICS;
  }
  return MOCK_STATISTICS;
}
