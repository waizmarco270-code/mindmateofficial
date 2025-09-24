
'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LandingPage } from '@/components/landing/landing-page';
import { Logo } from '@/components/ui/logo';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';


function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 40); // Controls the speed of the loading bar

    return () => clearInterval(interval);
  }, []);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-slate-800/50 [mask-image:linear-gradient(to_bottom,white_5%,transparent_50%)] animate-[spin_30s_linear_infinite]"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
       <div className="relative z-10 flex flex-col items-center justify-center gap-8">
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative h-40 w-40 flex items-center justify-center"
            >
                <svg className="absolute h-full w-full" viewBox="0 0 140 140">
                    <circle
                        cx="70"
                        cy="70"
                        r={radius}
                        className="stroke-primary/10"
                        strokeWidth="8"
                        fill="transparent"
                    />
                    <motion.circle
                        cx="70"
                        cy="70"
                        r={radius}
                        className="stroke-primary"
                        strokeWidth="8"
                        fill="transparent"
                        strokeLinecap="round"
                        style={{ rotate: -90, originX: '50%', originY: '50%' }}
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 0.1 }}
                    />
                </svg>
                <Logo className="h-20 w-20" />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                className="text-center"
            >
                 <AnimatePresence mode="wait">
                  <motion.div
                    key={progress}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="text-xl font-mono font-bold text-slate-300"
                  >
                    {progress}%
                  </motion.div>
                </AnimatePresence>
                <h1 className="text-2xl font-bold tracking-tight text-slate-100 mt-4 animate-shimmer bg-gradient-to-r from-purple-400 via-sky-400 to-purple-400 bg-[length:200%_100%] bg-clip-text text-transparent">
                    ⚡ Hustle Never Stops ⚡
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
