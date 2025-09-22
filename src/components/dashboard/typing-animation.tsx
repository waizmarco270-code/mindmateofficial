
'use client';

import { useState, useEffect, useId } from 'react';
import { cn } from '@/lib/utils';

interface TypingAnimationProps {
  text: string;
  className?: string;
  typingSpeed?: number;
}

export const TypingAnimation: React.FC<TypingAnimationProps> = ({
  text,
  className,
  typingSpeed = 30, // Made it a bit faster
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const id = useId(); // Unique key for re-triggering animation

  useEffect(() => {
    setDisplayedText(''); // Reset on text change
    
    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayedText(prev => prev + text.charAt(i));
      i++;
      if (i >= text.length) {
        clearInterval(intervalId);
      }
    }, typingSpeed);

    return () => clearInterval(intervalId);
  }, [text, typingSpeed, id]);


  return (
    <p className={cn(className)}>
      {displayedText}
      <span className="animate-pulse border-r-2 border-primary" aria-hidden="true"></span>
    </p>
  );
};
