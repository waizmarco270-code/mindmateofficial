'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Globe, MapPin } from 'lucide-react';

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
  const [activeNodes, setActiveNodes] = useState<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * locations.length);
      setActiveNodes(prev => {
        if (prev.includes(randomIdx)) return prev.filter(i => i !== randomIdx);
        return [...prev, randomIdx];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-[2.5rem] overflow-hidden glass-module shadow-[0_0_50px_rgba(0,0,0,0.5)] group">
      {/* Real Styled Map Background */}
      <div className="absolute inset-0 grayscale invert brightness-50 opacity-20 mix-blend-screen transition-opacity group-hover:opacity-40">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15552.400000000001!2d77.5945627!3d12.9715987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin&maptype=satellite&disableDefaultUI=1"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {/* Decorative Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      
      {/* Pulse Nodes */}
      {locations.map((loc, i) => (
        <div
          key={loc.id}
          className="absolute"
          style={{ top: loc.top, left: loc.left }}
        >
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 2.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, delay: loc.delay }}
              className="absolute -inset-6 bg-primary/30 rounded-full blur-xl"
            />
            <div className="h-3 w-3 bg-primary rounded-full shadow-[0_0_15px_rgba(139,92,246,1)] border-2 border-white/40" />
            
            <AnimatePresence>
              {activeNodes.includes(i) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: -25 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-1.5 rounded-2xl bg-black/90 backdrop-blur-xl border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-primary shadow-2xl"
                >
                  UPLINK: {loc.name}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ))}

      <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="px-5 py-2.5 rounded-2xl bg-black/80 backdrop-blur-2xl border border-white/10 flex items-center gap-3 shadow-xl">
            <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/90">Mainframe: Optimized</span>
          </div>
          <div className="hidden sm:flex px-5 py-2.5 rounded-2xl bg-black/80 backdrop-blur-2xl border border-white/10 items-center gap-3 shadow-xl">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Global Sync: 99.9%</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-white/50 italic text-[10px] font-bold uppercase tracking-widest">
          <Globe className="h-4 w-4 animate-spin-slow" />
          {locations.length} Global Sectors Active
        </div>
      </div>
    </div>
  );
}