
'use client';

import { useEffect, useRef } from 'react';

export function useVisibilityChange(onHidden: () => void) {
  const onHiddenRef = useRef(onHidden);
  onHiddenRef.current = onHidden;

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        onHiddenRef.current();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}
