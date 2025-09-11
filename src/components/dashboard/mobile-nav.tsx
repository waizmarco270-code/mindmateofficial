
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, ListTodo, Home, Trophy, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

const navItems = [
  { href: '/dashboard/todos', icon: ListTodo, label: 'To-Dos' },
  { href: '/dashboard/ai-assistant', icon: Bot, label: 'Marco AI' },
  { href: '/dashboard', icon: Home, label: 'Home' },
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
    <nav className="fixed bottom-0 left-0 right-0 h-16 border-t bg-background/80 backdrop-blur-lg z-40 md:hidden">
      <div className="relative flex h-full items-center justify-around">
         <AnimatePresence>
            {activeIndex !== -1 && navItems[activeIndex].href !== '/dashboard' && (
                <motion.div
                    layoutId="active-mobile-nav-pill"
                    className="absolute h-10 w-16 bg-primary rounded-full"
                    initial={false}
                    animate={{ x: (activeIndex - (navItems.length / 2) + 0.5) * 64 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
            )}
        </AnimatePresence>
        {navItems.map((item, index) => {
          const isActive = activeIndex === index;
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

    