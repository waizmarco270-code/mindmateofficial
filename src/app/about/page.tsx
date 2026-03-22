
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Lightbulb, Heart, Code, Copyright, Target, Rocket, Sparkles } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { motion } from 'framer-motion';

export default function PublicAboutUs() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-primary/30">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 blue-nebula-bg opacity-40" />
        <div id="particle-container">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" />
          ))}
        </div>
      </div>

      <div className="container relative z-10 mx-auto py-12 px-4 max-w-5xl">
        <Button asChild variant="ghost" className="mb-8 text-slate-300 hover:text-white hover:bg-white/10">
          <Link href="/"><ArrowLeft className="mr-2 h-4 w-4"/> Back to Home</Link>
        </Button>

        <div className="text-center space-y-4 mb-16">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <div className="p-4 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
              <Logo className="h-20 w-20" />
            </div>
          </motion.div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-black tracking-tighter bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent"
          >
            The Minds Behind MindMate
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto"
          >
            Empowering the next generation of scholars through artificial intelligence and scientific study methodology.
          </motion.p>
        </div>

        <div className="grid gap-12">
          {/* Mission Section */}
          <motion.section 
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <Card className="bg-white/5 backdrop-blur-md border-white/10 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-3xl font-bold text-white">
                  <Target className="text-primary h-8 w-8" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xl text-slate-300 leading-relaxed">
                At MindMate, we are building more than just an app; we are crafting a revolutionary study ecosystem. Our mission is to democratize high-level academic guidance through AI, making learning engaging, efficient, and deeply rewarding for every student regardless of their location.
              </CardContent>
            </Card>
          </motion.section>

          {/* Developers Section */}
          <section className="space-y-8">
            <h2 className="text-3xl font-bold flex items-center gap-3 justify-center md:justify-start">
              <Sparkles className="text-yellow-400" />
              Core Architects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* WaizMarco */}
              <motion.div 
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:border-primary/50 transition-all group h-full">
                  <CardContent className="p-8 flex flex-col items-center text-center">
                    <div className="relative mb-6">
                      <div className="absolute -inset-2 bg-gradient-to-r from-primary to-purple-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-500" />
                      <Avatar className="h-32 w-32 border-4 border-primary relative">
                        <AvatarImage src="https://picsum.photos/seed/waiz/400" alt="WaizMarco" data-ai-hint="male developer portrait professional" />
                        <AvatarFallback className="text-2xl font-bold bg-slate-800">WM</AvatarFallback>
                      </Avatar>
                    </div>
                    <h3 className="text-3xl font-bold text-white">WaizMarco</h3>
                    <p className="text-primary font-bold uppercase tracking-widest text-sm mt-1">Lead Developer & Architect</p>
                    <p className="text-slate-400 mt-4 leading-relaxed">
                      The original visionary behind MindMate. Responsible for the complex backend architecture, AI integration, and the overall system logic that powers the platform.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Msm */}
              <motion.div 
                initial={{ x: 50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:border-primary/50 transition-all group h-full">
                  <CardContent className="p-8 flex flex-col items-center text-center">
                    <div className="relative mb-6">
                      <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-500" />
                      <Avatar className="h-32 w-32 border-4 border-emerald-500 relative">
                        <AvatarImage src="https://picsum.photos/seed/msm/400" alt="Msm" data-ai-hint="male developer portrait professional" />
                        <AvatarFallback className="text-2xl font-bold bg-slate-800">M</AvatarFallback>
                      </Avatar>
                    </div>
                    <h3 className="text-3xl font-bold text-white">Msm</h3>
                    <p className="text-emerald-400 font-bold uppercase tracking-widest text-sm mt-1">Frontend & UI/UX Specialist</p>
                    <p className="text-slate-400 mt-4 leading-relaxed">
                      The creative force behind MindMate's visual identity. Focused on building intuitive, beautiful, and "legendary" interfaces that make studying an aesthetic experience.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </section>

          {/* Technology Section */}
          <motion.section 
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <Card className="bg-slate-900/80 border-white/5">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-3 text-2xl font-bold text-white">
                  <Code className="text-primary" />
                  Built with Cutting-Edge Tech
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap justify-center gap-4">
                {['Next.js 14', 'React 18', 'Firebase', 'Genkit AI', 'Tailwind CSS', 'TypeScript', 'ShadCN UI'].map(tech => (
                  <Badge key={tech} variant="outline" className="px-4 py-2 text-lg border-white/10 bg-white/5 text-slate-300">
                    {tech}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          </motion.section>

          {/* Footer Info */}
          <div className="text-center space-y-2 pt-8 border-t border-white/5">
            <div className="flex items-center justify-center gap-2 text-slate-500">
              <Copyright className="h-4 w-4" />
              <span>Established on October 2nd, 2025. MindMate.</span>
            </div>
            <p className="text-xs text-slate-600 max-w-xl mx-auto italic">
              MindMate is a registered trademark. The content, gamification logic, and autonomous sentinel systems are protected by intellectual property laws.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
