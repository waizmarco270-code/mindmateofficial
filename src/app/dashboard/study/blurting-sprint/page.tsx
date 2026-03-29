
'use client';

import { useEffect } from 'react';
import { BlurtingSprint } from '@/components/study/blurting-sprint';
import { useImmersive } from '@/hooks/use-immersive';

export default function BlurtingSprintPage() {
  const { setIsImmersive } = useImmersive();

  useEffect(() => {
    setIsImmersive(true);
    return () => setIsImmersive(false);
  }, [setIsImmersive]);

  return <BlurtingSprint />;
}
