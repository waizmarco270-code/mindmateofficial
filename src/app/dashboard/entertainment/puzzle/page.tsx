'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { ArrowRight, Bot, BrainCircuit, Users, Zap, FileText, Heart, Star, Gamepad2, Gift, Flame } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '../ui/logo';
import { SignedIn, SignedOut, SignUpButton, useUser } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Card, CardContent } from '../ui/card';

const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Why MindMate', href: '#why-mindmate' },
    { name: 'Reviews', href: '#reviews' },
]

const features = [
  {
    name: 'AI Tutor',
    description: 'Get instant, personalized help from Marco, your AI study partner.',
    icon: Bot,
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/20',
  },
  {
    name: 'Game Zone',
    description: 'Play games like Tic-Tac-Toe and Word Unscramble to earn credits while you relax.',
    icon: Gamepad2,
    color: 'text-green-400',
    bgColor: 'bg-green-900/20',
  },
  {
    name: 'Focus Mode',
    description: 'Eliminate distractions and get rewarded for deep, productive study sessions.',
    icon: Zap,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/20',
  },
  {
    name: 'Daily Streaks & Rewards',
    description: 'Build a study streak, claim daily surprises, and earn credits for your consistency.',
    icon: Flame,
    color: 'text-orange-400',
    bgColor: 'bg-orange-900/20',
  },
   {
    name: 'Free Resources',
    description: 'Access a library of curated notes, guides, and materials for various subjects.',
    icon: FileText,
    color: 'text-rose-400',
    bgColor: 'bg-rose-900/20',
  },
  {
    name: 'Invite & Earn',
    description: 'Share MindMate with your friends and earn bonus credits when they sign up.',
    icon: Gift,
    color: 'text-sky-400',
    bgColor: 'bg-sky-900/20',
  }
];

const whyMindMate = [
    {
        title: "All-in-One Toolkit",
        description: "From AI-powered assistance to focus timers and social hubs, we've integrated everything a student needs into one seamless platform."
    },
    {
        title: "Gamified Learning",
        description: "Earn credits, climb the leaderboard, and claim daily rewards. We make studying engaging and motivating, not a chore."
    },
    {
        title: "Built for Community",
        description: "You're not alone. Connect with friends, ask questions in the community hub, and grow with a network of fellow learners."
    }
]

const testimonials = [
    {
        name: "Priya Sharma",
        role: "Class 12 Student",
        avatar: "https://picsum.photos/seed/101/100/100",
        rating: 5,
        review: "MindMate has been a game-changer for my board exam prep. The AI tutor helps me with doubts anytime, and the focus mode is just amazing for productivity."
    },
    {
        name: "Rohan Verma",
        role: "JEE Aspirant",
        avatar: "https://picsum.photos/seed/102/100/100",
        rating: 5,
        review: "The quiz zone and leaderboard keep me motivated to study more. It feels like a healthy competition with my friends. The premium resources are also top-notch!"
    },
    {
        name: "Aisha Khan",
        role: "NEET Aspirant",
        avatar: "https://picsum.photos/seed/103/100/100",
        rating: 4,
        review: "I love how organized everything is. The schedule and to-do list features help me plan my week perfectly. I feel much more in control of my studies now."
    }
]


