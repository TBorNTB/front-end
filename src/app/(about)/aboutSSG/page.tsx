"use client";

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function AboutSSG() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        {/* Test your custom colors */}
        <p className="text-foreground text-base">
          This is the About SSG page
        </p>
      </main>
      <Footer />
    </div>
  );
}