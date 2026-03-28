
'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LectureRedirect() {
  const router = useRouter();
  const { lectureId } = useParams();

  useEffect(() => {
    router.replace(`/dashboard/guide/${lectureId}`);
  }, [router, lectureId]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-primary">
        <Loader2 className="h-16 w-16 animate-spin" />
        <p className="font-black uppercase tracking-[0.3em] text-xs">Synchronizing Operational Briefing...</p>
      </div>
    </div>
  );
}
