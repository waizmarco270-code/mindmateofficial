'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowRight, Bot, Users, Zap, FileText, Award, 
    Globe, Sparkles, Quote, ShieldCheck, 
    MessageSquare, BookOpen, Clock, Mail, 
    ChevronDown, Rocket, Smartphone, Layout,
    Info, Instagram, Youtube, Send, CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { Logo } from '../ui/logo';
import { SignUpButton, SignInButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ActivityGlobe } from './ActivityGlobe';
import NextImage from 'next/image';

const features = [
  {
    name: 'AI Study Assistant',
    description: 'Get instant, structured explanations and tackical academic help from your dedicated AI tutor.',
    icon: Bot,
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/20',
    border: 'border-purple-500/20'
  },
  {
    name: 'Gamified Growth',
    description: 'Earn credits, claim badges, and compete on global leaderboards to make studying rewarding.',
    icon: Sparkles,
    color: 'text-sky-400',
    bgColor: 'bg-sky-900/20',
    border: 'border-sky-500/20'
  },
  {
    name: 'Deep Focus Engine',
    description: 'Calibrated study timers with discipline-first penalty systems to eliminate distractions.',
    icon: Zap,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/20',
    border: 'border-yellow-500/20'
  },
  {
    name: 'Unified Resources',
    description: 'Access a central repository of high-level exam notes and study materials for rapid mastery.',
    icon: FileText,
    color: 'text-rose-400',
    bgColor: 'bg-rose-900/20',
    border: 'border-rose-500/20'
  },
  {
    name: 'Study Clans',
    description: 'Team up with friends, sync your schedules, and conquer milestones together as a unit.',
    icon: Users,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-900/20',
    border: 'border-emerald-500/20'
  },
  {
    name: 'Consistency Tracking',
    description: 'Powerful analytics to visualize your progress and maintain your streaks automatically.',
    icon: Award,
    color: 'text-orange-400',
    bgColor: 'bg-orange-900/20',
    border: 'border-orange-500/20'
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

export function LandingPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="min-h-screen bg-black" />;

  return (
    <div className="flex min-h-screen flex-col bg-black overflow-x-hidden selection:bg-primary/30 text-slate-200">
      {/* Background Layer */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 space-grid opacity-20" />
        <div className="absolute inset-0 blue-nebula-bg" />
      </div>

      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2 group">
            <Logo className="h-8 w-8" />
            <span className="font-bold text-xl tracking-tight text-white">MindMate</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
             <Link href="/dashboard/guide" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Documentation</Link>
             <Link href="/about" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Origins</Link>
          </div>

          <div className="flex items-center gap-4">
             <SignInButton mode="modal">
                <Button variant="ghost" className="text-xs font-bold uppercase text-slate-400 hover:text-white">Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal">
                <Button className="h-10 px-6 rounded-xl font-bold text-xs uppercase bg-primary hover:bg-primary/90">Initialize</Button>
            </SignUpButton>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto min-h-screen flex flex-col items-center justify-center px-4 pt-20 text-center">
            <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-tight mb-8"
            >
                <span className="bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent">Study Like A</span> <br />
                <span className="text-white drop-shadow-[0_0_20px_rgba(139,92,246,0.5)]">Legend</span>
            </motion.h1>

            <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mx-auto max-w-2xl text-base sm:text-xl text-slate-400 font-medium leading-relaxed mb-12"
            >
                Unlock your full potential with the world's most advanced AI-driven study ecosystem. Track progress, manage time, and master subjects with high-fidelity precision.
            </motion.p>

            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto"
            >
                <SignUpButton mode="modal">
                    <Button size="lg" className="w-full h-14 text-lg font-bold rounded-2xl shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 group">
                        Initialize MindMate for free
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                </SignUpButton>
            </motion.div>

            <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="mt-20 opacity-20"
            >
                <ChevronDown className="h-8 w-8" />
            </motion.div>
        </section>

        {/* Features */}
        <section className="container mx-auto py-32 px-4">
            <div className="text-center mb-24">
              <h2 className="text-4xl sm:text-5xl font-black uppercase mb-4">Elite Modules</h2>
              <div className="h-1 w-16 bg-primary mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="p-8 rounded-[2rem] glass-module hover:bg-white/[0.05] transition-all duration-500 group"
                >
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl mb-6 shadow-xl", feature.bgColor)}>
                    <feature.icon className={cn("h-6 w-6", feature.color)} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.name}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
        </section>

        {/* Global Map Section */}
        <section className="bg-white/[0.02] border-y border-white/5 py-32 px-4">
            <div className="container mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-black uppercase">Global Intelligence Feed</h2>
                    <p className="text-slate-400 mt-2">Real-time study uplink from scholars across the network.</p>
                </div>
                <ActivityGlobe />
            </div>
        </section>

        {/* Testimonials */}
        <section className="container mx-auto py-32 px-4">
            <div className="text-center mb-20">
                <h2 className="text-3xl sm:text-4xl font-black uppercase">Scholar Briefings</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {testimonials.map((t, i) => (
                    <Card key={i} className="glass-module border-0 rounded-[2.5rem] p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <NextImage src={t.avatar} alt={t.name} width={48} height={48} className="rounded-full border-2 border-primary/20" />
                            <div>
                                <p className="font-bold text-white">{t.name}</p>
                                <p className="text-[10px] font-black text-primary uppercase">{t.rank}</p>
                            </div>
                        </div>
                        <p className="text-slate-300 text-sm italic leading-relaxed">"{t.text}"</p>
                    </Card>
                ))}
            </div>
        </section>
      </main>

      {/* Corporate Footer */}
      <footer className="border-t border-white/5 bg-black/80 backdrop-blur-3xl pt-24 pb-12 px-4 sm:px-8">
        <div className="container mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <Logo className="h-10 w-10" />
                        <span className="font-bold text-2xl text-white">MindMate</span>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        The definitive AI-powered study command center. Empowering students through tactical automation and gamified mastery.
                    </p>
                    <div className="flex gap-4">
                        <a href="https://www.instagram.com/mindmatehq?igsh=MWd6dXJjbjVva2dlYg==" target="_blank" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"><Instagram className="h-5 w-5" /></a>
                        <a href="https://youtube.com/@mindmateofficials?si=_PpffdhhQFGCTi47" target="_blank" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"><Youtube className="h-5 w-5" /></a>
                        <a href="https://t.me/emitygate" target="_blank" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"><Send className="h-5 w-5" /></a>
                        <a href="https://whatsapp.com/channel/0029Vb6qoFb7YSd13q71Hc1H" target="_blank" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"><MessageSquare className="h-5 w-5" /></a>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-white uppercase text-xs tracking-widest mb-6">Intelligence</h4>
                    <ul className="space-y-4 text-sm text-slate-500">
                        <li><Link href="https://emitygate.com" className="hover:text-primary transition-colors">EmityGate Mainframe</Link></li>
                        <li><Link href="/about" className="hover:text-primary transition-colors">Our Origins</Link></li>
                        <li><Link href="/dashboard/guide" className="hover:text-primary transition-colors">Tactical Briefings</Link></li>
                        <li><Link href="/contact" className="hover:text-primary transition-colors">Command Support</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-white uppercase text-xs tracking-widest mb-6">Protocols</h4>
                    <ul className="space-y-4 text-sm text-slate-500">
                        <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Encryption</Link></li>
                        <li><Link href="/terms" className="hover:text-primary transition-colors">Compliance Terms</Link></li>
                        <li><Link href="/refund" className="hover:text-primary transition-colors">Refund Policy</Link></li>
                        <li><Link href="/faq" className="hover:text-primary transition-colors">System FAQ</Link></li>
                    </ul>
                </div>

                <div className="space-y-6">
                    <h4 className="font-bold text-white uppercase text-xs tracking-widest mb-6">Financial Security</h4>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
                        <ShieldCheck className="h-8 w-8 text-emerald-500" />
                        <div className="text-[10px] font-black uppercase text-slate-400 leading-tight">
                            Secure Transactions <br />
                            <span className="text-white">Powered by Razorpay</span>
                        </div>
                    </div>
                    <div className="flex gap-2 opacity-50 grayscale">
                        <NextImage src="https://placehold.co/60x30/000000/FFFFFF/png?text=Visa" alt="Visa" width={60} height={30} className="rounded" />
                        <NextImage src="https://placehold.co/60x30/000000/FFFFFF/png?text=MC" alt="Mastercard" width={60} height={30} className="rounded" />
                        <NextImage src="https://placehold.co/60x30/000000/FFFFFF/png?text=UPI" alt="UPI" width={60} height={30} className="rounded" />
                    </div>
                </div>
            </div>

            <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">
                <p>© {new Date().getFullYear()} EmityGate Solutions. All Rights Reserved.</p>
                <div className="flex gap-6">
                    <span className="flex items-center gap-2"><Globe className="h-3 w-3" /> System Stable</span>
                    <span className="flex items-center gap-2"><Clock className="h-3 w-3" /> Uptime 99.9%</span>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
}