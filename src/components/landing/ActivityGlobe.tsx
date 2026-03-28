
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';

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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * locations.length);
      setActiveNodes(prev => {
        if (prev.includes(randomIdx)) return prev.filter(i => i !== randomIdx);
        return [...prev, randomIdx];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!isMounted) return <div className="aspect-[16/9] w-full bg-white/5 rounded-[2.5rem] animate-pulse" />;

  return (
    <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-[2.5rem] overflow-hidden bg-white/[0.02] border border-white/5 shadow-2xl group">
      {/* Styled Map Background */}
      <div className="absolute inset-0 grayscale invert brightness-50 opacity-10 mix-blend-screen transition-opacity group-hover:opacity-20 pointer-events-none">
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
              className="absolute -inset-6 bg-primary/20 rounded-full blur-xl"
            />
            <div className="h-2 w-2 bg-primary rounded-full shadow-[0_0_10px_rgba(139,92,246,1)] border border-white/40" />
            
            <AnimatePresence>
              {activeNodes.includes(i) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: -20 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full bg-black/90 backdrop-blur-xl border border-white/10 text-[8px] font-black uppercase tracking-[0.2em] text-primary shadow-2xl"
                >
                  UPLINK: {loc.name}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ))}

      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-4">
        <div className="px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
          <span className="text-[8px] font-black uppercase tracking-widest text-white/70">Mainframe: Online</span>
        </div>
        <div className="flex items-center gap-2 text-white/30 text-[8px] font-black uppercase tracking-widest">
          <Globe className="h-3 w-3 animate-spin-slow" />
          {locations.length} Active Nodes
        </div>
      </div>
    </div>
  );
}
