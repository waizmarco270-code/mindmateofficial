
'use client';

import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, LineChart } from 'lucide-react';
import { TimeTracker } from '@/components/tracker/time-tracker';
import { InsightsView } from '@/components/insights/insights-view';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export default function TrackerInsightsPage() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'tracker';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tracker & Insights</h1>
        <p className="text-muted-foreground">
          Track your study time and visualize your progress patterns.
        </p>
      </div>
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tracker"><Clock className="mr-2 h-4 w-4"/> Time Tracker</TabsTrigger>
            <TabsTrigger value="insights"><LineChart className="mr-2 h-4 w-4"/> Study Insights</TabsTrigger>
        </TabsList>
        <TabsContent value="tracker" className="mt-6">
            <div className="space-y-4">
                 <div className="flex justify-end items-start">
                    <Popover>
                      <PopoverTrigger asChild>
                         <Button variant="ghost" size="icon" className="text-amber-500 hover:text-amber-400 relative">
                              <AlertTriangle className="h-6 w-6 animate-pulse"/>
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-50"></span>
                         </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-4">
                           <h4 className="font-bold text-base flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Fair Play & Accuracy Policy</h4>
                           <div>
                              <p className="text-sm text-muted-foreground font-semibold mb-2">Anti-Cheat System:</p>
                              <p className="text-xs text-muted-foreground">Our system can detect unusual activity. Any attempts to manipulate study time may result in a <span className="font-bold text-destructive">credit penalty of up to -100 credits.</span> Please study honestly.</p>
                           </div>
                            <div>
                              <p className="text-sm text-muted-foreground font-semibold mb-2">Background Timer Rule:</p>
                              <p className="text-xs text-muted-foreground">To ensure accuracy, the timer will automatically pause if the app is in the background for more than 30 minutes. To keep your session active, please return to the app periodically.</p>
                           </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                </div>
                <TimeTracker />
            </div>
        </TabsContent>
        <TabsContent value="insights" className="mt-6">
             <InsightsView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
