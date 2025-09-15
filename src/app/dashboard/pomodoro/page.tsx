
'use client';

import { PomodoroTimer } from '@/components/pomodoro/pomodoro-timer';
import { Stopwatch } from '@/components/pomodoro/stopwatch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Timer, Hourglass } from 'lucide-react';

export default function PomodoroPage() {
  return (
    <Tabs defaultValue="pomodoro" className="w-full h-full">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
        <TabsList className="bg-black/30 backdrop-blur-sm border border-white/10">
          <TabsTrigger value="pomodoro" className="text-white/80 data-[state=active]:text-white">
            <Timer className="mr-2 h-4 w-4"/>
            Pomodoro
          </TabsTrigger>
          <TabsTrigger value="stopwatch" className="text-white/80 data-[state=active]:text-white">
            <Hourglass className="mr-2 h-4 w-4"/>
            Stopwatch
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="pomodoro" className="h-full">
        <PomodoroTimer />
      </TabsContent>
      <TabsContent value="stopwatch" className="h-full">
        <Stopwatch />
      </TabsContent>
    </Tabs>
  );
}
