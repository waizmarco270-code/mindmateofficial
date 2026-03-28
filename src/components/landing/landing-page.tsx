
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowRight, Bot, Users, Zap, FileText, Award, 
    Globe, Sparkles, Quote, ShieldCheck, 
    MessageSquare, BookOpen, Clock, Mail, 
    ChevronDown, Rocket, Smartphone, Layout,
    Info, Instagram, Youtube, Send, CheckCircle,
    Shield, CreditCard, ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { Logo } from '../ui/logo';
import { SignUpButton, SignInButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ActivityGlobe } from './ActivityGlobe';
import NextImage from 'next/image';

const features = [
  {
    name: 'AI Study Assistant',
    description: 'Get instant, structured explanations and tactical academic help from your dedicated AI tutor.',
    icon: Bot,
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/20',
  },
  {
    name: 'Gamified Growth',
    description: 'Earn credits, claim badges, and compete on global leaderboards to make studying rewarding.',
    icon: Sparkles,
    color: 'text-sky-400',
    bgColor: 'bg-sky-900/20',
  },
  {
    name: 'Deep Focus Engine',
    description: 'Calibrated study timers with discipline-first penalty systems to eliminate distractions.',
    icon: Zap,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/20',
  },
  {
    name: 'Unified Resources',
    description: 'Access a central repository of high-level exam notes and study materials for rapid mastery.',
    icon: FileText,
    color: 'text-rose-400',
    bgColor: 'bg-rose-900/20',
  },
  {
    name: 'Study Clans',
    description: 'Team up with friends, sync your schedules, and conquer milestones together as a unit.',
    icon: Users,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-900/20',
  },
  {
    name: 'Consistency Tracking',
    description: 'Powerful analytics to visualize your progress and maintain your streaks automatically.',
    icon: Award,
    color: 'text-orange-400',
    bgColor: 'bg-orange-900/20',
  }
];

