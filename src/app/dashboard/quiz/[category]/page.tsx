
'use client';

import { useState, useMemo } from 'react';
import { useQuizzes, type Quiz, type QuizCategory, categoryDetails } from '@/hooks/use-quizzes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Trophy, Users, CheckCircle, ClipboardList, AlertTriangle, Search } from 'lucide-react';
import { QuizStartDialog } from '@/components/quiz/quiz-start-dialog';
import { useUsers } from '@/hooks/use-admin';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { notFound } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useUser, SignedOut } from '@clerk/nextjs';
import { LoginWall } from '@/components/ui/login-wall';
import { Input } from '@/components/ui/input';

interface QuizCategoryPageProps {
  params: {
    category: QuizCategory;
  };
}

export default function QuizCategoryPage({ params }: QuizCategoryPageProps) {
  const { category } = params;
  const details = categoryDetails[category];
  const { isSignedIn } = useUser();
  const { quizzes, loading: quizzesLoading } = useQuizzes();
  const { users, loading: usersLoading } = useUsers();
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loading = quizzesLoading || usersLoading;

  const handleQuizSelect = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsDialogOpen(true);
  };
  
  const categoryQuizzes = useMemo(() => {
    const filteredQuizzes = quizzes.filter(q => q.category === category);
    if (!searchTerm) {
      return filteredQuizzes;
    }
    return filteredQuizzes.filter(q => q.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [quizzes, category, searchTerm]);
  
  const topPerformers = useMemo(() => {
      if (!users) return [];
      return users
        .map(user => {
            const perfectedInCategory = (user.perfectedQuizzes || [])
                .map(quizId => quizzes.find(q => q.id === quizId))
                .filter(q => q && q.category === category).length;
            
            const attemptedInCategory = Object.keys(user.quizAttempts || {})
                .map(quizId => quizzes.find(q => q.id === quizId))
                .filter(q => q && q.category === category).length;

            return {
                ...user,
                perfectedCount: perfectedInCategory,
                attemptedCount: attemptedInCategory,
            };
        })
        .filter(user => user.perfectedCount > 0 || user.attemptedCount > 0)
        .sort((a, b) => {
            if (b.perfectedCount !== a.perfectedCount) {
                return b.perfectedCount - a.perfectedCount;
            }
            return b.attemptedCount - a.attemptedCount;
        })
        .slice(0, 10);
  }, [users, quizzes, category]);

  if (!details) {
    notFound();
  }

  const { Icon, gradient, shadow, title } = details;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard/quiz" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block">&larr; Back to Quiz Zone</Link>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Icon className="h-8 w-8 text-primary" />
          {title}
        </h1>
        <p className="text-muted-foreground">Test your knowledge in this category.</p>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6 relative">
             <SignedOut>
                <LoginWall 
                    title="Unlock Quizzes"
                    description="Sign up to start taking quizzes, earn credits for perfect scores, and compete on the leaderboard."
                />
            </SignedOut>
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search quizzes in this category..."
                    className="pl-10 h-12"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            {loading && (
                <div className="grid gap-6 md:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, j) => (
                        <Card key={j}><CardHeader><Skeleton className="h-6 w-3/4"></Skeleton></CardHeader><CardContent><Skeleton className="h-10 w-full"></Skeleton></CardContent></Card>
                    ))}
                </div>
            )}
            {!loading && categoryQuizzes.length === 0 && (
                <Card className="flex flex-col items-center justify-center text-center p-8 border-dashed">
                    <BrainCircuit className="h-12 w-12 text-muted-foreground mb-4"/>
                    <h3 className="font-semibold text-lg">{searchTerm ? "No Quizzes Found" : "Coming Soon!"}</h3>
                    <p className="text-muted-foreground text-sm">{searchTerm ? "No quizzes matched your search." : "No quizzes have been added to this category yet."}</p>
                </Card>
            )}
            {!loading && categoryQuizzes.length > 0 && (
                 <div className="grid gap-6 md:grid-cols-2">
                    {categoryQuizzes.map((quiz) => (
                        <Card key={quiz.id} className="h-full flex flex-col justify-between">
                            <CardHeader>
                                <CardTitle>{quiz.title}</CardTitle>
                                 <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs pt-1">
                                    <span>{quiz.questions.length} questions</span>
                                    <span>{quiz.timeLimit / 60} minutes</span>
                                    <span>Fee: {quiz.entryFee} credits</span>
                                    <span>Reward: {quiz.reward} credits</span>
                                </CardDescription>
                            </CardHeader>
                            <CardFooter>
                                <Button className="w-full z-10" onClick={() => handleQuizSelect(quiz)} disabled={!isSignedIn}>
                                    <BrainCircuit className="mr-2 h-4 w-4"/> Start Quiz
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
        <div className="lg:col-span-1">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Trophy className="text-amber-500"/> Top Performers</CardTitle>
                    <CardDescription>Users who have perfected the most quizzes in this category.</CardDescription>
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
                                     <Avatar className="h-10 w-10 border">
                                        <AvatarImage src={user.photoURL ?? undefined} />
                                        <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                                     </Avatar>
                                     <div className="flex-1">
                                        <p className="font-semibold text-sm">{user.displayName}</p>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                            <div className="flex items-center gap-1.5" title="Quizzes Perfected">
                                                <CheckCircle className="h-3 w-3 text-green-500" />
                                                <span className="font-medium">{user.perfectedCount}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5" title="Quizzes Attempted">
                                                <ClipboardList className="h-3 w-3 text-blue-500" />
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
                            <p className="text-sm">Be the first to master a quiz in this category and appear here!</p>
                        </div>
                    )}
                </CardContent>
              </Card>
        </div>
      </div>
      
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
