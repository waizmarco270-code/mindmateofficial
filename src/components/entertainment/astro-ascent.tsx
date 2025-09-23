
'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rocket, Play, RotateCw, HelpCircle, Award, Trophy, Fuel, Gauge, Mountain, ChevronsLeft, ChevronsRight, Zap as ThrustIcon, Hand } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useUser, SignedOut } from '@clerk/nextjs';
import { useUsers } from '@/hooks/use-admin';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LoginWall } from '../ui/login-wall';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// Game Configuration
const GRAVITY = 0.05;
const THRUST_POWER = 0.15;
const SIDE_THRUST_POWER = 0.08;
const RETRO_THRUST_POWER = 0.04; // Gentle braking force
const ROTATION_SPEED = 0.05;
const MAX_FUEL = 1000;
const SAFE_LANDING_VELOCITY = 1.5;
const ASTEROID_COUNT = 10;

interface GameObject {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  fuel: number;
}

interface Asteroid {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
}

interface LandingPad {
  x: number;
  y: number;
  width: number;
}

export function AstroAscentGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const { user, isSignedIn } = useUser();
  const { currentUserData, updateGameHighScore } = useUsers();

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameOver' | 'won'>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const playerRef = useRef<GameObject>({ x: 0, y: 0, vx: 0, vy: 0, angle: -Math.PI / 2, fuel: MAX_FUEL });
  const asteroidsRef = useRef<Asteroid[]>([]);
  const landingPadRef = useRef<LandingPad>({ x: 0, y: 0, width: 0 });
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const gameLoopRef = useRef<number>();

   useEffect(() => {
    if (currentUserData?.gameHighScores?.astroAscent) {
        setHighScore(currentUserData.gameHighScores.astroAscent);
    }
  }, [currentUserData]);

  const getThemeColors = useCallback(() => {
    const isDark = resolvedTheme === 'dark';
    return {
      bg: isDark ? '#0c0a09' : '#e0f2fe',
      rocket: isDark ? '#fef08a' : '#b45309',
      flame: isDark ? '#f97316' : '#fb923c',
      sideFlame: isDark ? '#38bdf8' : '#0ea5e9',
      retroFlame: isDark ? '#f43f5e' : '#ef4444',
      asteroid: isDark ? '#475569' : '#94a3b8',
      pad: isDark ? '#16a34a' : '#22c55e',
    };
  }, [resolvedTheme]);

  const resetGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    playerRef.current = {
      x: 50,
      y: canvas.height / 2,
      vx: 0,
      vy: 0,
      angle: -Math.PI / 2,
      fuel: MAX_FUEL,
    };
    
    landingPadRef.current = {
        x: canvas.width - 150,
        y: canvas.height - 20,
        width: 100,
    };

    asteroidsRef.current = [];
    for(let i = 0; i < ASTEROID_COUNT; i++) {
        asteroidsRef.current.push({
            x: Math.random() * canvas.width,
            y: Math.random() * (canvas.height - 100),
            radius: 10 + Math.random() * 15,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
        });
    }

    setScore(0);
  }, []);

  const startGame = () => {
    resetGame();
    setGameState('playing');
  };

  const handleGameOver = (reason: string) => {
    setGameState('gameOver');
    if (score > highScore) {
      setHighScore(score);
      if (user) updateGameHighScore(user.id, 'astroAscent', score);
    }
  };

  const handleWin = () => {
    const finalScore = Math.round(playerRef.current.fuel * 10);
    setScore(finalScore);
    setGameState('won');
    if(finalScore > highScore) {
        setHighScore(finalScore);
        if(user) updateGameHighScore(user.id, 'astroAscent', finalScore);
    }
  };
  
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const colors = getThemeColors();
    const player = playerRef.current;

    // Clear canvas
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // --- Update Logic ---
    player.vy += GRAVITY;

    if (keysRef.current['w'] || keysRef.current['ArrowUp']) {
        if(player.fuel > 0) {
            player.vx += Math.cos(player.angle) * THRUST_POWER;
            player.vy += Math.sin(player.angle) * THRUST_POWER;
            player.fuel -= 2;
        }
    }
    if (keysRef.current['a'] || keysRef.current['ArrowLeft']) player.angle -= ROTATION_SPEED;
    if (keysRef.current['d'] || keysRef.current['ArrowRight']) player.angle += ROTATION_SPEED;

    if (keysRef.current['q']) {
        if(player.fuel > 0) {
            player.vx -= SIDE_THRUST_POWER;
            player.fuel -= 1;
        }
    }
    if (keysRef.current['e']) {
        if(player.fuel > 0) {
            player.vx += SIDE_THRUST_POWER;
            player.fuel -= 1;
        }
    }
     if (keysRef.current[' '] || keysRef.current['Spacebar']) { // Spacebar for brakes
        if(player.fuel > 0) {
            const velocityMagnitude = Math.hypot(player.vx, player.vy);
            if (velocityMagnitude > 0.01) {
                 const brakeVx = (-player.vx / velocityMagnitude) * RETRO_THRUST_POWER;
                 const brakeVy = (-player.vy / velocityMagnitude) * RETRO_THRUST_POWER;
                 player.vx += brakeVx;
                 player.vy += brakeVy;
                 player.fuel -= 1.5;
            } else {
                player.vx = 0;
                player.vy = 0;
            }
        }
    }


    player.x += player.vx;
    player.y += player.vy;
    
    // Update asteroids
    asteroidsRef.current.forEach(asteroid => {
        asteroid.x += asteroid.vx;
        asteroid.y += asteroid.vy;
        if(asteroid.x < 0 || asteroid.x > canvas.width) asteroid.vx *= -1;
        if(asteroid.y < 0 || asteroid.y > canvas.height) asteroid.vy *= -1;
    });

    // --- Collision Detection ---
    if (player.x < 0 || player.x > canvas.width || player.y < 0 || player.y > canvas.height) {
        handleGameOver('Lost in space!'); return;
    }
    for(const asteroid of asteroidsRef.current) {
        const dist = Math.hypot(player.x - asteroid.x, player.y - asteroid.y);
        if(dist < asteroid.radius + 10) { // 10 is approx rocket radius
            handleGameOver('Crashed into an asteroid!'); return;
        }
    }
    
    const pad = landingPadRef.current;
    if (player.y > pad.y - 15 && player.x > pad.x && player.x < pad.x + pad.width) {
        const totalVelocity = Math.hypot(player.vx, player.vy);
        if (totalVelocity > SAFE_LANDING_VELOCITY) {
             handleGameOver('Landed too hard!'); return;
        } else {
            handleWin(); return;
        }
    }


    // --- Draw Logic ---
    // Draw asteroids
    asteroidsRef.current.forEach(asteroid => {
        ctx.fillStyle = colors.asteroid;
        ctx.beginPath();
        ctx.arc(asteroid.x, asteroid.y, asteroid.radius, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw landing pad
    ctx.fillStyle = colors.pad;
    ctx.fillRect(pad.x, pad.y, pad.width, 10);

    // Draw player
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);
    ctx.fillStyle = colors.rocket;
    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(-10, -8);
    ctx.lineTo(-10, 8);
    ctx.closePath();
    ctx.fill();
    
    // Main thruster flame
    if ((keysRef.current['w'] || keysRef.current['ArrowUp']) && player.fuel > 0) {
        ctx.fillStyle = colors.flame;
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(-15 - Math.random() * 10, -5);
        ctx.lineTo(-15 - Math.random() * 10, 5);
        ctx.closePath();
        ctx.fill();
    }

    // Retro thruster flames
     if ((keysRef.current[' '] || keysRef.current['Spacebar']) && player.fuel > 0 && Math.hypot(player.vx, player.vy) > 0.1) {
        ctx.fillStyle = colors.retroFlame;
        ctx.beginPath();
        ctx.moveTo(10, 5);
        ctx.lineTo(15 + Math.random() * 5, 3);
        ctx.lineTo(15 + Math.random() * 5, 7);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(10, -5);
        ctx.lineTo(15 + Math.random() * 5, -3);
        ctx.lineTo(15 + Math.random() * 5, -7);
        ctx.closePath();
        ctx.fill();
    }
    
    ctx.restore();

    // Side thruster flames
    ctx.save();
    ctx.translate(player.x, player.y);
    if (keysRef.current['q'] && player.fuel > 0) {
        ctx.fillStyle = colors.sideFlame;
        ctx.beginPath();
        ctx.moveTo(5, -6);
        ctx.lineTo(10 + Math.random() * 5, -8);
        ctx.lineTo(10 + Math.random() * 5, -4);
        ctx.closePath();
        ctx.fill();
    }
    if (keysRef.current['e'] && player.fuel > 0) {
        ctx.fillStyle = colors.sideFlame;
        ctx.beginPath();
        ctx.moveTo(5, 6);
        ctx.lineTo(10 + Math.random() * 5, 8);
        ctx.lineTo(10 + Math.random() * 5, 4);
        ctx.closePath();
        ctx.fill();
    }
    ctx.restore();
    
    // Draw fuel bar
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(10, 10, 200, 20);
    ctx.fillStyle = player.fuel > MAX_FUEL / 4 ? '#34d399' : '#ef4444';
    ctx.fillRect(10, 10, (player.fuel / MAX_FUEL) * 200, 20);

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [getThemeColors, score, highScore, user]);
  
  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    }
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, gameLoop]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keysRef.current[e.key] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.key] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const parentWidth = canvas.parentElement?.clientWidth || 500;
      canvas.width = parentWidth;
      canvas.height = parentWidth * 0.9;
      resetGame();
    }
  }, [resetGame]);
  
  const handleTouchControl = (key: string, isDown: boolean) => {
    if (gameState !== 'playing') return;
    keysRef.current[key] = isDown;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 grid gap-4">
            <Card className="w-full relative">
                <SignedOut>
                    <LoginWall title="Unlock Astro Ascent" description="Sign up to play this physics-based arcade game, master your landing, and set high scores!" />
                </SignedOut>
                <CardHeader>
                <CardTitle>Astro Ascent</CardTitle>
                <CardDescription>Keyboard: W/A/D, Q/E, Space. Touch: Use on-screen controls.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    <div className="w-full flex justify-between items-center bg-muted p-2 rounded-lg text-sm font-semibold">
                        <span>Score: {score}</span>
                        <span>High Score: {highScore}</span>
                        <span className="flex items-center gap-1"><Fuel className="h-4 w-4"/> {Math.max(0, playerRef.current.fuel).toFixed(0)}</span>
                    </div>
                    <div className="w-full rounded-lg overflow-hidden border relative aspect-[10/9] bg-slate-900">
                        <canvas ref={canvasRef} />
                        {gameState !== 'playing' && (
                            <div className="absolute inset-0 bg-black/70 flex flex-col justify-center items-center text-white z-20 p-4 text-center">
                                {gameState === 'idle' && (
                                    <Button size="lg" onClick={startGame} disabled={!isSignedIn}><Play className="mr-2"/> Start Game</Button>
                                )}
                                {gameState === 'gameOver' && (
                                    <div className="space-y-4">
                                        <h3 className="text-3xl font-bold text-destructive">Mission Failed</h3>
                                        <Button size="lg" onClick={startGame}><RotateCw className="mr-2"/> Try Again</Button>
                                    </div>
                                )}
                                {gameState === 'won' && (
                                    <motion.div initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} className="space-y-4">
                                        <h3 className="text-3xl font-bold text-green-400">Perfect Landing!</h3>
                                        <p className="text-xl">Your score: <span className="font-bold">{score}</span></p>
                                        <Button size="lg" onClick={startGame}><RotateCw className="mr-2"/> Fly Again</Button>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
             {/* Touch Controls Overlay */}
             <div className="w-full">
                <div className="relative p-4 bg-muted rounded-lg grid grid-cols-3 grid-rows-2 gap-2">
                    <Button 
                        className="h-20 w-full rounded-lg bg-black/20 text-white/80 active:bg-white/20 row-span-2 self-center"
                        onTouchStart={() => handleTouchControl('a', true)} onTouchEnd={() => handleTouchControl('a', false)}
                        onMouseDown={() => handleTouchControl('a', true)} onMouseUp={() => handleTouchControl('a', false)}
                    ><ChevronsLeft className="h-10 w-10"/></Button>

                    <Button 
                        className="h-14 w-full rounded-lg bg-black/20 text-white/80 active:bg-white/20 text-xs font-bold"
                        onTouchStart={() => handleTouchControl('q', true)} onTouchEnd={() => handleTouchControl('q', false)}
                        onMouseDown={() => handleTouchControl('q', true)} onMouseUp={() => handleTouchControl('q', false)}
                    >Q</Button>

                    <Button 
                        className="h-20 w-full rounded-lg bg-black/20 text-white/80 active:bg-white/20 row-start-1 col-start-2 row-span-2 self-center"
                        onTouchStart={() => handleTouchControl('w', true)} onTouchEnd={() => handleTouchControl('w', false)}
                        onMouseDown={() => handleTouchControl('w', true)} onMouseUp={() => handleTouchControl('w', false)}
                    ><ThrustIcon className="h-12 w-12"/></Button>
                     
                    <Button 
                        className="h-14 w-full rounded-lg bg-black/20 text-white/80 active:bg-white/20 text-xs font-bold"
                        onTouchStart={() => handleTouchControl('e', true)} onTouchEnd={() => handleTouchControl('e', false)}
                        onMouseDown={() => handleTouchControl('e', true)} onMouseUp={() => handleTouchControl('e', false)}
                    >E</Button>

                    <Button 
                        className="h-20 w-full rounded-lg bg-black/20 text-white/80 active:bg-white/20 row-span-2 self-center"
                        onTouchStart={() => handleTouchControl('d', true)} onTouchEnd={() => handleTouchControl('d', false)}
                        onMouseDown={() => handleTouchControl('d', true)} onMouseUp={() => handleTouchControl('d', false)}
                    ><ChevronsRight className="h-10 w-10"/></Button>

                    <Button
                        className="h-14 w-full rounded-lg bg-black/20 text-white/80 active:bg-white/20 col-span-3 mt-2"
                        onTouchStart={() => handleTouchControl(' ', true)} onTouchEnd={() => handleTouchControl(' ', false)}
                        onMouseDown={() => handleTouchControl(' ', true)} onMouseUp={() => handleTouchControl(' ', false)}
                    >
                        <Hand className="h-8 w-8"/>
                    </Button>

                </div>
            </div>
        </div>
        <Card className="w-full lg:col-span-1">
            <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="p-6">
                    <div className="flex items-center gap-2 text-base font-semibold">
                        <HelpCircle className="text-primary"/> How to Play & Scoring
                    </div>
                </AccordionTrigger>
                <AccordionContent className="p-6 pt-0">
                    <div className="space-y-4 text-sm text-muted-foreground">
                        <div className="flex items-start gap-3">
                            <Rocket className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                            <div>
                                <h4 className="font-bold text-foreground">Controls</h4>
                                <ul className="list-disc pl-4 space-y-1 mt-1">
                                  <li><span className="font-bold">W or Up:</span> Main thruster.</li>
                                  <li><span className="font-bold">A/D or Left/Right:</span> Rotate.</li>
                                  <li><span className="font-bold">Q / E:</span> Side thrusters.</li>
                                   <li><span className="font-bold">Spacebar:</span> Retro thrusters (Brakes).</li>
                                </ul>
                            </div>
                        </div>
                         <div className="flex items-start gap-3">
                            <Trophy className="h-5 w-5 mt-0.5 text-amber-500 flex-shrink-0" />
                             <div>
                                <h4 className="font-bold text-foreground">Objective & Scoring</h4>
                                <p>Safely land on the green platform. Score is based on remaining fuel. More fuel = higher score!</p>
                                <ul className="list-disc pl-4 space-y-1 mt-2">
                                    <li>Don't run out of fuel.</li>
                                    <li>Avoid crashing into asteroids.</li>
                                    <li>Land gently! Your total velocity must be less than {SAFE_LANDING_VELOCITY} m/s.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
        </Card>
    </div>
  );
}

    