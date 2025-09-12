
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRewards } from '@/hooks/use-rewards';
import { cn } from '@/lib/utils';
import { Gift, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';

export function ScratchCard() {
    const { canClaimReward, claimDailyReward, availableRewards } = useRewards();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isScratched, setIsScratched] = useState(false);
    const [prize, setPrize] = useState<number | string | null>(null);
    
    const setupCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#a855f7');
        gradient.addColorStop(1, '#ec4899');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SCRATCH HERE', canvas.width / 2, canvas.height / 2);
        
        ctx.globalCompositeOperation = 'destination-out';
    }, []);

    useEffect(() => {
        if (canClaimReward && !prize) {
            setupCanvas();
        }
    }, [canClaimReward, prize, setupCanvas]);

    const handleScratch = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!canClaimReward || prize) return;
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const pos = 'touches' in e ? e.touches[0] : e;
        const x = pos.clientX - rect.left;
        const y = pos.clientY - rect.top;
        
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2, false);
        ctx.fill();
        
        checkScratchCompletion();
    };

    const checkScratchCompletion = () => {
         const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let transparentPixels = 0;
        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] === 0) {
                transparentPixels++;
            }
        }
        
        const totalPixels = canvas.width * canvas.height;
        const scratchPercentage = (transparentPixels / totalPixels) * 100;
        
        if (scratchPercentage > 50 && !isScratched) {
            setIsScratched(true);
            claimDailyReward().then(result => {
                setPrize(result.prize);
            });
        }
    }
    
    const handleReset = () => {
        setIsScratched(false);
        setPrize(null);
        setTimeout(setupCanvas, 0); // Allow state to update before redrawing
    }

    const PrizeDisplay = () => {
        if (prize === 'better luck') {
            return (
                <div className="text-center">
                    <p className="text-2xl font-bold text-muted-foreground">Better Luck Next Time!</p>
                    <p className="text-sm">Keep trying, your lucky day is coming.</p>
                </div>
            )
        }
        return (
             <div className="text-center">
                <p className="text-sm text-muted-foreground">You Won</p>
                <p className="text-6xl font-bold tracking-tighter text-amber-500">{prize}</p>
                <p className="text-2xl font-semibold text-amber-500">Credits!</p>
            </div>
        )
    }

    return (
        <div className="w-full max-w-md mx-auto space-y-4">
             <div className="relative aspect-[1.618] w-full rounded-2xl bg-muted overflow-hidden border-4 border-dashed flex items-center justify-center p-8">
                {canClaimReward && prize === null ? (
                    <>
                        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center text-center">
                            <Gift className="h-16 w-16 text-muted-foreground/30 animate-pulse" />
                             <p className="text-muted-foreground/50 font-bold text-xl mt-2">Prize is Hidden</p>
                        </div>
                        <canvas
                            ref={canvasRef}
                            className="absolute inset-0 z-10 w-full h-full cursor-grab active:cursor-grabbing rounded-lg"
                            onMouseMove={(e) => { if (e.buttons === 1) handleScratch(e); }}
                            onTouchMove={handleScratch}
                        />
                    </>
                ) : !canClaimReward ? (
                    <div className="text-center">
                        <h3 className="text-2xl font-bold">All Scratched Out!</h3>
                        <p className="text-muted-foreground mt-2">You've used all your cards for today. Come back tomorrow for a new one!</p>
                    </div>
                ) : prize !== null ? (
                    <div className="flex flex-col items-center justify-center gap-4 animate-in fade-in-50 zoom-in-95">
                        <Sparkles className="h-12 w-12 text-yellow-400" />
                        <PrizeDisplay />
                    </div>
                ) : null}
            </div>
             {prize !== null && (
                 <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
                    <RotateCcw className="mr-2 h-4 w-4"/> See Next Reward Status
                </Button>
            )}
        </div>
    );
}
