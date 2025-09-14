
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Circle, RotateCw, Award, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { useToast } from '@/hooks/use-toast';
import { useUsers } from '@/hooks/use-admin';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { isToday } from 'date-fns';

type Player = 'X' | 'O';
type Board = (Player | null)[];

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],           // diagonals
];

const DAILY_WIN_REWARD = 1000;

export function TicTacToeGame() {
    const { user } = useUser();
    const { toast } = useToast();
    const { addCreditsToUser } = useUsers();
    
    const [board, setBoard] = useState<Board>(Array(9).fill(null));
    const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
    const [winner, setWinner] = useState<Player | 'draw' | null>(null);
    const [hasClaimedToday, setHasClaimedToday] = useState(true);

    // Check daily claim status
    useEffect(() => {
        const checkClaimStatus = async () => {
            if (!user) return;
            const claimDocRef = doc(db, 'users', user.id, 'dailyClaims', 'ticTacToeWin');
            const docSnap = await getDoc(claimDocRef);
            if (docSnap.exists() && isToday(docSnap.data().lastClaimed.toDate())) {
                setHasClaimedToday(true);
            } else {
                setHasClaimedToday(false);
            }
        };
        checkClaimStatus();
    }, [user]);

    const checkWinner = (currentBoard: Board): Player | 'draw' | null => {
        for (const combination of WINNING_COMBINATIONS) {
            const [a, b, c] = combination;
            if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
                return currentBoard[a];
            }
        }
        if (currentBoard.every(cell => cell !== null)) {
            return 'draw';
        }
        return null;
    };
    
    const handleWin = async (theWinner: Player) => {
        if (theWinner === 'X' && !hasClaimedToday && user) {
            await addCreditsToUser(user.id, DAILY_WIN_REWARD);
            const claimDocRef = doc(db, 'users', user.id, 'dailyClaims', 'ticTacToeWin');
            await setDoc(claimDocRef, { lastClaimed: Timestamp.now() });
            setHasClaimedToday(true);
            toast({
                title: `You won! +${DAILY_WIN_REWARD} Credits!`,
                description: "You've claimed your daily reward for Tic-Tac-Toe.",
                className: "bg-green-500/10 text-green-700 border-green-500/50"
            });
        }
    };


    const handleClick = (index: number) => {
        if (board[index] || winner) return;

        const newBoard = [...board];
        newBoard[index] = currentPlayer;
        setBoard(newBoard);
        
        const gameResult = checkWinner(newBoard);
        if (gameResult) {
            setWinner(gameResult);
            if(gameResult !== 'draw') {
                handleWin(gameResult);
            }
        } else {
             // AI's turn
            setCurrentPlayer('O');
            setTimeout(() => aiMove(newBoard), 500);
        }
    };
    
    const aiMove = (currentBoard: Board) => {
        let bestScore = -Infinity;
        let move = -1;

        for (let i = 0; i < 9; i++) {
            if (currentBoard[i] === null) {
                currentBoard[i] = 'O';
                let score = minimax(currentBoard, 0, false);
                currentBoard[i] = null;
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        
        if(move !== -1){
            const newBoard = [...currentBoard];
            newBoard[move] = 'O';
            setBoard(newBoard);
            
            const gameResult = checkWinner(newBoard);
            if (gameResult) {
                setWinner(gameResult);
            } else {
                setCurrentPlayer('X');
            }
        }
    };

    const scores = { X: -1, O: 1, draw: 0 };

    const minimax = (board: Board, depth: number, isMaximizing: boolean) => {
        let result = checkWinner(board);
        if (result !== null) {
            return scores[result as keyof typeof scores];
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = 'O';
                    let score = minimax(board, depth + 1, false);
                    board[i] = null;
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = 'X';
                    let score = minimax(board, depth + 1, true);
                    board[i] = null;
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }


    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setCurrentPlayer('X');
        setWinner(null);
    };
    
    const getStatusMessage = () => {
        if(winner === 'X') return 'You Win!';
        if(winner === 'O') return 'You Lose!';
        if(winner === 'draw') return 'It\'s a Draw!';
        return `Current Player: ${currentPlayer}`;
    }

    return (
        <div className="flex flex-col md:flex-row gap-8 items-start">
             <Card className="w-full md:w-auto">
                <CardHeader>
                    <CardTitle>Tic-Tac-Toe</CardTitle>
                    <CardDescription>A classic game of strategy. Can you beat the AI?</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6">
                    <div className="grid grid-cols-3 gap-2 bg-muted p-2 rounded-lg">
                        {board.map((cell, index) => (
                             <motion.div
                                key={index}
                                className="h-20 w-20 sm:h-28 sm:w-28 bg-background rounded-md flex items-center justify-center cursor-pointer hover:bg-primary/10 transition-colors"
                                onClick={() => handleClick(index)}
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                             >
                                <AnimatePresence>
                                    {cell === 'X' && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                            <X className="h-12 w-12 text-blue-500" strokeWidth={3} />
                                        </motion.div>
                                    )}
                                    {cell === 'O' && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                            <Circle className="h-12 w-12 text-red-500" strokeWidth={3} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                     <div className="flex flex-col items-center gap-4 w-full">
                        <div className={cn(
                            "text-xl font-bold p-2 rounded-md w-full text-center transition-colors",
                            winner === 'X' && "bg-green-500/20 text-green-500",
                            winner === 'O' && "bg-destructive/20 text-destructive",
                            winner === 'draw' && "bg-muted-foreground/20 text-muted-foreground",
                        )}>
                            {getStatusMessage()}
                        </div>
                        <Button onClick={resetGame} variant="outline" className="w-full">
                            <RotateCw className="mr-2 h-4 w-4" />
                            {winner ? 'Play Again' : 'Reset Game'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
             <Card className="flex-1 w-full md:w-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Award className="text-amber-500"/> Daily Reward</CardTitle>
                </CardHeader>
                <CardContent>
                    {hasClaimedToday ? (
                        <div className="flex items-center justify-center gap-2 rounded-lg border border-green-500/50 bg-green-500/10 p-4 text-green-700 dark:text-green-300 h-full">
                            <Award className="h-6 w-6"/>
                            <p className="font-semibold text-center">You've already claimed your win reward for today. Come back tomorrow!</p>
                        </div>
                    ) : (
                         <div className="text-center rounded-lg border-2 border-dashed border-amber-500/50 bg-amber-500/10 p-6 text-amber-700 dark:text-amber-300">
                            <p className="text-2xl font-bold tracking-tight">If you have the will,</p>
                            <p className="text-4xl font-extrabold text-amber-500 my-2">WIN IT & TAKE {DAILY_WIN_REWARD} CREDITS</p>
                            <p className="text-xs mt-2">No credits are awarded for a draw. This is a one-time daily reward.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
