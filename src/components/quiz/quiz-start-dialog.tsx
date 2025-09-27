
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUsers } from '@/hooks/use-admin';
import { useUser } from '@clerk/nextjs';
import { type Quiz } from '@/hooks/use-quizzes';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Award, AlertTriangle, ArrowRight, BrainCircuit, CheckCircle } from 'lucide-react';
import { QuizInterface } from './quiz-interface';


interface QuizStartDialogProps {
  quiz: Quiz;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function QuizStartDialog({ quiz, isOpen, onOpenChange }: QuizStartDialogProps) {
  const { user } = useUser();
  const { currentUserData, addCreditsToUser } = useUsers();
  const { toast } = useToast();
  const [quizStarted, setQuizStarted] = useState(false);
  
  const alreadyPerfected = currentUserData?.perfectedQuizzes?.includes(quiz.id);
  const attempts = currentUserData?.quizAttempts?.[quiz.id] || 0;
  const canEarnReward = !alreadyPerfected && attempts < 2;
  const hasMasterCard = currentUserData?.masterCardExpires && new Date(currentUserData.masterCardExpires) > new Date();


  const handleStartQuiz = async () => {
      if (!user || !currentUserData) {
          toast({ variant: 'destructive', title: 'Please log in to start the quiz.' });
          return;
      }
      
      // Master Card bypasses credit check
      if (!hasMasterCard && currentUserData.credits < quiz.entryFee) {
          toast({ variant: 'destructive', title: 'Insufficient Credits', description: `You need ${quiz.entryFee} credits to take this quiz.` });
          return;
      }
      
      // Deduct entry fee only if user does not have master card
      if (!hasMasterCard && quiz.entryFee > 0) {
        await addCreditsToUser(user.id, -quiz.entryFee);
      }

      setQuizStarted(true);
  };

  const handleCloseDialog = (open: boolean) => {
      if(!open) {
          // Reset state when dialog is closed
          setTimeout(() => {
            setQuizStarted(false);
          }, 300);
      }
      onOpenChange(open);
  }

  if (quizStarted) {
      return (
          <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
              <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 data-[state=open]:slide-in-from-bottom-24 transition-all duration-500">
                <QuizInterface quiz={quiz} onClose={() => handleCloseDialog(false)} />
              </DialogContent>
          </Dialog>
      )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">Ready to Start?</DialogTitle>
          <DialogDescription>You have {2 - attempts} attempt(s) left to earn the reward.</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-around text-center">
            <div className="space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-600">
                <CreditCard className="h-6 w-6" />
              </div>
              <p className="font-bold">Entry Fee</p>
              <p className="text-muted-foreground">{hasMasterCard ? <span className="text-green-500 font-bold">FREE</span> : `${quiz.entryFee} Credits`}</p>
            </div>
            <div className="space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-600">
                <Award className="h-6 w-6" />
              </div>
              <p className="font-bold">Perfect Score Reward</p>
              <p className="text-muted-foreground">+{quiz.reward} Credits</p>
            </div>
          </div>

          {alreadyPerfected ? (
             <div className="flex items-center justify-center gap-2 rounded-lg border border-green-500/50 bg-green-500/10 p-3 text-green-700 dark:text-green-300">
                <CheckCircle className="h-5 w-5"/>
                <p className="font-semibold text-sm">You have already earned the reward for this quiz!</p>
            </div>
          ) : !canEarnReward ? (
             <div className="flex items-center justify-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-destructive">
                <AlertTriangle className="h-5 w-5"/>
                <p className="font-semibold text-sm">You have used all your reward attempts for this quiz.</p>
            </div>
          ) : (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 text-amber-700 dark:text-amber-300">
                <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <p className="text-xs">
                  <span className="font-semibold">The +{quiz.reward} credit reward is only available for a perfect score within your first 2 attempts.</span> The timer begins immediately after starting.
                </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleStartQuiz}>
            {hasMasterCard ? 'Start for Free' : `Pay ${quiz.entryFee} credits & Start`} <ArrowRight className="ml-2 h-4 w-4"/>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
