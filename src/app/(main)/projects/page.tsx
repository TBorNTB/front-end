import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProjectsContent from './_components/ProjectsContent';

// Loading fallback component
function ProjectsLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-3 sm:px-4 lg:px-10 py-10">
        <div className="text-center mb-8">
          <div className="h-10 bg-gray-200 rounded w-48 mx-auto mb-4 animate-pulse" />
          <div className="h-6 bg-gray-200 rounded w-96 mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-200">
              <div className="h-48 bg-gray-200 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-6 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<ProjectsLoadingSkeleton />}>
        <ProjectsContent />
      </Suspense>
      <Footer />
    </>
  );
}
