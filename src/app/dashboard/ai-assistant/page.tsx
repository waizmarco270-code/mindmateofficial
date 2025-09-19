
'use client';

import { useImmersive } from '@/hooks/use-immersive';
import { useEffect } from 'react';

export default function AiAssistantPage() {
  const { setIsImmersive } = useImmersive();

  useEffect(() => {
    // Enter immersive mode when component mounts
    setIsImmersive(true);
    // Exit immersive mode when component unmounts
    return () => setIsImmersive(false);
  }, [setIsImmersive]);

  return (
    <div className="h-full w-full">
      <iframe
        src="https://aimindmate.vercel.app/"
        className="w-full h-full border-0 rounded-lg"
        title="Marco AI Assistant"
        allow="microphone"
      ></iframe>
    </div>
  );
}
