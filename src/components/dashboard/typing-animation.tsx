
'use client';

import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface TypingAnimationProps {
  text: string;
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
}

export const TypingAnimation: React.FC<TypingAnimationProps> = ({
  text,
  className,
  typingSpeed = 50, // Made slightly faster
  deletingSpeed = 30,
  pauseDuration = 3000, // Longer pause
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleTyping = () => {
      const fullText = text;
      const currentLength = displayedText.length;

      if (isDeleting) {
        if (currentLength > 0) {
          setDisplayedText(fullText.substring(0, currentLength - 1));
          timeoutId = setTimeout(handleTyping, deletingSpeed);
        } else {
          setIsDeleting(false);
          // Don't restart typing automatically, wait for next text prop change
        }
      } else {
        if (currentLength < fullText.length) {
          setDisplayedText(fullText.substring(0, currentLength + 1));
           timeoutId = setTimeout(handleTyping, typingSpeed);
        } else {
            // Once finished, it stays
        }
      }
    };
    
    handleTyping();

    return () => clearTimeout(timeoutId);
  }, [text, displayedText, isDeleting, typingSpeed, deletingSpeed, pauseDuration]);

  // Reset animation when text prop changes
  useEffect(() => {
    setDisplayedText('');
    setIsDeleting(false);
  }, [text]);


  return (
    <p className={cn(className)}>
      {displayedText}
      <span className="animate-pulse border-r-2 border-primary" aria-hidden="true"></span>
    </p>
  );
};
