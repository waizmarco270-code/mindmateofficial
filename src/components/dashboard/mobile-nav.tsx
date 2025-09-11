
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, ListTodo, Zap, Trophy, Globe, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

const navItems = [
  { href: '/dashboard/todos', icon: ListTodo, label: 'To-Dos' },
  { href: '/dashboard/focus', icon: Zap, label: 'Focus' },
  { href: '/dashboard/ai-assistant', icon: Bot, label: 'Marco AI' },
  { href: '/dashboard/resources', icon: BookOpen, label: 'Resources' },
  { href: '/dashboard/leaderboard', icon: Trophy, label: 'Ranks' },
];

export default function MobileNav() {
  const pathname = usePathname();
  const activeIndex = navItems.findIndex(item => 
      (item.href === '/dashboard' && pathname === '/dashboard') ||
      (item.href !== '/dashboard' && pathname.startsWith(item.href))
  );

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 md:hidden">
      <div className="relative flex items-center h-16 gap-2 rounded-full border bg-background/80 backdrop-blur-lg p-2 shadow-lg">
        <AnimatePresence>
            {activeIndex !== -1 && (
                <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 h-full w-[68px] bg-primary rounded-full"
                    initial={{ x: activeIndex * 76 }}
                    animate={{ x: activeIndex * 76 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    style={{
                        left: '8px',
                    }}
                />
            )}
        </AnimatePresence>
        {navItems.map((item, index) => {
          const isActive = activeIndex === index;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={cn(
                'relative z-10 flex flex-col items-center justify-center w-16 h-full text-xs font-medium transition-colors rounded-full',
                isActive ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
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
