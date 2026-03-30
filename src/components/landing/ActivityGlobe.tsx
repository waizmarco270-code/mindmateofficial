
'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { Globe, Zap, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const locations = [
  { id: 1, name: 'Mumbai', top: '65%', left: '70%', delay: 0 },
  { id: 2, name: 'Delhi', top: '58%', left: '68%', delay: 1.2 },
  { id: 3, name: 'London', top: '35%', left: '48%', delay: 1.5 },
  { id: 4, name: 'New York', top: '40%', left: '25%', delay: 3 },
  { id: 5, name: 'Tokyo', top: '45%', left: '85%', delay: 4.5 },
  { id: 6, name: 'Sydney', top: '80%', left: '88%', delay: 6 },
  { id: 7, name: 'Bengaluru', top: '68%', left: '69%', delay: 2.2 },
];

export function ActivityGlobe() {
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 100 };
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [20, -20]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-30, 30]), springConfig);

  useEffect(() => {
    setIsMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  if (!isMounted) return null;

  return (
    <div ref={containerRef} className="relative w-full h-[500px] flex items-center justify-center perspective-[1500px] overflow-hidden rounded-[3rem] bg-black/20 border border-white/5">
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
      
      {/* Top Left Status */}
      <div className="absolute top-8 left-8 flex items-center gap-3 bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10 z-20">
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Mainframe: Online</p>
      </div>

      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative w-80 h-80 flex items-center justify-center"
      >
        {/* Atmosphere Glow */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-primary/20 blur-[60px]"
        />

        {/* The Core Sphere */}
        <div className="absolute inset-0 rounded-full border-2 border-primary/30 shadow-[inset_0_0_50px_rgba(139,92,246,0.3)] bg-gradient-to-br from-primary/10 via-black to-black backdrop-blur-sm" />

        {/* Lat/Long Grid Lines */}
        <div className="absolute inset-0 rounded-full opacity-20 border border-white/10" style={{ transform: 'rotateX(90deg)' }} />
        <div className="absolute inset-0 rounded-full opacity-20 border border-white/10" style={{ transform: 'rotateY(90deg)' }} />

        {/* Orbital Rings */}
        <motion.div
          animate={{ rotateZ: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute w-[400px] h-[400px] rounded-full border border-dashed border-primary/20"
        />

        {/* Hotspots */}
        {locations.map((loc) => (
          <div
            key={loc.id}
            className="absolute z-30"
            style={{ 
                top: loc.top, 
                left: loc.left,
                transform: 'translateZ(20px)'
            }}
          >
            <div className="relative group">
              <motion.div
                animate={{ scale: [1, 2, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, delay: loc.delay }}
                className="absolute -inset-4 bg-primary/40 rounded-full blur-md"
              />
              <div className="h-2 w-2 bg-white rounded-full shadow-[0_0_10px_white] border border-primary" />
              
              <div className="absolute top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 border border-primary/30 px-2 py-1 rounded-md whitespace-nowrap">
                <p className="text-[8px] font-black uppercase text-primary tracking-widest">{loc.name}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Center Label */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center space-y-1 z-20">
        <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Global Presence Map</h3>
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Protocol: Real-time Citizen Sync</p>
      </div>
    </div>
  );
}
