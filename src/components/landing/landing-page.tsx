'use client';

import { Button } from '@/components/ui/button';
import { 
    ArrowRight, Bot, Users, Zap, FileText, Award, 
    Gamepad2, ShieldCheck, Globe, Zap as FlashIcon,
    Sparkles, ChevronDown, Monitor as MonitorIcon, Rocket, BrainCircuit,
    Star, Crown, CheckCircle2, Shield
} from 'lucide-react';
import Link from 'next/link';
import { Logo } from '../ui/logo';
import { SignUpButton, SignInButton } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { ActivityGlobe } from './ActivityGlobe';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
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
    <div className="flex min-h-screen flex-col bg-slate-950 text-white selection:bg-primary/30 overflow-x-hidden">
      {/* Hero Section with Parallax Background */}
      <section ref={targetRef} className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 blue-nebula-bg opacity-40" />
            <div className="absolute inset-0 bg-grid-slate-800/50 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
            <div id="particle-container">
                {[...Array(20)].map((_, i) => <div key={i} className="particle" />)}
            </div>
        </div>

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
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">System Online: v1.5 Enterprise</span>
            </motion.div>

            <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter uppercase italic leading-[0.9]"
            >
                Claim Your <br />
                <span className="bg-gradient-to-r from-yellow-400 via-white to-primary bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">Legend</span>
            </motion.h1>

            <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="mx-auto mt-8 max-w-2xl text-lg md:text-2xl text-slate-400 font-medium leading-relaxed"
            >
                The Sovereign Study Mainframe by <span className="text-white font-bold">EmityGate</span>. 
                Intelligence meets discipline in the ultimate academic edifice.
            </motion.p>

            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6"
            >
                <SignUpButton mode="modal">
                    <Button size="lg" className="group px-10 h-16 text-xl font-black rounded-2xl shadow-2xl shadow-primary/20 uppercase italic transition-all hover:scale-105 active:scale-95">
                        Initialize Ascent
                        <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-2" />
                    </Button>
                </SignUpButton>
                <Button variant="outline" size="lg" asChild className="px-10 h-16 text-xl font-bold rounded-2xl border-white/10 hover:bg-white/5 uppercase backdrop-blur-sm">
                    <Link href="/dashboard/guide">Operational Manual</Link>
                </Button>
            </motion.div>
        </motion.div>

        <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-30"
        >
            <ChevronDown className="h-8 w-8" />
        </motion.div>
      </section>

      {/* Floating Header */}
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-slate-950/20 backdrop-blur-xl">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-3 font-bold text-2xl group">
            <div className="p-1 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Logo className="h-10 w-10" />
            </div>
            <span className="tracking-tighter uppercase italic">MindMate</span>
          </Link>
          <div className="flex items-center gap-4">
             <SignInButton mode="modal">
                <Button variant="ghost" className="hidden sm:flex font-black text-xs uppercase tracking-widest hover:bg-white/5">Establish Uplink</Button>
            </SignInButton>
            <SignUpButton mode="modal">
                <Button className="h-11 px-6 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20">Sign Up</Button>
            </SignUpButton>
          </div>
        </div>
      </header>

      <main className="flex-1">
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
              <h2 className="text-4xl font-black tracking-tight text-white sm:text-6xl uppercase italic">The Mainframe Modules</h2>
              <div className="h-1.5 w-24 bg-primary mx-auto mt-6 rounded-full shadow-[0_0_15px_hsl(var(--primary))]" />
              <p className="mt-8 text-xl text-slate-400 font-medium">Engineered for peak cognitive output.</p>
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
                    whileHover={{ y: -10, rotate: 1 }}
                    className={cn(
                        "relative flex flex-col rounded-[3rem] border bg-slate-900/40 p-12 backdrop-blur-2xl transition-all duration-500 hover:shadow-2xl h-full",
                        feature.border
                    )}
                >
                  <div className={cn("flex h-20 w-20 items-center justify-center rounded-[1.5rem] shadow-2xl transition-transform group-hover:scale-110", feature.bgColor)}>
                    <feature.icon className={cn("h-10 w-10", feature.color)} />
                  </div>
                  <h3 className="mt-10 text-3xl font-black text-white uppercase tracking-tight italic">{feature.name}</h3>
                  <p className="mt-6 text-lg text-slate-400 leading-relaxed font-medium">{feature.description}</p>
                  
                  <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between opacity-40 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-black uppercase tracking-widest">Protocol: Active</span>
                    <FlashIcon className={cn("h-4 w-4", feature.color)} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Intelligence / Network Section */}
        <section id="intelligence" className="py-32 relative bg-slate-900/20 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <div className="container mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="space-y-6"
                >
                    <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto border border-primary/20">
                        <Globe className="h-12 w-12 text-primary animate-pulse" />
                    </div>
                    <h2 className="text-5xl font-black uppercase italic tracking-tighter">Global Intelligence Feed</h2>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto font-medium">Synchronizing with thousands of active Legends in real-time across the Sovereign Network.</p>
                </motion.div>
                
                <div className="mt-20">
                    <ActivityGlobe />
                </div>
            </div>
        </section>

        {/* CTA Section */}
        <section className="py-40 relative">
            <div className="container mx-auto px-4 text-center relative z-10">
                <div className="max-w-4xl mx-auto rounded-[4rem] bg-gradient-to-br from-primary via-purple-600 to-indigo-900 p-12 md:p-24 shadow-[0_0_100px_rgba(139,92,246,0.4)] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-grid-slate-800/20 mix-blend-overlay" />
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        className="relative z-10 space-y-8"
                    >
                        <h2 className="text-4xl md:text-7xl font-black uppercase italic leading-none tracking-tighter">Your Legacy <br /> Starts Today</h2>
                        <p className="text-xl md:text-2xl text-white/80 font-medium max-w-2xl mx-auto">Establish your uplink to the mainframe and claim your bonus credits instantly.</p>
                        <div className="pt-8">
                            <SignUpButton mode="modal">
                                <Button size="lg" variant="secondary" className="h-20 px-16 text-2xl font-black rounded-[2rem] shadow-2xl hover:scale-105 active:scale-95 transition-transform uppercase italic">
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
      <footer className="border-t border-white/5 bg-slate-950 py-20">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="space-y-6">
                    <div className="flex items-center gap-2 font-bold text-2xl">
                        <div className="p-1 rounded-lg bg-primary/10">
                            <Logo className="h-8 w-8" />
                        </div>
                        <span className="tracking-tighter uppercase italic">MindMate</span>
                    </div>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed">
                        A flagship subsidiary of <span className="text-white font-bold">EmityGate Solutions</span>. 
                        Defining the next epoch of intelligent learning ecosystems.
                    </p>
                </div>
                <div>
                    <h4 className="font-black text-[10px] uppercase tracking-[0.3em] mb-8 text-primary">Intelligence</h4>
                    <ul className="space-y-4 text-sm text-slate-400 font-medium">
                        <li><Link href="/about" className="hover:text-white transition-colors">Operational History</Link></li>
                        <li><Link href="/contact" className="hover:text-white transition-colors">Support Command</Link></li>
                        <li><Link href="/dashboard/guide" className="hover:text-white transition-colors">System Briefings</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-black text-[10px] uppercase tracking-[0.3em] mb-8 text-primary">Protocol</h4>
                    <ul className="space-y-4 text-sm text-slate-400 font-medium">
                        <li><Link href="/privacy" className="hover:text-white transition-colors">Data Encryption</Link></li>
                        <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                        <li><Link href="/refund" className="hover:text-white transition-colors">Refund Policy</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-black text-[10px] uppercase tracking-[0.3em] mb-8 text-primary">Cyber-Security</h4>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                            <ShieldCheck className="h-5 w-5 text-emerald-500" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">SECURE PORTAL v2.0</span>
                        </div>
                        <div className="flex gap-3 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
                            <NextImage src="https://placehold.co/50x30/png?text=VISA" alt="Visa" width={50} height={30} className="rounded" />
                            <NextImage src="https://placehold.co/50x30/png?text=UPI" alt="UPI" width={50} height={30} className="rounded" />
                            <NextImage src="https://placehold.co/50x30/png?text=SSL" alt="SSL" width={50} height={30} className="rounded" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-black uppercase tracking-[0.4em] text-slate-600">
                <p>&copy; {new Date().getFullYear()} EMITYGATE SOLUTIONS. ALL RIGHTS RESERVED.</p>
                <div className="flex gap-8">
                    <span className="flex items-center gap-2"><MonitorIcon className="h-3 w-3" /> INFRA: MAINNET</span>
                    <span className="flex items-center gap-2"><Shield className="h-3 w-3" /> SEC: ENCRYPTED</span>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
}