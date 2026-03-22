
'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, Users, Zap, FileText, Heart, Star, Gamepad2, Gift, Flame, Award, ShieldQuestion, Swords, Gem, Anchor, ArrowLeftRight } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '../ui/logo';
import { SignedIn, SignedOut, SignUpButton, useUser } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Card, CardContent } from '../ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';
import Autoplay from "embla-carousel-autoplay"
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ActivityGlobe } from './ActivityGlobe';


const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Our Mission', href: '#why-mindmate' },
    { name: 'Reviews', href: '#reviews' },
]

const features = [
  {
    name: 'AI Learning Partner',
    description: 'Get instant academic support from Marco, your personal AI tutor.',
    icon: Bot,
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/20',
  },
  {
    name: 'Gamified Sprints',
    description: 'Solve academic challenges and subject-based quizzes to earn study credits.',
    icon: Gamepad2,
    color: 'text-green-400',
    bgColor: 'bg-green-900/20',
  },
  {
    name: 'Deep Focus Engine',
    description: 'Scientific study timers to maximize retention and minimize distractions.',
    icon: Zap,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/20',
  },
  {
    name: 'Academic Resources',
    description: 'Access a vast library of curated notes, JEE/NEET prep materials, and board guides.',
    icon: FileText,
    color: 'text-rose-400',
    bgColor: 'bg-rose-900/20',
  },
  {
    name: 'Collaborative Groups',
    description: 'Join peer-to-peer study clans to share knowledge and track progress together.',
    icon: Users,
    color: 'text-sky-400',
    bgColor: 'bg-sky-900/20',
  },
  {
    name: 'Consistency Rewards',
    description: 'Maintain your study streak and unlock premium content through consistent effort.',
    icon: Award,
    color: 'text-orange-400',
    bgColor: 'bg-orange-900/20',
  }
];

export function LandingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Logo className="h-8 w-8" />
            <span className="hidden sm:inline">MindMate</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
                 <a key={link.name} href={link.href} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                    {link.name}
                </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
             <SignedOut>
                 <SignUpButton mode="modal">
                    <Button>
                        Try MindMate Free <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </SignUpButton>
             </SignedOut>
             <SignedIn>
                <Link href="/dashboard">
                  <Button variant="outline">Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </Link>
             </SignedIn>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 sm:py-32">
            <div className="container mx-auto px-4 text-center relative">
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
                    The Smartest Way to <span className="bg-gradient-to-r from-purple-400 to-sky-400 bg-clip-text text-transparent">Master Your Subjects</span>
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
                    MindMate is an integrated Learning Management System designed to help students achieve academic excellence through AI assistance and focus tools.
                </p>
                 <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <SignUpButton mode="modal">
                        <Button size="lg" className="px-8 h-12 text-lg">Start Learning Now</Button>
                    </SignUpButton>
                    <Button variant="outline" size="lg" asChild className="px-8 h-12 text-lg">
                        <Link href="/contact">Talk to Support</Link>
                    </Button>
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-slate-900/50">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Comprehensive EdTech Ecosystem</h2>
              <p className="mt-4 text-lg text-slate-400">Tools engineered for modern academic challenges.</p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => (
                <div key={i} className="flex flex-col rounded-2xl border border-white/10 bg-slate-950 p-8 transition-all hover:-translate-y-1">
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg", feature.bgColor)}>
                    <feature.icon className={cn("h-6 w-6", feature.color)} />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-white">{feature.name}</h3>
                  <p className="mt-2 text-base text-slate-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Global Community Section */}
        <section className="py-24">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold mb-8">Trusted by Students Globally</h2>
                <ActivityGlobe />
            </div>
        </section>
      </main>

      {/* Compliance Footer */}
      <footer className="border-t border-white/10 bg-slate-950 py-12">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 font-bold text-xl">
                        <Logo className="h-6 w-6" />
                        <span>MindMate</span>
                    </div>
                    <p className="text-sm text-slate-400">Empowering the next generation of scholars with AI-driven study tools.</p>
                </div>
                <div>
                    <h4 className="font-bold mb-4">Company</h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                        <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                        <li><Link href="/contact" className="hover:text-white">Contact Support</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold mb-4">Legal</h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                        <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                        <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                        <li><Link href="/refund" className="hover:text-white">Refund & Cancellation</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold mb-4">Secure Payments</h4>
                    <p className="text-xs text-slate-500 mb-2">Processed by Razorpay</p>
                    <div className="flex gap-2 opacity-50 grayscale">
                        <Image src="https://placehold.co/40x25/png?text=Visa" alt="Visa" width={40} height={25} />
                        <Image src="https://placehold.co/40x25/png?text=MC" alt="Mastercard" width={40} height={25} />
                        <Image src="https://placehold.co/40x25/png?text=UPI" alt="UPI" width={40} height={25} />
                    </div>
                </div>
            </div>
            <div className="mt-12 pt-8 border-t border-white/5 text-center text-xs text-slate-500">
                <p>&copy; {new Date().getFullYear()} MindMate EdTech Solutions. All rights reserved.</p>
            </div>
        </div>
      </footer>
    </div>
  );
}
