'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, ListTodo, Home, BookOpen, BrainCircuit, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard/todos', icon: ListTodo, label: 'To-Dos' },
  { href: '/dashboard/ai-assistant', icon: Bot, label: 'Marco AI' },
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/dashboard/resources', icon: BookOpen, label: 'Resources' },
  { href: '/dashboard/quiz', icon: BrainCircuit, label: 'Quiz' },
];

export default function MobileNav() {
  const pathname = usePathname();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 border-t bg-background/80 backdrop-blur-lg z-40 md:hidden">
      <div className="relative flex h-full items-center justify-around">
        {navItems.map((item) => {
          const isActive = 
              (item.href === '/dashboard' && pathname === '/dashboard') ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

          if (item.href === '/dashboard') {
            return (
                 <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    className="relative z-10 -top-5"
                  >
                    <div className="h-16 w-16 flex items-center justify-center rounded-full bg-destructive shadow-lg shadow-destructive/30">
                        <item.icon className="h-7 w-7 text-white" />
                    </div>
                </Link>
            )
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={cn(
                'relative z-10 flex flex-col items-center justify-center w-16 h-full text-xs font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
