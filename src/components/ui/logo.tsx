
import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Logo({ className, ...props }: { className?: string }) {
  return (
    <div 
      className={cn("relative h-10 w-10", className)} {...props}
    >
      <Image
        src="/logo.png"
        alt="MindMate Logo"
        fill
        sizes="(max-width: 768px) 10vw, (max-width: 1200px) 5vw, 5vw"
        style={{ objectFit: 'contain' }}
        priority
      />
    </div >
  );
}
