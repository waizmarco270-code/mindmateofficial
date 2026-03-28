
'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Logo({ className, ...props }: { className?: string }) {
  return (
    <div 
      className={cn("relative h-10 w-10 overflow-hidden rounded-xl", className)} {...props}
    >
      <Image
        src="https://mindmate.emitygate.com/logo.jpg?v=3"
        alt="MindMate Logo"
        fill
        sizes="(max-width: 768px) 10vw, (max-width: 1200px) 5vw, 5vw"
        style={{ objectFit: 'cover' }}
        priority
        unoptimized // Prevent Next.js from processing remote images if they are external
      />
    </div >
  );
}
