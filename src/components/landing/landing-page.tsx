'use client';

import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
    ArrowRight, Bot, Users, Zap, FileText, Award, 
    Globe, Sparkles, Quote, ShieldCheck, 
    MessageSquare, BookOpen, Clock, Mail, Map as MapIcon,
    ChevronDown, Rocket, Smartphone, Layout
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
    name: 'Sovereign AI Partner',
    description: 'Establish a direct neural link with Marco AI. Receive context-aware briefings and tactical solutions for any complex academic query.',
    icon: Bot,
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/20',
    border: 'border-purple-500/20'
  },
  {
    name: 'Knowledge Sprints',
    description: 'Engage in high-fidelity competitive quizzes. Claim study credits for mastery and ascend the global legend rankings.',
    icon: Sparkles,
    color: 'text-sky-400',
    bgColor: 'bg-sky-900/20',
    border: 'border-sky-500/20'
  },
  {
    name: 'Deep Focus Protocol',
    description: 'Scientifically calibrated timers with penalty enforcement to ensure absolute cognitive lock-in and productivity isolation.',
    icon: Zap,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/20',
    border: 'border-yellow-500/20'
  },
  {
    name: 'Tactical Resources',
    description: 'A premium repository of high-level exam data. Structured specifically for rapid ingestion and mastery of complex subjects.',
    icon: FileText,
    color: 'text-rose-400',
    bgColor: 'bg-rose-900/20',
    border: 'border-rose-500/20'
  },
  {
    name: 'Study Alliances',
    description: 'Forge clans with elite scholars. Synchronize schedules and conquer milestones as a collective intelligence unit.',
    icon: Users,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-900/20',
    border: 'border-emerald-500/20'
  },
  {
    name: 'Milestone Legacy',
    description: 'Maintain consistency to unlock legendary artifacts, custom badges, and exclusive command center access.',
    icon: Award,
    color: 'text-orange-400',
    bgColor: 'bg-orange-900/20',
    border: 'border-orange-500/20'
  }
];

const testimonials = [
    {
        name: "Aryan Gupta",
        rank: "Elite Member",
        text: "The Focus Mode is brutal but necessary. It's the only thing that kept me disciplined during the final months of my JEE prep.",
        avatar: "https://picsum.photos/seed/aryan/100"
    },
    {
        name: "Sneha Reddy",
        rank: "Scholar",
        text: "MindMate feels like a command center. Marco AI is surprisingly sharp, and the UI makes studying feel like a high-stakes mission.",
        avatar: "https://picsum.photos/seed/sneha/100"
    },
    {
        name: "Vikram Singh",
        rank: "Clan Leader",
        text: "Synchronizing with my clan has turned preparation into a competitive sport. We track collective hours and win together.",
        avatar: "https://picsum.photos/seed/vikram/100"
    }
];

