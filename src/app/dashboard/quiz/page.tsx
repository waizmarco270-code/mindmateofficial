
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuizzes, categoryDetails, type QuizCategory } from '@/hooks/use-quizzes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BrainCircuit, Trophy, Users, CheckCircle, ClipboardList } from 'lucide-react';
import { useUsers } from '@/hooks/use-admin';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export default function QuizZoneHubPage() {
  const { quizzes, loading: quizzesLoading } = useQuizzes();
  const { users, loading: usersLoading } = useUsers();
  const loading = quizzesLoading || usersLoading;

  const topPerformers = useMemo(() => {
    if (loading || !users) return [];
    return users
      .map(user => ({
          ...user,
          perfectedCount: user.perfectedQuizzes?.length || 0,
          attemptedCount: user.quizAttempts ? Object.keys(user.quizAttempts).length : 0,
      }))
      .filter(user => user.perfectedCount > 0 || user.attemptedCount > 0)
      .sort((a, b) => {
          if (b.perfectedCount !== a.perfectedCount) return b.perfectedCount - a.perfectedCount;
          return b.attemptedCount - a.attemptedCount;
      })
      .slice(0, 5); // Get top 5 overall
  }, [users, loading]);
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <BrainCircuit className="h-8 w-8 text-primary" />
          Quiz Zone
        </h1>
        <p className="text-muted-foreground">Select a category to test your knowledge, compete, and earn credits!</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(categoryDetails).map(([key, details], index) => {
           const { Icon, title, description, gradient, shadow } = details;
           return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={cn("rounded-xl", shadow)}
            >
              <Link href={`/dashboard/quiz/${key}`} className="block h-full">
                <div className={cn("group relative h-full w-full overflow-hidden rounded-xl p-px", 
                    "before:absolute before:inset-0 before:w-full before:h-full before:opacity-10 before:bg-gradient-to-t before:from-background",
                    "after:absolute after:w-full after:h-full after:bg-gradient-to-tr after:from-primary/0 after:via-primary/20 after:to-primary/0 after:animate-shimmer after:inset-0 after:rounded-xl after:opacity-0 group-hover:after:opacity-100 after:duration-500"
                )}>
                  <div className={cn("relative z-10 flex h-full flex-col justify-between rounded-xl p-6", gradient)}>
                      <div className="flex items-start justify-between">
                          <div className="space-y-2">
                              <h3 className="text-2xl font-bold text-white [text-shadow:_0_2px_4px_rgb(0_0_0_/_40%)]">{title}</h3>
                              <p className="text-sm text-white/80">{description}</p>
                          </div>
                          <Icon className="h-10 w-10 text-white/50 transition-transform duration-300 group-hover:scale-125" />
                      </div>
                      <div className="mt-8 text-right text-sm font-semibold text-white/90 transition-transform duration-300 group-hover:translate-x-1">
                          Explore &rarr;
                      </div>
                  </div>
                </div>
              </Link>
            </motion.div>
           )
        })}
      </div>

       <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2"><Trophy className="text-amber-500"/> Overall Top Performers</CardTitle>
              <CardDescription>The best of the best across all quiz categories.</CardDescription>
          </CardHeader>
          <CardContent>
              {loading && (
                  <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                         <div key={i} className="flex items-center gap-4"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-5 flex-1" /></div>
                      ))}
                  </div>
              )}
              {!loading && topPerformers.length > 0 ? (
                   <ol className="space-y-4">
                       {topPerformers.map((user, index) => (
                           <li key={user.uid} className="flex items-center gap-4 rounded-lg p-3 bg-muted/50 border">
                               <span className="font-bold text-lg text-muted-foreground w-8 text-center">{index + 1}</span>
                               <Avatar className="h-12 w-12 border">
                                  <AvatarImage src={user.photoURL ?? undefined} />
                                  <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                               </Avatar>
                               <div className="flex-1">
                                  <p className="font-semibold">{user.displayName}</p>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                      <div className="flex items-center gap-1.5" title="Quizzes Perfected">
                                          <CheckCircle className="h-4 w-4 text-green-500" />
                                          <span className="font-medium">{user.perfectedCount}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5" title="Quizzes Attempted">
                                          <ClipboardList className="h-4 w-4 text-blue-500" />
                                          <span className="font-medium">{user.attemptedCount}</span>
                                      </div>
                                  </div>
                               </div>
                           </li>
                       ))}
                   </ol>
              ) : !loading && (
                  <div className="text-center text-muted-foreground py-10 flex flex-col items-center gap-4">
                      <Users className="h-12 w-12" />
                      <p>Be the first to attempt or perfect a quiz and appear here!</p>
                  </div>
              )}
          </CardContent>
        </Card>
    </div>
  );
}
