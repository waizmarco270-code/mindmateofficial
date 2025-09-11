
'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, BrainCircuit, Users, Zap, Youtube, Twitter, Send } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '../ui/logo';
import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs';
import { cn } from '@/lib/utils';

const features = [
  {
    name: 'AI Tutor',
    description: 'Get instant, personalized help from Marco, your AI study partner.',
    icon: Bot,
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/20',
  },
  {
    name: 'Quiz Zone',
    description: 'Test your knowledge with dynamic quizzes and earn credits for top performance.',
    icon: BrainCircuit,
    color: 'text-green-400',
    bgColor: 'bg-green-900/20',
  },
  {
    name: 'Focus Mode',
    description: 'Eliminate distractions and get rewarded for deep, productive study sessions.',
    icon: Zap,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/20',
  },
  {
    name: 'Social Hub',
    description: 'Connect with peers, share knowledge, and study together in a vibrant community.',
    icon: Users,
    color: 'text-sky-400',
    bgColor: 'bg-sky-900/20',
  },
];

const socialLinks = [
    { name: 'Instagram', href: 'https://www.instagram.com/mindmate100?igsh=MWd6dXJjbjVva2dlYg==', icon: null },
    { name: 'WhatsApp', href: 'https://whatsapp.com/channel/0029Vb6qoFb7YSd13q71Hc1H', icon: null },
    { name: 'YouTube', href: '#', icon: Youtube },
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'Telegram', href: '#', icon: Send },
];


const InstagramIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
)

const WhatsAppIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
)


export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Logo className="h-8 w-8" />
            <span>MindMate</span>
          </Link>
          <div className="flex items-center gap-2">
             <SignedOut>
                <SignInButton mode="modal">
                    <Button variant="ghost">Sign In</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                    <Button variant="default" className="bg-primary/90 hover:bg-primary">Get Started</Button>
                </SignUpButton>
             </SignedOut>
             <SignedIn>
                <Link href="/dashboard">
                  <Button>Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </Link>
             </SignedIn>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 sm:py-32">
            <div className="absolute inset-0 bg-grid-slate-800 [mask-image:linear-gradient(to_bottom,white_20%,transparent_100%)] animate-pulse-slow"></div>
            <div className="container mx-auto px-4 text-center relative">
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                    Unlock Your <span className="bg-gradient-to-r from-purple-400 to-sky-400 bg-clip-text text-transparent">Full Potential</span>
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                    MindMate is your all-in-one AI-powered study companion, designed to help you learn smarter, stay focused, and achieve your academic goals.
                </p>
                <div className="mt-10 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
                    <SignUpButton mode="modal">
                        <Button size="lg" className="text-lg h-14 px-10 bg-primary/90 hover:bg-primary shadow-lg shadow-primary/20 transition-transform duration-300 hover:scale-105">
                            Start Learning for Free
                        </Button>
                    </SignUpButton>
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section className="py-24 sm:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Your Ultimate Study Toolkit</h2>
              <p className="mt-4 text-lg text-slate-400">Everything you need to succeed, all in one place.</p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, i) => (
                <div 
                  key={feature.name} 
                  className="flex flex-col rounded-2xl border border-white/10 bg-slate-900/50 p-8 shadow-2xl shadow-slate-950/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-primary/20 animate-fade-in-up"
                  style={{animationDelay: `${0.8 + i * 0.2}s`}}
                >
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg", feature.bgColor)}>
                    <feature.icon className={cn("h-6 w-6", feature.color)} aria-hidden="true" />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-white">{feature.name}</h3>
                  <p className="mt-2 text-base text-slate-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm text-slate-400">&copy; {new Date().getFullYear()} MindMate. All rights reserved.</p>
                <div className="flex items-center gap-4">
                    {socialLinks.map(link => {
                        let Icon = link.icon;
                        if(link.name === 'Instagram') Icon = InstagramIcon;
                        if(link.name === 'WhatsApp') Icon = WhatsAppIcon;
                        return (
                             <a key={link.name} href={link.href} className="text-slate-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                                {Icon ? <Icon /> : link.name}
                                <span className="sr-only">{link.name}</span>
                            </a>
                        )
                    })}
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
}

