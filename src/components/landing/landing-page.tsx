'use client';

import { Button } from '@/components/ui/button';
import { 
    ArrowRight, Bot, Users, Zap, FileText, Award, 
    Gamepad2, Globe, Zap as FlashIcon,
    ChevronDown, Rocket,
    Sparkles, Quote, ShieldCheck, Monitor as MonitorIcon, Shield
} from 'lucide-react';
import Link from 'next/link';
import { Logo } from '../ui/logo';
import { SignUpButton, SignInButton } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { ActivityGlobe } from './ActivityGlobe';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import NextImage from 'next/image';

const features = [
  {
    name: 'Marco AI Partner',
    description: 'Instant academic briefings and complex problem solving powered by next-gen intelligence.',
    icon: Bot,
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/20',
    border: 'border-purple-500/20'
  },
  {
    name: 'Gamified Discipline',
    description: 'Solve high-stakes quizzes and challenges to earn study credits and climb the global rankings.',
    icon: Gamepad2,
    color: 'text-green-400',
    bgColor: 'bg-green-900/20',
    border: 'border-green-500/20'
  },
  {
    name: 'Deep Focus Engine',
    description: 'Scientifically calibrated study timers designed to eliminate distractions and maximize retention.',
    icon: Zap,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/20',
    border: 'border-yellow-500/20'
  },
  {
    name: 'Premium Resources',
    description: 'Curated library of JEE, NEET, and Board Exam materials specifically organized for peak performance.',
    icon: FileText,
    color: 'text-rose-400',
    bgColor: 'bg-rose-900/20',
    border: 'border-rose-500/20'
  },
  {
    name: 'Sovereign Alliances',
    description: 'Join elite study clans to collaborate, share wisdom, and compete in team-based leaderboards.',
    icon: Users,
    color: 'text-sky-400',
    bgColor: 'bg-sky-900/20',
    border: 'border-sky-500/20'
  },
  {
    name: 'Legendary Rewards',
    description: 'Maintain your consistency streak to unlock artifacts, custom badges, and exclusive system access.',
    icon: Award,
    color: 'text-orange-400',
    bgColor: 'bg-orange-900/20',
    border: 'border-orange-500/20'
  }
];

const testimonials = [
    {
        name: "Aryan Sharma",
        rank: "Elite Member",
        text: "The Focus Mode changed everything. I used to procrastinate for hours, but now the penalty system keeps me locked in. Highly recommended for JEE prep.",
        avatar: "https://picsum.photos/seed/aryan/100"
    },
    {
        name: "Jessica Patel",
        rank: "Scholar",
        text: "The AI briefing module is like having a private tutor 24/7. It explains complex biology concepts in seconds. Simply legendary.",
        avatar: "https://picsum.photos/seed/jessica/100"
    },
    {
        name: "Rahul Verma",
        rank: "Clan Leader",
        text: "MindMate isn't just an app; it's a movement. Building a study clan with my friends has made the grind actually fun.",
        avatar: "https://picsum.photos/seed/rahul/100"
    }
];