const testimonials = [
    {
        name: "Aryan Gupta",
        rank: "Legendary Scholar",
        text: "MindMate transformed my JEE prep. The focus mode is a life-saver!",
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
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1)_0%,transparent_70%)]" />
            
            {/* Animated Grid */}
            <div className="absolute inset-0 bg-grid-animate opacity-20" />
            
            {/* Neural Particles */}
            <svg className="absolute inset-0 w-full h-full opacity-30">
                <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
                <motion.path
                    d="M 100,100 Q 200,300 400,100 T 700,300"
                    fill="none"
                    stroke="rgba(139,92,246,0.3)"
                    strokeWidth="1"
                    filter="url(#glow)"
                    animate={{
                        d: [
                            "M 100,100 Q 200,300 400,100 T 700,300",
                            "M 100,150 Q 250,250 400,150 T 700,250",
                            "M 100,100 Q 200,300 400,100 T 700,300"
                        ]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.circle
                    r="2"
                    fill="rgba(139,92,246,0.8)"
                    filter="url(#glow)"
                    animate={{
                        cx: [100, 400, 700],
                        cy: [100, 100, 300],
                        opacity: [0, 1, 0]
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                />
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
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2 group">
            <Logo className="h-8 w-8" />
            <span className="font-bold text-xl tracking-tight text-white">MindMate</span>
          </Link>

          <div className="hidden lg:flex items-center gap-4">
             <div className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Join the v2.5 Beta Cycle</span>
                <ArrowRight className="h-3 w-3 text-primary" />
             </div>
          </div>

          <div className="flex items-center gap-4">
             <SignInButton mode="modal">
                <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white">Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal">
                <Button className="h-9 px-5 rounded-xl font-black text-[10px] uppercase tracking-widest bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">Initialize</Button>
            </SignUpButton>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto min-h-screen flex flex-col items-center justify-center px-4 pt-20 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-2 px-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.3em] text-primary shadow-2xl"
            >
                The Definitive AI Study Partner
            </motion.div>

            <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter uppercase leading-none mb-8 max-w-4xl"
            >
                <span className="bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent italic font-serif">Master</span> Your Journey <br />
                <span className="text-white drop-shadow-[0_0_20px_rgba(139,92,246,0.5)]">Claim Your Legend</span>
            </motion.h1>

            <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mx-auto max-w-2xl text-sm sm:text-lg text-slate-400 font-medium leading-relaxed mb-12 px-4"
            >
                Unlock absolute clarity with our integrated cognitive ecosystem. Calibrated focus timers, tactical AI tutoring, and collaborative mastery protocols—all in one secure edifice.
            </motion.p>

            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-sm mx-auto"
            >
                <SignUpButton mode="modal">
                    <Button size="lg" className="w-full h-14 text-sm font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 group">
                        Initialize for free
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                </SignUpButton>
            </motion.div>

            <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="mt-20 opacity-20"
            >
                <ChevronDown className="h-6 w-6" />
            </motion.div>
        </section>

        {/* Features */}
        <section className="container mx-auto py-24 px-4">
            <div className="text-center mb-24">
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter mb-4 italic font-serif text-white">Elite Modules</h2>
              <div className="h-1 w-12 bg-primary mx-auto rounded-full shadow-[0_0_10px_#8b5cf6]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="p-8 rounded-[2rem] bg-white/[0.03] backdrop-blur-xl border border-white/5 hover:border-primary/20 hover:bg-white/[0.05] transition-all duration-500 group"
                >
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl mb-6 shadow-2xl", feature.bgColor)}>
                    <feature.icon className={cn("h-6 w-6", feature.color)} />
                  </div>
                  <h3 className="text-lg font-black text-white mb-3 uppercase tracking-tight">{feature.name}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed font-medium">{feature.description}</p>
                </motion.div>
              ))}
            </div>
        </section>

        {/* Global Map Section */}
        <section className="bg-white/[0.01] border-y border-white/5 py-24 px-4">
            <div className="container mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-widest italic font-serif text-white">Global Intelligence Feed</h2>
                    <p className="text-slate-500 mt-2 text-xs font-bold uppercase tracking-widest">Real-time study uplinks from active legends</p>
                </div>
                <ActivityGlobe />
            </div>
        </section>

        {/* Testimonials */}
        <section className="container mx-auto py-24 px-4">
            <div className="text-center mb-20">
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-white italic font-serif">Citizen Briefings</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {testimonials.map((t, i) => (
                    <Card key={i} className="bg-white/[0.03] backdrop-blur-2xl border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
                        <div className="flex items-center gap-4 mb-6">
                            <NextImage src={t.avatar} alt={t.name} width={40} height={40} className="rounded-full border-2 border-primary/20" />
                            <div>
                                <p className="font-black text-sm text-white uppercase tracking-tight">{t.name}</p>
                                <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">{t.rank}</p>
                            </div>
                        </div>
                        <p className="text-slate-400 text-xs italic leading-relaxed font-medium">"{t.text}"</p>
                    </Card>
                ))}
            </div>
        </section>
      </main>

      {/* Enterprise Footer */}
      <footer className="border-t border-white/5 bg-black/80 backdrop-blur-3xl pt-24 pb-12 px-4 sm:px-8">
        <div className="container mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <Logo className="h-10 w-10" />
                        <span className="font-bold text-2xl text-white tracking-tighter">MindMate</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium max-w-xs">
                        The definitive AI-powered study command center. Empowering students through tactical automation and gamified mastery.
                    </p>
                    <div className="flex gap-3">
                        <a href="https://www.instagram.com/mindmatehq?igsh=MWd6dXJjbjVva2dlYg==" target="_blank" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"><Instagram className="h-4 w-4" /></a>
                        <a href="https://youtube.com/@mindmateofficials?si=_PpffdhhQFGCTi47" target="_blank" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"><Youtube className="h-4 w-4" /></a>
                        <a href="https://t.me/emitygate" target="_blank" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"><Send className="h-4 w-4" /></a>
                        <a href="https://whatsapp.com/channel/0029Vb6qoFb7YSd13q71Hc1H" target="_blank" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"><MessageSquare className="h-4 w-4" /></a>
                    </div>
                </div>

                <div>
                    <h4 className="font-black text-white uppercase text-[10px] tracking-[0.3em] mb-6 opacity-60">Intelligence</h4>
                    <ul className="space-y-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                        <li><Link href="https://emitygate.com" className="hover:text-primary transition-colors flex items-center gap-2">EmityGate Mainframe <ExternalLink className="h-3 w-3"/></Link></li>
                        <li><Link href="/about" className="hover:text-white transition-colors">Our Origins</Link></li>
                        <li><Link href="/dashboard/guide" className="hover:text-white transition-colors">Tactical Briefings</Link></li>
                        <li><Link href="/contact" className="hover:text-white transition-colors">Support Link</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-black text-white uppercase text-[10px] tracking-[0.3em] mb-6 opacity-60">Protocols</h4>
                    <ul className="space-y-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                        <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Shield</Link></li>
                        <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                        <li><Link href="/refund" className="hover:text-white transition-colors">Refund Policy</Link></li>
                        <li><Link href="/faq" className="hover:text-white transition-colors">System FAQ</Link></li>
                    </ul>
                </div>

                <div className="space-y-6">
                    <h4 className="font-black text-white uppercase text-[10px] tracking-[0.3em] mb-6 opacity-60">Financial Security</h4>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
                        <ShieldCheck className="h-8 w-8 text-emerald-500" />
                        <div className="text-[9px] font-black uppercase text-slate-400 leading-tight">
                            Secure Transactions <br />
                            <span className="text-white">Powered by Razorpay</span>
                        </div>
                    </div>
                    <div className="flex gap-2 opacity-30 grayscale hover:opacity-60 transition-opacity">
                        <NextImage src="https://placehold.co/60x30/000000/FFFFFF/png?text=Visa" alt="Visa" width={60} height={30} className="rounded" />
                        <NextImage src="https://placehold.co/60x30/000000/FFFFFF/png?text=MC" alt="Mastercard" width={60} height={30} className="rounded" />
                        <NextImage src="https://placehold.co/60x30/000000/FFFFFF/png?text=UPI" alt="UPI" width={60} height={30} className="rounded" />
                    </div>
                </div>
            </div>

            <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">
                <p>© {new Date().getFullYear()} EmityGate Solutions. All Rights Reserved.</p>
                <div className="flex gap-6">
                    <span className="flex items-center gap-2"><Globe className="h-3 w-3" /> System Operational</span>
                    <span className="flex items-center gap-2"><Clock className="h-3 w-3" /> Uptime 99.9%</span>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
}
