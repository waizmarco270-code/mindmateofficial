

'use client';

import { TodoList } from '@/components/todos/todo-list';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';

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
      <Card>
        <CardHeader>
          <CardTitle>My Daily Checklist</CardTitle>
          <CardDescription>Add your tasks for the day. Complete tasks to unlock a daily credit reward!</CardDescription>
        </CardHeader>
        <CardContent>
          <TodoList />
        </CardContent>
      </Card>
    </div>
  );
}
