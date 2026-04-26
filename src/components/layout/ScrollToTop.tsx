'use client';

import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="맨 위로 이동"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-white border-2 border-primary text-primary shadow-lg hover:bg-primary hover:text-white transition-all duration-200 flex items-center justify-center"
    >
      <ChevronUp className="w-6 h-6" />
    </button>
  );
}
