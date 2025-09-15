
'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Play, RotateCw, HelpCircle, Award, Trophy } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useUser, SignedOut } from '@clerk/nextjs';
import { useUsers } from '@/hooks/use-admin';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LoginWall } from '../ui/login-wall';

// Game Configuration
const PLAYER_SIZE = { width: 40, height: 30 };
const GRAVITY = 0.5;
const JUMP_STRENGTH = -8;
const BARRIER_WIDTH = 80;
const BARRIER_GAP = 200; // Vertical gap between barriers
const BARRIER_SPACING = 350; // Horizontal distance between barriers

const DISTRACTION_WORDS = [
    'PROCRASTINATION', 'DOUBT', 'LAZINESS', 'DISTRACTION',
    'FATIGUE', 'OVERTHINKING', 'FEAR', 'BURNOUT'
];

const MILESTONE_REWARDS: Record<number, number> = {
  5: 2, 10: 5, 15: 10, 20: 50, 30: 100,
};

interface PlayerState {
  x: number;
  y: number;
  velocity: number;
}

interface Barrier {
  x: number;
  topHeight: number;
  word: string;
  passed: boolean;
}

export function FlappyMindGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const { user, isSignedIn } = useUser();
  const { currentUserData, claimFlappyMindMilestone } = useUsers();
  const { toast } = useToast();

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameOver'>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [claimedMilestones, setClaimedMilestones] = useState<number[]>([]);

  // Using refs for game state that changes every frame
  const playerRef = useRef<PlayerState>({ x: 0, y: 0, velocity: 0 });
  const barriersRef = useRef<Barrier[]>([]);
  const frameCountRef = useRef(0);
  const gameLoopRef = useRef<number>();
  const gameSpeedRef = useRef(3);

  useEffect(() => {
    if (currentUserData?.gameHighScores?.flappyMind) {
        setHighScore(currentUserData.gameHighScores.flappyMind);
    }
  }, [currentUserData]);
  
  useEffect(() => {
    if (user && currentUserData?.flappyMindClaims) {
        const todayStr = new Date().toISOString().slice(0, 10);
        const todayClaims = currentUserData.flappyMindClaims[todayStr] || [];
        setClaimedMilestones(todayClaims);
    } else {
        setClaimedMilestones([]);
    }
  }, [user, currentUserData, gameState]);


  const getThemeColors = useCallback(() => {
    const isDark = resolvedTheme === 'dark';
    return {
      bg: isDark ? '#020617' : '#e0f2fe',
      player: isDark ? '#f0b90b' : '#ca8a04', // Golden book
      barrier: isDark ? '#94a3b8' : '#475569',
      barrierText: isDark ? '#1e293b' : '#cbd5e1',
    };
  }, [resolvedTheme]);

  const resetGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    playerRef.current = {
      x: canvas.width / 4,
      y: canvas.height / 2,
      velocity: 0,
    };
    barriersRef.current = [];
    gameSpeedRef.current = 3;
    setScore(0);
    frameCountRef.current = 0;
    
    // Create initial barriers
    for (let i = 1; i <= 3; i++) {
        barriersRef.current.push({
            x: canvas.width + i * BARRIER_SPACING,
            topHeight: Math.random() * (canvas.height - BARRIER_GAP - 80) + 40,
            word: DISTRACTION_WORDS[Math.floor(Math.random() * DISTRACTION_WORDS.length)],
            passed: false,
        });
    }

  }, []);

  const startGame = () => {
    resetGame();
    setGameState('playing');
  };

  const gameOver = () => {
    setGameState('gameOver');
    if (score > highScore) {
      setHighScore(score);
       if (user) {
        // We'll use the claim function to update high score
        claimFlappyMindMilestone(user.id, score);
      }
    }
  };
  
  const handleScoreUpdate = useCallback((newScore: number) => {
    setScore(newScore);

    const reachedMilestone = Object.keys(MILESTONE_REWARDS)
      .map(Number)
      .find(m => newScore >= m && !claimedMilestones.includes(m));

    if (reachedMilestone && user) {
        claimFlappyMindMilestone(user.id, reachedMilestone)
            .then(success => {
                if (success) {
                    toast({
                        title: `Milestone! +${MILESTONE_REWARDS[reachedMilestone]} Credits!`,
                        description: `You reached a score of ${reachedMilestone}!`,
                        className: "bg-green-500/10 text-green-700 border-green-500/50"
                    });
                    setClaimedMilestones(prev => [...prev, reachedMilestone]);
                }
            });
    }
  }, [claimedMilestones, user, claimFlappyMindMilestone, toast]);


  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const colors = getThemeColors();

    // Clear canvas
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // --- Update Logic ---
    const player = playerRef.current;
    player.velocity += GRAVITY;
    player.y += player.velocity;

    // Difficulty scaling
    if (score >= 10) gameSpeedRef.current = 4; // Super Hard
    if (score >= 20) gameSpeedRef.current = 5; // Impossible
    if (score >= 25) gameSpeedRef.current = 5.5; // No one can cross

    // Move barriers
    barriersRef.current.forEach(barrier => {
      barrier.x -= gameSpeedRef.current;
    });

    // Check for score
    const currentBarrier = barriersRef.current.find(b => !b.passed && b.x + BARRIER_WIDTH < player.x);
    if (currentBarrier) {
      currentBarrier.passed = true;
      handleScoreUpdate(score + 1);
    }
    
    // Remove off-screen barriers and add new ones
    if (barriersRef.current.length > 0 && barriersRef.current[0].x < -BARRIER_WIDTH) {
        barriersRef.current.shift();
        const lastBarrier = barriersRef.current[barriersRef.current.length - 1];
        barriersRef.current.push({
            x: lastBarrier.x + BARRIER_SPACING,
            topHeight: Math.random() * (canvas.height - BARRIER_GAP - 80) + 40,
            word: DISTRACTION_WORDS[Math.floor(Math.random() * DISTRACTION_WORDS.length)],
            passed: false,
        });
    }

    // --- Collision Detection ---
    if (player.y > canvas.height - PLAYER_SIZE.height / 2 || player.y < PLAYER_SIZE.height / 2) {
      gameOver(); return;
    }
    for (const barrier of barriersRef.current) {
        const isColliding = player.x + PLAYER_SIZE.width / 2 > barrier.x &&
                            player.x - PLAYER_SIZE.width / 2 < barrier.x + BARRIER_WIDTH &&
                            (player.y - PLAYER_SIZE.height / 2 < barrier.topHeight ||
                             player.y + PLAYER_SIZE.height / 2 > barrier.topHeight + BARRIER_GAP);
        if (isColliding) {
            gameOver(); return;
        }
    }

    // --- Draw Logic ---
    // Draw barriers
    ctx.fillStyle = colors.barrier;
    ctx.font = 'bold 12px sans-serif';
    barriersRef.current.forEach(barrier => {
      ctx.fillRect(barrier.x, 0, BARRIER_WIDTH, barrier.topHeight);
      const bottomBarrierY = barrier.topHeight + BARRIER_GAP;
      ctx.fillRect(barrier.x, bottomBarrierY, BARRIER_WIDTH, canvas.height - bottomBarrierY);
      
      // Draw text
      ctx.save();
      ctx.fillStyle = colors.barrierText;
      ctx.translate(barrier.x + BARRIER_WIDTH / 2, barrier.topHeight - 10);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(barrier.word, 0, 0);
      ctx.restore();
    });

    // Draw player (book)
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(Math.min(player.velocity / 20, Math.PI / 6)); // Tilt based on velocity
    ctx.fillStyle = colors.player;
    ctx.fillRect(-PLAYER_SIZE.width / 2, -PLAYER_SIZE.height / 2, PLAYER_SIZE.width, PLAYER_SIZE.height);
    // Book binding
    ctx.fillStyle = resolvedTheme === 'dark' ? '#fde047' : '#a16207';
    ctx.fillRect(-PLAYER_SIZE.width / 2, -PLAYER_SIZE.height / 2, 5, PLAYER_SIZE.height);
    ctx.restore();
    
    // Draw score
    ctx.fillStyle = resolvedTheme === 'dark' ? 'white' : 'black';
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText(score.toString(), canvas.width / 2, 60);

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [getThemeColors, score, handleScoreUpdate, resolvedTheme]);

  // Game loop management
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

  // Handle jump
  useEffect(() => {
    const handleJump = () => {
      if (gameState === 'playing') {
        playerRef.current.velocity = JUMP_STRENGTH;
      } else if (gameState === 'idle') {
          startGame();
      }
    };
    window.addEventListener('keydown', handleJump);
    window.addEventListener('click', handleJump);
    window.addEventListener('touchstart', handleJump);
    return () => {
      window.removeEventListener('keydown', handleJump);
      window.removeEventListener('click', handleJump);
      window.removeEventListener('touchstart', handleJump);
    };
  }, [gameState]);
  
  // Set canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.parentElement?.clientWidth || 300;
      canvas.height = 450;
      resetGame();
    }
  }, [resetGame]);

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start">
      <Card className="w-full md:max-w-md mx-auto relative">
        <SignedOut>
          <LoginWall title="Unlock Flappy Mind" description="Sign up to play this challenging arcade game, track your high score, and earn legendary rewards." />
        </SignedOut>
        <CardHeader>
          <CardTitle>Flappy Mind</CardTitle>
          <CardDescription>Tap to make the book fly. Avoid the distractions!</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="w-full flex justify-between items-center bg-muted p-2 rounded-lg text-sm font-semibold">
            <span>Score: {score}</span>
            <span>High Score: {highScore}</span>
          </div>
          <div className="w-full rounded-lg overflow-hidden border relative">
             <canvas ref={canvasRef} />
             {gameState !== 'playing' && (
                <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-white z-10 p-4 text-center">
                    {gameState === 'idle' && (
                        <div className="space-y-4">
                            <h3 className="text-3xl font-bold">Flappy Mind</h3>
                            <p>Tap anywhere to start</p>
                             <Button size="lg" onClick={startGame} disabled={!isSignedIn}>
                                <Play className="mr-2"/> Start Game
                            </Button>
                        </div>
                    )}
                    {gameState === 'gameOver' && (
                        <div className="space-y-4">
                            <h3 className="text-3xl font-bold">Game Over</h3>
                            <p>You scored {score}.</p>
                            <Button size="lg" onClick={startGame}>
                                <RotateCw className="mr-2"/> Play Again
                            </Button>
                        </div>
                    )}
                </div>
             )}
          </div>
        </CardContent>
      </Card>
      <Card className="flex-1 w-full">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="p-6">
                <div className="flex items-center gap-2 text-base font-semibold">
                    <HelpCircle className="text-primary"/> How to Play & Rewards
                </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0">
                <div className="space-y-4 text-sm text-muted-foreground">
                    <div className="flex items-start gap-3">
                        <BookOpen className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                        <div>
                            <h4 className="font-bold text-foreground">Game Rules</h4>
                            <p>Tap or click anywhere on the screen to make the book 'flap' upwards. Navigate through the gaps in the 'distraction' barriers to score points.</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-3">
                        <Trophy className="h-5 w-5 mt-0.5 text-amber-500 flex-shrink-0" />
                         <div>
                            <h4 className="font-bold text-foreground">Daily Milestone Rewards</h4>
                            <p>Reach score milestones to earn credit rewards! Rewards are claimable once per day, so aim high!</p>
                            <ul className="list-disc pl-4 space-y-1 mt-2">
                                {Object.entries(MILESTONE_REWARDS).map(([score, reward]) => (
                                    <li key={score}><span className="font-bold text-primary">{score} Score</span> = <span className="font-semibold text-amber-500">{reward} Credits</span></li>
                                ))}
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
