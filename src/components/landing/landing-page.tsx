'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowRight, Bot, Users, Zap, Award, 
    Globe, Sparkles, ShieldCheck, 
    Instagram, Youtube, Send, 
    Code, CreditCard, Clock, Gem, Vault,
    MessageSquare, ExternalLink, ShieldAlert,
    BookOpen, FileText, ChevronDown, Trophy, Timer, Map, Wrench, Smartphone, Laptop, Target, X, Star, Rocket, Crown
} from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';
import { SignUpButton, SignInButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import '@/app/landing.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

// --- PLEXUS ENGINE ---
class Node {
    x: number; y: number; vx: number; vy: number; r: number; alpha: number;
    constructor(w: number, h: number, speed: number) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * speed;
        this.vy = (Math.random() - 0.5) * speed;
        this.r = 0.5 + Math.random() * 1.7;
        this.alpha = 0.25 + Math.random() * 0.45;
    }
    update(w: number, h: number, mx?: number, my?: number) {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > h) this.vy *= -1;

        if (mx !== undefined && my !== undefined) {
            const dx = this.x - mx;
            const dy = this.y - my;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 110) {
                const force = (110 - dist) / 110 * 2.2;
                this.vx += (dx / dist) * force;
                this.vy += (dy / dist) * force;
            }
        }
        this.vx *= 0.97;
        this.vy *= 0.97;
    }
}

