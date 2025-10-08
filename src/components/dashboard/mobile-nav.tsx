
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gamepad2, Globe, Home, BookOpen, Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { href: '/dashboard/world', icon: Globe, label: 'World' },
  { href: '/dashboard/game-zone', icon: Gamepad2, label: 'Games' },
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/dashboard/resources', icon: BookOpen, label: 'Resources' },
  { href: '/dashboard/leaderboard', icon: Trophy, label: 'Leaderboard' },
];

interface MobileNavProps {
    isCollapsed: boolean;
    onToggleCollapse: (isCollapsed: boolean) => void;
}

export default function MobileNav({ isCollapsed, onToggleCollapse }: MobileNavProps) {
  const pathname = usePathname();
  
  return (
    <AnimatePresence>
        {!isCollapsed ? (
            <motion.nav
                key="nav-bar"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="fixed bottom-0 left-0 right-0 h-20 border-t bg-background/80 backdrop-blur-lg z-40 md:hidden"
            >
                <button 
                    onClick={() => onToggleCollapse(true)}
                    className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-6 bg-muted/80 backdrop-blur-sm rounded-t-lg flex items-center justify-center"
                >
                    <ChevronDown className="h-5 w-5 text-muted-foreground"/>
                </button>
                <div className="relative flex h-full items-center justify-around">
                    {navItems.map((item) => {
                    const isActive = 
                        (item.href === '/dashboard' && pathname === '/dashboard') ||
                        (item.href !== '/dashboard' && pathname.startsWith(item.href));

                    return (
                        <Link
                        key={item.href}
                        href={item.href}
                        prefetch={true}
                        className={cn(
                            'relative z-10 flex flex-col items-center justify-center w-16 h-full text-xs font-medium transition-colors gap-1',
                            isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                        )}
                        >
                            <item.icon className="h-5 w-5" />
                            <span>{item.label}</span>
                        </Link>
                    );
                    })}
                </div>
            </motion.nav>
        ) : (
             <motion.button 
                key="show-button"
                initial={{ y: "200%" }}
                animate={{ y: 0 }}
                exit={{ y: "200%" }}
                transition={{ duration: 0.2, ease: 'easeOut', delay: 0.1 }}
                onClick={() => onToggleCollapse(false)}
                className="fixed bottom-2 left-1/2 -translate-x-1/2 h-10 w-10 bg-muted/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border z-40 md:hidden"
            >
                <ChevronUp className="h-5 w-5 text-muted-foreground"/>
            </motion.button>
        )}
    </AnimatePresence>
  );
}