function NeuralNetworkBackground() {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-black">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#121212_0%,#000_100%)]" />
            <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="synapse-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {[...Array(30)].map((_, i) => (
                    <motion.path
                        key={i}
                        d={`M ${Math.random() * 100}% ${Math.random() * 100}% L ${Math.random() * 100}% ${Math.random() * 100}%`}
                        stroke="url(#synapse-grad)"
                        strokeWidth="0.5"
                        fill="none"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: [0, 1, 0], opacity: [0, 0.5, 0] }}
                        transition={{
                            duration: 10 + Math.random() * 10,
                            repeat: Infinity,
                            delay: Math.random() * 5,
                            ease: "linear"
                        }}
                    />
                ))}
                {[...Array(50)].map((_, i) => (
                    <motion.circle
                        key={i}
                        cx={`${Math.random() * 100}%`}
                        cy={`${Math.random() * 100}%`}
                        r="1"
                        fill="#8b5cf6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.8, 0], scale: [0.5, 1.5, 0.5] }}
                        transition={{
                            duration: 5 + Math.random() * 5,
                            repeat: Infinity,
                            delay: Math.random() * 5
                        }}
                    />
                ))}
            </svg>
            <div className="absolute inset-0 bg-grid-white/[0.01] bg-[size:80px_80px]" />
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
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col selection:bg-primary/30 text-slate-200">
      <NeuralNetworkBackground />

      {/* Sovereign Header */}
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/40 backdrop-blur-3xl">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-8">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="p-2 rounded-2xl bg-white/5 border border-white/10 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                <Logo className="h-10 w-10" />
            </div>
            <div className="flex flex-col">
                <span className="font-black text-2xl tracking-tighter uppercase italic leading-none bg-gradient-to-r from-white via-slate-300 to-slate-500 bg-clip-text text-transparent">MindMate</span>
                <span className="text-[9px] font-black uppercase tracking-[0.5em] text-primary mt-1.5 ml-0.5">EmityGate Mainframe</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
             <Link href="/dashboard/guide" className="group flex items-center gap-3 px-5 py-2 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 group-hover:text-white">Protocol v2.5: Active Briefings</span>
                <ArrowRight className="h-3 w-3 opacity-40 group-hover:translate-x-1 transition-transform" />
             </Link>
          </div>

          <div className="flex items-center gap-4">
             <SignInButton mode="modal">
                <Button variant="ghost" className="hidden sm:flex font-black text-xs uppercase tracking-widest text-slate-400 hover:text-white hover:bg-transparent">Secure Ingress</Button>
            </SignInButton>
            <SignUpButton mode="modal">
                <Button className="h-12 px-8 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all border border-white/10 bg-primary hover:bg-primary/90">Initialize</Button>
            </SignUpButton>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10 pt-20">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 text-center">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1 }}
                className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl glass-module mb-12"
            >
                <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#8b5cf6]" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-100">Establish Link: Intelligence Active</span>
            </motion.div>

            <motion.h1 
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter uppercase italic leading-[0.8] mb-12"
            >
                <span className="bg-gradient-to-b from-white to-slate-600 bg-clip-text text-transparent">Command Your</span> <br />
                <span className="text-white drop-shadow-[0_0_30px_rgba(139,92,246,0.4)]">Education</span>
            </motion.h1>

            <motion.p 
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="mx-auto max-w-3xl text-lg sm:text-2xl text-slate-400 font-medium leading-relaxed px-6"
            >
                MindMate is a <span className="text-white font-bold">Cognitive Fortress</span> for the next generation of scholars. Master your time, manage your resources, and claim your legend within the mainframe.
            </motion.p>

            <motion.div 
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-lg mx-auto"
            >
                <SignUpButton mode="modal">
                    <Button size="lg" className="w-full h-18 text-2xl font-black rounded-[2rem] shadow-2xl shadow-primary/40 uppercase italic transition-all hover:scale-105 active:scale-95 group">
                        Initialize Link
                        <ArrowRight className="ml-3 h-7 w-7 transition-transform group-hover:translate-x-2" />
                    </Button>
                </SignUpButton>
                <Button variant="outline" size="lg" asChild className="w-full h-18 text-xl font-bold rounded-[2rem] border-white/10 hover:bg-white/5 uppercase backdrop-blur-3xl transition-all hover:border-primary/50">
                    <Link href="/dashboard/guide">System Manual</Link>
                </Button>
            </motion.div>

            <motion.div 
                animate={{ y: [0, 15, 0] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className="mt-24 opacity-20"
            >
                <ChevronDown className="h-10 w-10 text-primary" />
            </motion.div>
        </section>

        {/* Features Modules */}
        <section className="py-40 px-6">
          <div className="container mx-auto">
            <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-150px" }}
                variants={containerVariants}
                className="text-center mb-32"
            >
              <h2 className="text-5xl sm:text-7xl font-black tracking-tight uppercase italic mb-6">Mainframe Modules</h2>
              <div className="h-1.5 w-24 bg-primary mx-auto rounded-full shadow-[0_0_25px_#8b5cf6]" />
              <p className="mt-10 text-xl sm:text-2xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">Advanced tactical systems engineered for comprehensive academic dominance.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <motion.div 
                    key={i} 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={itemVariants}
                    whileHover={{ y: -12, scale: 1.02 }}
                    className={cn(
                        "relative flex flex-col rounded-[3.5rem] p-12 backdrop-blur-3xl glass-module transition-all duration-700 hover:bg-white/[0.07] h-full",
                        feature.border
                    )}
                >
                  <div className={cn("flex h-20 w-20 items-center justify-center rounded-[2rem] shadow-2xl transition-transform duration-500 group-hover:rotate-12", feature.bgColor)}>
                    <feature.icon className={cn("h-10 w-10", feature.color)} />
                  </div>
                  <h3 className="mt-10 text-3xl font-black text-white uppercase tracking-tight italic">{feature.name}</h3>
                  <p className="mt-6 text-slate-400 leading-relaxed font-medium text-lg">{feature.description}</p>
                  
                  <div className="mt-12 pt-12 border-t border-white/5 flex items-center justify-between opacity-40 group-hover:opacity-100 transition-opacity">
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Protocol Active</span>
                    <ShieldCheck className={cn("h-5 w-5", feature.color)} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Global Intelligence Map */}
        <section className="py-40 px-6 relative overflow-hidden bg-black/40">
            <div className="container mx-auto text-center relative z-10">
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="space-y-8 mb-24">
                    <div className="p-5 rounded-full bg-primary/10 w-fit mx-auto border border-primary/20 shadow-inner">
                        <Globe className="h-14 w-14 text-primary animate-pulse" />
                    </div>
                    <h2 className="text-5xl sm:text-8xl font-black uppercase italic tracking-tighter">Global Intelligence Feed</h2>
                    <p className="text-slate-400 text-xl sm:text-2xl font-medium max-w-3xl mx-auto leading-relaxed">Synchronizing real-time progress data from top-tier scholars across the Sovereign Network.</p>
                </motion.div>
                
                <ActivityGlobe />
            </div>
        </section>

        {/* Feedbacks / Briefings */}
        <section className="py-40 px-6">
            <div className="container mx-auto">
                <div className="text-center mb-32 space-y-6">
                    <div className="p-4 bg-primary/10 rounded-[2rem] w-fit mx-auto border border-primary/20 shadow-2xl">
                        <Quote className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="text-5xl sm:text-7xl font-black tracking-tight uppercase italic">Citizen Briefings</h2>
                    <p className="text-slate-400 font-medium text-xl sm:text-2xl">Performance reports from high-performing scholars.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.15 }}
                            className="p-12 rounded-[4rem] glass-module relative group hover:border-primary/40 transition-all duration-700"
                        >
                            <div className="flex items-center gap-6 mb-10">
                                <div className="relative">
                                    <div className="absolute -inset-1.5 bg-primary/20 rounded-2xl blur group-hover:bg-primary/40 transition-colors" />
                                    <NextImage src={t.avatar} alt={t.name} width={80} height={80} className="rounded-2xl border-2 border-white/10 grayscale group-hover:grayscale-0 transition-all duration-700 relative z-10" />
                                </div>
                                <div>
                                    <p className="font-black text-2xl uppercase tracking-tight text-white">{t.name}</p>
                                    <p className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mt-1">{t.rank}</p>
                                </div>
                            </div>
                            <p className="text-slate-300 text-xl leading-relaxed italic font-medium opacity-80 group-hover:opacity-100 transition-opacity">"{t.text}"</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>

        {/* Pre-Footer Action */}
        <section className="py-60 px-6 text-center">
            <motion.div 
                initial={{ y: 40, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                className="max-w-6xl mx-auto rounded-[5rem] bg-gradient-to-br from-primary/30 via-slate-950 to-black p-16 sm:p-32 border border-white/10 shadow-[0_0_150px_rgba(139,92,246,0.2)] relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-grid-white/[0.02] mix-blend-overlay pointer-events-none" />
                <h2 className="text-6xl sm:text-9xl font-black uppercase italic leading-none tracking-tighter mb-12">Claim Your <br /> Legend</h2>
                <p className="text-2xl sm:text-3xl text-slate-400 font-medium max-w-3xl mx-auto mb-20 leading-relaxed">Establish your uplink to the MindMate mainframe now and gain an absolute advantage.</p>
                <SignUpButton mode="modal">
                    <Button size="lg" className="h-24 px-20 text-3xl font-black rounded-[3rem] shadow-[0_0_50px_rgba(139,92,246,0.5)] transition-all hover:scale-105 active:scale-95 uppercase italic bg-white text-black hover:bg-slate-100">
                        ESTABLISH UPLINK
                    </Button>
                </SignUpButton>
            </motion.div>
        </section>
      </main>

      {/* Enterprise SaaS Footer */}
      <footer className="border-t border-white/5 bg-black/80 backdrop-blur-3xl py-32 relative z-10 px-6 sm:px-12">
        <div className="container mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-20 mb-32">
                <div className="space-y-10 text-center sm:text-left">
                    <Link href="/" className="flex items-center justify-center sm:justify-start gap-4">
                        <div className="p-2 rounded-2xl bg-white/5 border border-white/10">
                            <Logo className="h-12 w-12" />
                        </div>
                        <span className="font-black text-3xl tracking-tighter uppercase italic bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">MindMate</span>
                    </Link>
                    <p className="text-base text-slate-500 font-medium leading-relaxed max-w-xs mx-auto sm:mx-0">
                        The definitive study mainframe engineered for academic dominance. A subsidiary of <span className="text-white font-bold">EmityGate Solutions</span>.
                    </p>
                    <div className="flex justify-center sm:justify-start gap-5">
                        {[Smartphone, Layout, ShieldCheck, Zap].map((Icon, i) => (
                            <div key={i} className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors flex items-center justify-center group cursor-pointer">
                                <Icon className="h-5 w-5 text-slate-500 group-hover:text-primary transition-colors" />
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="font-black text-[11px] uppercase tracking-[0.5em] mb-12 text-primary text-center sm:text-left">Intelligence</h4>
                    <ul className="space-y-6 text-sm font-black uppercase tracking-[0.25em] text-slate-400 text-center sm:text-left">
                        <li><Link href="/about" className="hover:text-white transition-colors flex items-center justify-center sm:justify-start gap-3"><Info className="h-4 w-4 text-primary" /> Origins</Link></li>
                        <li><Link href="/contact" className="hover:text-white transition-colors flex items-center justify-center sm:justify-start gap-3"><Mail className="h-4 w-4 text-primary" /> Command Hub</Link></li>
                        <li><Link href="/dashboard/guide" className="hover:text-white transition-colors flex items-center justify-center sm:justify-start gap-3"><BookOpen className="h-4 w-4 text-primary" /> Briefings</Link></li>
                        <li><Link href="/dashboard/roadmap" className="hover:text-white transition-colors flex items-center justify-center sm:justify-start gap-3"><Rocket className="h-4 w-4 text-primary" /> Roadmap</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-black text-[11px] uppercase tracking-[0.5em] mb-12 text-primary text-center sm:text-left">Protocols</h4>
                    <ul className="space-y-6 text-sm font-black uppercase tracking-[0.25em] text-slate-400 text-center sm:text-left">
                        <li><Link href="/privacy" className="hover:text-white transition-colors flex items-center justify-center sm:justify-start gap-3"><ShieldCheck className="h-4 w-4 text-primary" /> Encryption</Link></li>
                        <li><Link href="/terms" className="hover:text-white transition-colors flex items-center justify-center sm:justify-start gap-3"><FileText className="h-4 w-4 text-primary" /> Compliance</Link></li>
                        <li><Link href="/refund" className="hover:text-white transition-colors flex items-center justify-center sm:justify-start gap-3"><Clock className="h-4 w-4 text-primary" /> Refunds</Link></li>
                        <li><Link href="/faq" className="hover:text-white transition-colors flex items-center justify-center sm:justify-start gap-3"><MessageSquare className="h-4 w-4 text-primary" /> Archives</Link></li>
                    </ul>
                </div>

                <div className="text-center sm:text-left">
                    <h4 className="font-black text-[11px] uppercase tracking-[0.5em] mb-12 text-primary">Grid Status</h4>
                    <div className="space-y-8">
                        <div className="p-6 rounded-[2.5rem] glass-module flex items-center justify-center sm:justify-start gap-5 mx-auto sm:mx-0 max-w-[260px] shadow-2xl">
                            <ShieldCheck className="h-8 w-8 text-emerald-500" />
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-widest text-slate-300">Port Secure</p>
                                <p className="text-[11px] text-emerald-500 font-bold tracking-tighter">STABLE MAINNET</p>
                            </div>
                        </div>
                        <div className="flex justify-center sm:justify-start gap-5 opacity-40 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
                            <NextImage src="https://placehold.co/80x50/000000/FFFFFF/png?text=SSL" alt="SSL" width={80} height={50} className="rounded-2xl border border-white/10" />
                            <NextImage src="https://placehold.co/80x50/000000/FFFFFF/png?text=UPI" alt="UPI" width={80} height={50} className="rounded-2xl border border-white/10" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-16 border-t border-white/5 flex flex-col lg:flex-row justify-between items-center gap-12 text-[10px] font-black uppercase tracking-[0.6em] text-slate-600">
                <p className="text-center lg:text-left leading-relaxed">© {new Date().getFullYear()} EMITYGATE SOLUTIONS. UNIFIED INTELLIGENCE EDIFICE.</p>
                <div className="flex flex-wrap justify-center gap-10">
                    <span className="flex items-center gap-3 transition-colors hover:text-white"><MonitorIcon className="h-4 w-4 text-primary" /> INFRA: OPTIMIZED</span>
                    <span className="flex items-center gap-3 transition-colors hover:text-white"><ShieldCheck className="h-4 w-4 text-primary" /> SEC: RSA-ACTIVE</span>
                    <span className="flex items-center gap-3 transition-colors hover:text-white"><Zap className="h-4 w-4 text-primary" /> LATENCY: 12MS</span>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
}

const BrainCircuit = (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .52 8.208 4 4 0 0 0 5.274 2.253 3 3 0 1 0 5.458-2.253 4 4 0 0 0 .52-8.208 4 4 0 0 0-2.526-5.77A3 3 0 0 0 12 5Z"/><path d="M9 13a4.5 4.5 0 0 0 3-4"/><path d="M6.003 5.125A3 3 0 0 0 7 11"/><path d="M15.474 19.253a3 3 0 0 1-1 1.747"/><path d="M6.52 10.895a4 4 0 0 0-.52 8.208"/><path d="M17.48 10.895a4 4 0 0 1 .52 8.208"/></svg>
);