export function LandingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      router.push('/dashboard');
    }
  }, [isLoaded, user, router]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Logo className="h-8 w-8" />
            <span>MindMate</span>
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
                 <SignUpButton mode="modal" afterSignUpUrl="/dashboard" afterSignInUrl="/dashboard">
                    <Button>
                        Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </SignUpButton>
             </SignedOut>
             <SignedIn>
                <Link href="/dashboard">
                  <Button>Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </Link>
             </SignedIn>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 sm:py-32">
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="h-[40rem] w-[40rem] bg-gradient-to-tr from-purple-500 to-sky-400 opacity-20 blur-[12rem]"></div>
                </div>
                 <div id="particle-container" className="[mask-image:linear-gradient(to_bottom,white_20%,transparent_75%)]">
                    <div className="particle"></div><div className="particle"></div>
                    <div className="particle"></div><div className="particle"></div>
                    <div className="particle"></div><div className="particle"></div>
                    <div className="particle"></div><div className="particle"></div>
                    <div className="particle"></div><div className="particle"></div>
                    <div className="particle"></div><div className="particle"></div>
                    <div className="particle"></div><div className="particle"></div>
                    <div className="particle"></div><div className="particle"></div>
                    <div className="particle"></div><div className="particle"></div>
                    <div className="particle"></div><div className="particle"></div>
                    <div className="particle"></div><div className="particle"></div>
                    <div className="particle"></div><div className="particle"></div>
                    <div className="particle"></div><div className="particle"></div>
                    <div className="particle"></div><div className="particle"></div>
                </div>
            </div>
            <div className="container mx-auto px-4 text-center relative">
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                    Unlock Your <span className="bg-gradient-to-r from-purple-400 to-sky-400 bg-clip-text text-transparent">Full Potential</span>
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                    MindMate is your all-in-one study companion to learn smarter, stay focused, and connect with a community of learners.
                </p>
                 <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
                    <SignedOut>
                        <SignUpButton mode="modal" afterSignUpUrl="/dashboard" afterSignInUrl="/dashboard">
                             <Button size="lg" className="relative group w-full sm:w-auto">
                                <span className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></span>
                                <span className="relative flex items-center">
                                    Create Free Account <ArrowRight className="ml-2" />
                                </span>
                            </Button>
                        </SignUpButton>
                        <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline", size: "lg"}), "bg-transparent text-white w-full sm:w-auto")}>
                            Explore Demo
                        </Link>
                    </SignedOut>
                     <SignedIn>
                        <Link href="/dashboard">
                            <Button size="lg">Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" /></Button>
                        </Link>
                     </SignedIn>
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 sm:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Your Ultimate Study Toolkit</h2>
              <p className="mt-4 text-lg text-slate-400">Everything you need to succeed, all in one place.</p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => (
                <div 
                  key={feature.name} 
                  className="flex flex-col rounded-2xl border border-white/10 bg-slate-900/50 p-8 shadow-2xl shadow-slate-950/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-primary/20 animate-fade-in-up"
                  style={{animationDelay: `${0.8 + i * 0.2}s`}}
                >
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg", feature.bgColor)}>
                    <feature.icon className={cn("h-6 w-6", feature.color)} aria-hidden="true" />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-white">{feature.name}</h3>
                  <p className="mt-2 text-base text-slate-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

         {/* Why MindMate Section */}
        <section id="why-mindmate" className="py-24 sm:py-32 bg-slate-900">
            <div className="container mx-auto px-4">
                 <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Why MindMate?</h2>
                    <p className="mt-4 text-lg text-slate-400">We're more than just an app; we're your dedicated study partner.</p>
                </div>
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    {whyMindMate.map((point, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
                                <Heart className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold text-white">{point.title}</h3>
                            <p className="mt-2 text-base text-slate-400">{point.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Testimonials Section */}
        <section id="reviews" className="py-24 sm:py-32">
             <div className="container mx-auto px-4">
                 <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Loved by Students</h2>
                    <p className="mt-4 text-lg text-slate-400">See what fellow learners are saying about MindMate.</p>
                </div>
                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, i) => (
                        <Card key={i} className="bg-slate-900/50 border-white/10">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={testimonial.avatar} />
                                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h4 className="font-semibold text-white">{testimonial.name}</h4>
                                        <p className="text-sm text-slate-400">{testimonial.role}</p>
                                    </div>
                                </div>
                                <div className="flex gap-0.5 mt-4">
                                    {Array.from({ length: 5 }).map((_, starIndex) => (
                                        <Star key={starIndex} className={cn("h-5 w-5", starIndex < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600')} />
                                    ))}
                                </div>
                                <blockquote className="mt-4 text-slate-300 italic border-l-2 border-primary/50 pl-4">
                                    "{testimonial.review}"
                                </blockquote>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm text-slate-400">&copy; {new Date().getFullYear()} MindMate. All rights reserved.</p>
            </div>
        </div>
      </footer>
    </div>
  );
}