
'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, Users, Zap, FileText, Award, Gamepad2, ShieldCheck, Star } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '../ui/logo';
import { SignedIn, SignedOut, SignUpButton } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { ActivityGlobe } from './ActivityGlobe';
import { motion } from 'framer-motion';

const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Sovereign Guide', href: '/dashboard/guide' },
    { name: 'About EmityGate', href: '/about' },
]

const features = [
  {
    name: 'Marco AI Partner',
    description: 'Instant academic briefings and complex problem solving powered by next-gen intelligence.',
    icon: Bot,
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/20',
  },
  {
    name: 'Gamified Discipline',
    description: 'Solve high-stakes quizzes and challenges to earn study credits and climb the global rankings.',
    icon: Gamepad2,
    color: 'text-green-400',
    bgColor: 'bg-green-900/20',
  },
  {
    name: 'Deep Focus Engine',
    description: 'Scientifically calibrated study timers designed to eliminate distractions and maximize retention.',
    icon: Zap,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/20',
  },
  {
    name: 'Premium Resources',
    description: 'Curated library of JEE, NEET, and Board Exam materials specifically organized for peak performance.',
    icon: FileText,
    color: 'text-rose-400',
    bgColor: 'bg-rose-900/20',
  },
  {
    name: 'Sovereign Alliances',
    description: 'Join elite study clans to collaborate, share wisdom, and compete in team-based leaderboards.',
    icon: Users,
    color: 'text-sky-400',
    bgColor: 'bg-sky-900/20',
  },
  {
    name: 'Legendary Rewards',
    description: 'Maintain your consistency streak to unlock artifacts, custom badges, and exclusive system access.',
    icon: Award,
    color: 'text-orange-400',
    bgColor: 'bg-orange-900/20',
  }
];

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white selection:bg-primary/30">
      {/* JSON-LD for Google SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "MindMate",
            "url": "https://mindmate.emitygate.com",
            "applicationCategory": "EducationalApplication",
            "operatingSystem": "Web, Android, iOS",
            "author": {
              "@type": "Organization",
              "name": "EmityGate"
            },
            "description": "The ultimate AI-powered study ecosystem for academic excellence."
          })
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Logo className="h-8 w-8" />
            <span className="hidden sm:inline tracking-tighter">MindMate <span className="text-[10px] text-muted-foreground ml-1 uppercase">by EmityGate</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
                 <a key={link.name} href={link.href} className="text-sm font-medium text-slate-300 hover:text-white transition-colors uppercase tracking-widest text-[10px]">
                    {link.name}
                </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
             <SignedOut>
                 <SignUpButton mode="modal">
                    <Button className="font-bold">
                        JOIN THE ALLIANCE <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </SignUpButton>
             </SignedOut>
             <SignedIn>
                <Link href="/dashboard">
                  <Button variant="outline" className="border-primary/20 hover:bg-primary/10">GO TO COMMAND CENTER <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </Link>
             </SignedIn>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 sm:py-32">
            <div className="absolute inset-0 blue-nebula-bg opacity-20 pointer-events-none" />
            <div className="container mx-auto px-4 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-5xl font-black tracking-tighter text-white sm:text-7xl lg:text-8xl uppercase italic">
                        Master the <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">Protocol</span>
                    </h1>
                    <p className="mx-auto mt-8 max-w-2xl text-lg md:text-xl text-slate-400 font-medium leading-relaxed">
                        MindMate is the Sovereign Study Ecosystem by EmityGate. Engineered for high-performers who demand AI intelligence, deep focus, and total academic oversight.
                    </p>
                    <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
                        <SignUpButton mode="modal">
                            <Button size="lg" className="px-10 h-16 text-xl font-black rounded-2xl shadow-2xl shadow-primary/20 uppercase italic">Start Your Ascent</Button>
                        </SignUpButton>
                        <Button variant="outline" size="lg" asChild className="px-10 h-16 text-xl font-bold rounded-2xl border-white/10 hover:bg-white/5 uppercase">
                            <Link href="/dashboard/guide">System Briefing</Link>
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 bg-slate-900/30">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center mb-24">
              <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl uppercase">The EdTech Mainframe</h2>
              <div className="h-1.5 w-24 bg-primary mx-auto mt-4 rounded-full" />
              <p className="mt-6 text-xl text-slate-400 font-medium">Tools engineered for the next generation of scholars.</p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => (
                <motion.div 
                    key={i} 
                    whileHover={{ y: -10 }}
                    className="flex flex-col rounded-[2rem] border border-white/5 bg-slate-950/50 p-10 backdrop-blur-xl transition-all hover:border-primary/30 group"
                >
                  <div className={cn("flex h-16 w-16 items-center justify-center rounded-2xl shadow-xl transition-transform group-hover:scale-110", feature.bgColor)}>
                    <feature.icon className={cn("h-8 w-8", feature.color)} />
                  </div>
                  <h3 className="mt-8 text-2xl font-black text-white uppercase tracking-tight italic">{feature.name}</h3>
                  <p className="mt-4 text-base text-slate-400 leading-relaxed font-medium">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Global Community Section */}
        <section className="py-32 overflow-hidden">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-4xl font-black mb-4 uppercase">The Sovereign Network</h2>
                <p className="text-slate-400 mb-16 font-medium">Connecting thousands of active Legends across the globe.</p>
                <ActivityGlobe />
            </div>
        </section>
      </main>

      {/* Compliance Footer */}
      <footer className="border-t border-white/5 bg-slate-950 py-20">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="space-y-6">
                    <div className="flex items-center gap-2 font-bold text-2xl">
                        <Logo className="h-8 w-8" />
                        <span className="tracking-tighter">MindMate</span>
                    </div>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed">A subsidiary of <span className="text-white font-bold">EmityGate Solutions</span>. Pioneering the future of intelligent learning ecosystems.</p>
                </div>
                <div>
                    <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-6 text-primary">Intelligence</h4>
                    <ul className="space-y-4 text-sm text-slate-400 font-medium">
                        <li><Link href="/about" className="hover:text-white transition-colors">Operational History</Link></li>
                        <li><Link href="/contact" className="hover:text-white transition-colors">Support Command</Link></li>
                        <li><Link href="/dashboard/guide" className="hover:text-white transition-colors">System Briefings</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-6 text-primary">Protocol</h4>
                    <ul className="space-y-4 text-sm text-slate-400 font-medium">
                        <li><Link href="/privacy" className="hover:text-white transition-colors">Data Encryption</Link></li>
                        <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                        <li><Link href="/refund" className="hover:text-white transition-colors">Refund Policy</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-6 text-primary">Security</h4>
                    <p className="text-xs text-slate-500 mb-4 font-bold uppercase tracking-widest">Gateway: Razorpay Stable</p>
                    <div className="flex gap-3 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
                        <Image src="https://placehold.co/50x30/png?text=VISA" alt="Visa Secured" width={50} height={30} className="rounded" />
                        <Image src="https://placehold.co/50x30/png?text=UPI" alt="UPI Instant" width={50} height={30} className="rounded" />
                        <Image src="https://placehold.co/50x30/png?text=SSL" alt="SSL Encrypted" width={50} height={30} className="rounded" />
                    </div>
                </div>
            </div>
            <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                <p>&copy; {new Date().getFullYear()} EMITYGATE SOLUTIONS. ALL RIGHTS RESERVED.</p>
                <div className="flex gap-6">
                    <span>V1.5 ENTERPRISE</span>
                    <span>SERVER: MAINNET</span>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
}
