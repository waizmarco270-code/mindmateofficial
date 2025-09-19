
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bot,
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '../ui/logo';
import { useUnreadMessages } from '@/hooks/use-unread';
import { useNewQuiz } from '@/hooks/use-new-quiz';
import { useAdmin } from '@/hooks/use-admin';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

const mainNavItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/dashboard/ai-assistant', icon: Bot, label: 'Marco AI', glow: 'text-indigo-400' },
  { href: '/dashboard/challenger', icon: Swords, label: 'Challenger', glow: 'text-red-400' },
  { href: '/dashboard/reward', icon: Gift, label: 'Reward Zone', glow: 'text-pink-400' },
  { href: '/dashboard/quiz', icon: BrainCircuit, label: 'Quiz Zone', glow: 'text-orange-400' },
  { href: '/dashboard/social', icon: Users, label: 'Social Hub', glow: 'text-yellow-400' },
  { href: '/dashboard/game-zone', icon: Gamepad2, label: 'Game Zone', glow: 'text-red-400' },
  { href: '/dashboard/resources', icon: BookOpen, label: 'Resources', glow: 'text-yellow-400' },
  { href: '/dashboard/refer', icon: UserPlus, label: 'Invite & Earn', glow: 'text-green-400' },
  { href: '/dashboard/leaderboard', icon: Trophy, label: 'Leaderboard', glow: 'text-red-400' },
];

const studyNav = [
  { href: '/dashboard/schedule', icon: Calendar, label: 'MindMate Nexus', glow: 'text-sky-400' },
  { href: '/dashboard/pomodoro', icon: Timer, label: 'Pomodoro', glow: 'text-green-400' },
  { href: '/dashboard/tracker', icon: Zap, label: 'Focus Mode', glow: 'text-green-400' },
  { href: '/dashboard/time-tracker', icon: Clock, label: 'Time Tracker', glow: 'text-blue-400' },
  { href: '/dashboard/todos', icon: ListTodo, label: 'To-Dos', glow: 'text-orange-400' },
  { href: '/dashboard/insights', icon: LineChart, label: 'Insights', glow: 'text-sky-400' },
];

const otherNav = [
    { href: '/dashboard/tools', icon: Wrench, label: 'Tools', glow: 'text-lime-400' },
];

const adminNav = [
    { href: '/dashboard/admin', icon: Shield, label: 'Admin Panel' },
];

const superAdminNav = [
    { href: '/dashboard/super-admin', icon: KeyRound, label: 'Super Admin' },
];

const socialLinks = [
    { name: 'Instagram', href: 'https://www.instagram.com/reel/DOoLvLCERLG/?igsh=eHd4d2tjbm10bmRx', icon: 'instagram' },
    { name: 'WhatsApp', href: 'https://whatsapp.com/channel/0029Vb6qoFb7YSd13q71Hc1H', icon: 'whatsapp' },
    { name: 'Telegram', href: 'https://t.me/EmityGate', icon: Send },
];

const InstagramIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
)

const WhatsAppIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
)


