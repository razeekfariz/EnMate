'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPortfolioRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin?tab=portfolio');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#040208] flex items-center justify-center text-white font-mono text-xs">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
        <p>Routing to Unified Portfolio Showcase Manager...</p>
      </div>
    </div>
  );
}
