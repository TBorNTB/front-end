// app/(pages)/topics/page.tsx
import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { TopicsClient } from './LearningTopics';

function TopicsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="text-center mb-8">
          <div className="h-10 bg-gray-200 rounded animate-pulse mb-4 max-w-md mx-auto"></div>
          <div className="h-6 bg-gray-200 rounded animate-pulse max-w-2xl mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TopicsPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<TopicsLoading />}>
        <TopicsClient />
      </Suspense>
      <Footer />
    </>
  );
}
