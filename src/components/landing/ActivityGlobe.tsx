
'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Corrected, simplified world map path data.
const worldMapPath = "M959.5 499.5c0-275.3-224.3-499-499.5-499S-0.5 224.2-0.5 499.5c0 275.3 224.3 499 499.5 499s499.5-223.7 499.5-499z M819.9 283.4l-39.6-1.5-44.5-120.3-29.3 2.3-4.3-20.9-35.3-3.1-2.1 23-22.1 4.3-15.6-21.8-31 1.7-19.1 29.3-5.2 19.3-21.2-11.2-40.4-31.5-20.9 5.3-17-38.9-29.3-2.3-19.7 46.5-31.4 17.6-43.1-13.6-26.2-16.3-44.2 3.1-27.1 23.5-34.9 33.8-2.6 15.6-13.5 13.6-22.3-3.1-33.1-23.7-29.2-18.7-20.9 23-11.2 13.6 12.1 40.8 19.8 16.2 19.8-16.2 40.8-12.1 13.6-23-11.2-18.7 29.2-23.7 33.1-3.1 22.3 13.6 15.6-2.6 33.8 34.9 23.5 27.1 3.1 44.2-16.3 26.2-13.6 43.1 17.6 31.4 46.5-19.7-2.3 29.3-38.9 17 5.3-20.9-31.5 40.4-11.2 21.2 19.3-5.2 29.3 19.1 1.7 31-21.8 15.6 4.3 22.1-3.1 23 35.3 20.9-4.3 2.3-29.3-120.3 44.5-1.5 39.6L819.9 283.4z";


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
