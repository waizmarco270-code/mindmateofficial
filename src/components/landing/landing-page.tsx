'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowRight, Bot, Users, Zap, Award, 
    Globe, Sparkles, ShieldCheck, 
    Instagram, Youtube, Send, 
    Code, CreditCard, Clock, Gem, Vault
} from 'lucide-react';
import Link from 'next/link';
import { Logo } from '../ui/logo';
import { SignUpButton, SignInButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import '@/app/landing.css';

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
    const scrollBuffer = useRef(0);
    const touchStartY = useRef(0);

    const totalSlides = 4;

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
        { color: "75,200,255", density: 60, glow: 0.75, speed: 0.40, accent: "#4bc8ff" }
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
                        <Link href="/about" className="nav-link">Mission</Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <SignInButton mode="modal">
                            <Button className="ingress-btn h-11 px-8 shadow-[0_0_15px_rgba(236,72,153,0.3)]">Login to MindMate</Button>
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

                {/* SLIDE 1: FEATURES */}
                <section className={cn("slide slide-1", currentSlide === 1 ? "active" : currentSlide > 1 ? "above" : currentSlide < 1 ? "below" : "instant")}>
                    <PlexusCanvas {...slideConfigs[1]} active={currentSlide === 1} mouse={mouse} />
                    <div className="slide-content container px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Elite Modules</h2>
                            <p className="text-slate-400 mt-4 max-w-xl mx-auto font-medium">Proprietary systems designed for absolute academic dominance.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { title: 'Marco AI', icon: Bot, desc: 'Neural study partner for instant tactical help.' },
                                { title: 'Sovereign Vault', icon: Vault, desc: 'Secure repository for your intellectual assets.' },
                                { title: 'Credit Economy', icon: Gem, desc: 'Earn universal credits via high-focus study.' },
                                { title: 'Deep Focus', icon: Zap, desc: 'Calibrated timers with penalty enforcement.' }
                            ].map((f, i) => (
                                <div key={i} className="glass-module">
                                    <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                                        <f.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <h4 className="font-black uppercase text-lg mb-2 text-white">{f.title}</h4>
                                    <p className="text-sm text-slate-400 leading-relaxed font-medium">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SLIDE 2: STATS */}
                <section className={cn("slide slide-2", currentSlide === 2 ? "active" : currentSlide > 2 ? "above" : currentSlide < 2 ? "below" : "instant")}>
                    <PlexusCanvas {...slideConfigs[2]} active={currentSlide === 2} mouse={mouse} />
                    <div className="slide-content container px-6 text-center">
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-20">Mission Metrics</h2>
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

                {/* SLIDE 3: MISSION & FOOTER */}
                <section className={cn("slide slide-3", currentSlide === 3 ? "active" : currentSlide < 3 ? "below" : "instant")}>
                    <PlexusCanvas {...slideConfigs[3]} active={currentSlide === 3} mouse={mouse} />
                    <div className="slide-content w-full h-full flex flex-col pt-32">
                        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 text-white">SECURE YOUR <br />LEGACY.</h2>
                            <SignUpButton mode="modal">
                                <Button size="lg" className="h-20 px-16 rounded-3xl ingress-btn text-xl shadow-2xl">Claim Your Mainframe</Button>
                            </SignUpButton>
                        </div>

                        {/* Institutional Footer */}
                        <footer className="w-full bg-black/40 backdrop-blur-3xl border-t border-white/5 p-12 lg:p-20">
                            <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                                <div className="space-y-6 text-left">
                                    <div className="flex items-center gap-3">
                                        <Logo className="h-10 w-10" />
                                        <span className="font-black text-2xl uppercase tracking-tighter text-white">MindMate</span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-loose">
                                        Empowering the next generation of scholars through strategic automation and collective intelligence.
                                    </p>
                                </div>
                                <div className="text-left">
                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-6">Mainframe</h5>
                                    <ul className="space-y-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        <li><Link href="https://emitygate.com" className="hover:text-primary transition-colors">EmityGate Solutions</Link></li>
                                        <li><Link href="/about" className="hover:text-primary transition-colors">Strategic Mission</Link></li>
                                        <li><Link href="/dashboard/docs" className="hover:text-primary transition-colors">Sovereign Docs</Link></li>
                                    </ul>
                                </div>
                                <div className="text-left">
                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-6">Protocols</h5>
                                    <ul className="space-y-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Shield</Link></li>
                                        <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                                        <li><Link href="/refund" className="hover:text-primary transition-colors">Asset Protection</Link></li>
                                    </ul>
                                </div>
                                <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 space-y-4 text-left">
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck className="h-8 w-8 text-emerald-500" />
                                        <div className="text-[10px] font-black uppercase">
                                            <p className="text-slate-400">Validated Ingress</p>
                                            <p className="text-white mt-0.5">Razorpay Secure</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Instagram className="h-4 w-4 text-slate-500 hover:text-white cursor-pointer" />
                                        <Youtube className="h-4 w-4 text-slate-500 hover:text-white cursor-pointer" />
                                        <Send className="h-4 w-4 text-slate-500 hover:text-white cursor-pointer" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-black uppercase tracking-[0.4em] text-slate-600">
                                <p>© {new Date().getFullYear()} EmityGate Solutions. All Rights Reserved.</p>
                                <div className="flex gap-8">
                                    <span>Status: Operational</span>
                                    <span>Network: Stable</span>
                                </div>
                            </div>
                        </footer>
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

            <div className="fixed left-8 bottom-8 z-[1000] font-black text-[10px] uppercase tracking-widest text-slate-500">
                {String(currentSlide + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
            </div>

            <div className="fixed top-0 left-0 h-0.5 z-[2000] transition-all duration-900" 
                 style={{ 
                    width: `${(currentSlide / (totalSlides - 1)) * 100}%`,
                    background: slideConfigs[currentSlide].accent,
                    boxShadow: `0 0 10px ${slideConfigs[currentSlide].accent}`
                 }} 
            />
        </div>
    );
}