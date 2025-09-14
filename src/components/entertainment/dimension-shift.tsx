
'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Orbit, Play, RotateCw, HelpCircle, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useUser } from '@clerk/nextjs';
import { useUsers } from '@/hooks/use-admin';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { isToday } from 'date-fns';

// Game Configuration
const PLAYER_SIZE = 20;
const OBSTACLE_WIDTH = 40;
const OBSTACLE_HEIGHT = 20;
const SCROLL_SPEED_START = 2;
const SCROLL_SPEED_INCREASE = 0.1;
const DAILY_WIN_REWARD = 15;


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
  const { user } = useUser();
  const { currentUserData, updateGameHighScore, addCreditsToUser } = useUsers();
  const { toast } = useToast();


  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameOver'>('idle');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [hasClaimedToday, setHasClaimedToday] = useState(true);

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
  
  // Check daily claim status
  useEffect(() => {
    const checkClaimStatus = async () => {
        if (!user) {
          setHasClaimedToday(true); // Can't claim if not logged in
          return;
        };
        const claimDocRef = doc(db, 'users', user.id, 'dailyClaims', 'dimensionShiftWin');
        const docSnap = await getDoc(claimDocRef);
        if (docSnap.exists() && isToday(docSnap.data().lastClaimed.toDate())) {
            setHasClaimedToday(true);
        } else {
            setHasClaimedToday(false);
        }
    };
    checkClaimStatus();
  }, [user, gameState]);

  const getThemeColors = useCallback(() => {
    const isDark = resolvedTheme === 'dark';
    return {
      light: {
        bg: isDark ? 'hsl(240 10% 3.9%)' : 'hsl(0 0% 100%)',
        player: isDark ? '#FFFFFF' : '#000000',
        obstacle: isDark ? '#A0A0A0' : '#A0A0A0',
        trapObstacle: isDark ? '#FF6B6B' : '#FF6B6B',
      },
      dark: {
        bg: isDark ? '#000000' : '#E5E7EB',
        player: isDark ? '#FFFFFF' : '#000000',
        obstacle: isDark ? '#4B5563' : '#4B5563',
        trapObstacle: isDark ? '#C92A2A' : '#C92A2A',
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
  
  const handleWin = async () => {
    if (!hasClaimedToday && user) {
        await addCreditsToUser(user.id, DAILY_WIN_REWARD);
        const claimDocRef = doc(db, 'users', user.id, 'dailyClaims', 'dimensionShiftWin');
        await setDoc(claimDocRef, { lastClaimed: Timestamp.now() });
        setHasClaimedToday(true);
        toast({
            title: `You won! +${DAILY_WIN_REWARD} Credits!`,
            description: "You've claimed your daily win reward for Dimension Shift.",
            className: "bg-green-500/10 text-green-700 border-green-500/50"
        });
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
    // Trigger win condition on first point scored if reward is available
    if(newScore === 1 && !hasClaimedToday) {
        handleWin();
    }
    // Update level based on score
    const newLevel = Math.floor(newScore / 10) + 1;
    setLevel(newLevel);
    scrollSpeedRef.current = SCROLL_SPEED_START + (newLevel - 1) * SCROLL_SPEED_INCREASE;

  }, [user, hasClaimedToday]);

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
    
    // Generate new obstacles
    if (frameCountRef.current % 80 === 0) { // Slightly less frequent
        const dimension = Math.random() > 0.5 ? 'light' : 'dark';
        const xPosition = Math.random() * (canvas.width - OBSTACLE_WIDTH);
        
        let type: Obstacle['type'] = 'normal';
        // Level 4+: Introduce Trap and Accelerating obstacles
        if (level >= 4 && Math.random() < 0.3) { // 30% chance for special obstacle
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
        
        // Level 2+: Moving obstacles
        if(level >= 2) {
             if (Math.random() < 0.3) { // 30% chance to be a moving obstacle
                newObstacle.dx = (Math.random() - 0.5) * 2; // -1 to 1
             }
        }
        
        // Level 3+: Blinking obstacles
        if(level >= 3) {
            if (Math.random() < 0.2) { // 20% chance to be a blinking obstacle
                newObstacle.isVisible = true;
                newObstacle.blinkCounter = 0;
            }
        }

        obstaclesRef.current.push(newObstacle);
    }

    // Move obstacles and remove off-screen ones
    obstaclesRef.current.forEach((obstacle, index) => {
        // Handle accelerating obstacles
        if (obstacle.type === 'accelerating' && obstacle.y > canvas.height / 3) {
            obstacle.speed += 0.15;
        }
        obstacle.y += obstacle.speed;

        // Move horizontally if applicable
        if (obstacle.dx) {
            obstacle.x += obstacle.dx;
            if (obstacle.x <= 0 || obstacle.x + obstacle.width >= canvas.width) {
                obstacle.dx *= -1; // Bounce off edges
            }
        }

        // Handle blinking
        if (obstacle.blinkCounter !== undefined) {
            obstacle.blinkCounter++;
            if (obstacle.blinkCounter > 60) { // Blink every ~1 second
                obstacle.isVisible = !obstacle.isVisible;
                obstacle.blinkCounter = 0;
            }
        }
        
        if (obstacle.y > canvas.height) {
            obstaclesRef.current.splice(index, 1);
            handleScoreUpdate(score + 1); // Increment score for dodging
        }
    });
    
    // --- Collision Detection ---
    const playerBox = { x: playerRef.current.x - PLAYER_SIZE / 2, y: playerRef.current.y - PLAYER_SIZE / 2, width: PLAYER_SIZE, height: PLAYER_SIZE };
    for (const obstacle of obstaclesRef.current) {
        if (obstacle.isVisible === false) continue; // Cannot collide with invisible obstacle

        const obstacleBox = { x: obstacle.x, y: obstacle.y, width: obstacle.width, height: obstacle.height };
        const isColliding = playerBox.x < obstacleBox.x + obstacleBox.width &&
                            playerBox.x + playerBox.width > obstacleBox.x &&
                            playerBox.y < obstacleBox.y + obstacleBox.height &&
                            playerBox.y + playerBox.height > obstacleBox.y;

        if (isColliding) {
            let collisionHappened = false;
            // Normal collision: hit if same dimension
            if (obstacle.type === 'normal' || obstacle.type === 'accelerating') {
                if (obstacle.dimension === playerRef.current.dimension) {
                    collisionHappened = true;
                }
            }
            // Trap collision: hit if DIFFERENT dimension
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
    // Draw obstacles
    obstaclesRef.current.forEach(obstacle => {
        if(obstacle.isVisible === false) return; // Don't draw invisible obstacles
        
        if(obstacle.type === 'trap') {
            ctx.fillStyle = colors[obstacle.dimension].trapObstacle;
        } else {
            ctx.fillStyle = colors[obstacle.dimension].obstacle;
        }
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Draw player
    ctx.fillStyle = colors[playerRef.current.dimension].player;
    ctx.beginPath();
    ctx.arc(playerRef.current.x, playerRef.current.y, PLAYER_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [getThemeColors, level, score, handleScoreUpdate]);


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
    const handleSwitch = (e: MouseEvent | TouchEvent) => {
      if (gameState !== 'playing') return;
      playerRef.current.dimension = playerRef.current.dimension === 'light' ? 'dark' : 'light';
    };
    
    const handleMove = (e: MouseEvent | TouchEvent) => {
        if (gameState !== 'playing') return;
        const canvas = canvasRef.current;
        if(!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const newX = clientX - rect.left;
        
        // Clamp player position within canvas bounds
        playerRef.current.x = Math.max(PLAYER_SIZE / 2, Math.min(canvas.width - PLAYER_SIZE / 2, newX));
    }

    const canvas = canvasRef.current;
    canvas?.addEventListener('click', handleSwitch);
    canvas?.addEventListener('mousemove', handleMove);
    canvas?.addEventListener('touchmove', handleMove);

    return () => {
        canvas?.removeEventListener('click', handleSwitch);
        canvas?.removeEventListener('mousemove', handleMove);
        canvas?.removeEventListener('touchmove', handleMove);
    }
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
          <CardDescription>Click to switch dimensions, move mouse to dodge.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="w-full flex justify-between items-center bg-muted p-2 rounded-lg text-sm font-semibold">
            <span>Score: {score}</span>
            <span>Level: {level}</span>
            <span>High Score: {highScore}</span>
          </div>
          <div className="w-full rounded-lg overflow-hidden border relative cursor-crosshair">
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
                        <h4 className="font-bold text-foreground">Rewards</h4>
                         <p>You'll earn a <span className="font-bold text-primary">+{DAILY_WIN_REWARD} credit bonus</span> for your first win each day. Score at least 1 point to claim it!</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
