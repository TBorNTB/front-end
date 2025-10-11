'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { Calendar, User, Eye, Heart, MessageCircle, Search, Filter, Bookmark, Plus, TrendingUp } from 'lucide-react';
import { useState } from 'react';

const articles = [
  {
    id: 1,
    title: 'Advanced SQL Injection Techniques in 2024',
    excerpt: 'SQL 인젝션 공격의 최신 동향과 고급 기법들을 분석하고, 효과적인 방어 방법을 제시합니다.',
    content: 'SQL 인젝션은 여전히 OWASP Top 10에서 중요한 위치를 차지하고 있는 웹 애플리케이션 취약점입니다...',
    category: 'Web Security',
    author: '김민수',
    date: '2024.03.15',
    readTime: '8분',
    views: 342,
    likes: 23,
    comments: 5,
    featured: true,
    tags: ['SQL Injection', 'Web Security', 'OWASP', 'Penetration Testing'],
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcWwlMjBpbmplY3Rpb24lMjBzZWN1cml0eXxlbnwxfHx8fDE3NTc1NjM5NTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  {
    id: 2,
    title: 'CTF WriteUp: HackTheBox - Pilgrimage',
    excerpt: 'HackTheBox의 Pilgrimage 머신 해결 과정을 상세히 분석하고, 학습 포인트를 정리했습니다.',
    content: 'Pilgrimage는 Medium 난이도의 Linux 머신으로, ImageMagick 취약점을 활용하는 문제입니다...',
    category: 'CTF',
    author: '박지영',
    date: '2024.03.12',
    readTime: '12분',
    views: 156,
    likes: 18,
    comments: 8,
    featured: false,
    tags: ['CTF', 'HackTheBox', 'Linux', 'ImageMagick', 'CVE'],
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdGYlMjBjb21wZXRpdGlvbiUyMGhhY2tpbmd8ZW58MXx8fHwxNzU3NTYzOTUxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  {
    id: 3,
    title: '악성코드 분석 실전 가이드',
    excerpt: '실제 악성코드 샘플을 통한 정적/동적 분석 방법론과 도구 사용법을 상세히 설명합니다.',
    content: '악성코드 분석은 사이버보안 분야에서 핵심적인 역량 중 하나입니다. 이 글에서는...',
    category: 'Malware Analysis',
    author: '이준호',
    date: '2024.03.10',
    readTime: '15분',
    views: 289,
    likes: 31,
    comments: 12,
    featured: false,
    tags: ['Malware', 'Reverse Engineering', 'IDA Pro', 'Ghidra', 'Static Analysis'],
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWx3YXJlJTIwYW5hbHlzaXMlMjBzZWN1cml0eXxlbnwxfHx8fDE3NTc1NjM5NTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  {
    id: 4,
    title: 'OSINT를 활용한 디지털 포렌식',
    excerpt: '공개된 정보를 활용하여 디지털 포렌식 조사를 수행하는 방법과 주요 도구들을 소개합니다.',
    content: 'OSINT(Open Source Intelligence)는 공개적으로 이용 가능한 정보를 수집하고 분석하는...',
    category: 'Digital Forensics',
    author: '최수진',
    date: '2024.03.08',
    readTime: '10분',
    views: 198,
    likes: 15,
    comments: 6,
    featured: false,
    tags: ['OSINT', 'Digital Forensics', 'Investigation', 'Maltego', 'Shodan'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvc2ludCUyMGZvcmVuc2ljcyUyMGludmVzdGlnYXRpb258ZW58MXx8fHwxNzU3NTYzOTUxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  {
    id: 5,
    title: '네트워크 보안 모니터링 자동화',
    excerpt: 'Python과 Scapy를 이용하여 네트워크 트래픽을 실시간으로 모니터링하고 이상징후를 탐지하는 시스템을 구축하는 방법을 설명합니다.',
    content: '네트워크 보안에서 실시간 모니터링은 매우 중요한 요소입니다. 이 글에서는...',
    category: 'Network Security',
    author: '정우현',
    date: '2024.03.05',
    readTime: '11분',
    views: 234,
    likes: 19,
    comments: 9,
    featured: false,
    tags: ['Network Security', 'Python', 'Scapy', 'Monitoring', 'Automation'],
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXR3b3JrJTIwc2VjdXJpdHklMjBtb25pdG9yaW5nfGVufDF8fHx8MTc1NzU2Mzk1MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  {
    id: 6,
    title: '암호화 프로토콜의 이해와 구현',
    excerpt: 'TLS/SSL 프로토콜의 작동 원리를 분석하고, Python으로 간단한 암호화 통신을 구현해보는 실습을 진행합니다.',
    content: 'TLS(Transport Layer Security)는 현대 인터넷 통신에서 필수적인 보안 프로토콜입니다...',
    category: 'Cryptography',
    author: '강예린',
    date: '2024.03.02',
    readTime: '14분',
    views: 167,
    likes: 22,
    comments: 4,
    featured: false,
    tags: ['Cryptography', 'TLS/SSL', 'Python', 'Protocol', 'Implementation'],
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcnlwdG9ncmFwaHklMjBlbmNyeXB0aW9ufGVufDF8fHx8MTc1NzU2Mzk1MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  }
];

const categories = ['All', 'Web Security', 'CTF', 'Malware Analysis', 'Digital Forensics', 'Network Security', 'Cryptography'];

// This is now the main page component - note it's NOT named ArticlesPage
export default function ArticlesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // For demonstration, we'll assume current user is 'member' 
  // In a real app, this would come from authentication context
  const currentUser: 'guest' | 'member' | 'admin' | null = 'member';

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredArticle = articles.find(a => a.featured);
  const regularArticles = filteredArticles.filter(a => !a.featured);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      {/* Background Effects using SSG Theme Colors */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/5 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/5 right-1/4 w-64 h-64 bg-secondary-500/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-0 w-px h-full bg-gradient-to-b from-transparent via-primary-500/10 to-transparent"></div>
        <div className="absolute top-1/2 right-0 w-px h-full bg-gradient-to-b from-transparent via-primary-500/10 to-transparent"></div>
      </div>

      <div className="relative">
        {/* Header Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-5xl mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500">
                Knowledge Base
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                SSG 멤버들이 공유하는 보안 지식과 경험을 담은 아티클들입니다.<br />
                실전 경험과 연구 결과를 바탕으로 한 유용한 정보들을 확인하세요.
              </p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-12">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-500" />
                <input
                  type="text"
                  placeholder="아티클 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-primary-200 rounded-lg 
                           text-foreground placeholder-gray-500 focus:border-primary-400 
                           focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all duration-300"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-primary-500" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-white border border-primary-200 rounded-lg px-4 py-3 text-foreground 
                           focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all duration-300"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Write Article Button (for members/admin) */}
              {(currentUser === 'member' || currentUser === 'admin') && (
                <button className="btn btn-primary btn-lg flex items-center space-x-2 hover:scale-105">
                  <Plus className="h-5 w-5" />
                  <span>글 쓰기</span>
                </button>
              )}
            </div>

            {/* Trending Topics */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <TrendingUp className="h-6 w-6 text-primary-500 mr-3" />
                <h2 className="text-2xl text-primary-700">Trending Topics</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {['SQL Injection', 'CTF', 'Malware Analysis', 'OSINT', 'Network Security', 'Cryptography'].map((topic, index) => (
                  <button
                    key={index}
                    className="bg-primary-50 hover:bg-primary-100 border border-primary-200 
                             rounded-full px-4 py-2 text-primary-700 transition-all duration-300 
                             hover:shadow-md hover:border-primary-300 hover:scale-105"
                  >
                    #{topic}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Article */}
        {featuredArticle && selectedCategory === 'All' && (
          <section className="py-12 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center mb-8">
                <Badge className="bg-warning/20 text-warning border-warning/50 mr-4">
                  Featured Article
                </Badge>
                <h2 className="text-3xl text-primary-700">이번 주 추천 글</h2>
              </div>
              
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 
                              rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative card hover:shadow-xl transition-all duration-500">
                  <div className="md:flex">
                    <div className="md:w-1/2 relative">
                      <ImageWithFallback 
                        src={featuredArticle.image} 
                        alt={featuredArticle.title}
                        width={600}
                        height={400}
                        className="w-full h-64 md:h-full object-cover rounded-l-xl"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent rounded-l-xl"></div>
                      <Badge className="absolute top-4 left-4 bg-primary-500/20 text-primary-700 border-primary-400/50">
                        {featuredArticle.category}
                      </Badge>
                    </div>
                    
                    <div className="md:w-1/2 p-8">
                      <h3 className="text-3xl text-foreground mb-4 leading-tight">{featuredArticle.title}</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">{featuredArticle.excerpt}</p>
                      
                      <div className="flex items-center space-x-6 mb-6 text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{featuredArticle.author}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{featuredArticle.date}</span>
                        </div>
                        <span>{featuredArticle.readTime} 읽기</span>
                      </div>
                      
                      <div className="flex items-center space-x-6 mb-6 text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{featuredArticle.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4" />
                          <span>{featuredArticle.likes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{featuredArticle.comments}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                        {featuredArticle.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" 
                                className="bg-secondary-50 text-secondary-700 border-secondary-300 text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <button className="btn btn-primary btn-lg hover:scale-105">
                        전체 글 읽기
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Articles Grid */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            {regularArticles.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-gray-500 text-xl">검색 결과가 없습니다.</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {regularArticles.map((article) => (
                  <div key={article.id} className="group relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 
                                  rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative card hover:shadow-xl cursor-pointer group-hover:scale-105 transition-all duration-500">
                      
                      <div className="relative">
                        <ImageWithFallback 
                          src={article.image} 
                          alt={article.title}
                          width={400}
                          height={200}
                          className="w-full h-48 object-cover rounded-t-xl opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-t-xl"></div>
                        
                        <Badge className="absolute top-4 left-4 bg-primary-500/20 text-primary-700 border-primary-400/50 text-xs">
                          {article.category}
                        </Badge>
                        
                        {(currentUser === 'member' || currentUser === 'admin') && (
                          <button className="absolute top-4 right-4 text-primary-500 hover:text-primary-700 
                                           transition-colors duration-300">
                            <Bookmark className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                      
                      <div className="p-6">
                        <h3 className="text-xl text-foreground mb-3 line-clamp-2 group-hover:text-primary-700 transition-colors duration-300">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                          {article.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{article.author}</span>
                          </div>
                          <span>{article.date}</span>
                          <span>{article.readTime}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Eye className="h-3 w-3" />
                              <span>{article.views}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Heart className="h-3 w-3" />
                              <span>{article.likes}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="h-3 w-3" />
                              <span>{article.comments}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {article.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" 
                                  className="text-xs bg-secondary-50 text-secondary-700 border-secondary-300">
                              {tag}
                            </Badge>
                          ))}
                          {article.tags.length > 3 && (
                            <Badge variant="outline" 
                                  className="text-xs bg-secondary-50 text-secondary-700 border-secondary-300">
                              +{article.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Newsletter Section */}
        {(currentUser === 'member' || currentUser === 'admin') && (
          <section className="py-20 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 
                              rounded-2xl blur"></div>
                <div className="relative card p-12">
                  <h2 className="text-4xl mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500">
                    Stay Updated
                  </h2>
                  <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                    새로운 보안 트렌드와 SSG의 최신 아티클을 이메일로 받아보세요.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                    <input
                      type="email"
                      placeholder="이메일 주소"
                      className="flex-1 px-4 py-3 bg-white border border-primary-200 rounded-lg 
                               text-foreground placeholder-gray-500 focus:border-primary-400 
                               focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all duration-300"
                    />
                    <button className="btn btn-primary px-8 py-3 hover:scale-105 whitespace-nowrap">
                      구독하기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
      <Footer />
    </div>
      
  );
}
