
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuizzes } from '@/hooks/use-quizzes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Film, Swords, BrainCircuit, BookOpen, Trophy, Award, Users, CheckCircle, ClipboardList } from 'lucide-react';
import { QuizStartDialog } from '@/components/quiz/quiz-start-dialog';
import { type Quiz } from '@/hooks/use-quizzes';
import { useUsers } from '@/hooks/use-admin';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useNewQuiz } from '@/hooks/use-new-quiz';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// A helper function to get an icon for a category
const getCategoryIcon = (category: string) => {
    const lowerCaseCategory = category.toLowerCase();
    if (lowerCaseCategory.includes('anime')) return { Icon: Swords, color: 'from-red-500 to-red-600', shadow: 'shadow-red-500/20' };
    if (lowerCaseCategory.includes('movie') || lowerCaseCategory.includes('series')) return { Icon: Film, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' };
    if (lowerCaseCategory.includes('study') || lowerCaseCategory.includes('science') || lowerCaseCategory.includes('history')) return { Icon: BookOpen, color: 'from-green-500 to-green-600', shadow: 'shadow-green-500/20' };
    return { Icon: BrainCircuit, color: 'from-purple-500 to-purple-600', shadow: 'shadow-purple-500/20' }; // Default icon
}

export default function QuizZonePage() {
  const { quizzes, loading: quizzesLoading } = useQuizzes();
  const { users, loading: usersLoading } = useUsers();
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { markAsSeen } = useNewQuiz();

  useEffect(() => {
    markAsSeen();
  }, [markAsSeen]);

  const loading = quizzesLoading || usersLoading;

  const handleQuizSelect = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsDialogOpen(true);
  };
  
  const quizzesByCategory = useMemo(() => {
    return quizzes.reduce((acc, quiz) => {
      const category = quiz.category || 'General';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(quiz);
      return acc;
    }, {} as Record<string, Quiz[]>);
  }, [quizzes]);

  const sortedCategories = useMemo(() => Object.keys(quizzesByCategory).sort(), [quizzesByCategory]);
  
  const topPerformers = useMemo(() => {
      return users
        .map(user => ({
            ...user,
            perfectedCount: user.perfectedQuizzes?.length || 0,
            attemptedCount: user.quizAttempts ? Object.keys(user.quizAttempts).length : 0,
        }))
        .filter(user => user.perfectedCount > 0 || user.attemptedCount > 0)
        .sort((a, b) => {
            // Sort primarily by perfected count
            if (b.perfectedCount !== a.perfectedCount) {
                return b.perfectedCount - a.perfectedCount;
            }
            // Then by attempted count
            return b.attemptedCount - a.attemptedCount;
        })
        .slice(0, 20); // Get top 20
  }, [users]);


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <BrainCircuit className="h-8 w-8 text-primary" />
          Quiz Zone
        </h1>
        <p className="text-muted-foreground">Test your knowledge, compete, and earn credits!</p>
      </div>
      
       <Tabs defaultValue="quizzes" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="quizzes"><BrainCircuit className="mr-2 h-4 w-4" /> Quizzes</TabsTrigger>
                <TabsTrigger value="leaderboard"><Trophy className="mr-2 h-4 w-4" /> Leaderboard</TabsTrigger>
            </TabsList>
            <TabsContent value="quizzes" className="mt-6">
                 <div className="space-y-8">
                    {loading && (
                         <div className="space-y-8">
                            {Array.from({ length: 2 }).map((_, i) => (
                                <div key={i}>
                                    <Skeleton className="h-8 w-48 mb-4" />
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                         {Array.from({ length: 3 }).map((_, j) => (
                                            <Card key={j}><CardHeader><Skeleton className="h-6 w-3/4"></Skeleton></CardHeader><CardContent><Skeleton className="h-10 w-full"></Skeleton></CardContent></Card>
                                        ))}
                                    </div>
                                </div>
                            ))}
                         </div>
                    )}
                    {!loading && sortedCategories.map((category) => {
                      const { Icon, color, shadow } = getCategoryIcon(category);
                      return (
                         <div key={category}>
                            <div className="flex items-center gap-3 mb-4">
                                <Icon className="h-7 w-7 text-primary" />
                                <h2 className="text-2xl font-bold tracking-tight capitalize">{category}</h2>
                            </div>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {quizzesByCategory[category].map((quiz, index) => (
                                   <motion.div
                                    key={quiz.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    className="h-full"
                                   >
                                    <Card className={cn(
                                        "h-full group flex flex-col justify-between transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1",
                                        shadow
                                    )}>
                                        <CardHeader>
                                            <CardTitle className="flex items-start gap-4">
                                                <div className={cn("p-2 rounded-lg bg-gradient-to-br", color)}>
                                                    <Icon className="h-6 w-6 text-white"/>
                                                </div>
                                                <span>{quiz.title}</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-muted-foreground text-sm">{quiz.questions.length} questions &bull; {quiz.timeLimit / 60} minutes</p>
                                        </CardContent>
                                        <CardFooter>
                                            <Button className="w-full z-10" onClick={() => handleQuizSelect(quiz)}>
                                                <BrainCircuit className="mr-2 h-4 w-4"/> Start Quiz
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                   </motion.div>
                                ))}
                            </div>
                        </div>
                      )
                    })}
                    {!loading && sortedCategories.length === 0 && (
                        <div className="text-center text-muted-foreground col-span-full py-16">
                          <p>No quizzes have been created yet.</p>
                          <p>An admin can add new quizzes in the Admin Panel.</p>
                        </div>
                    )}
                  </div>
            </TabsContent>
            <TabsContent value="leaderboard" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Trophy className="text-amber-500"/> Top Performers</CardTitle>
                        <CardDescription>Users who have perfected the most quizzes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading && (
                            <div className="space-y-3">
                                {Array.from({ length: 5 }).map((_, i) => (
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
            </TabsContent>
      </Tabs>
      
      {selectedQuiz && (
        <QuizStartDialog 
            quiz={selectedQuiz}
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
        />
      )}

    </div>
  );
}
