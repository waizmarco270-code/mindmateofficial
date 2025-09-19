
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Calendar,
  Settings,
  User,
  BookOpen,
  Shield,
  ListTodo,
  BrainCircuit,
  Users,
  Percent,
  Trophy,
  Globe,
  Zap,
  Clock,
  LineChart,
  ChevronsUpDown,
  Gift,
  KeyRound,
  Send,
  UserPlus,
  Gamepad2,
  LifeBuoy,
  Timer,
  Wrench,
  Swords,
  Crown,
  HelpCircle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '../ui/logo';
import { useUnreadMessages } from '@/hooks/use-unread';
import { useNewQuiz } from '@/hooks/use-new-quiz';
import { useAdmin } from '@/hooks/use-admin';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Button } from '../ui/button';

const mainNavItems = [
  { href: '/dashboard/schedule', icon: Calendar, label: 'MindMate Nexus' },
  { href: '/dashboard/pomodoro', icon: Timer, label: 'Pomodoro' },
  { href: '/dashboard/tracker', icon: Zap, label: 'Focus Mode' },
  { href: '/dashboard/time-tracker', icon: Clock, label: 'Time Tracker' },
  { href: '/dashboard/todos', icon: ListTodo, label: 'To-Dos' },
  { href: '/dashboard/insights', icon: LineChart, label: 'Insights' },
  { href: '/dashboard/challenger', icon: Swords, label: 'Challenger' },
];

const communityNav = [
  { href: '/dashboard/social', icon: Users, label: 'Social Hub' },
  { href: '/dashboard/resources', icon: BookOpen, label: 'Resources' },
];

const competeNav = [
    { href: '/dashboard/reward', icon: Gift, label: 'Reward Zone' },
    { href: '/dashboard/quiz', icon: BrainCircuit, label: 'Quiz Zone' },
    { href: '/dashboard/game-zone', icon: Gamepad2, label: 'Game Zone' },
    { href: '/dashboard/leaderboard', icon: Trophy, label: 'Leaderboard' },
];


const adminNav = [
    { href: '/dashboard/admin', icon: Shield, label: 'Admin Panel' },
];

const superAdminNav = [
    { href: '/dashboard/super-admin', icon: KeyRound, label: 'Super Admin' },
];

const socialLinks = [
    { name: 'Instagram', href: 'https://www.instagram.com/reel/DOoLvLCERLG/?igsh=eHd4d2tjbm10bmRx' },
    { name: 'WhatsApp', href: 'https://whatsapp.com/channel/0029Vb6qoFb7YSd13q71Hc1H' },
    { name: 'Telegram', href: 'https://t.me/EmityGate' },
];

const InstagramIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
)

const WhatsAppIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
)


