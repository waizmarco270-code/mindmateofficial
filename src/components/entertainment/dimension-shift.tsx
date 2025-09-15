

'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Orbit, Play, RotateCw, HelpCircle, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useUser, SignedOut } from '@clerk/nextjs';
import { useUsers } from '@/hooks/use-admin';
import { useToast } from '@/hooks/use-toast';
import { isToday } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LoginWall } from '../ui/login-wall';

// Game Configuration
const PLAYER_SIZE = 20;
const OBSTACLE_WIDTH = 40;
const OBSTACLE_HEIGHT = 20;
const WIN_SCORE = 200;

const MILESTONE_REWARDS: Record<number, number> = {
  50: 30,
  100: 50,
  150: 100,
  200: 200,
};

// Player state
interface Player {
  x: number;
  y: number;
  dimension: 'light' | 'dark';
}

// Obstacle state
interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  dimension: 'light' | 'dark';
  type: 'normal' | 'trap' | 'accelerating';
  speed: number;
  dx?: number; // Horizontal speed for moving obstacles
  isVisible?: boolean; // For blinking obstacles
  blinkCounter?: number;
}

export function DimensionShiftGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const { user, isSignedIn } = useUser();
  const { currentUserData, updateGameHighScore, claimDimensionShiftMilestone } = useUsers();
  const { toast } = useToast();


  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameOver' | 'won'>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [claimedMilestones, setClaimedMilestones] = useState<number[]>([]);

  // Using refs for game state that changes every frame to avoid re-renders
  const playerRef = useRef<Player>({ x: 0, y: 0, dimension: 'light' });
  const obstaclesRef = useRef<Obstacle[]>([]);
  const frameCountRef = useRef(0);
  const scrollSpeedRef = useRef(2);
  const gameLoopRef = useRef<number>();
  
  useEffect(() => {
    if(currentUserData?.gameHighScores?.dimensionShift) {
        setHighScore(currentUserData.gameHighScores.dimensionShift);
    }
  }, [currentUserData]);
  
  // Check daily claim status
  useEffect(() => {
    if (user && currentUserData?.dimensionShiftClaims) {
        const todayStr = new Date().toISOString().slice(0, 10);
        const todayClaims = currentUserData.dimensionShiftClaims[todayStr] || [];
        setClaimedMilestones(todayClaims);
    } else {
        setClaimedMilestones([]);
    }
  }, [user, currentUserData, gameState]);


  const getThemeColors = useCallback(() => {
    const isDark = resolvedTheme === 'dark';
    return {
      light: {
        bg: isDark ? 'hsl(240 10% 3.9%)' : 'hsl(0 0% 100%)',
        player: isDark ? '#FFFFFF' : '#000000',
        obstacle: '#A0A0A0', // Changed to a distinct gray for visibility on both themes
        trapObstacle: '#FF6B6B',
      },
      dark: {
        bg: isDark ? '#000000' : '#E5E7EB',
        player: isDark ? '#FFFFFF' : '#000000',
        obstacle: '#4B5563',
        trapObstacle: '#C92A2A',
      },
    };
  }, [resolvedTheme]);

  const resetGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    playerRef.current = {
      x: canvas.width / 2,
      y: canvas.height - PLAYER_SIZE * 3,
      dimension: 'light',
    };
    obstaclesRef.current = [];
    scrollSpeedRef.current = 2; // Start speed
    setScore(0);
    frameCountRef.current = 0;
  }, []);

  const startGame = () => {
    resetGame();
    setGameState('playing');
  };
  
  const handleWin = async () => {
    setGameState('won');
    if (score > highScore) {
      setHighScore(score);
      if(user) updateGameHighScore(user.id, 'dimensionShift', score);
    }
  }

  const gameOver = () => {
    setGameState('gameOver');
    if (score > highScore) {
      setHighScore(score);
       if (user) {
        updateGameHighScore(user.id, 'dimensionShift', score);
      }
    }
  };
  
  const handleScoreUpdate = useCallback((newScore: number) => {
    setScore(newScore);
    
    // Check for milestone
    const reachedMilestone = Object.keys(MILESTONE_REWARDS)
      .map(Number)
      .find(m => newScore >= m && !claimedMilestones.includes(m));

    if (reachedMilestone && user) {
        claimDimensionShiftMilestone(user.id, reachedMilestone)
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

    if (newScore >= WIN_SCORE) {
        handleWin();
    }
  }, [claimedMilestones, user, claimDimensionShiftMilestone, toast]);


  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const colors = getThemeColors();

    // Clear canvas based on current dimension
    ctx.fillStyle = colors[playerRef.current.dimension].bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // --- Update Logic ---
    frameCountRef.current++;
    
    // Difficulty scaling based on score
    let spawnRate = 80;
    if (score > 15) spawnRate = 60; // Insane
    if (score > 20) spawnRate = 40; // Impossible
    if (score > 30) spawnRate = 25; // SUPER CAR
    if (score > 50) spawnRate = 20; // Super Insane
    if (score > 100) spawnRate = 12; // Impossible Level

    // Speed increases
    if (score > 15) scrollSpeedRef.current += 0.025;
    if (score > 20) scrollSpeedRef.current += 0.05;
    if (score > 30) scrollSpeedRef.current += 0.075;
    if (score > 50) scrollSpeedRef.current += 0.1;   // Super Insane
    if (score > 100) scrollSpeedRef.current += 0.15; // Impossible Level

    // Generate new obstacles
    if (frameCountRef.current % Math.floor(spawnRate) === 0) { 
        const dimension = Math.random() > 0.5 ? 'light' : 'dark';
        const xPosition = Math.random() * (canvas.width - OBSTACLE_WIDTH);
        
        let type: Obstacle['type'] = 'normal';
        const specialChance = 0.1 + (score * 0.02); // Chance increases with score
        if (Math.random() < specialChance) {
            type = Math.random() < 0.5 ? 'trap' : 'accelerating';
        }

        const newObstacle: Obstacle = {
            x: xPosition,
            y: -OBSTACLE_HEIGHT,
            width: OBSTACLE_WIDTH,
            height: OBSTACLE_HEIGHT,
            dimension: dimension,
            type: type,
            speed: scrollSpeedRef.current,
        };
        
        const movingChance = 0.1 + (score * 0.015);
        if(Math.random() < movingChance) {
            newObstacle.dx = (Math.random() - 0.5) * (2 + score * 0.1); // Speed increases
        }
        
        const blinkingChance = score > 10 ? 0.2 : 0; // Starts after score 10
        if(Math.random() < blinkingChance) {
            newObstacle.isVisible = true;
            newObstacle.blinkCounter = 0;
        }

        obstaclesRef.current.push(newObstacle);
    }

    // Move obstacles and remove off-screen ones
    let scoreGainedThisFrame = 0;
    obstaclesRef.current.forEach((obstacle, index) => {
        if (obstacle.type === 'accelerating' && obstacle.y > canvas.height / 3) {
            obstacle.speed += 0.15;
        }
        obstacle.y += obstacle.speed;

        if (obstacle.dx) {
            obstacle.x += obstacle.dx;
            if (obstacle.x <= 0 || obstacle.x + obstacle.width >= canvas.width) {
                obstacle.dx *= -1; // Bounce off edges
            }
        }

        if (obstacle.blinkCounter !== undefined) {
            const blinkSpeed = score > 20 ? 30 : 60; // Blinks faster at high scores
            obstacle.blinkCounter++;
            if (obstacle.blinkCounter > blinkSpeed) {
                obstacle.isVisible = !obstacle.isVisible;
                obstacle.blinkCounter = 0;
            }
        }
        
        if (obstacle.y > canvas.height) {
            obstaclesRef.current.splice(index, 1);
            if(gameState === 'playing') {
                scoreGainedThisFrame++;
            }
        }
    });

    if (scoreGainedThisFrame > 0) {
        handleScoreUpdate(score + scoreGainedThisFrame);
    }
    
    // --- Collision Detection ---
    const playerBox = { x: playerRef.current.x - PLAYER_SIZE / 2, y: playerRef.current.y - PLAYER_SIZE / 2, width: PLAYER_SIZE, height: PLAYER_SIZE };
    for (const obstacle of obstaclesRef.current) {
        if (obstacle.isVisible === false) continue; 

        const obstacleBox = { x: obstacle.x, y: obstacle.y, width: obstacle.width, height: obstacle.height };
        const isColliding = playerBox.x < obstacleBox.x + obstacleBox.width &&
                            playerBox.x + playerBox.width > obstacleBox.x &&
                            playerBox.y < obstacleBox.y + obstacleBox.height &&
                            playerBox.y + playerBox.height > obstacleBox.y;

        if (isColliding) {
            let collisionHappened = false;
            if (obstacle.type === 'normal' || obstacle.type === 'accelerating') {
                if (obstacle.dimension === playerRef.current.dimension) {
                    collisionHappened = true;
                }
            }
            else if (obstacle.type === 'trap') {
                if (obstacle.dimension !== playerRef.current.dimension) {
                    collisionHappened = true;
                }
            }

            if(collisionHappened) {
                gameOver();
                return;
            }
        }
    }


    // --- Draw Logic ---
    obstaclesRef.current.forEach(obstacle => {
        if(obstacle.isVisible === false) return; 
        
        if(obstacle.type === 'trap') {
            ctx.fillStyle = colors[obstacle.dimension].trapObstacle;
        } else {
            ctx.fillStyle = colors[obstacle.dimension].obstacle;
        }
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    ctx.fillStyle = colors[playerRef.current.dimension].player;
    ctx.beginPath();
    ctx.arc(playerRef.current.x, playerRef.current.y, PLAYER_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [getThemeColors, score, gameState, handleScoreUpdate]);


  // Initialize and run game loop
  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, gameLoop]);
  
   // Handle dimension switching and player movement
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleSwitch = (e: MouseEvent | TouchEvent) => {
      if (gameState !== 'playing') return;
      playerRef.current.dimension = playerRef.current.dimension === 'light' ? 'dark' : 'light';
    };
    
    const handleMove = (e: MouseEvent | TouchEvent) => {
        if (gameState !== 'playing') return;
        
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const newX = clientX - rect.left;
        
        playerRef.current.x = Math.max(PLAYER_SIZE / 2, Math.min(canvas.width - PLAYER_SIZE / 2, newX));
    }
    
    const handleTouchMove = (e: TouchEvent) => {
      if (gameState === 'playing') {
        e.preventDefault(); // Prevent scrolling on mobile
        handleMove(e);
      }
    }

    canvas.addEventListener('click', handleSwitch);
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
        canvas.removeEventListener('click', handleSwitch);
        canvas.removeEventListener('mousemove', handleMove);
        canvas.removeEventListener('touchmove', handleTouchMove);
    }
  }, [gameState]);


  // Set canvas size and initial state
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.parentElement?.clientWidth || 300;
      canvas.height = 450; // Made slightly shorter for mobile
      resetGame();
    }
  }, [resetGame]);

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start">
      <Card className="w-full md:max-w-md mx-auto relative">
         <SignedOut>
            <LoginWall title="Unlock Dimension Shift" description="Sign up to play this fast-paced arcade game, track your high score, and earn legendary rewards." />
        </SignedOut>
        <CardHeader>
          <CardTitle>Dimension Shift</CardTitle>
          <CardDescription>Click to switch dimensions, move mouse to dodge.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="w-full flex justify-between items-center bg-muted p-2 rounded-lg text-sm font-semibold">
            <span>Score: {score} / {WIN_SCORE}</span>
            <span>High Score: {highScore}</span>
          </div>
          <div className="w-full rounded-lg overflow-hidden border relative cursor-crosshair">
             <canvas ref={canvasRef} />
             {gameState !== 'playing' && (
                <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-white z-10 p-4">
                    {gameState === 'idle' && (
                        <Button size="lg" onClick={startGame} disabled={!isSignedIn}>
                            <Play className="mr-2"/> Start Game
                        </Button>
                    )}
                    {gameState === 'gameOver' && (
                        <div className="text-center space-y-4">
                            <h3 className="text-3xl font-bold">Game Over</h3>
                            <p>You reached a score of {score}.</p>
                            <Button size="lg" onClick={startGame}>
                                <RotateCw className="mr-2"/> Play Again
                            </Button>
                        </div>
                    )}
                    {gameState === 'won' && (
                         <div className="text-center space-y-4">
                            <h3 className="text-3xl font-bold text-yellow-400">YOU WON!</h3>
                            <p>You conquered the impossible!</p>
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
            <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
              <AccordionItem value="item-1">
                <AccordionTrigger className="p-6">
                    <div className="flex items-center gap-2 text-base font-semibold">
                        <HelpCircle className="text-primary"/> How to Play & Rewards
                    </div>
                </AccordionTrigger>
                <AccordionContent className="p-6 pt-0">
                    <div className="space-y-4 text-sm text-muted-foreground">
                        <div className="flex items-start gap-3">
                            <Orbit className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                            <div>
                                <h4 className="font-bold text-foreground">Game Rules</h4>
                                <ul className="list-disc pl-4 space-y-1 mt-1">
                                  <li>Dodge obstacles that are the same dimension as you.</li>
                                  <li>Pass through obstacles of the opposite dimension.</li>
                                  <li>Click to switch dimensions.</li>
                                  <li>Move your mouse to move your character.</li>
                                   <li className="text-red-500">Watch out for <span className="font-bold">Trap Obstacles</span> (colored bars)! You must pass through these if you are the SAME dimension.</li>
                                </ul>
                            </div>
                        </div>
                         <div className="flex items-start gap-3">
                            <Award className="h-5 w-5 mt-0.5 text-amber-500 flex-shrink-0" />
                             <div>
                                <h4 className="font-bold text-foreground">Daily Rewards</h4>
                                <p>Reach score milestones to earn credit rewards! Rewards are claimable once per day.</p>
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
