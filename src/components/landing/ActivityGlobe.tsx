
'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Simplified and corrected SVG path data for the world map.
const worldMapPath = "M959.5,499.5 C959.5,224.2 744.8,0.5 480,0.5 C215.2,0.5 0.5,224.2 0.5,499.5 C0.5,774.8 215.2,998.5 480,998.5 C744.8,998.5 959.5,774.8 959.5,499.5 Z M480,900 C268.4,900 89,721.6 89,510 C89,298.4 268.4,120 480,120 C691.6,120 871,298.4 871,510 C871,721.6 691.6,900 480,900 Z M630,225 C630,225 630,225 630,225 C630,225 630,225 630,225 L630,225 Z M330,225 C330,225 330,225 330,225 C330,225 330,225 330,225 L330,225 Z M480,300 C529.7,300 570,340.3 570,390 C570,439.7 529.7,480 480,480 C430.3,480 390,439.7 390,390 C390,340.3 430.3,300 480,300 Z M480,540 C430.3,540 390,580.3 390,630 C390,679.7 430.3,720 480,720 C529.7,720 570,679.7 570,630 C570,580.3 529.7,540 480,540 Z";


const activityLocations = [
    { x: 130, y: 150 }, // North America
    { x: 250, y: 200 }, // South America
    { x: 480, y: 130 }, // Europe
    { x: 550, y: 220 }, // Africa
    { x: 700, y: 180 }, // Asia
    { x: 800, y: 350 }, // Australia
    { x: 680, y: 280 }, // India
    { x: 850, y: 150 }, // Japan
    { x: 450, y: 350 }, // Antarctica
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
        }, 1500); // New pulse every 1.5 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full max-w-5xl mx-auto">
            <svg viewBox="0 0 960 500" className="w-full h-auto">
                <path d={worldMapPath} fill="hsl(var(--primary) / 0.1)" stroke="hsl(var(--primary) / 0.3)" strokeWidth="0.5" />
                
                {activityLocations.map((loc, i) => (
                     <g key={i}>
                        <motion.circle
                            cx={loc.x}
                            cy={loc.y}
                            r="3"
                            fill="hsl(var(--primary))"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={activePoints.includes(i) ? { scale: [1, 1.5, 1], opacity: [1, 0.5, 1] } : {}}
                            transition={{ duration: 0.5, repeat: activePoints.includes(i) ? Infinity : 0, repeatType: 'reverse' }}
                        />
                        <motion.circle
                            cx={loc.x}
                            cy={loc.y}
                            r="8"
                            fill="hsl(var(--primary))"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={activePoints.includes(i) ? { scale: [0, 2], opacity: [0.5, 0] } : {}}
                            transition={{ duration: 1.5, repeat: activePoints.includes(i) ? Infinity : 0 }}
                        />
                    </g>
                ))}
            </svg>
        </div>
    );
}