export default function SidebarContent() {
  const pathname = usePathname();
  const { hasUnread, hasGlobalUnread } = useUnreadMessages();
  const { hasNewQuiz } = useNewQuiz();
  const { isAdmin, isSuperAdmin, currentUserData } = useAdmin();
  
  const isVip = currentUserData?.isVip || false;
  const isGM = currentUserData?.isGM || false;
  const isSpecialUser = isVip || isGM || isAdmin || isSuperAdmin;
  
  const isActive = (href: string) => {
    return (href === '/dashboard' && pathname === href) || (href !== '/dashboard' && pathname.startsWith(href));
  };
  
  const renderNavLinks = (navItems: typeof mainNavItems) => (
    <div className="space-y-1">
      {navItems.map((item) => {
        return (
          <Link
            key={item.label}
            href={item.href}
            prefetch={true}
            className={cn(
              'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground/80 transition-all hover:bg-primary/10 text-sm font-medium relative',
              isActive(item.href)
                  ? 'bg-primary/10 text-primary shadow-inner shadow-primary/10 font-semibold' 
                  : 'hover:text-primary'
            )}
          >
            <div className={cn(
              "absolute left-0 h-6 w-1 rounded-r-lg bg-primary/0 transition-all duration-300",
              isActive(item.href) ? "bg-primary" : "group-hover:scale-y-50"
            )}></div>
            <item.icon className="h-5 w-5" />
            <span className="flex-1">{item.label}</span>
            {(item.href === '/dashboard/social' && (hasUnread || hasGlobalUnread)) && (
              <span className="h-2.5 w-2.5 rounded-full bg-destructive animate-pulse" />
            )}
            {item.href === '/dashboard/quiz' && hasNewQuiz && (
              <span className="h-2.5 w-2.5 rounded-full bg-destructive animate-pulse" />
            )}
          </Link>
        )
      })}
    </div>
  );

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-20 items-center justify-between border-b border-sidebar-border px-4">
        <Link href="/dashboard" className="flex items-center gap-3 font-semibold" prefetch={true}>
          <Logo className="h-8 w-8" />
          <span className="text-xl">MindMate</span>
        </Link>
        <Link href="/dashboard" aria-label="Go to Home">
            <Button variant={isActive('/dashboard') ? "secondary" : "ghost"} size="icon" className={cn(isActive('/dashboard') && "bg-primary/10 text-primary")}>
                <Home className="h-5 w-5" />
            </Button>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto py-4 px-4 space-y-2">
        <Accordion
          type="multiple"
          defaultValue={['main-tools']}
          className="w-full"
        >
          <AccordionItem value="main-tools" className="border-b-0">
            <AccordionTrigger className="px-1 py-2 hover:no-underline text-sidebar-foreground/60 text-sm font-semibold tracking-tight">
              Main
            </AccordionTrigger>
            <AccordionContent className="px-0 pb-2">
              {renderNavLinks(mainNavItems)}
            </AccordionContent>
          </AccordionItem>
        
          <AccordionItem value="community-resources" className="border-b-0">
            <AccordionTrigger className="px-1 py-2 hover:no-underline text-sidebar-foreground/60 text-sm font-semibold tracking-tight">
              Community &amp; Resources
            </AccordionTrigger>
            <AccordionContent className="px-0 pb-2">
              {renderNavLinks(communityNav as any)}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="compete-earn" className="border-b-0">
            <AccordionTrigger className="px-1 py-2 hover:no-underline text-sidebar-foreground/60 text-sm font-semibold tracking-tight">
              Compete &amp; Earn
            </AccordionTrigger>
            <AccordionContent className="px-0 pb-2">
              {renderNavLinks(competeNav as any)}
            </AccordionContent>
          </AccordionItem>

          {isSpecialUser && (
              <AccordionItem value="elite-lounge" className="border-b-0">
                  <AccordionTrigger className="px-1 py-2 hover:no-underline text-sidebar-foreground/60 text-sm font-semibold tracking-tight">
                    Lounge
                  </AccordionTrigger>
                  <AccordionContent className="px-0 pb-2 space-y-1">
                      <Link href="/dashboard/premium/elite-lounge" className={cn('group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground/80 transition-all hover:bg-primary/10 text-sm font-medium relative', isActive('/dashboard/premium/elite-lounge') ? 'bg-primary/10 text-primary shadow-inner shadow-primary/10 font-semibold' : 'hover:text-primary', 'text-yellow-400 [text-shadow:0_0_8px_currentColor]')}>
                          <div className={cn("absolute left-0 h-6 w-1 rounded-r-lg bg-primary/0 transition-all duration-300", isActive('/dashboard/premium/elite-lounge') ? "bg-current" : "group-hover:scale-y-50" )}></div>
                          <Crown className="h-5 w-5"/> Elite Lounge
                      </Link>
                      {(isAdmin || isSuperAdmin) && renderNavLinks(adminNav as any)}
                      {isSuperAdmin && renderNavLinks(superAdminNav as any)}
                  </AccordionContent>
              </AccordionItem>
            )}
        </Accordion>
      </div>

       <div className="mt-auto p-4 border-t border-sidebar-border space-y-2">
          <Link
                href="/dashboard/settings"
                prefetch={true}
                className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground/80 transition-all hover:bg-primary/10 text-sm font-medium relative',
                    isActive('/dashboard/settings') 
                        ? 'bg-primary/10 text-primary shadow-inner shadow-primary/10 font-semibold' 
                        : 'hover:text-primary',
                )}
            >
                <div className={cn(
                    "absolute left-0 h-6 w-1 rounded-r-lg bg-primary/0 transition-all duration-300",
                    isActive('/dashboard/settings') ? "bg-primary" : "group-hover:scale-y-50"
                )}></div>
                <Settings className="h-5 w-5" />
                <span className="flex-1">Settings</span>
            </Link>
          <Link
                href="/dashboard/help"
                prefetch={true}
                className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground/80 transition-all hover:bg-primary/10 text-sm font-medium relative',
                    isActive('/dashboard/help') 
                        ? 'bg-primary/10 text-primary shadow-inner shadow-primary/10 font-semibold' 
                        : 'hover:text-primary',
                )}
            >
                <div className={cn(
                    "absolute left-0 h-6 w-1 rounded-r-lg bg-primary/0 transition-all duration-300",
                    isActive('/dashboard/help') ? "bg-primary" : "group-hover:scale-y-50"
                )}></div>
                <LifeBuoy className="h-5 w-5" />
                <span className="flex-1">Help &amp; Support</span>
            </Link>
          <div className="px-3 pt-2 mb-2">
             <h2 className="text-sm font-semibold tracking-tight text-sidebar-foreground/60">Follow Us</h2>
          </div>
          <div className="flex items-center justify-around">
              {socialLinks.map(link => {
                  let Icon;
                  if (link.name === 'Instagram') Icon = InstagramIcon;
                  else if (link.name === 'WhatsApp') Icon = WhatsAppIcon;
                  else Icon = Send;
                  
                  return (
                        <a 
                            key={link.name} 
                            href={link.href} 
                            className={cn(
                                "text-sidebar-foreground/70 transition-colors",
                                link.name === 'Instagram' && 'hover:text-[#E4405F]',
                                link.name === 'WhatsApp' && 'hover:text-[#25D366]',
                                link.name === 'Telegram' && 'hover:text-[#0088cc]'
                            )} 
                            target="_blank" 
                            rel="noopener noreferrer"
                        >
                          {Icon ? <Icon /> : link.name}
                          <span className="sr-only">{link.name}</span>
                      </a>
                  )
              })}
          </div>
       </div>

    </div>
  );
}
