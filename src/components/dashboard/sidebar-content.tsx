
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Calendar,
  Settings,
  User as UserIcon,
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
  Info,
  Map as MapIcon,
  Bot,
  Megaphone,
  Fingerprint,
  ShoppingCart,
  Film,
  Gem,
  Sparkles,
  FileText,
  Mail,
  BellRing,
  Book
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '../ui/logo';
import { useUnreadMessages } from '@/hooks/use-unread';
import { useNewQuiz } from '@/hooks/use-new-quiz';
import { useAdmin } from '@/hooks/use-admin';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Button } from '../ui/button';

const mainNavItems = [
  { href: '/dashboard/schedule', icon: Calendar, label: 'MindMate Nexus', glow: 'text-sky-400' },
  { href: '/dashboard/guide', icon: Book, label: 'App Guide', glow: 'text-emerald-400' },
  { href: '/dashboard/roadmap', icon: MapIcon, label: 'Roadmap', glow: 'text-orange-400' },
  { href: '/dashboard/focus', icon: Zap, label: 'MindMate Focus', glow: 'text-yellow-400', isBold: true },
  { href: '/dashboard/ai-assistant', icon: Bot, label: 'Marco AI', glow: 'text-purple-400' },
  { href: '/dashboard/profile', icon: UserIcon, label: 'Profile', glow: 'text-teal-400' },
  { href: '/dashboard/leaderboard', icon: Trophy, label: 'Leaderboard', glow: 'text-amber-400' },
  { href: '/dashboard/tools', icon: Wrench, label: 'Tools', glow: 'text-lime-400' },
];

const communityNav = [
  { href: '/dashboard/social', icon: Users, label: 'Alliance Hub', glow: 'text-yellow-400' },
  { href: '/dashboard/groups', icon: Users, label: 'Study Groups', glow: 'text-green-400' },
  { href: '/dashboard/world', icon: Globe, label: 'Global Forum', glow: 'text-blue-400' },
  { href: '/dashboard/social/nuggets', icon: Gem, label: 'Nugget Jar', glow: 'text-amber-400' },
  { href: '/dashboard/resources', icon: BookOpen, label: 'Resources', glow: 'text-orange-400' },
  { href: '/dashboard/refer', icon: UserPlus, label: 'Invite & Earn', glow: 'text-green-400' },
];

const competeNav = [
    { href: '/dashboard/reward', icon: Gift, label: 'Reward Zone', glow: 'text-pink-400' },
    { href: '/dashboard/quiz', icon: BrainCircuit, label: 'Quiz Zone', glow: 'text-purple-400' },
    { href: '/dashboard/game-zone', icon: Gamepad2, label: 'Game Zone', glow: 'text-rose-400' },
];

const helpNav = [
    { href: '/dashboard/docs', icon: FileText, label: 'Documentation', glow: 'text-blue-400' },
    { href: '/dashboard/help', icon: LifeBuoy, label: 'Support Center', glow: 'text-rose-400' },
];

const socialLinks = [
    { name: 'Instagram', href: 'https://www.instagram.com/mindmatehq?igsh=MWd6dXJjbjVva2dlYg==' },
    { name: 'WhatsApp', href: 'https://whatsapp.com/channel/0029Vb6qoFb7YSd13q71Hc1H' },
    { name: 'Telegram', href: 'https://t.me/emitygate' },
    { name: 'YouTube', href: 'https://youtube.com/@mindmateofficials?si=_PpffdhhQFGCTi47' },
];

const InstagramIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
)

const WhatsAppIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
)

const YouTubeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M2.5 17a24.12 24.12 0 0 1 0-10C2.5 6 2.5 4.5 3.5 3.5a2.44 2.44 0 0 1 2-1C7 2 12 2 12 2s5 0 6.5.5a2.44 2.44 0 0 1 2 1c1 1 1 2.5 1 3.5a24.12 24.12 0 0 1 0 10c0 1 0 2.5-1 3.5a2.44 2.44 0 0 1-2-1C17 22 12 22 12 22s-5 0-6.5-.5a2.44 2.44 0 0 1-2-1C2.5 19.5 2.5 18 2.5 17Z"></path>
        <path d="m10 15 5-3-5-3z"></path>
    </svg>
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
    if (href === '/dashboard' && pathname === href) return true;
    if (href !== '/dashboard' && pathname.startsWith(href)) return true;
    if (href === '/dashboard/focus' && (pathname.startsWith('/dashboard/pomodoro') || pathname.startsWith('/dashboard/tracker') || pathname.startsWith('/dashboard/tracker-insights') || pathname.startsWith('/dashboard/challenger'))) return true;
    if (href === '/dashboard/schedule' && (pathname.startsWith('/dashboard/todos'))) return true;
    if (href === '/dashboard/settings' && (pathname.startsWith('/dashboard/about') || pathname.startsWith('/dashboard/rules') || pathname.startsWith('/dashboard/admin') || pathname.startsWith('/waizmarcoadmin') || pathname.startsWith('/dashboard/whats-new'))) return true;
    if (href === '/dashboard/store' && pathname.startsWith('/dashboard/store/history')) return true;
    if (href === '/dashboard/social' && pathname.startsWith('/dashboard/groups')) return true;
    return false;
  };
  
  const renderNavLinks = (navItems: any[]) => (
    <div className="space-y-1">
      {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            prefetch={true}
            className={cn(
              'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground/80 transition-all hover:bg-primary/10 text-sm font-medium relative',
              isActive(item.href) ? 'bg-primary/10 text-primary shadow-inner shadow-primary/10 font-semibold' : 'hover:text-primary',
              item.isBold && 'font-bold text-sidebar-foreground/90'
            )}
          >
            <div className={cn("absolute left-0 h-6 w-1 rounded-r-lg bg-primary/0 transition-all duration-300", isActive(item.href) ? "bg-primary" : "group-hover:scale-y-50")}></div>
            <item.icon className={cn("h-5 w-5", item.glow)} />
            <span className="flex-1">{item.label}</span>
            {(item.href === '/dashboard/social' && (hasUnread || hasGlobalUnread)) && <span className="h-2.5 w-2.5 rounded-full bg-destructive animate-pulse" />}
            {item.href === '/dashboard/quiz' && hasNewQuiz && <span className="h-2.5 w-2.5 rounded-full bg-destructive animate-pulse" />}
          </Link>
      ))}
    </div>
  );

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-20 items-center justify-between border-b border-sidebar-border px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold" prefetch={true}>
            <Logo className="h-8 w-8" />
            <span className="text-xl text-nowrap">MindMate</span>
        </Link>

        <div className="flex items-center gap-3">
            <Link href="/dashboard/settings" prefetch={true}>
                <Button variant="ghost" size="icon" className={cn(
                    "h-10 w-10 rounded-full transition-all group/settings",
                    "bg-yellow-400/10 text-yellow-400/80 shadow-[0_0_15px_rgba(250,204,21,0.3)] ring-1 ring-yellow-400/30",
                    isActive('/dashboard/settings') && "bg-yellow-400/20 text-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.6)] ring-2 ring-yellow-400/50"
                )}>
                    <Settings className={cn(
                        "h-6 w-6 transition-all duration-1000",
                        "animate-[spin_10s_linear_infinite]",
                        "drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]",
                        isActive('/dashboard/settings') && "text-yellow-400 drop-shadow-[0_0_10px_currentColor]"
                    )} />
                </Button>
            </Link>

            <Link href="/dashboard" aria-label="Go to Home" prefetch={true}>
                <Button 
                    variant="ghost" 
                    className={cn(
                        "h-10 w-10 rounded-lg p-0 transition-all", 
                        "bg-red-500/10 text-red-400/80 ring-1 ring-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]",
                        isActive('/dashboard') && "bg-red-500/20 text-red-400 ring-2 ring-red-500/50 shadow-[0_0_25px_rgba(239,68,68,0.6)]"
                    )}
                >
                    <Home className="h-5 w-5" />
                </Button>
            </Link>
        </div>
      </div>

       <div className="p-4 border-b border-sidebar-border space-y-2">
          {isSpecialUser && (
            <Link href="/dashboard/premium/elite-lounge" prefetch={true} className={cn('group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground/80 transition-all hover:bg-primary/10 text-sm font-medium relative', isActive('/dashboard/premium/elite-lounge') ? 'bg-primary/10 text-primary shadow-inner shadow-primary/10 font-semibold' : 'hover:text-primary', 'text-yellow-400 [text-shadow:0_0_8px_currentColor]')}>
                <div className={cn("absolute left-0 h-6 w-1 rounded-r-lg bg-primary/0 transition-all duration-300", isActive('/dashboard/premium/elite-lounge') ? "bg-current" : "group-hover:scale-y-50" )}></div>
                <Crown className="h-5 w-5"/> Elite Lounge
            </Link>
          )}

          <Link href="/dashboard/store" prefetch={true} className={cn(
              'group flex items-center gap-3 rounded-xl px-4 py-3 transition-all relative overflow-hidden border-2',
              isActive('/dashboard/store') 
                ? 'bg-green-500 text-white border-green-400 shadow-lg shadow-green-500/30' 
                : 'bg-green-500/10 border-green-500/20 hover:border-green-500/50 hover:bg-green-500/20 text-green-500'
          )}>
              {!isActive('/dashboard/store') && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />}
              <ShoppingCart className={cn("h-5 w-5", isActive('/dashboard/store') ? "text-white" : "text-green-500 animate-pulse")} />
              <span className="font-black uppercase tracking-tight text-sm">Nexus Emporium</span>
              <Sparkles className="h-3 w-3 absolute top-1 right-2 text-yellow-400 animate-pulse" />
          </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-4 space-y-2">
        <Accordion type="multiple" defaultValue={['main-tools', 'community-resources', 'compete-earn']} className="w-full">
          <AccordionItem value="main-tools" className="border-b-0">
            <AccordionTrigger className="px-1 py-2 hover:no-underline text-sidebar-foreground/60 text-sm font-semibold tracking-tight">Main</AccordionTrigger>
            <AccordionContent className="px-0 pb-2">{renderNavLinks(mainNavItems)}</AccordionContent>
          </AccordionItem>
          <AccordionItem value="community-resources" className="border-b-0">
            <AccordionTrigger className="px-1 py-2 hover:no-underline text-sidebar-foreground/60 text-sm font-semibold tracking-tight">Community & Resources</AccordionTrigger>
            <AccordionContent className="px-0 pb-2">{renderNavLinks(communityNav)}</AccordionContent>
          </AccordionItem>
          <AccordionItem value="compete-earn" className="border-b-0">
            <AccordionTrigger className="px-1 py-2 hover:no-underline text-sidebar-foreground/60 text-sm font-semibold tracking-tight">Compete & Earn</AccordionTrigger>
            <AccordionContent className="px-0 pb-2">{renderNavLinks(competeNav)}</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

       <div className="mt-auto p-4 border-t border-sidebar-border space-y-4">
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted/20 rounded-xl border border-white/5">
              {helpNav.map(item => (
                  <Link key={item.label} href={item.href} className={cn(
                      "flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-all",
                      isActive(item.href) ? "bg-primary/20 text-primary" : "hover:bg-primary/5 text-muted-foreground hover:text-primary"
                  )}>
                      <item.icon className="h-4 w-4" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label.split(' ')[0]}</span>
                  </Link>
              ))}
          </div>

          <div className="flex items-center justify-around">
              {socialLinks.map(link => {
                  let Icon;
                  if (link.name === 'Instagram') Icon = InstagramIcon;
                  else if (link.name === 'WhatsApp') Icon = WhatsAppIcon;
                  else if (link.name === 'YouTube') Icon = YouTubeIcon;
                  else Icon = Send;
                  return (
                        <a key={link.name} href={link.href} className={cn("transition-opacity hover:opacity-80", link.name === 'Instagram' && 'text-[#E4405F]', link.name === 'WhatsApp' && 'text-[#25D366]', link.name === 'Telegram' && 'text-[#0088cc]', link.name === 'YouTube' && 'text-[#FF0000]')} target="_blank" rel="noopener noreferrer">
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
