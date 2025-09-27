
'use client';

import { NexusView } from '@/components/schedule/nexus-view';
import { TodoList } from '@/components/todos/todo-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, ListTodo, Map } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { RoadmapPageContent } from '@/components/roadmap/roadmap-page-content';

export default function SchedulePage() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'nexus';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            MindMate Nexus
        </h1>
        <p className="text-muted-foreground">Your Study Command Center. Plan your schedule, manage tasks, and build your success roadmap.</p>
      </div>
      
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="nexus"><Calendar className="mr-2 h-4 w-4"/> Nexus Calendar</TabsTrigger>
            <TabsTrigger value="todos"><ListTodo className="mr-2 h-4 w-4"/> Daily To-Do List</TabsTrigger>
            <TabsTrigger value="roadmap"><Map className="mr-2 h-4 w-4"/> Roadmap</TabsTrigger>
        </TabsList>
        <TabsContent value="nexus" className="mt-6">
            <NexusView />
        </TabsContent>
        <TabsContent value="todos" className="mt-6">
             <TodoList />
        </TabsContent>
        <TabsContent value="roadmap" className="mt-6">
            <RoadmapPageContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
