
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
  Activity,
  ChevronsUpDown,
  Gift,
  KeyRound,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '../ui/logo';
import { useUnreadMessages } from '@/hooks/use-unread';
import { useNewQuiz } from '@/hooks/use-new-quiz';
import { useAdmin } from '@/hooks/use-admin';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Separator } from '../ui/separator';

const mainNav = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/dashboard/ai-assistant', icon: Bot, label: 'Marco AI' },
  { href: '/dashboard/reward', icon: Gift, label: 'Reward Zone' },
  { href: '/dashboard/quiz', icon: BrainCircuit, label: 'Quiz Zone' },
  { href: '/dashboard/social', icon: Users, label: 'Social Hub' },
  { href: '/dashboard/resources', icon: BookOpen, label: 'Resources', highlight: true },
];

const studyNav = [
  { href: '/dashboard/tracker', icon: Zap, label: 'Focus Mode' },
  { href: '/dashboard/time-tracker', icon: Clock, label: 'Time Tracker' },
  { href: '/dashboard/schedule', icon: Calendar, label: 'Schedule' },
  { href: '/dashboard/todos', icon: ListTodo, label: 'To-Dos' },
];

const progressNav = [
  { href: '/dashboard/insights', icon: LineChart, label: 'Insights', highlight: true },
  { href: '/dashboard/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { href: '/dashboard/calculator', icon: Percent, label: 'Percentage Calc' },
];

const adminNav = [
    { href: '/dashboard/admin', icon: Shield, label: 'Admin Panel' },
]

const superAdminNav = [
    { href: '/dashboard/super-admin', icon: KeyRound, label: 'Super Admin' },
]

const socialLinks = [
    { name: 'Instagram', href: 'https://www.instagram.com/mindmate100?utm_source=ig_web_button_share_sheet&igsh=emJwcTZxdmZnaGF1', icon: 'instagram' },
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
  const { hasUnread, hasGlobalUnread } = useUnreadMessages();
  const { hasNewQuiz } = useNewQuiz();
  const { isAdmin, isSuperAdmin } = useAdmin();

  const isActive = (href: string) => {
    return (href === '/dashboard' && pathname === href) || (href !== '/dashboard' && pathname.startsWith(href));
  };
  
  const renderNavLinks = (navItems: typeof mainNav) => (
    <div className="space-y-1">
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          prefetch={true}
          className={cn(
            'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground/80 transition-all hover:bg-primary/10 hover:text-primary text-sm font-medium relative',
            isActive(item.href) && 'bg-primary/10 text-primary shadow-inner shadow-primary/10 font-semibold',
            item.highlight && !isActive(item.href) && 'text-yellow-400 hover:text-yellow-500',
            item.highlight && isActive(item.href) && 'text-yellow-400 bg-yellow-500/10 hover:text-yellow-500'
          )}
        >
          <div className={cn(
            "absolute left-0 h-6 w-1 rounded-r-lg bg-primary/0 transition-all duration-300",
            isActive(item.href) ? "bg-primary/100" : "group-hover:scale-y-50",
            item.highlight && isActive(item.href) && 'bg-yellow-500'
          )}></div>
          <item.icon className="h-5 w-5" />
          <span className="flex-1">{item.label}</span>
          {item.href === '/dashboard/social' && hasUnread && (
            <span className="h-2.5 w-2.5 rounded-full bg-destructive animate-pulse" />
          )}
          {item.href === '/dashboard/quiz' && hasNewQuiz && (
            <span className="h-2.5 w-2.5 rounded-full bg-destructive animate-pulse" />
          )}
          {item.highlight && (
            <span className="h-2 w-2 rounded-full bg-yellow-500" />
          )}
        </Link>
      ))}
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
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        
        <div className="px-4 space-y-2">
            <h2 className="mb-2 px-3 text-sm font-semibold tracking-tight text-sidebar-foreground/60">Main</h2>
            {renderNavLinks(mainNav)}
        </div>
        
        <div className="px-4 space-y-2">
            <h2 className="mb-2 px-3 text-sm font-semibold tracking-tight text-sidebar-foreground/60">Study</h2>
            {renderNavLinks(studyNav)}
        </div>

        <div className="px-4 space-y-2">
            <h2 className="mb-2 px-3 text-sm font-semibold tracking-tight text-sidebar-foreground/60">Progress</h2>
            {renderNavLinks(progressNav)}
        </div>
        
        {isAdmin && (
            <div className="px-4 space-y-2">
                <h2 className="mb-2 px-3 text-sm font-semibold tracking-tight text-sidebar-foreground/60">Admin</h2>
                {renderNavLinks(adminNav)}
            </div>
        )}
        
        {isSuperAdmin && (
             <div className="px-4 space-y-2">
                <h2 className="mb-2 px-3 text-sm font-semibold tracking-tight text-destructive/80">Super Admin</h2>
                {renderNavLinks(superAdminNav)}
            </div>
        )}
      </div>

       <div className="mt-auto p-4 border-t border-sidebar-border">
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