export default function SidebarContent() {
  const pathname = usePathname();
  const { hasUnread } = useUnreadMessages();
  const { hasNewQuiz } = useNewQuiz();
  const { isAdmin, isSuperAdmin, currentUserData, appSettings } = useAdmin();
  
  const isVip = currentUserData?.isVip || false;
  const isGM = currentUserData?.isGM || false;
  const isSpecialUser = isVip || isGM || isAdmin || isSuperAdmin;
  const isAiLive = appSettings?.marcoAiLaunchStatus === 'live';


  const isActive = (href: string) => {
    return (href === '/dashboard' && pathname === href) || (href !== '/dashboard' && pathname.startsWith(href));
  };
  
  const renderNavLinks = (navItems: typeof mainNavItems) => (
    <div className="space-y-1">
      {navItems.map((item) => {
        // Conditionally skip rendering Marco AI link if not live
        if (item.label === 'Marco AI' && !isAiLive) {
            return null;
        }

        return (
          <Link
            key={item.label}
            href={item.href}
            prefetch={true}
            className={cn(
              'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground/80 transition-all hover:bg-primary/10 text-sm font-medium relative',
              isActive(item.href)
                  ? 'bg-primary/10 text-primary shadow-inner shadow-primary/10 font-semibold' 
                  : 'hover:text-primary',
              item.glow && !isActive(item.href) && `${item.glow} [text-shadow:0_0_8px_currentColor]`,
            )}
          >
            <div className={cn(
              "absolute left-0 h-6 w-1 rounded-r-lg bg-primary/0 transition-all duration-300",
              isActive(item.href) ? "bg-primary/100" : "group-hover:scale-y-50",
              isActive(item.href) && item.glow && 'bg-current'
            )}></div>
            <item.icon className="h-5 w-5" />
            <span className="flex-1">{item.label}</span>
            {item.href === '/dashboard/social' && hasUnread && (
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
      <div className="flex h-20 items-center border-b border-sidebar-border px-6">
        <Link href="/dashboard" className="flex items-center gap-3 font-semibold" prefetch={true}>
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-xl">MindMate</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <Accordion
          type="multiple"
          defaultValue={['main-tools']}
          className="w-full"
        >
          <AccordionItem value="main-tools" className="border-b-0">
            <AccordionTrigger className="px-4 py-2 hover:no-underline text-sidebar-foreground/60 text-sm font-semibold tracking-tight">
              Main
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-2">
              {renderNavLinks(mainNavItems)}
            </AccordionContent>
          </AccordionItem>
        
          <AccordionItem value="study-tools" className="border-b-0">
            <AccordionTrigger className="px-4 py-2 hover:no-underline text-sidebar-foreground/60 text-sm font-semibold tracking-tight">
              Study
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-2">
              {renderNavLinks(studyNav as any)}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="other-tools" className="border-b-0">
            <AccordionTrigger className="px-4 py-2 hover:no-underline text-sidebar-foreground/60 text-sm font-semibold tracking-tight">
              Other
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-2">
              {renderNavLinks(otherNav as any)}
            </AccordionContent>
          </AccordionItem>

          {isSpecialUser && (
              <AccordionItem value="elite-lounge" className="border-b-0">
                  <AccordionTrigger className="px-4 py-2 hover:no-underline text-sidebar-foreground/60 text-sm font-semibold tracking-tight">
                    Lounge
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-2 space-y-1">
                      <Link href="/dashboard/premium/elite-lounge" className={cn('group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground/80 transition-all hover:bg-primary/10 text-sm font-medium relative', isActive('/dashboard/premium/elite-lounge') ? 'bg-primary/10 text-primary shadow-inner shadow-primary/10 font-semibold' : 'hover:text-primary','text-yellow-400 [text-shadow:0_0_8px_currentColor]')}>
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

       <div className="mt-auto p-4 border-t border-sidebar-border space-y-4">
          <Link
                href="/dashboard/help"
                prefetch={true}
                className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground/80 transition-all hover:bg-primary/10 text-sm font-medium relative',
                    isActive('/dashboard/help') 
                        ? 'bg-primary/10 text-primary shadow-inner shadow-primary/10 font-semibold' 
                        : 'hover:text-primary',
                    'text-amber-400 [text-shadow:0_0_8px_currentColor]',
                )}
            >
                <div className={cn(
                    "absolute left-0 h-6 w-1 rounded-r-lg bg-primary/0 transition-all duration-300",
                    isActive('/dashboard/help') ? "bg-current" : "group-hover:scale-y-50"
                )}></div>
                <LifeBuoy className="h-5 w-5" />
                <span className="flex-1">Help & Support</span>
            </Link>
          <div className="px-3 mb-2">
             <h2 className="text-sm font-semibold tracking-tight text-sidebar-foreground/60">Follow Us</h2>
          </div>
          <div className="flex items-center justify-around">
              {socialLinks.map(link => {
                  let Icon;
                  if(link.icon === 'instagram') Icon = InstagramIcon;
                  else if(link.icon === 'whatsapp') Icon = WhatsAppIcon;
                  else Icon = link.icon;
                  
                  return (
                        <a key={link.name} href={link.href} className="text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors" target="_blank" rel="noopener noreferrer">
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
