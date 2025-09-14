
'use client';

import { Gamepad2, Puzzle, Swords, Dice5, Brain, Newspaper, Orbit } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TicTacToeGame } from '@/components/entertainment/tic-tac-toe';
import { WordUnscrambleGame } from '@/components/entertainment/word-unscramble';
import { MemoryPatternGame } from '@/components/entertainment/memory-pattern-game';
import { WordHuntGame } from '@/components/entertainment/word-hunt';
import { EmojiQuiz } from '@/components/entertainment/emoji-quiz';
import { DimensionShiftGame } from '@/components/entertainment/dimension-shift';
import { Card, CardContent } from '@/components/ui/card';

export default function EntertainmentPage() {
  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Gamepad2 className="h-8 w-8 text-primary" />
          Entertainment Zone
        </h1>
        <p className="text-muted-foreground">Relax, play some games, and earn credits!</p>
      </div>

      <Tabs defaultValue="arcade" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
                <TabsTrigger value="arcade"><Orbit className="mr-2 h-4 w-4" /> Arcade</TabsTrigger>
                <TabsTrigger value="strategy"><Swords className="mr-2 h-4 w-4" /> Strategy</TabsTrigger>
                <TabsTrigger value="puzzle"><Brain className="mr-2 h-4 w-4" /> Puzzle</TabsTrigger>
                <TabsTrigger value="word-games"><Newspaper className="mr-2 h-4 w-4" /> Word Games</TabsTrigger>
                <TabsTrigger value="memory"><Dice5 className="mr-2 h-4 w-4" /> Memory</TabsTrigger>
            </TabsList>
            <TabsContent value="arcade" className="mt-6">
                <DimensionShiftGame />
            </TabsContent>
            <TabsContent value="strategy" className="mt-6">
                <TicTacToeGame />
            </TabsContent>
            <TabsContent value="puzzle" className="mt-6">
                 <EmojiQuiz />
            </TabsContent>
             <TabsContent value="word-games" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <WordHuntGame />
                    <WordUnscrambleGame />
                </div>
            </TabsContent>
             <TabsContent value="memory" className="mt-6">
                <MemoryPatternGame />
            </TabsContent>
      </Tabs>
    </div>
  );
}
