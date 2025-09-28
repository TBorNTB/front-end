import Footer from "@/components/layout/footer";

export default function Home() {
  return (
    <><div className="min-h-screen" style={{ backgroundColor: '#e2eefc' }}>
      <div className="container">
       
        {/* Test your custom colors */}
        <div className="bg-primary-800 text-white p-4 mb-4">
          Primary color background
        </div>

        {/* Test your button component */}
        <button className="btn btn-primary btn-lg">
          Test Button
        </button>

        <h1 className="text-4xl font-bold mb-4" style={{ color: '#060810' }}>
          세종대학교 정보보안 동아리 SSG
        </h1>

        <p className="text-lg mb-8" style={{ color: '#1f2937' }}>
          체계적인 보안 교육과 실무 경험을 통해 미래의 보안 전문가를 양성합니다.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="card">
            <h3 className="text-xl font-semibold mb-4" style={{ color: '#060810' }}>보안 교육</h3>
            <p style={{ color: '#1f2937' }}>체계적인 커리큘럼을 통한 정보보안 기초부터 고급 과정까지</p>
          </div>
          <div className="card">
            <h3 className="text-xl font-semibold mb-4" style={{ color: '#060810' }}>실무 프로젝트</h3>
            <p style={{ color: '#1f2937' }}>실제 보안 시나리오를 활용한 실습 및 프로젝트 진행</p>
          </div>
          <div className="card">
            <h3 className="text-xl font-semibold mb-4" style={{ color: '#060810' }}>네트워킹</h3>
            <p style={{ color: '#1f2937' }}>보안 전문가 및 업계 종사자와의 네트워킹 기회 제공</p>
          </div>
        </div>
      </div>
    </div><Footer /></>
  );
}

