
'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const worldMapPath = "M480,0C214.9,0,0,214.9,0,480s214.9,480,480,480s480-214.9,480-480S745.1,0,480,0z M819.9,283.4l-39.6-1.5l-44.5-120.3l-29.3,2.3l-4.3-20.9l-35.3-3.1l-2.1,23l-22.1,4.3l-15.6-21.8l-31,1.7l-19.1,29.3l-5.2,19.3l-21.2-11.2l-40.4-31.5l-20.9,5.3l-17-38.9l-29.3-2.3l-19.7,46.5l-31.4,17.6l-43.1-13.6l-26.2-16.3l-44.2,3.1l-27.1,23.5l-34.9,33.8l-2.6,15.6l-13.5,13.6l-22.3-3.1l-33.1-23.7l-29.2-18.7l-20.9,23l-11.2,13.6l12.1,40.8l19.8,16.2l19.8-16.2l40.8-12.1l13.6-23l-11.2-18.7l29.2-23.7l33.1-3.1l22.3,13.6l15.6-2.6l33.8,34.9l23.5,27.1l3.1,44.2l-16.3,26.2l-13.6,43.1l17.6,31.4l46.5-19.7l-2.3,29.3l-38.9,17l5.3-20.9l-31.5,40.4l-11.2,21.2l19.3-5.2l29.3,19.1l1.7,31l-21.8,15.6l4.3,22.1l-3.1,23l35.3,20.9l-4.3,2.3l-29.3,120.3l44.5,1.5l39.6L819.9,283.4z";

const activityLocations = [
    { x: 130, y: 150, label: "New York" },
    { x: 250, y: 300, label: "Sao Paulo" },
    { x: 480, y: 130, label: "London" },
    { x: 550, y: 220, label: "Lagos" },
    { x: 700, y: 180, label: "Tokyo" },
    { x: 800, y: 350, label: "Sydney" },
    { x: 680, y: 280, label: "Bengaluru" },
    { x: 850, y: 150, label: "Seoul" },
    { x: 450, y: 350, label: "Cape Town" },
];

export function ActivityGlobe() {
    const [activePoints, setActivePoints] = useState<number[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            const index = Math.floor(Math.random() * activityLocations.length);
            setActivePoints(prev => [...prev, index]);
            setTimeout(() => {
                setActivePoints(prev => prev.filter(p => p !== index));
            }, 2000);
        }, 1500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full max-w-5xl mx-auto py-20 px-4">
            <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full" />
            <svg viewBox="0 0 960 500" className="w-full h-auto drop-shadow-2xl">
                <path d={worldMapPath} fill="hsl(var(--primary) / 0.05)" stroke="hsl(var(--primary) / 0.2)" strokeWidth="1" />
                
                {activityLocations.map((loc, i) => (
                     <g key={i}>
                        <motion.circle
                            cx={loc.x}
                            cy={loc.y}
                            r="3"
                            fill="hsl(var(--primary))"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={activePoints.includes(i) ? { scale: [1, 1.5, 1], opacity: [1, 0.5, 1] } : { opacity: 0.2 }}
                            transition={{ duration: 0.5, repeat: activePoints.includes(i) ? Infinity : 0, repeatType: 'reverse' }}
                        />
                        <AnimatePresence>
                            {activePoints.includes(i) && (
                                <motion.g
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <circle
                                        cx={loc.x}
                                        cy={loc.y}
                                        r="12"
                                        fill="none"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth="0.5"
                                        className="animate-ping"
                                    />
                                    <text
                                        x={loc.x}
                                        y={loc.y - 15}
                                        textAnchor="middle"
                                        className="text-[10px] font-black uppercase tracking-widest fill-primary"
                                    >
                                        Uplink Active
                                    </text>
                                </motion.g>
                            )}
                        </AnimatePresence>
                    </g>
                ))}
            </svg>
            <div className="mt-8 flex justify-center gap-8">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Global Mainframe Nodes: Stable</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Sync Rate: 99.9%</span>
                </div>
            </div>
        </div>
    );
}
