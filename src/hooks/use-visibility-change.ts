
'use client';

import { useEffect, useRef } from 'react';

export function useVisibilityChange(onVisibilityChange: () => void) {
  const callbackRef = useRef(onVisibilityChange);
  callbackRef.current = onVisibilityChange;

  useEffect(() => {
    const handleVisibilityChange = () => {
      callbackRef.current();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}
