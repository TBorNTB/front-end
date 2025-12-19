"use client";

import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import NewsContent from './_components/NewsContent';

export default function SSGnews() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <Suspense fallback={
          <div className="w-full px-3 sm:px-4 lg:px-10 py-10">
            <div className="animate-pulse space-y-8">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        }>
          <NewsContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}