
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
  typingSpeed = 30,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const id = useId(); 

  useEffect(() => {
    setDisplayedText(''); 
    
    let i = 0;
    const intervalId = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(prev => prev + text.charAt(i));
        i++;
      } else {
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
