// app/profile/ProfileContent.tsx
'use client';

import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { Badge } from '@/components/ui/badge';
import { 
  Edit3, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Eye,
  Heart,
  MessageCircle,
  BookOpen,
  ThumbsUp as Like,
  Award
} from 'lucide-react';
import Link from 'next/link';

const userData = {
  id: 1,
  name: '김민수',
  email: 'minsu.kim@ssg.ac.kr',
  phone: '010-1234-5678',
  location: '서울, 대한민국',
  joinDate: '2023.03.15',
  role: 'Security Researcher',
  bio: '웹 보안과 침투 테스팅에 관심이 많은 보안 연구원입니다. OWASP Top 10을 중심으로 한 취약점 분석과 CTF 문제 해결을 즐깁니다.',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
  stats: {
    articlesWritten: 12,
    totalViews: 3420,
    totalLikes: 156,
    commentsReceived: 89,
    badgesEarned: 5,
    currentStreak: 7
  }
};

const recentActivity = [
  {
    id: 1,
    type: 'article',
    title: 'Advanced SQL Injection Techniques in 2024',
    date: '2024.10.15',
    views: 342,
    likes: 23
  },
  {
    id: 2,
    type: 'comment',
    title: 'CTF WriteUp: HackTheBox - Pilgrimage',
    date: '2024.10.12',
    action: '댓글 작성'
  },
  {
    id: 3,
    type: 'badge',
    title: 'Security Expert 배지 획득',
    date: '2024.10.10',
    action: '배지 획득'
  }
];

export default function ProfileContent() {

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex flex-col items-center lg:items-start">
            <div className="relative">
              <ImageWithFallback
                src={userData.avatar}
                alt={userData.name}
                width={120}
                height={120}
                className="w-30 h-30 rounded-full object-cover border-4 border-primary-200"
              />
              <button className="absolute bottom-2 right-2 btn btn-primary btn-sm rounded-full p-2">
                <Edit3 className="h-4 w-4" />
              </button>
            </div>
            <Link href="/profile/settings" className="btn btn-primary mt-4">
              프로필 편집
            </Link>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{userData.name}</h1>
              <Badge className="bg-primary-500/20 text-primary-700 border-primary-400/50">
                {userData.role}
              </Badge>
            </div>
            
            <p className="text-gray-700 mb-6 leading-relaxed">{userData.bio}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary-600" />
                <span>{userData.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary-600" />
                <span>{userData.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary-600" />
                <span>{userData.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary-600" />
                <span>가입일: {userData.joinDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div className="card text-center">
          <BookOpen className="h-6 w-6 text-primary-600 mx-auto mb-2" />
          <div className="text-lg font-bold text-foreground mb-1">{userData.stats.articlesWritten}</div>
          <div className="text-gray-600 text-xs">작성한 글</div>
        </div>
        <div className="card text-center">
          <Eye className="h-6 w-6 text-secondary-600 mx-auto mb-2" />
          <div className="text-lg font-bold text-foreground mb-1">{userData.stats.totalViews.toLocaleString()}</div>
          <div className="text-gray-600 text-xs">총 조회수</div>
        </div>
        <div className="card text-center">
          <Like className="h-6 w-6 text-error mx-auto mb-2" />
          <div className="text-lg font-bold text-foreground mb-1">{userData.stats.totalLikes}</div>
          <div className="text-gray-600 text-xs">받은 좋아요</div>
        </div>
        <div className="card text-center">
          <MessageCircle className="h-6 w-6 text-warning mx-auto mb-2" />
          <div className="text-lg font-bold text-foreground mb-1">{userData.stats.commentsReceived}</div>
          <div className="text-gray-600 text-xs">받은 댓글</div>
        </div>
        <div className="card text-center">
          <Award className="h-6 w-6 text-purple-600 mx-auto mb-2" />
          <div className="text-lg font-bold text-foreground mb-1">{userData.stats.badgesEarned}</div>
          <div className="text-gray-600 text-xs">획득 배지</div>
        </div>
      </div>

      {/* Recent Activity Preview */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-foreground">최근 활동</h2>
          <Link href="/profile/activity" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
            전체보기 →
          </Link>
        </div>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className={`p-2 rounded-full ${
                activity.type === 'article' ? 'bg-primary-500/20 text-primary-700' :
                activity.type === 'comment' ? 'bg-secondary-500/20 text-secondary-700' :
                activity.type === 'badge' ? 'bg-purple-500/20 text-purple-700' :
                'bg-gray-500/20 text-gray-700'
              }`}>
                {activity.type === 'article' ? <BookOpen className="h-4 w-4" /> :
                 activity.type === 'comment' ? <MessageCircle className="h-4 w-4" /> :
                 activity.type === 'badge' ? <Award className="h-4 w-4" /> :
                 <BookOpen className="h-4 w-4" />}
              </div>
              
              <div className="flex-1">
                <h3 className="font-medium text-foreground">{activity.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <span>{activity.date}</span>
                  {activity.action && <span className="text-primary-600">{activity.action}</span>}
                  {activity.views && (
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{activity.views}</span>
                    </div>
                  )}
                  {activity.likes && (
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      <span>{activity.likes}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
