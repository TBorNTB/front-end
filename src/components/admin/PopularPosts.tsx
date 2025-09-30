"use client";

const popularPosts = [
  {
    id: 1,
    type: "아티클",
    title: "CSRF 토큰은 어떻게 동작하는가?",
    metric: "조회수 1,204",
    typeColor: "bg-blue-100 text-blue-800",
  },
  {
    id: 2,
    type: "프로젝트",
    title: "XSS 패턴 자동 탐지 스캐너",
    metric: "좋아요 128",
    typeColor: "bg-green-100 text-green-800",
  },
  {
    id: 3,
    type: "아티클",
    title: "PE 파일 구조 완전 정복",
    metric: "조회수 980",
    typeColor: "bg-blue-100 text-blue-800",
  },
];

export default function PopularPosts() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">최근 인기 게시물</h3>
      
      <div className="space-y-4">
        {popularPosts.map((post) => (
          <div key={post.id} className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${post.typeColor}`}>
              {post.type}
            </span>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {post.title}
              </h4>
              <p className="text-sm text-gray-700 mt-1">
                {post.metric}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
