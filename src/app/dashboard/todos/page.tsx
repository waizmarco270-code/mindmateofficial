
'use client';

import { TodoList } from '@/components/todos/todo-list';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { SignedOut } from '@clerk/nextjs';
import { LoginWall } from '@/components/ui/login-wall';
import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';

export default function TodosPage() {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    // Set date on the client-side to ensure it's always correct
    setCurrentDate(format(new Date(), 'EEEE, MMMM do'));
  }, []);


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Today's To-Dos</h1>
        <p className="text-muted-foreground">
          {currentDate || 'Loading date...'}
        </p>
      </div>
      <Card className="relative">
        <SignedOut>
            <LoginWall 
                title="Unlock To-Do Lists"
                description="Sign up for free to create daily tasks, track your progress, and earn credits for completing your checklist."
            />
        </SignedOut>
        <CardHeader>
          <CardTitle>My Daily Checklist</CardTitle>
          <CardDescription>Add your tasks for the day. Complete tasks to unlock a daily credit reward!</CardDescription>
        </CardHeader>
        <CardContent>
            <Link href="/dashboard/schedule" className="group block mb-6">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <p className="text-sm font-semibold">
                      Plan your day in the <span className="font-bold text-primary">MindMate Nexus</span>
                    </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          <TodoList />
        </CardContent>
      </Card>
    </div>
  );
}
