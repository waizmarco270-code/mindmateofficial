
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowRight, Bot, Users, Zap, FileText, Award, 
    Globe, Sparkles, ShieldCheck, 
    MessageSquare, ChevronDown, 
    Instagram, Youtube, Send, 
    ExternalLink, Code, Shield, 
    CreditCard, Info
} from 'lucide-react';
import Link from 'next/link';
import { Logo } from '../ui/logo';
import { SignUpButton, SignInButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ActivityGlobe } from './ActivityGlobe';
import NextImage from 'next/image';
import { ThreeDCore } from './ThreeDCore';

const features = [
  {
    name: 'AI Study Assistant',
    description: 'Get instant, structured explanations and tactical help from your dedicated AI tutor.',
    icon: Bot,
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/20',
  },
  {
    name: 'Gamified Growth',
    description: 'Earn credits, claim badges, and compete on global leaderboards.',
    icon: Sparkles,
    color: 'text-sky-400',
    bgColor: 'bg-sky-900/20',
  },
  {
    name: 'Deep Focus Engine',
    description: 'Calibrated focus timers with penalty systems to protect your productivity.',
    icon: Zap,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/20',
  },
  {
    name: 'Unified Resources',
    description: 'A central repository of high-level exam notes and study materials.',
    icon: FileText,
    color: 'text-rose-400',
    bgColor: 'bg-rose-900/20',
  },
  {
    name: 'Study Clans',
    description: 'Team up with allies, sync schedules, and conquer milestones as a unit.',
    icon: Users,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-900/20',
  },
  {
    name: 'Academic Ledger',
    description: 'Powerful analytics to maintain your consistency and track your streaks.',
    icon: Award,
    color: 'text-orange-400',
    bgColor: 'bg-orange-900/20',
  }
];

const testimonials = [
    {
        name: "Aryan Gupta",
        rank: "Legendary Scholar",
        text: "MindMate transformed my prep. The focus mode is a life-saver for consistency!",
        avatar: "https://picsum.photos/seed/aryan/100"
    },
    {
        name: "Sneha Reddy",
        rank: "Elite Member",
        text: "The AI tutor feels so human. It explains things better than my textbooks!",
        avatar: "https://picsum.photos/seed/sneha/100"
    },
    {
        name: "Vikram Singh",
        rank: "Clan Leader",
        text: "Studying with a clan makes it feel like a mission. We never miss a goal now.",
        avatar: "https://picsum.photos/seed/vikram/100"
    }
];

function NeuralBackground() {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-black" />
            
            {/* Animated Grid */}
            <div className="absolute inset-0 bg-grid-animate opacity-10" />
            
            {/* Neural Synapse Branches */}
            <svg className="absolute inset-0 w-full h-full opacity-20">
                <filter id="glow-path">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
                
                {/* Synaptic Tree Paths */}
                {[...Array(5)].map((_, i) => (
                    <motion.path
                        key={i}
                        d={`M ${200 * i},1000 Q ${400 + i * 50},500 ${window.innerWidth / 2},${window.innerHeight / 2} T ${window.innerWidth - (i * 200)},0`}
                        fill="none"
                        stroke="rgba(139,92,246,0.2)"
                        strokeWidth="1"
                        filter="url(#glow-path)"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: [0, 1, 0] }}
                        transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                ))}

                {/* Random Pulsing Synapses */}
                {[...Array(15)].map((_, i) => (
                    <motion.circle
                        key={`node-${i}`}
                        r={Math.random() * 2 + 1}
                        fill="rgba(139,92,246,0.6)"
                        animate={{ 
                            opacity: [0, 1, 0],
                            scale: [0.5, 1.2, 0.5]
                        }}
                        transition={{ 
                            duration: 3 + Math.random() * 4, 
                            repeat: Infinity, 
                            delay: Math.random() * 5 
                        }}
                        cx={`${Math.random() * 100}%`}
                        cy={`${Math.random() * 100}%`}
                    />
                ))}
            </svg>
        </div>
    );
}

