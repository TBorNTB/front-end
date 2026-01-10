"use client";

import { 
  Award, 
  Trophy, 
  BookOpen,
} from 'lucide-react';

export default function Activities() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="container mx-auto px-4 py-8 flex-1">
        
        {/* Activities Section */}
        <section className="section py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-primary-700 mb-4">주요 활동</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                SSG는 다양한 학술 활동과 실무 경험을 통해 회원들의 역량을 개발합니다
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="card text-center hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <div className="p-4 bg-primary-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Trophy className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-primary-700 mb-3">경진대회 참가</h3>
                <p className="text-gray-600">
                  국내외 보안 경진대회 및 해커톤에 적극 참여하여 실력을 검증받고 있습니다.
                </p>
              </div>
              
              <div className="card text-center hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <div className="p-4 bg-secondary-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-secondary-600" />
                </div>
                <h3 className="text-xl font-semibold text-primary-700 mb-3">연구 발표</h3>
                <p className="text-gray-600">
                  보안 컨퍼런스에서 연구 결과를 발표하고 보안 커뮤니티와 지식을 공유합니다.
                </p>
              </div>
              
              <div className="card text-center hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <div className="p-4 bg-warning/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Award className="h-8 w-8 text-warning" />
                </div>
                <h3 className="text-xl font-semibold text-primary-700 mb-3">취약점 제보</h3>
                <p className="text-gray-600">
                  소프트웨어 취약점을 발견하고 제보하여 보안 생태계 발전에 기여하고 있습니다.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}