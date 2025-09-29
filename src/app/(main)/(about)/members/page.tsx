"use client";

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { User, Github, Linkedin, Mail, Award, Calendar } from 'lucide-react';

const members = [
  {
    id: 1,
    name: '김민준',
    role: '회장',
    email: 'minjun@ssg.com',
    github: 'minjun-dev',
    linkedin: 'minjun-kim',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
    specialties: ['웹해킹', '포너블', '리버싱'],
    joinDate: '2022.03',
    achievements: ['CTF 1위', 'DEFCON 참가', '보안 논문 발표']
  },
  {
    id: 2,
    name: '이서연',
    role: '부회장',
    email: 'seoyeon@ssg.com',
    github: 'seoyeon-lee',
    linkedin: 'seoyeon-lee',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    specialties: ['암호학', '네트워크 보안', '포렌식'],
    joinDate: '2022.03',
    achievements: ['암호학 연구', 'KISA 인턴', '보안 컨퍼런스 발표']
  },
  {
    id: 3,
    name: '박준호',
    role: '기술팀장',
    email: 'junho@ssg.com',
    github: 'junho-park',
    linkedin: 'junho-park',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
    specialties: ['모바일 보안', '웹해킹', 'DevSecOps'],
    joinDate: '2022.09',
    achievements: ['모바일 앱 취약점 발견', 'Bug Bounty 수상', 'OWASP 기여']
  },
  {
    id: 4,
    name: '최유진',
    role: '교육팀장',
    email: 'yujin@ssg.com',
    github: 'yujin-choi',
    linkedin: 'yujin-choi',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
    specialties: ['리버싱', '악성코드 분석', 'AI 보안'],
    joinDate: '2023.03',
    achievements: ['악성코드 분석 도구 개발', 'AI 보안 연구', '국제 컨퍼런스 발표']
  },
  {
    id: 5,
    name: '정현우',
    role: '연구원',
    email: 'hyunwoo@ssg.com',
    github: 'hyunwoo-jung',
    linkedin: 'hyunwoo-jung',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
    specialties: ['블록체인 보안', '스마트 컨트랙트', 'DeFi'],
    joinDate: '2023.09',
    achievements: ['스마트 컨트랙트 감사', '블록체인 연구', 'DeFi 프로토콜 분석']
  },
  {
    id: 6,
    name: '한소영',
    role: '연구원',
    email: 'soyoung@ssg.com',
    github: 'soyoung-han',
    linkedin: 'soyoung-han',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
    specialties: ['클라우드 보안', 'DevOps', '컨테이너 보안'],
    joinDate: '2024.03',
    achievements: ['AWS 보안 인증', '쿠버네티스 보안', '클라우드 아키텍처 설계']
  }
];

const getRoleColor = (role: string) => {
  switch (role) {
    case '회장': return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
    case '부회장': return 'bg-purple-100 text-purple-800 border border-purple-300';
    case '기술팀장': return 'bg-blue-100 text-blue-800 border border-blue-300';
    case '교육팀장': return 'bg-green-100 text-green-800 border border-green-300';
    default: return 'bg-gray-100 text-gray-800 border border-gray-300';
  }
};

export default function Members() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#F5F5F5] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Members</h1>
            <p className="text-[#757B80] text-lg max-w-3xl mx-auto">
              SSG의 뛰어난 보안 전문가들을 만나보세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {members.map((member) => (
              <div key={member.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#3A4DA1] hover:shadow-lg transition-all hover-lift">
                <div className="text-center mb-6">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <img 
                      src={member.avatar} 
                      alt={member.name}
                      className="w-full h-full rounded-full object-cover border-2 border-gray-200"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(member.role)} shadow-lg`}>
                    {member.role}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-[#757B80] text-sm">
                    <Calendar size={16} />
                    <span>가입: {member.joinDate}</span>
                  </div>

                  <div>
                    <h4 className="text-gray-900 font-medium mb-2">전문 분야</h4>
                    <div className="flex flex-wrap gap-2">
                      {member.specialties.map((specialty) => (
                        <span 
                          key={specialty}
                          className="bg-gray-100 border border-gray-200 text-gray-700 px-2 py-1 rounded text-xs"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-gray-900 font-medium mb-2">주요 성과</h4>
                    <div className="space-y-1">
                      {member.achievements.map((achievement, index) => (
                        <div key={index} className="flex items-center space-x-2 text-[#757B80] text-sm">
                          <Award size={12} className="text-[#3A4DA1]" />
                          <span>{achievement}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-center space-x-4 pt-4 border-t border-gray-200">
                    <a href={`mailto:${member.email}`} className="text-[#757B80] hover:text-[#3A4DA1] transition-colors">
                      <Mail size={20} />
                    </a>
                    <a href={`https://github.com/${member.github}`} className="text-[#757B80] hover:text-[#3A4DA1] transition-colors">
                      <Github size={20} />
                    </a>
                    <a href={`https://linkedin.com/in/${member.linkedin}`} className="text-[#757B80] hover:text-[#3A4DA1] transition-colors">
                      <Linkedin size={20} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}