
'use client';

import { Gamepad2, Puzzle, Swords, Dice5 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TicTacToeGame } from '@/components/entertainment/tic-tac-toe';

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

      <Tabs defaultValue="strategy" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="strategy"><Swords className="mr-2 h-4 w-4" /> Strategy</TabsTrigger>
                <TabsTrigger value="puzzle" disabled><Puzzle className="mr-2 h-4 w-4" /> Puzzle</TabsTrigger>
                <TabsTrigger value="arcade" disabled><Dice5 className="mr-2 h-4 w-4" /> Arcade</TabsTrigger>
            </TabsList>
            <TabsContent value="strategy" className="mt-6">
                <TicTacToeGame />
            </TabsContent>
            <TabsContent value="puzzle" className="mt-6">
                <p className="text-center text-muted-foreground">Puzzle games coming soon!</p>
            </TabsContent>
             <TabsContent value="arcade" className="mt-6">
                <p className="text-center text-muted-foreground">Arcade games coming soon!</p>
            </TabsContent>
      </Tabs>
    </div>
  );
}