export function LandingPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="min-h-screen bg-black" />;

  return (
    <div className="flex min-h-screen flex-col bg-black overflow-x-hidden selection:bg-primary/30 text-slate-200">
      <NeuralBackground />

      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="container mx-auto flex h-20 items-center justify-between px-6 sm:px-12">
          <Link href="/" className="flex items-center gap-3 group">
            <Logo className="h-10 w-10 transition-transform group-hover:scale-110" />
            <span className="font-black text-2xl tracking-tighter text-white uppercase italic">MindMate</span>
          </Link>

          <div className="hidden lg:flex items-center gap-6">
             <div className="px-5 py-2 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-3 hover:bg-primary/20 transition-all cursor-pointer group/banner">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Join the v2.5 Beta Cycle</span>
                <ArrowRight className="h-3.5 w-3.5 text-primary transition-transform group-hover/banner:translate-x-1" />
             </div>
          </div>

          <div className="flex items-center gap-4">
             <SignInButton mode="modal">
                <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal">
                <Button className="h-11 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/20 transition-all hover:-translate-y-0.5">Initialize</Button>
            </SignUpButton>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto min-h-screen flex flex-col lg:flex-row items-center justify-center px-6 sm:px-12 pt-20 gap-12 text-center lg:text-left">
            <div className="flex-1 space-y-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="inline-flex p-px rounded-full bg-gradient-to-r from-primary/50 via-white/10 to-transparent"
                >
                    <div className="px-4 py-1 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                        Cognitive Fortress v2.5
                    </div>
                </motion.div>

                <motion.h1 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.9] mb-8"
                >
                    <span className="text-white drop-shadow-[0_0_30px_rgba(139,92,246,0.3)]">Ascend to</span><br />
                    <span className="bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent italic font-serif pr-4">Greatness.</span>
                </motion.h1>

                <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="max-w-xl text-lg text-slate-400 font-medium leading-relaxed"
                >
                    Forge your legacy with our integrated study ecosystem. Calibrated deep-focus protocols, tactical AI tutoring, and collaborative mastery systems.
                </motion.p>

                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-sm"
                >
                    <SignUpButton mode="modal">
                        <Button size="lg" className="w-full h-16 text-xs font-black uppercase tracking-widest rounded-2xl shadow-[0_20px_50px_rgba(139,92,246,0.3)] bg-primary hover:bg-primary/90 group transition-all hover:scale-[1.02]">
                            Initialize MindMate for free
                            <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-2" />
                        </Button>
                    </SignUpButton>
                </motion.div>
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
                className="flex-1 flex justify-center items-center"
            >
                <ThreeDCore />
            </motion.div>
        </section>

        {/* Features Bento Grid */}
        <section className="container mx-auto py-32 px-6 sm:px-12">
            <div className="flex flex-col items-center text-center mb-24">
              <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter mb-4 italic font-serif text-white">Elite Modules</h2>
              <div className="h-1.5 w-16 bg-primary rounded-full shadow-[0_0_15px_#8b5cf6]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="relative group p-10 rounded-[2.5rem] bg-white/[0.02] backdrop-blur-2xl border border-white/5 hover:border-primary/30 hover:bg-white/[0.04] transition-all duration-700 cursor-pointer overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl mb-8 shadow-2xl relative z-10", feature.bgColor)}>
                    <feature.icon className={cn("h-7 w-7", feature.color)} />
                  </div>
                  <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tight relative z-10">{feature.name}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium relative z-10">{feature.description}</p>
                </motion.div>
              ))}
            </div>
        </section>

        {/* Global Intelligence Feed */}
        <section className="bg-white/[0.01] border-y border-white/5 py-32 px-6 sm:px-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-slate-800 opacity-5" />
            <div className="container mx-auto relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-widest italic font-serif text-white">Global Intelligence Feed</h2>
                    <p className="text-slate-500 mt-4 text-[10px] font-black uppercase tracking-[0.3em]">Real-time study uplinks from active legends</p>
                </div>
                <ActivityGlobe />
            </div>
        </section>

        {/* Testimonials */}
        <section className="container mx-auto py-32 px-6 sm:px-12">
            <div className="text-center mb-24">
                <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-widest text-white italic font-serif">Citizen Briefings</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((t, i) => (
                    <Card key={i} className="bg-white/[0.02] backdrop-blur-3xl border-white/5 rounded-[3rem] p-10 shadow-2xl hover:border-primary/20 transition-all duration-500 group">
                        <div className="flex items-center gap-5 mb-8">
                            <div className="relative">
                                <div className="absolute -inset-1 bg-primary/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity" />
                                <NextImage src={t.avatar} alt={t.name} width={50} height={50} className="rounded-full border-2 border-primary/20 relative z-10" />
                            </div>
                            <div>
                                <p className="font-black text-md text-white uppercase tracking-tight">{t.name}</p>
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{t.rank}</p>
                            </div>
                        </div>
                        <p className="text-slate-400 text-sm italic leading-relaxed font-medium">"{t.text}"</p>
                    </Card>
                ))}
            </div>
        </section>
      </main>

      {/* Enterprise Footer */}
      <footer className="border-t border-white/5 bg-black backdrop-blur-3xl pt-32 pb-16 px-6 sm:px-12 relative z-10">
        <div className="container mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
                <div className="space-y-8">
                    <div className="flex items-center gap-3">
                        <Logo className="h-12 w-12" />
                        <span className="font-black text-3xl text-white tracking-tighter italic uppercase">MindMate</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium max-w-xs uppercase tracking-wider">
                        The definitive AI-powered study command center. Empowering students through tactical automation and gamified mastery.
                    </p>
                    <div className="flex gap-4">
                        {[
                            { icon: Instagram, href: 'https://www.instagram.com/mindmatehq?igsh=MWd6dXJjbjVva2dlYg==' },
                            { icon: Youtube, href: 'https://youtube.com/@mindmateofficials?si=_PpffdhhQFGCTi47' },
                            { icon: Send, href: 'https://t.me/emitygate' },
                            { icon: MessageSquare, href: 'https://whatsapp.com/channel/0029Vb6qoFb7YSd13q71Hc1H' }
                        ].map((social, idx) => (
                            <a key={idx} href={social.href} target="_blank" className="p-3 rounded-2xl bg-white/5 hover:bg-primary/20 text-slate-400 hover:text-primary transition-all border border-white/5 shadow-xl">
                                <social.icon className="h-5 w-5" />
                            </a>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="font-black text-white uppercase text-[10px] tracking-[0.4em] mb-8 opacity-40">Intelligence</h4>
                    <ul className="space-y-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                        <li><Link href="https://emitygate.com" target="_blank" className="hover:text-primary transition-colors flex items-center gap-2">EmityGate Mainframe <ExternalLink className="h-3 w-3"/></Link></li>
                        <li><Link href="/about" className="hover:text-white transition-colors">Strategic Mission</Link></li>
                        <li><Link href="/dashboard/guide" className="hover:text-white transition-colors">Tactical Briefings</Link></li>
                        <li><Link href="/contact" className="hover:text-white transition-colors">Uplink Support</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-black text-white uppercase text-[10px] tracking-[0.4em] mb-8 opacity-40">Protocols</h4>
                    <ul className="space-y-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                        <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Shield</Link></li>
                        <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                        <li><Link href="/refund" className="hover:text-white transition-colors">Asset Protection</Link></li>
                        <li><Link href="/faq" className="hover:text-white transition-colors">System FAQ</Link></li>
                    </ul>
                </div>

                <div className="space-y-8">
                    <h4 className="font-black text-white uppercase text-[10px] tracking-[0.4em] mb-8 opacity-40">Secure Settlement</h4>
                    <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/10 space-y-4 shadow-inner">
                        <div className="flex items-center gap-4">
                            <ShieldCheck className="h-10 w-10 text-emerald-500" />
                            <div className="text-[9px] font-black uppercase text-slate-400 leading-tight tracking-widest">
                                Validated Payments <br />
                                <span className="text-white text-[11px] mt-1 block">Powered by Razorpay</span>
                            </div>
                        </div>
                        <div className="flex gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                            <div className="px-2 py-1 rounded bg-white/10 text-[8px] font-black text-white">VISA</div>
                            <div className="px-2 py-1 rounded bg-white/10 text-[8px] font-black text-white">UPI</div>
                            <div className="px-2 py-1 rounded bg-white/10 text-[8px] font-black text-white">MASTER</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">
                <p>© {new Date().getFullYear()} EmityGate Solutions. All Rights Reserved.</p>
                <div className="flex gap-10">
                    <span className="flex items-center gap-2.5"><Globe className="h-3 w-3 text-primary animate-pulse" /> Network Operational</span>
                    <span className="flex items-center gap-2.5"><Clock className="h-3 w-3" /> Uptime 99.9%</span>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
}
