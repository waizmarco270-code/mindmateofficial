
'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LandingPage } from '@/components/landing/landing-page';
import { Logo } from '@/components/ui/logo';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';


function LoadingScreen() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-slate-800/50 [mask-image:linear-gradient(to_bottom,white_5%,transparent_50%)] animate-[spin_30s_linear_infinite]"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
       <div className="relative z-10 flex flex-col items-center justify-center gap-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <Logo className="h-24 w-24 text-primary animate-pulse" style={{ animationDuration: '2s' }} />
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                className="text-center"
            >
                <h1 className="text-2xl font-bold tracking-tight text-slate-100">
                    ⚡ Hustle Never Stop ⚡
                </h1>
                <p className="mt-4 text-sm text-slate-400">Powered By EmityGate</p>
            </motion.div>
       </div>
    </div>
  );
}


export default function RootPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || isSignedIn) {
    return <LoadingScreen />;
  }

  return <LandingPage />;
}
