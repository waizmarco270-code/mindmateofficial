
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
  LayoutGrid,
  ClipboardCheck,
  BarChart3,
  GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '../ui/logo';
import { useUnreadMessages } from '@/hooks/use-unread';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useNewQuiz } from '@/hooks/use-new-quiz';
import { useAdmin } from '@/hooks/use-admin';

const mainNav = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/dashboard/ai-assistant', icon: Bot, label: 'Marco AI' },
  { href: '/dashboard/quiz', icon: BrainCircuit, label: 'Quiz Zone' },
  { href: '/dashboard/resources', icon: BookOpen, label: 'Resources', highlight: true },
  { href: '/dashboard/social', icon: Users, label: 'Social', highlight: true },
  { href: '/dashboard/community', icon: Globe, label: 'Community Hub' },
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

export default function SidebarContent() {
  const pathname = usePathname();
  const { hasUnread, hasGlobalUnread } = useUnreadMessages();
  const { hasNewQuiz } = useNewQuiz();
  const { isAdmin } = useAdmin();

  const isActive = (href: string) => {
    return (href === '/dashboard' && pathname === href) || (href !== '/dashboard' && pathname.startsWith(href));
  };
  
  const renderNavLinks = (navItems: typeof mainNav) => (
    <div className="grid grid-flow-row auto-rows-max text-sm">
        {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              prefetch={true}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-all hover:text-primary hover:bg-muted text-base font-medium',
                isActive(item.href) && 'bg-muted text-primary',
                item.highlight && !isActive(item.href) && 'text-yellow-500 hover:text-yellow-600',
                item.highlight && isActive(item.href) && 'text-yellow-500 bg-yellow-500/10 hover:text-yellow-600'
              )}
            >
              <div className={cn(
                "absolute left-0 h-6 w-1 rounded-r-lg bg-primary transition-transform scale-y-0 group-hover:scale-y-100",
                isActive(item.href) ? "scale-y-100" : "",
                 item.highlight && isActive(item.href) && 'bg-yellow-500'
              )}></div>
              <item.icon className="h-5 w-5" />
              <span className="flex-1">{item.label}</span>
               {item.href === '/dashboard/social' && hasUnread && (
                 <span className="h-2.5 w-2.5 rounded-full bg-destructive animate-pulse" />
              )}
              {item.href === '/dashboard/community' && hasGlobalUnread && (
                 <span className="h-2.5 w-2.5 rounded-full bg-destructive animate-pulse" />
              )}
               {item.href === '/dashboard/quiz' && hasNewQuiz && (
                 <span className="h-2.5 w-2.5 rounded-full bg-destructive animate-pulse" />
              )}
            </Link>
          ))}
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold" prefetch={true}>
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-lg">MindMate</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        <Accordion type="multiple" defaultValue={['main', 'study', 'progress']} className="w-full px-4">
          <AccordionItem value="main" className="border-b-0">
            <AccordionTrigger className="py-3 text-sm font-medium text-muted-foreground hover:no-underline">
              <div className="flex items-center gap-3">
                  <LayoutGrid className="h-5 w-5" /> Main
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-2">
              {renderNavLinks(mainNav)}
            </AccordionContent>
          </AccordionItem>
          
           <AccordionItem value="study" className="border-b-0">
            <AccordionTrigger className="py-3 text-sm font-medium text-muted-foreground hover:no-underline">
              <div className="flex items-center gap-3">
                  <GraduationCap className="h-5 w-5" /> Study
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-2">
              {renderNavLinks(studyNav)}
            </AccordionContent>
          </AccordionItem>
          
           <AccordionItem value="progress" className="border-b-0">
            <AccordionTrigger className="py-3 text-sm font-medium text-muted-foreground hover:no-underline">
              <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5" /> Progress
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-2">
              {renderNavLinks(progressNav)}
            </AccordionContent>
          </AccordionItem>
          
        </Accordion>
      </div>
    </div>
  );
}
