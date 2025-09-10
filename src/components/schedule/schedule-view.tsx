
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Schedule } from './schedule';
import { useGoals, Goal } from '@/hooks/use-goals';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { ListChecks, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export function ScheduleView() {
  const { 
    weeklyGoal, 
    updateWeeklyGoal, 
    loading 
  } = useGoals();

  const [weeklyText, setWeeklyText] = useState('');
  const [isEditingWeekly, setIsEditingWeekly] = useState(false);

  // When goals load from the hook, update the local state
  useEffect(() => {
    setWeeklyText(weeklyGoal?.text || '');
  }, [weeklyGoal]);


  const handleSaveWeekly = () => {
    updateWeeklyGoal(weeklyText);
    setIsEditingWeekly(false);
  }

  return (
    <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ListChecks className="text-primary"/>This Week's Focus</CardTitle>
            <CardDescription>What are your key priorities for this week?</CardDescription>
          </CardHeader>
          <CardContent>
            {isEditingWeekly ? (
                <div className="space-y-4">
                    <Textarea 
                    value={weeklyText}
                    onChange={(e) => setWeeklyText(e.target.value)}
                    placeholder="e.g., Complete physics homework, prepare presentation slides..."
                    rows={4}
                    />
                    <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setIsEditingWeekly(false)}>Cancel</Button>
                    <Button onClick={handleSaveWeekly}>Save</Button>
                    </div>
                </div>
                ) : (
                <div onClick={() => setIsEditingWeekly(true)} className="cursor-pointer group rounded-lg p-4 hover:bg-muted transition-colors">
                    {weeklyGoal?.text ? (
                    <p className="text-muted-foreground whitespace-pre-wrap">{weeklyGoal.text}</p>
                    ) : (
                    <p className="text-muted-foreground italic">Click to set your goals for this week.</p>
                    )}
                    <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity mt-2">Edit Weekly Goal</Button>
                </div>
            )}
          </CardContent>
        </Card>
      
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Calendar className="text-primary"/>Monthly Roadmap</CardTitle>
                <CardDescription>Click a day to add events, or click an event to edit it.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Schedule />
            </CardContent>
        </Card>
    </div>
  );
}
