
'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Orbit, Play, RotateCw, HelpCircle, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useUser } from '@clerk/nextjs';
import { useUsers } from '@/hooks/use-admin';

// Game Configuration
const PLAYER_SIZE = 20;
const OBSTACLE_WIDTH = 40;
const OBSTACLE_HEIGHT = 20;
const SCROLL_SPEED_START = 2;

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
}

export function DimensionShiftGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const { user } = useUser();
  const { currentUserData, updateGameHighScore } = useUsers();

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameOver'>('idle');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Using refs for game state that changes every frame to avoid re-renders
  const playerRef = useRef<Player>({ x: 0, y: 0, dimension: 'light' });
  const obstaclesRef = useRef<Obstacle[]>([]);
  const frameCountRef = useRef(0);
  const scrollSpeedRef = useRef(SCROLL_SPEED_START);
  const gameLoopRef = useRef<number>();
  
  useEffect(() => {
    if(currentUserData?.gameHighScores?.dimensionShift) {
        setHighScore(currentUserData.gameHighScores.dimensionShift);
    }
  }, [currentUserData]);

  const getThemeColors = useCallback(() => {
    const isDark = resolvedTheme === 'dark';
    return {
      light: {
        bg: isDark ? 'hsl(240 10% 3.9%)' : 'hsl(0 0% 100%)',
        player: isDark ? '#FFFFFF' : '#000000',
        obstacle: isDark ? '#A0A0A0' : '#A0A0A0',
      },
      dark: {
        bg: isDark ? '#000000' : '#E5E7EB',
        player: isDark ? '#FFFFFF' : '#000000',
        obstacle: isDark ? '#4B5563' : '#4B5563',
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
    scrollSpeedRef.current = SCROLL_SPEED_START;
    setLevel(1);
    setScore(0);
    frameCountRef.current = 0;
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
        updateGameHighScore(user.id, 'dimensionShift', score);
      }
    }
  };

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
    
    // Generate new obstacles (Level 1-10 logic)
    if (frameCountRef.current % 100 === 0) {
        const dimension = Math.random() > 0.5 ? 'light' : 'dark';
        const xPosition = Math.random() * (canvas.width - OBSTACLE_WIDTH);
        obstaclesRef.current.push({
            x: xPosition,
            y: -OBSTACLE_HEIGHT,
            width: OBSTACLE_WIDTH,
            height: OBSTACLE_HEIGHT,
            dimension: dimension,
        });
    }

    // Move obstacles and remove off-screen ones
    obstaclesRef.current.forEach((obstacle, index) => {
        obstacle.y += scrollSpeedRef.current;
        if (obstacle.y > canvas.height) {
            obstaclesRef.current.splice(index, 1);
            setScore(prev => prev + 1); // Increment score for dodging
        }
    });
    
    // --- Collision Detection ---
    for (const obstacle of obstaclesRef.current) {
        if (obstacle.dimension === playerRef.current.dimension) {
            const playerBox = { x: playerRef.current.x - PLAYER_SIZE / 2, y: playerRef.current.y - PLAYER_SIZE / 2, width: PLAYER_SIZE, height: PLAYER_SIZE };
            const obstacleBox = { x: obstacle.x, y: obstacle.y, width: obstacle.width, height: obstacle.height };
            if (
                playerBox.x < obstacleBox.x + obstacleBox.width &&
                playerBox.x + playerBox.width > obstacleBox.x &&
                playerBox.y < obstacleBox.y + obstacleBox.height &&
                playerBox.y + playerBox.height > obstacleBox.y
            ) {
                gameOver();
                return;
            }
        }
    }


    // --- Draw Logic ---

    // Draw obstacles
    obstaclesRef.current.forEach(obstacle => {
      ctx.fillStyle = colors[obstacle.dimension].obstacle;
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Draw player
    ctx.fillStyle = colors[playerRef.current.dimension].player;
    ctx.beginPath();
    ctx.arc(playerRef.current.x, playerRef.current.y, PLAYER_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [getThemeColors]);


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
  
   // Handle dimension switching
  useEffect(() => {
    const handleSwitch = (e: MouseEvent | TouchEvent) => {
      if (gameState !== 'playing') return;
      playerRef.current.dimension = playerRef.current.dimension === 'light' ? 'dark' : 'light';
    };

    const canvas = canvasRef.current;
    canvas?.addEventListener('click', handleSwitch);
    return () => canvas?.removeEventListener('click', handleSwitch);
  }, [gameState]);


  // Set canvas size and initial state
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.parentElement?.clientWidth || 300;
      canvas.height = 500;
      resetGame();
    }
  }, [resetGame]);

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start">
      <Card className="w-full md:max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Dimension Shift</CardTitle>
          <CardDescription>Click to switch dimensions and dodge the obstacles.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="w-full flex justify-between items-center bg-muted p-2 rounded-lg text-sm font-semibold">
            <span>Score: {score}</span>
            <span>Level: {level}</span>
            <span>High Score: {highScore}</span>
          </div>
          <div className="w-full rounded-lg overflow-hidden border relative">
             <canvas ref={canvasRef} />
             {gameState !== 'playing' && (
                <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-white z-10">
                    {gameState === 'idle' && (
                        <Button size="lg" onClick={startGame}>
                            <Play className="mr-2"/> Start Game
                        </Button>
                    )}
                    {gameState === 'gameOver' && (
                        <div className="text-center space-y-4">
                            <h3 className="text-3xl font-bold">Game Over</h3>
                            <p>Your score: {score}</p>
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
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><HelpCircle className="text-primary"/> How to Play & Rewards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
               <div className="flex items-start gap-3">
                    <Orbit className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                    <div>
                        <h4 className="font-bold text-foreground">Game Rules</h4>
                        <p>Your character exists in either the Light or Dark dimension. You must dodge obstacles of the SAME dimension. Click anywhere on the screen to switch dimensions. The longer you survive, the higher your score.</p>
                    </div>
                </div>
                 <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 mt-0.5 text-amber-500 flex-shrink-0" />
                     <div>
                        <h4 className="font-bold text-foreground">Rewards</h4>
                         <p>Rewards will be added in Phase 2! For now, chase the high score!</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}

    