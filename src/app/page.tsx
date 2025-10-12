import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import HeroBanner from "@/components/landing/HeroBanner";
import { ProjectCardHome } from "@/components/landing/ProjectCardHome";
import { ArticleCardHome } from "@/components/landing/ArticleCardHome";
import { FeaturedProjectCard } from "@/components/landing/FeaturedCardHome";
import Topics from "@/components/landing/Topics";
import StatisticsSection from "@/components/landing/Statistics";

// Mock data matching the design
const featuredProject = {
  id: "featured-1",
  title: "Open Source Intelligence (OSINT) Dashboard",
  description: "A web-based dashboard that aggregates and visualizes publicly available data from various online sources",
  category: "오픈소스",
  status: "LATEST PROJECT",
  technologies: ["Python", "Elasticsearch", "React", "MongoDB"],
  thumbnailImage: "/images/projects/osint-dashboard.jpg",
  viewText: "자세히 보기"
};

const projectsData = [
  {
    id: "1",
    title: "Zero Trust Architecture",
    description: "Implementing comprehensive zero trust security framework for enterprise environments",
    status: "Active",
    category: "보안 아키텍처",
    collaborators: [
      { profileImage: "/images/profiles/user1.jpg" },
      { profileImage: "/images/profiles/user2.jpg" },
      { profileImage: "/images/profiles/user3.jpg" }
    ],
    likes: 75
  },
  {
    id: "2", 
    title: "AI Threat Detection",
    description: "Machine learning models for real-time threat identification and response automation",
    status: "In Progress",
    category: "AI/ML 보안",
    collaborators: [
      { profileImage: "/images/profiles/user4.jpg" },
      { profileImage: "/images/profiles/user5.jpg" }
    ],
    likes: 89
  },
  {
    id: "3",
    title: "Blockchain Security Audit", 
    description: "Comprehensive security assessment framework for blockchain applications and smart contracts",
    status: "Planning",
    category: "블록체인",
    collaborators: [
      { profileImage: "/images/profiles/user6.jpg" },
      { profileImage: "/images/profiles/user7.jpg" },
      { profileImage: "/images/profiles/user8.jpg" },
      { profileImage: "/images/profiles/user9.jpg" }
    ],
    likes: 92
  }
];

const articlesData = [
  {
    id: "1",
    title: "The Evolution of Ransomware Attacks in 2024",
    description: "Exploring the latest ransomware techniques and how organizations can protect themselves against evolving threats",
    author: {
      name: "Sarah Chen",
      profileImage: "/images/authors/sarah.jpg"
    },
    category: "Security",
    thumbnailImage: "/images/articles/ransomware-2024.jpg",
    likes: 156,
    comments: 34
  },
  {
    id: "2",
    title: "AI-Powered Threat Detection: Future or Fiction?", 
    description: "Analyzing the current state of AI in cybersecurity and its potential to revolutionize threat detection",
    author: {
      name: "Sarah Chen",
      profileImage: "/images/authors/sarah.jpg"
    },
    category: "AI Security", 
    thumbnailImage: "/images/articles/ai-threat-detection.jpg",
    likes: 203,
    comments: 67
  }
];

export default function Home() {
  return (
    <>
      <div className="min-h-screen bg-background">
        <Header />
        
        {/* Hero Section */}
        <div className="w-screen text-center text-3xl text-white sm:h-[250px] md:h-[400px]">
          <HeroBanner />
        </div>
        <StatisticsSection />

        <Topics />


        {/* Latest Project Section */}
        <section className="section bg-gray-50">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Text Content */}
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  LATEST<br />
                  PROJECT
                </h2>
                <p className="text-gray-600 text-lg mb-6">
                  최신의 보안 기술과 오픈소스를 활용한<br />
                  실무에 적용 가능한 솔루션입니다.
                </p>
                <button className="btn btn-primary btn-lg">
                  프로젝트 더보기
                </button>
              </div>

              {/* Right Side - Featured Project Card */}
              <div>
                <FeaturedProjectCard project={featuredProject} />
              </div>
            </div>

            {/* Projects Grid */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projectsData.map((project) => (
                <ProjectCardHome key={project.id} project={project} />
              ))}
            </div>
          </div>
        </section>

        {/* Latest Articles Section */}
        <section className="section bg-background">
          <div className="container">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Latest Articles</h2>
            <p className="text-gray-600 mb-12">Stay informed with expert insights</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {articlesData.map((article) => (
                <ArticleCardHome key={article.id} article={article} />
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
