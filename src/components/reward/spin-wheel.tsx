
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRewards } from '@/hooks/use-rewards';
import { Gift } from 'lucide-react';

const prizes = [
    { value: 5, label: '5' },
    { value: 'better luck', label: '😭' },
    { value: 10, label: '10' },
    { value: 2, label: '2' },
    { value: 100, label: '100' },
    { value: 'better luck', label: '😭' },
    { value: 5, label: '5' },
    { value: 2, label: '2' },
];
const prizeColors = ['#6366f1', '#4f46e5', '#ec4899', '#d946ef', '#f59e0b', '#eab308', '#84cc16', '#22c55e'];

export function SpinWheel() {
    const { canSpin, spin, availableSpins } = useRewards();
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);

    const handleSpin = async () => {
        if (!canSpin || isSpinning) return;
        setIsSpinning(true);
        const { finalRotation, prizeIndex } = await spin();
        
        // Add multiple full spins for a better visual effect
        const fullSpins = 5;
        const totalRotation = (fullSpins * 360) + finalRotation;
        
        setRotation(totalRotation);

        // After the animation finishes, reset rotation to the final position to avoid weird jumps on respin
        setTimeout(() => {
            setIsSpinning(false);
            const simplifiedRotation = finalRotation % 360;
            setRotation(simplifiedRotation);
        }, 5000); 
    };

    const segmentAngle = 360 / prizes.length;

    return (
        <div className="relative flex flex-col items-center justify-center p-4 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 border border-purple-800 shadow-2xl shadow-purple-500/10">
            <div className="absolute top-4 text-center">
                 <h2 className="text-3xl font-bold text-white tracking-tight">Spin The Wheel</h2>
                 <p className="text-purple-300">You have <span className="font-bold text-white">{availableSpins}</span> spin{availableSpins !== 1 && 's'} left.</p>
            </div>
            
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 my-16 flex items-center justify-center">
                {/* Pointer */}
                <div className="absolute -top-4 z-20 h-10 w-10 drop-shadow-lg" style={{ transform: 'translateY(-50%)' }}>
                    <div className="h-0 w-0 border-x-8 border-x-transparent border-t-[16px] border-t-yellow-400 -translate-y-1/2 left-1/2 -translate-x-1/2 absolute"></div>
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-5 bg-yellow-400 rounded-full border-2 border-yellow-200"></div>
                </div>

                {/* Wheel */}
                <div
                    className="absolute w-full h-full rounded-full border-8 border-purple-500/50 shadow-inner transition-transform duration-5000 ease-out"
                    style={{ transform: `rotate(${rotation}deg)` }}
                >
                    <ul className="w-full h-full relative rounded-full overflow-hidden">
                        {prizes.map((prize, i) => {
                            const segmentRotation = segmentAngle * i;
                            return (
                                <li
                                    key={i}
                                    className="absolute w-full h-full"
                                    style={{
                                        transform: `rotate(${segmentRotation}deg)`,
                                        clipPath: `polygon(50% 50%, 100% 50%, 100% 0%, 50% 0)`,
                                    }}
                                >
                                    <div
                                        className="absolute w-full h-full flex items-start justify-center"
                                        style={{
                                            backgroundColor: prizeColors[i % prizeColors.length],
                                            transform: `rotate(${segmentAngle / 2}deg)`,
                                            transformOrigin: '50% 50%',
                                        }}
                                    >
                                        <span 
                                            className="text-white font-bold text-xl sm:text-2xl mt-4"
                                            style={{
                                                transform: `rotate(${-90 - segmentAngle/2}deg)`,
                                                display: 'inline-block'
                                            }}
                                        >
                                            {prize.label}
                                        </span>
                                    </div>
                                </li>
                             )
                         })}
                    </ul>
                </div>
                 {/* Center Button */}
                <button 
                    onClick={handleSpin} 
                    disabled={!canSpin || isSpinning}
                    className="absolute z-10 h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border-4 border-purple-500/50 text-white font-bold text-lg uppercase transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                >
                    Spin
                </button>
            </div>
             {!canSpin && !isSpinning && (
                <p className="text-center text-yellow-400 font-semibold mt-4">Come back tomorrow for your next free spin!</p>
             )}
        </div>
    );
}
