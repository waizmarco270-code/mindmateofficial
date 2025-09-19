
'use client';

import { NexusView } from '@/components/schedule/nexus-view';
import { TodoList } from '@/components/todos/todo-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, ListTodo } from 'lucide-react';

export default function SchedulePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            MindMate Nexus
        </h1>
        <p className="text-muted-foreground">Your Study Command Center. Plan your schedule and manage your daily tasks.</p>
      </div>
      
      <Tabs defaultValue="nexus" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="nexus"><Calendar className="mr-2 h-4 w-4"/> Nexus Calendar</TabsTrigger>
            <TabsTrigger value="todos"><ListTodo className="mr-2 h-4 w-4"/> Daily To-Do List</TabsTrigger>
        </TabsList>
        <TabsContent value="nexus" className="mt-6">
            <NexusView />
        </TabsContent>
        <TabsContent value="todos" className="mt-6">
             <TodoList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
