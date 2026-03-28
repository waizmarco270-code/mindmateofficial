
'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function ThreeDCore() {
  const [isMounted, setIsMounted] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for buttery movement
  const springConfig = { damping: 30, stiffness: 100 };
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [15, -15]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-15, 15]), springConfig);

  useEffect(() => {
    setIsMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const moveX = clientX - window.innerWidth / 2;
      const moveY = clientY - window.innerHeight / 2;
      mouseX.set(moveX);
      mouseY.set(moveY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  if (!isMounted) return null;

  return (
    <div className="relative h-[400px] w-[400px] flex items-center justify-center perspective-[1000px]">
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative flex items-center justify-center h-full w-full"
      >
        {/* Central Energy Sphere */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute h-32 w-32 rounded-full bg-primary/20 blur-2xl border border-primary/30 shadow-[0_0_50px_rgba(139,92,246,0.5)]"
        />
        
        <div className="absolute h-16 w-16 rounded-full bg-white/10 border-2 border-white/20 backdrop-blur-md shadow-2xl flex items-center justify-center">
            <div className="h-4 w-4 rounded-full bg-primary animate-pulse shadow-[0_0_15px_#8b5cf6]" />
        </div>

        {/* Orbital Ring 1 */}
        <motion.div
          animate={{ rotateZ: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute h-64 w-64 rounded-full border border-primary/20 border-dashed"
          style={{ transform: 'translateZ(20px)' }}
        />

        {/* Orbital Ring 2 - Vertical */}
        <motion.div
          animate={{ rotateX: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute h-80 w-80 rounded-full border border-cyan-500/10"
          style={{ transform: 'rotateY(90deg)' }}
        />

        {/* Floating Data Nodes */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-white shadow-[0_0_10px_white]"
            animate={{ 
              y: [0, -20, 0],
              opacity: [0.2, 1, 0.2]
            }}
            transition={{ 
              duration: 3 + i, 
              repeat: Infinity, 
              delay: i * 0.5 
            }}
            style={{
              left: `${50 + 40 * Math.cos((i * 60 * Math.PI) / 180)}%`,
              top: `${50 + 40 * Math.sin((i * 60 * Math.PI) / 180)}%`,
              transform: `translateZ(${20 + i * 10}px)`
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
