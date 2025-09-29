'use client'

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { User, Activity, Settings, Users, Edit3 } from 'lucide-react';

export default function MyPage() {
  const [activeTab, setActiveTab] = useState('profile');

  const menuItems = [
    { id: 'profile', label: '내 프로필', icon: <User size={20} /> },
    { id: 'activity', label: '나의 활동', icon: <Activity size={20} /> },
    { id: 'settings', label: '계정 설정', icon: <Settings size={20} /> },
    { id: 'feed', label: '동료 피드', icon: <Users size={20} /> },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-cyan-300 mb-8 glow-text">마이페이지</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-black/70 border border-cyan-500/20 rounded-xl p-6 shadow-lg shadow-cyan-500/10">
                <nav className="space-y-2">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left ${
                        activeTab === item.id
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-lg shadow-cyan-500/30'
                          : 'text-cyan-200 hover:bg-cyan-500/10 hover:border-cyan-500/30'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeTab === 'profile' && (
                <div className="bg-black/70 border border-cyan-500/20 rounded-xl p-6 shadow-lg shadow-cyan-500/10">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-cyan-300 glow-text-subtle">내 정보</h2>
                    <button className="flex items-center space-x-2 bg-black/50 border border-cyan-500/30 text-cyan-300 px-4 py-2 rounded-lg hover:bg-black/30 hover:border-cyan-400 transition-all">
                      <Edit3 size={16} />
                      <span>수정</span>
                    </button>
                  </div>
                  
                  <div className="text-cyan-200/70 mb-8">
                    미 정보는 다른 멤버에게만 보여집니다.
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-cyan-200 mb-2">이름</label>
                        <div className="bg-black/50 border border-cyan-500/20 p-4 rounded-lg text-cyan-100">김민준</div>
                      </div>
                      <div>
                        <label className="block text-cyan-200 mb-2">닉네임</label>
                        <div className="bg-black/50 border border-cyan-500/20 p-4 rounded-lg text-cyan-100">minjun.dev</div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-cyan-200 mb-2">이메일 주소</label>
                      <div className="bg-black/50 border border-cyan-500/20 p-4 rounded-lg text-cyan-100">dev.minjun@email.com</div>
                    </div>

                    <div>
                      <label className="block text-cyan-200 mb-2">한 줄 소개</label>
                      <div className="bg-black/50 border border-cyan-500/20 p-4 rounded-lg text-cyan-100 leading-relaxed">
                        React와 TypeScript를 사용하여 프론트엔드 개발에 집중하고 있습니다.
                      </div>
                    </div>

                    <div>
                      <label className="block text-cyan-200 mb-2">주요 기술 스택</label>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-black px-3 py-1 rounded-full text-sm shadow-lg shadow-cyan-500/30">React</span>
                        <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm shadow-lg shadow-blue-500/30">TypeScript</span>
                        <span className="bg-gradient-to-r from-green-500 to-cyan-500 text-black px-3 py-1 rounded-full text-sm shadow-lg shadow-green-500/30">Next.js</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-cyan-200 mb-2">상세 소개</label>
                      <div className="bg-black/50 border border-cyan-500/20 p-4 rounded-lg text-cyan-100 leading-relaxed">
                        사용자에게 좋은 경험을 제공하는 인터페이스 및 기능에 관심이 많습니다...
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="bg-black/70 border border-cyan-500/20 rounded-xl p-6 shadow-lg shadow-cyan-500/10">
                  <h2 className="text-2xl font-bold text-cyan-300 mb-6 glow-text-subtle">나의 활동</h2>
                  <div className="text-cyan-200/70 text-center py-12">
                    활동 내역이 곧 업데이트될 예정입니다.
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="bg-black/70 border border-cyan-500/20 rounded-xl p-6 shadow-lg shadow-cyan-500/10">
                  <h2 className="text-2xl font-bold text-cyan-300 mb-6 glow-text-subtle">계정 설정</h2>
                  <div className="text-cyan-200/70 text-center py-12">
                    계정 설정 기능이 곧 추가될 예정입니다.
                  </div>
                </div>
              )}

              {activeTab === 'feed' && (
                <div className="bg-black/70 border border-cyan-500/20 rounded-xl p-6 shadow-lg shadow-cyan-500/10">
                  <h2 className="text-2xl font-bold text-cyan-300 mb-6 glow-text-subtle">동료 피드</h2>
                  <div className="text-cyan-200/70 text-center py-12">
                    동료 피드 기능이 곧 추가될 예정입니다.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}