function NeuralBackground() {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-black" />
            <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="neural-glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                    </radialGradient>
                </defs>
                {/* Neural Connections */}
                {[...Array(15)].map((_, i) => (
                    <motion.path
                        key={i}
                        d={`M ${Math.random() * 100}% ${Math.random() * 100}% Q ${Math.random() * 100}% ${Math.random() * 100}% ${Math.random() * 100}% ${Math.random() * 100}%`}
                        stroke="hsl(var(--primary))"
                        strokeWidth="0.5"
                        fill="none"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: [0, 1, 0], opacity: [0, 0.5, 0] }}
                        transition={{
                            duration: 5 + Math.random() * 5,
                            repeat: Infinity,
                            delay: Math.random() * 5,
                            ease: "easeInOut"
                        }}
                    />
                ))}
                {/* Neural Nodes */}
                {[...Array(30)].map((_, i) => (
                    <motion.circle
                        key={i}
                        cx={`${Math.random() * 100}%`}
                        cy={`${Math.random() * 100}%`}
                        r="1.5"
                        fill="hsl(var(--primary))"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.8, 0], scale: [0.5, 1.2, 0.5] }}
                        transition={{
                            duration: 3 + Math.random() * 3,
                            repeat: Infinity,
                            delay: Math.random() * 3
                        }}
                    />
                ))}
            </svg>
            <div className="absolute inset-0 bg-grid-slate-900/50 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        </div>
    );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export function LandingPage() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  return (
    <div className="flex min-h-screen flex-col bg-black text-white selection:bg-primary/30 overflow-x-hidden">
      {/* Hero Section */}
      <section ref={targetRef} className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden">
        <NeuralBackground />

        <motion.div 
            style={{ opacity, scale }}
            className="container relative z-10 mx-auto px-4 text-center"
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, type: 'spring' }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
            >
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">System Online: MindMate Mainframe</span>
            </motion.div>

            <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter uppercase italic leading-[0.9] relative"
            >
                <span className="relative z-10 bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent">Claim Your</span> <br />
                <span className="bg-gradient-to-r from-yellow-400 via-white to-primary bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(139,92,246,0.5)]">Legend</span>
                {/* Cyber Scan Line */}
                <motion.div 
                    className="absolute inset-x-0 h-px bg-primary/50 shadow-[0_0_10px_hsl(var(--primary))] z-20"
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
            </motion.h1>

            <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="mx-auto mt-8 max-w-2xl text-lg md:text-2xl text-slate-400 font-medium leading-relaxed"
            >
                MindMate is not just an app; it's a <span className="text-white font-bold tracking-tight">Cognitive Fortress</span>. 
                Structure your study, track every second of focus, and conquer your destiny.
            </motion.p>

            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6"
            >
                <SignUpButton mode="modal">
                    <Button size="lg" className="group px-10 h-16 text-xl font-black rounded-2xl shadow-2xl shadow-primary/20 uppercase italic transition-all hover:scale-105 hover:shadow-primary/40 active:scale-95">
                        Establish Uplink
                        <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-2" />
                    </Button>
                </SignUpButton>
                <Button variant="outline" size="lg" asChild className="px-10 h-16 text-xl font-bold rounded-2xl border-white/10 hover:bg-white/5 uppercase backdrop-blur-sm transition-all hover:border-primary/50">
                    <Link href="/dashboard/guide">Operational Manual</Link>
                </Button>
            </motion.div>
        </motion.div>

        <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-30"
        >
            <ChevronDown className="h-8 w-8 text-primary" />
        </motion.div>
      </section>

      {/* Floating Header */}
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-3 font-bold text-2xl group">
            <div className="p-1 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-all border border-primary/20 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                <Logo className="h-10 w-10" />
            </div>
            <span className="tracking-tighter uppercase italic bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">MindMate</span>
          </Link>
          <div className="flex items-center gap-4">
             <SignInButton mode="modal">
                <Button variant="ghost" className="hidden sm:flex font-black text-xs uppercase tracking-widest hover:bg-white/5 text-slate-400 hover:text-white">Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal">
                <Button className="h-11 px-6 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/40 border border-primary/20">Sign Up</Button>
            </SignUpButton>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10 bg-black">
        {/* Features Section */}
        <section id="features" className="py-32 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={containerVariants}
                className="mx-auto max-w-3xl text-center mb-24"
            >
              <h2 className="text-4xl font-black tracking-tight text-white sm:text-6xl uppercase italic">Mainframe Modules</h2>
              <div className="h-1 w-24 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-6 rounded-full shadow-[0_0_20px_hsl(var(--primary))]" />
              <p className="mt-8 text-xl text-slate-400 font-medium">Engineered for peak cognitive output and academic dominance.</p>
            </motion.div>

            <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={containerVariants}
                className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
            >
              {features.map((feature, i) => (
                <motion.div 
                    key={i} 
                    variants={itemVariants}
                    whileHover={{ y: -10 }}
                    className={cn(
                        "relative flex flex-col rounded-[2.5rem] border bg-slate-900/20 p-10 backdrop-blur-3xl transition-all duration-500 hover:bg-slate-900/40 hover:shadow-[0_0_50px_rgba(139,92,246,0.1)] h-full",
                        feature.border
                    )}
                >
                  <div className={cn("flex h-16 w-16 items-center justify-center rounded-2xl shadow-2xl transition-transform group-hover:scale-110", feature.bgColor)}>
                    <feature.icon className={cn("h-8 w-8", feature.color)} />
                  </div>
                  <h3 className="mt-8 text-2xl font-black text-white uppercase tracking-tight italic">{feature.name}</h3>
                  <p className="mt-4 text-slate-400 leading-relaxed font-medium">{feature.description}</p>
                  
                  <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between opacity-40 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Protocol Active</span>
                    <FlashIcon className={cn("h-4 w-4", feature.color)} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Global Network Section */}
        <section id="intelligence" className="py-32 relative bg-black overflow-hidden border-y border-white/5">
            <div className="absolute inset-0 bg-primary/5 blur-[150px] rounded-full" />
            <div className="container mx-auto px-4 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="space-y-6"
                >
                    <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto border border-primary/20 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
                        <Globe className="h-12 w-12 text-primary animate-pulse" />
                    </div>
                    <h2 className="text-5xl font-black uppercase italic tracking-tighter">Global Intelligence Feed</h2>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto font-medium">Synchronizing with Legends in real-time across the Sovereign Network.</p>
                </motion.div>
                
                <div className="mt-20">
                    <ActivityGlobe />
                </div>
            </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-32 relative overflow-hidden bg-black">
            <div className="container mx-auto px-4">
                <div className="text-center mb-20 space-y-4">
                    <div className="p-3 bg-primary/10 rounded-2xl w-fit mx-auto border border-primary/20">
                        <Quote className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight uppercase italic">Citizen Briefings</h2>
                    <p className="text-slate-400 font-medium">Voices from the high-performing elite.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-8 rounded-[2rem] bg-slate-900/20 border border-white/5 backdrop-blur-xl relative group hover:border-primary/30 transition-all duration-500"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <NextImage src={t.avatar} alt={t.name} width={60} height={60} className="rounded-2xl border border-white/10 grayscale group-hover:grayscale-0 transition-all duration-500" />
                                <div>
                                    <p className="font-black text-lg uppercase tracking-tight">{t.name}</p>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">{t.rank}</p>
                                </div>
                            </div>
                            <p className="text-slate-400 leading-relaxed italic group-hover:text-slate-200 transition-colors">"{t.text}"</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>

        {/* CTA Section */}
        <section className="py-40 relative">
            <div className="container mx-auto px-4 text-center relative z-10">
                <div className="max-w-4xl mx-auto rounded-[3.5rem] bg-gradient-to-br from-primary/20 via-slate-900 to-black p-12 md:p-24 border border-white/10 shadow-[0_0_100px_rgba(139,92,246,0.2)] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-grid-slate-800/20 mix-blend-overlay" />
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        className="relative z-10 space-y-8"
                    >
                        <h2 className="text-4xl md:text-7xl font-black uppercase italic leading-none tracking-tighter">Your Legacy <br /> Starts Now</h2>
                        <p className="text-xl md:text-2xl text-slate-400 font-medium max-w-2xl mx-auto">Establish your uplink to the mainframe and claim your starting credits instantly.</p>
                        <div className="pt-8">
                            <SignUpButton mode="modal">
                                <Button size="lg" className="h-20 px-16 text-2xl font-black rounded-[2rem] shadow-2xl hover:scale-105 active:scale-95 transition-transform uppercase italic border border-primary/20">
                                    Establish Link
                                </Button>
                            </SignUpButton>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
      </main>

      {/* Compliance Footer */}
      <footer className="border-t border-white/5 bg-black py-20 relative z-10">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
                <div className="space-y-6">
                    <div className="flex items-center justify-center md:justify-start gap-2 font-bold text-2xl">
                        <div className="p-1 rounded-lg bg-primary/10 border border-primary/20">
                            <Logo className="h-8 w-8" />
                        </div>
                        <span className="tracking-tighter uppercase italic bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">MindMate</span>
                    </div>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        The ultimate study mainframe engineered for dominance. A flagship subsidiary of <span className="text-white font-bold">EmityGate Solutions</span>.
                    </p>
                </div>
                <div>
                    <h4 className="font-black text-[10px] uppercase tracking-[0.3em] mb-8 text-primary">Intelligence</h4>
                    <ul className="space-y-4 text-sm text-slate-400 font-medium">
                        <li><Link href="/about" className="hover:text-primary transition-colors">Operational History</Link></li>
                        <li><Link href="/contact" className="hover:text-primary transition-colors">Support Command</Link></li>
                        <li><Link href="/dashboard/guide" className="hover:text-primary transition-colors">System Briefings</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-black text-[10px] uppercase tracking-[0.3em] mb-8 text-primary">Protocol</h4>
                    <ul className="space-y-4 text-sm text-slate-400 font-medium">
                        <li><Link href="/privacy" className="hover:text-primary transition-colors">Data Encryption</Link></li>
                        <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                        <li><Link href="/refund" className="hover:text-primary transition-colors">Refund Policy</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-black text-[10px] uppercase tracking-[0.3em] mb-8 text-primary">Security</h4>
                    <div className="flex flex-col gap-4 items-center md:items-start">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 w-full max-w-[200px]">
                            <ShieldCheck className="h-5 w-5 text-emerald-500" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">SECURE PORTAL v2.5</span>
                        </div>
                        <div className="flex gap-3 opacity-20 grayscale group-hover:opacity-100 transition-all">
                            <NextImage src="https://placehold.co/50x30/000000/FFFFFF/png?text=SSL" alt="SSL" width={50} height={30} className="rounded" />
                            <NextImage src="https://placehold.co/50x30/000000/FFFFFF/png?text=UPI" alt="UPI" width={50} height={30} className="rounded" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-black uppercase tracking-[0.4em] text-slate-600">
                <p>&copy; {new Date().getFullYear()} EMITYGATE SOLUTIONS. ALL RIGHTS RESERVED.</p>
                <div className="flex gap-8">
                    <span className="flex items-center gap-2"><MonitorIcon className="h-3 w-3" /> INFRA: STABLE</span>
                    <span className="flex items-center gap-2"><Shield className="h-3 w-3" /> SEC: ENCRYPTED</span>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
}