function PlexusCanvas({ color, density, glow, speed, active, mouse }: any) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const nodes = useRef<Node[]>([]);

    const init = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const w = canvas.width = window.innerWidth;
        const h = canvas.height = window.innerHeight;
        const count = Math.floor((w * h / 18000) * (density / 45));
        nodes.current = Array.from({ length: count }, () => new Node(w, h, speed));
    }, [density, speed]);

    useEffect(() => {
        init();
        window.addEventListener('resize', init);
        return () => window.removeEventListener('resize', init);
    }, [init]);

    useEffect(() => {
        if (!active) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;

        let frame: number;
        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            nodes.current.forEach(n => {
                n.update(canvas.width, canvas.height, mouse.x, mouse.y);
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${color}, ${n.alpha})`;
                ctx.shadowBlur = 6 * glow;
                ctx.shadowColor = `rgba(${color}, 0.5)`;
                ctx.fill();
            });

            ctx.lineWidth = 0.5;
            for (let i = 0; i < nodes.current.length; i++) {
                for (let j = i + 1; j < nodes.current.length; j++) {
                    const n1 = nodes.current[i];
                    const n2 = nodes.current[j];
                    const dist = Math.sqrt((n1.x - n2.x)**2 + (n1.y - n2.y)**2);
                    if (dist < 145) {
                        ctx.beginPath();
                        ctx.moveTo(n1.x, n1.y);
                        ctx.lineTo(n2.x, n2.y);
                        ctx.strokeStyle = `rgba(${color}, ${(1 - dist/145) * 0.28 * glow})`;
                        ctx.stroke();
                    }
                }
            }
            frame = requestAnimationFrame(render);
        };
        render();
        return () => cancelAnimationFrame(frame);
    }, [active, color, glow, mouse]);

    return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-40" />;
}

// --- STAT COUNTER ---
function StatCounter({ target, suffix = "" }: { target: number, suffix?: string }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number;
        const animate = (now: number) => {
            if (!startTime) startTime = now;
            const progress = Math.min((now - startTime) / 1800, 1);
            const ease = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(ease * target));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [target]);

    return <span>{count.toLocaleString()}{suffix}</span>;
}

// --- MAIN PAGE ---
export function LandingPage() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [mouse, setMouse] = useState({ x: 0, y: 0 });
    const [selectedFounder, setSelectedFounder] = useState<'waiz' | 'msm' | null>(null);
    const scrollBuffer = useRef(0);
    const touchStartY = useRef(0);

    const totalSlides = 6;

    const goTo = useCallback((index: number) => {
        if (isAnimating || index === currentSlide || index < 0 || index >= totalSlides) return;
        setIsAnimating(true);
        setCurrentSlide(index);
        setTimeout(() => setIsAnimating(false), 950);
    }, [currentSlide, isAnimating]);

    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            scrollBuffer.current += e.deltaY;
            if (Math.abs(scrollBuffer.current) > 55) {
                if (scrollBuffer.current > 0) goTo(currentSlide + 1);
                else goTo(currentSlide - 1);
                scrollBuffer.current = 0;
            }
        };

        const handleTouchStart = (e: TouchEvent) => {
            touchStartY.current = e.touches[0].clientY;
        };

        const handleTouchEnd = (e: TouchEvent) => {
            const touchEndY = e.changedTouches[0].clientY;
            const deltaY = touchStartY.current - touchEndY;
            
            if (Math.abs(deltaY) > 50) {
                if (deltaY > 0) goTo(currentSlide + 1);
                else goTo(currentSlide - 1);
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown' || e.key === 'PageDown') goTo(currentSlide + 1);
            if (e.key === 'ArrowUp' || e.key === 'PageUp') goTo(currentSlide - 1);
        };

        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchend', handleTouchEnd);
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentSlide, goTo]);

    // Cursor Follow
    useEffect(() => {
        const ring = document.getElementById('cursor-ring');
        const dot = document.getElementById('cursor-dot');
        let rx = 0, ry = 0;

        const move = (e: MouseEvent) => {
            const { clientX: mx, clientY: my } = e;
            setMouse({ x: mx, y: my });
            if (dot) {
                dot.style.left = `${mx}px`;
                dot.style.top = `${my}px`;
            }
            
            const animate = () => {
                rx += (mx - rx) * 0.12;
                ry += (my - ry) * 0.12;
                if (ring) {
                    ring.style.left = `${rx}px`;
                    ring.style.top = `${ry}px`;
                }
                requestAnimationFrame(animate);
            };
        };
        window.addEventListener('mousemove', move);
        return () => window.removeEventListener('mousemove', move);
    }, []);

    const slideConfigs = [
        { color: "255,77,109", density: 52, glow: 0.55, speed: 0.35, accent: "#ff4d6d" },
        { color: "180,138,255", density: 38, glow: 0.70, speed: 0.28, accent: "#b48aff" },
        { color: "54,255,184", density: 28, glow: 0.45, speed: 0.22, accent: "#36ffb8" },
        { color: "255,215,0", density: 40, glow: 0.85, speed: 0.30, accent: "#ffd700" },
        { color: "75,200,255", density: 60, glow: 0.75, speed: 0.40, accent: "#4bc8ff" },
        { color: "255,255,255", density: 30, glow: 0.30, speed: 0.15, accent: "#ffffff" }
    ];

    const modules = [
        { title: 'Focus Mode', icon: Zap, desc: 'High-stakes tracking.', color: 'text-yellow-400' },
        { title: 'Pomodoro', icon: Timer, desc: 'Classic sprint cycles.', color: 'text-green-400' },
        { title: 'Marco AI', icon: Bot, desc: 'Your 24/7 AI Tutor.', color: 'text-purple-400' },
        { title: 'Isolation', icon: ShieldAlert, desc: 'Hardened digital exile.', color: 'text-red-500' },
        { title: 'Roadmaps', icon: Map, desc: 'Strategic path planning.', color: 'text-orange-400' },
        { title: 'Time Tracker', icon: Clock, desc: 'Live precision logging.', color: 'text-sky-400' },
        { title: 'Resources', icon: BookOpen, desc: 'Premium library access.', color: 'text-blue-400' },
        { title: 'All Tools', icon: Wrench, desc: 'Unified student utilities.', color: 'text-emerald-400' }
    ];

    return (
        <div className="landing-root">
            <div id="cursor-dot" className="cursor-dot" />
            <div id="cursor-ring" className="cursor-ring" />

            <header className="fixed top-0 left-0 w-full z-[1000] border-b border-white/5 bg-black/30 backdrop-blur-md">
                <div className="container mx-auto h-20 flex items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <Logo className="h-10 w-10" />
                        <span className="logo-text font-black text-2xl tracking-tighter text-white uppercase">MindMate</span>
                    </div>
                    <nav className="hidden lg:flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <button onClick={() => goTo(1)} className="nav-link">Modules</button>
                        <button onClick={() => goTo(2)} className="nav-link">Intelligence</button>
                        <button onClick={() => goTo(3)} className="nav-link">Founders</button>
                        <button onClick={() => goTo(5)} className="nav-link">Contact</button>
                    </nav>
                    <div className="flex items-center gap-4">
                        <SignInButton mode="modal">
                            <Button className="ingress-btn h-11 px-8">Login</Button>
                        </SignInButton>
                    </div>
                </div>
            </header>

            <div className="slide-container">
                {/* SLIDE 0: HERO */}
                <section className={cn("slide slide-0", currentSlide === 0 ? "active" : currentSlide > 0 ? "above" : "below")}>
                    <PlexusCanvas {...slideConfigs[0]} active={currentSlide === 0} mouse={mouse} />
                    <div className="slide-content max-w-4xl flex flex-col items-center text-center">
                        <div className="flex gap-3 mb-8">
                            <span className="px-4 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest">🤖 AI Native</span>
                            <span className="px-4 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest">🛡️ Secure Vault</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase mb-8">
                            ASCEND TO <br />
                            <span className="keyword-glow">GREATNESS.</span>
                        </h1>
                        <p className="text-lg text-slate-400 max-w-xl leading-relaxed mb-10 opacity-60">
                            The integrated study ecosystem for elite scholars. Tactical AI guidance, deep focus protocols, and collective mastery.
                        </p>
                        <div className="flex gap-4">
                            <SignUpButton mode="modal">
                                <Button size="lg" className="h-16 px-10 rounded-2xl bg-white text-black font-black uppercase tracking-widest hover:bg-slate-200">Initialize</Button>
                            </SignUpButton>
                            <Button variant="outline" onClick={() => goTo(1)} className="h-16 px-10 rounded-2xl border-white/10 font-black uppercase tracking-widest text-white">Explore</Button>
                        </div>
                    </div>
                </section>

                {/* SLIDE 1: ENHANCED MODULES */}
                <section className={cn("slide slide-1", currentSlide === 1 ? "active" : currentSlide > 1 ? "above" : currentSlide < 1 ? "below" : "instant")}>
                    <PlexusCanvas {...slideConfigs[1]} active={currentSlide === 1} mouse={mouse} />
                    <div className="slide-content container px-4 sm:px-6">
                        <div className="text-center mb-8 sm:mb-16">
                            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">Operational Briefing</h2>
                            <p className="text-slate-400 mt-2 max-w-xl mx-auto font-medium text-sm sm:text-base">Integrated modules designed for academic dominance.</p>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                            {modules.map((f, i) => (
                                <div key={i} className="glass-module p-4 sm:p-8 flex flex-col items-center text-center">
                                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                                        <f.icon className={cn("h-5 w-5 sm:h-6 sm:w-6", f.color)} />
                                    </div>
                                    <h4 className="font-black uppercase text-xs sm:text-lg mb-1 sm:mb-2 text-white">{f.title}</h4>
                                    <p className="text-[10px] sm:text-sm text-slate-500 leading-tight font-medium hidden sm:block">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SLIDE 2: STATS */}
                <section className={cn("slide slide-2", currentSlide === 2 ? "active" : currentSlide > 2 ? "above" : currentSlide < 2 ? "below" : "instant")}>
                    <PlexusCanvas {...slideConfigs[2]} active={currentSlide === 2} mouse={mouse} />
                    <div className="slide-content container px-6 text-center">
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-20">Network Metrics</h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                            {[
                                { label: 'Active Scholars', target: 12500, suffix: '+' },
                                { label: 'Hours Focused', target: 850000, suffix: '+' },
                                { label: 'AI Responses', target: 2400000, suffix: '+' },
                                { label: 'Vaults Created', target: 4500, suffix: '' }
                            ].map((s, i) => (
                                <div key={i} className="stat-node">
                                    <span className="text-5xl md:text-7xl font-black tracking-tighter text-primary">
                                        {currentSlide === 2 && <StatCounter target={s.target} suffix={s.suffix} />}
                                    </span>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-4">{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SLIDE 3: FOUNDERS */}
                <section className={cn("slide slide-3", currentSlide === 3 ? "active" : currentSlide > 3 ? "above" : currentSlide < 3 ? "below" : "instant")}>
                    <PlexusCanvas {...slideConfigs[3]} active={currentSlide === 3} mouse={mouse} />
                    <div className="slide-content container px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic text-yellow-400">Meet the Architects</h2>
                            <p className="text-slate-400 mt-2 max-w-xl mx-auto font-medium">The visionaries behind the MindMate mainframe.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                            {/* Waiz Marco */}
                            <motion.div 
                                onClick={() => setSelectedFounder('waiz')}
                                whileHover={{ scale: 1.02 }}
                                className="group cursor-pointer relative"
                            >
                                <div className="absolute -inset-1 bg-yellow-400/20 rounded-[2.5rem] blur opacity-40 group-hover:opacity-100 transition duration-500" />
                                <div className="relative glass-module p-10 flex flex-col items-center text-center border-yellow-400/30">
                                    <div className="relative mb-6">
                                        <div className="absolute -inset-4 bg-yellow-400/10 rounded-full animate-pulse" />
                                        <Avatar className="h-32 w-32 border-4 border-yellow-400 shadow-2xl">
                                            <AvatarImage src="https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18zMldnVjZTYUx3c0xUUUZsdTlnSFN3UmcwY3kifQ" />
                                            <AvatarFallback>WM</AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <h3 className="text-2xl font-black text-white uppercase italic">Mohammed Waiz Monazzum</h3>
                                    <p className="text-yellow-400 text-[10px] font-black uppercase tracking-widest mt-1">Founder & Lead Architect (Waiz Marco)</p>
                                    <p className="text-slate-400 text-sm mt-4 font-medium leading-relaxed">The original visionary. Core developer of the MindMate source logic.</p>
                                    <Button variant="ghost" className="mt-6 text-yellow-400/60 group-hover:text-yellow-400 transition-colors">
                                        Inspect Registry <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </motion.div>

                            {/* Msm */}
                            <motion.div 
                                onClick={() => setSelectedFounder('msm')}
                                whileHover={{ scale: 1.02 }}
                                className="group cursor-pointer relative"
                            >
                                <div className="absolute -inset-1 bg-primary/20 rounded-[2.5rem] blur opacity-40 group-hover:opacity-100 transition duration-500" />
                                <div className="relative glass-module p-10 flex flex-col items-center text-center border-primary/30">
                                    <Avatar className="h-32 w-32 border-4 border-primary shadow-2xl mb-6">
                                        <AvatarImage src="https://picsum.photos/seed/msm/400" />
                                        <AvatarFallback>MSM</AvatarFallback>
                                    </Avatar>
                                    <h3 className="text-2xl font-black text-white uppercase italic">Shabaan Moazzum</h3>
                                    <p className="text-primary text-[10px] font-black uppercase tracking-widest mt-1">Co-Founder & UI Strategist (Msm)</p>
                                    <p className="text-slate-400 text-sm mt-4 font-medium leading-relaxed">Visual engineer responsible for the immersive Sovereign interface.</p>
                                    <Button variant="ghost" className="mt-6 text-primary/60 group-hover:text-primary transition-colors">
                                        Inspect Registry <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* SLIDE 4: CTA */}
                <section className={cn("slide slide-4", currentSlide === 4 ? "active" : currentSlide > 4 ? "above" : currentSlide < 4 ? "below" : "instant")}>
                    <PlexusCanvas {...slideConfigs[4]} active={currentSlide === 4} mouse={mouse} />
                    <div className="slide-content flex flex-col items-center justify-center text-center px-6">
                        <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-8 text-white">SECURE YOUR <br />LEGACY.</h2>
                        <SignUpButton mode="modal">
                            <Button size="lg" className="h-20 px-16 rounded-3xl ingress-btn text-xl shadow-2xl">Claim Your Mainframe</Button>
                        </SignUpButton>
                        <div className="mt-12 animate-bounce opacity-40">
                            <ChevronDown className="h-8 w-8" />
                        </div>
                    </div>
                </section>

                {/* SLIDE 5: ULTIMATE FOOTER */}
                <section className={cn("slide slide-5", currentSlide === 5 ? "active" : currentSlide < 5 ? "below" : "instant")}>
                    <PlexusCanvas {...slideConfigs[5]} active={currentSlide === 5} mouse={mouse} />
                    <div className="slide-content w-full h-full flex flex-col">
                        <ScrollArea className="flex-1 w-full h-full">
                            <div className="container mx-auto px-6 flex flex-col justify-center py-24 sm:py-32">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-16 mb-20">
                                    <div className="space-y-8 text-left">
                                        <div className="flex items-center gap-3">
                                            <Logo className="h-12 w-12" />
                                            <span className="font-black text-3xl uppercase tracking-tighter text-white">MindMate</span>
                                        </div>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-loose max-w-xs">
                                            Empowering the next generation of scholars through strategic automation and collective intelligence.
                                        </p>
                                        <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <ShieldCheck className="h-8 w-8 text-emerald-500" />
                                                <div className="text-[10px] font-black uppercase">
                                                    <p className="text-slate-400">Validated Ingress</p>
                                                    <p className="text-white mt-0.5">Razorpay Secure</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-left">
                                        <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-8">Mainframe</h5>
                                        <ul className="space-y-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            <li><Link href="https://emitygate.com" target="_blank" className="nav-link flex items-center gap-2">EmityGate Solutions <ExternalLink className="h-3 w-3"/></Link></li>
                                            <li><Link href="/about" className="nav-link">Strategic Mission</Link></li>
                                            <li><Link href="/dashboard/docs" className="nav-link flex items-center gap-2">Sovereign Docs <BookOpen className="h-3 w-3"/></Link></li>
                                            <li><Link href="/contact" className="nav-link flex items-center gap-2">Relay Signal <MessageSquare className="h-3 w-3"/></Link></li>
                                        </ul>
                                    </div>

                                    <div className="text-left">
                                        <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-8">Protocols</h5>
                                        <ul className="space-y-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            <li><Link href="/privacy" className="nav-link flex items-center gap-2">Privacy Shield <ShieldCheck className="h-3 w-3"/></Link></li>
                                            <li><Link href="/terms" className="nav-link flex items-center gap-2">Terms of Service <FileText className="h-3 w-3"/></Link></li>
                                            <li><Link href="/refund" className="nav-link flex items-center gap-2">Asset Protection <ShieldAlert className="h-3 w-3"/></Link></li>
                                        </ul>
                                    </div>

                                    <div className="text-left">
                                        <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-8">Alliance Hub</h5>
                                        <div className="flex flex-col gap-6">
                                            <div className="flex gap-4">
                                                <Link href="https://www.instagram.com/mindmatehq?igsh=MWd6dXJjbjVva2dlYg==" target="_blank" className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 transition-all">
                                                    <Instagram className="h-5 w-5" />
                                                </Link>
                                                <Link href="https://youtube.com/@mindmateofficials?si=_PpffdhhQFGCTi47" target="_blank" className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 transition-all">
                                                    <Youtube className="h-5 w-5" />
                                                </Link>
                                                <Link href="https://t.me/emitygate" target="_blank" className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 transition-all">
                                                    <Send className="h-5 w-5" />
                                                </Link>
                                                <Link href="https://whatsapp.com/channel/0029Vb6qoFb7YSd13q71Hc1H" target="_blank" className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 transition-all">
                                                    <Globe className="h-5 w-5" />
                                                </Link>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
                                                <p className="text-[8px] font-black uppercase text-primary mb-1">Official Status</p>
                                                <p className="text-[10px] font-bold text-white">NETWORK OPERATIONAL</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 pb-12">
                                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600">
                                        © {new Date().getFullYear()} EmityGate Solutions. All Rights Reserved.
                                    </p>
                                    <div className="flex gap-12 text-[9px] font-black uppercase tracking-[0.4em] text-slate-600">
                                        <span>Status: Stable</span>
                                        <span>Version: 2.5.0</span>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    </div>
                </section>
            </div>

            {/* Navigation Dots */}
            <div className="fixed right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-[1000]">
                {Array.from({ length: totalSlides }).map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goTo(i)}
                        className={cn(
                            "h-2 w-2 rounded-full transition-all duration-500",
                            currentSlide === i ? "bg-white scale-150 shadow-[0_0_10px_white]" : "bg-white/20 hover:bg-white/40"
                        )}
                    />
                ))}
            </div>

            {/* Slide Indicator */}
            <div className="fixed left-8 bottom-8 z-[1000] font-black text-[10px] uppercase tracking-widest text-slate-500">
                {String(currentSlide + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
            </div>

            {/* Progress Bar */}
            <div className="fixed top-0 left-0 h-0.5 z-[2000] transition-all duration-900" 
                 style={{ 
                    width: `${(currentSlide / (totalSlides - 1)) * 100}%`,
                    background: slideConfigs[currentSlide].accent,
                    boxShadow: `0 0 10px ${slideConfigs[currentSlide].accent}`
                 }} 
            />

            {/* Founder Registry Dialog */}
            <Dialog open={!!selectedFounder} onOpenChange={(o) => !o && setSelectedFounder(null)}>
                <DialogContent className="max-w-2xl bg-black/95 border-yellow-400/20 backdrop-blur-2xl p-0 overflow-hidden rounded-[3rem]">
                    <div className="relative h-48 bg-gradient-to-br from-yellow-400/20 via-black to-black">
                        <div className="absolute inset-0 bg-grid-white/5" />
                        <Button variant="ghost" size="icon" className="absolute top-6 right-6 text-white/40 hover:text-white" onClick={() => setSelectedFounder(null)}><X/></Button>
                    </div>
                    <div className="px-8 pb-12 -mt-16 relative z-10">
                        {selectedFounder === 'waiz' ? (
                            <div className="space-y-8">
                                <div className="flex flex-col sm:flex-row items-end gap-6">
                                    <Avatar className="h-40 w-40 border-4 border-yellow-400 shadow-2xl bg-black">
                                        <AvatarImage src="https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18zMldnVjZTYUx3c0xUUUZsdTlnSFN3UmcwY3kifQ" />
                                    </Avatar>
                                    <div className="pb-2">
                                        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">Waiz Marco</h2>
                                        <p className="text-yellow-400 font-black uppercase text-[10px] tracking-[0.3em] mt-2">Mohammed Waiz Monazzum</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    <div className="p-4 rounded-3xl bg-white/5 border border-white/10 text-center">
                                        <p className="text-[8px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Experience</p>
                                        <p className="text-xl font-black text-white">300+ PROJ</p>
                                    </div>
                                    <div className="p-4 rounded-3xl bg-white/5 border border-white/10 text-center">
                                        <p className="text-[8px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Authority</p>
                                        <p className="text-xl font-black text-white">ARCHITECT</p>
                                    </div>
                                    <div className="p-4 rounded-3xl bg-yellow-400/10 border border-yellow-400/20 text-center col-span-2 sm:col-span-1">
                                        <p className="text-[8px] font-black uppercase text-yellow-400 mb-1 tracking-widest">Founding</p>
                                        <p className="text-xl font-black text-yellow-400">EMITYGATE</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-primary">Sovereign Vision</h4>
                                    <p className="text-lg text-slate-300 font-medium italic leading-relaxed">
                                        "The future of academic excellence is not just in smarter study, but in the intelligent integration of human potential and neural automation. MindMate is the manifestation of that balance."
                                    </p>
                                    <div className="pt-4 border-t border-white/5 text-sm text-slate-400 font-medium leading-loose">
                                        As the lead developer and founder of EmityGate, Mohammed Waiz Monazzum (Waiz Marco) has spent years engineering high-fidelity digital systems. With over 300 successful projects delivered, his focus is on building platforms that don't just function, but inspire absolute mastery.
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="flex flex-col sm:flex-row items-end gap-6">
                                    <Avatar className="h-40 w-40 border-4 border-primary shadow-2xl bg-black">
                                        <AvatarImage src="https://picsum.photos/seed/msm/400" />
                                    </Avatar>
                                    <div className="pb-2">
                                        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">Msm</h2>
                                        <p className="text-primary font-black uppercase text-[10px] tracking-[0.3em] mt-2">Shabaan Moazzum</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-3xl bg-white/5 border border-white/10 text-center">
                                        <p className="text-[8px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Specialization</p>
                                        <p className="text-xl font-black text-white">UI STRATEGY</p>
                                    </div>
                                    <div className="p-4 rounded-3xl bg-primary/10 border border-primary/20 text-center">
                                        <p className="text-[8px] font-black uppercase text-primary mb-1 tracking-widest">Founding</p>
                                        <p className="text-xl font-black text-primary">CO-FOUNDER</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-primary">Aesthetic Protocol</h4>
                                    <p className="text-lg text-slate-300 font-medium italic leading-relaxed">
                                        "A legendary student needs a legendary workspace. We built the Sovereign interface to ensure every second of focus is an aesthetic and rewarding experience."
                                    </p>
                                    <div className="pt-4 border-t border-white/5 text-sm text-slate-400 font-medium leading-loose">
                                        Shabaan Moazzum (Msm) is the creative force behind the MindMate visual identity. His expertise in user experience and interface engineering ensures that the platform remains intuitive while pushing the boundaries of modern design.
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
