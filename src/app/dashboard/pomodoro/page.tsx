'use client';

import { useEffect } from 'react';
import { PomodoroTimer } from '@/components/pomodoro/pomodoro-timer';
import { useImmersive } from '@/hooks/use-immersive';

export default function PomodoroPage() {
  const { setIsImmersive } = useImmersive();

  useEffect(() => {
    // Enter immersive mode when the component mounts
    setIsImmersive(true);

    // Exit immersive mode when the component unmounts (user navigates away)
    return () => {
      setIsImmersive(false);
    };
  }, [setIsImmersive]);

  return <PomodoroTimer />;
}
