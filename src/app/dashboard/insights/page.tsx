
'use client';

import { InsightsView } from '@/components/insights/insights-view';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function InsightsPage() {
  return (
    <div className="space-y-4">
       <div className="flex items-center gap-4">
          <Link href="/dashboard" className="md:hidden">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Insights</h1>
      </div>
      <InsightsView />
    </div>
  );
}
