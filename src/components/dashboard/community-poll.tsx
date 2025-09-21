
'use client';
import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { usePolls, useAdmin } from '@/hooks/use-admin';
import { Vote, CheckCircle, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';

export function CommunityPoll() {
  const { activePoll, submitPollVote, submitPollComment } = usePolls();
  const { currentUserData } = useAdmin();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comment, setComment] = useState('');
  const { toast } = useToast();

  const userVote = useMemo(() => {
    if (!activePoll || !currentUserData?.votedPolls) return null;
    return currentUserData.votedPolls[activePoll.id];
  }, [activePoll, currentUserData]);
  
  const totalVotes = useMemo(() => {
    if (!activePoll) return 0;
    return Object.values(activePoll.results).reduce((sum, count) => sum + count, 0);
  }, [activePoll]);

  const handleVote = async (option: string) => {
    if (!activePoll || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await submitPollVote(activePoll.id, option);
    } catch (error) {
      console.error("Failed to submit vote:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!activePoll || !comment.trim()) return;
      
      try {
          await submitPollComment(activePoll.id, comment);
          toast({ title: "Comment Submitted!", description: "Thanks for your feedback." });
          setComment('');
      } catch (error: any) {
          toast({ variant: 'destructive', title: "Error", description: error.message });
      }
  }

  if (!activePoll) {
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Community Poll</DialogTitle>
            </DialogHeader>
            <p className="py-10 text-center text-muted-foreground">No active poll at the moment. Check back later!</p>
        </DialogContent>
    );
  }

  const hasVoted = !!userVote;

  return (
    <DialogContent className="sm:max-w-lg">
        <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Vote /> Community Poll</DialogTitle>
            <DialogDescription>{activePoll.question}</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            {activePoll.options.map((option, index) => {
                const votesForOption = activePoll.results[option] || 0;
                const percentage = totalVotes > 0 ? (votesForOption / totalVotes) * 100 : 0;
                
                if (hasVoted) {
                const isUserChoice = userVote === option;
                return (
                    <div key={index} className="space-y-2 group">
                        <div className="flex justify-between items-center text-sm">
                            <p className={cn("font-semibold", isUserChoice && "text-primary")}>{option}</p>
                            <p className="text-muted-foreground font-medium">{percentage.toFixed(0)}% ({votesForOption})</p>
                        </div>
                        <Progress value={percentage} className="h-2" />
                    </div>
                );
                }
                
                return (
                <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start h-12 text-base"
                    onClick={() => handleVote(option)}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Voting...' : option}
                </Button>
                );
            })}
        </div>
         <p className="text-xs text-muted-foreground text-center">{totalVotes} total votes</p>
        
        {hasVoted && activePoll.commentsEnabled && (
            <form onSubmit={handleCommentSubmit} className="pt-4 border-t space-y-3">
                <h4 className="font-semibold flex items-center gap-2"><MessageSquare className="h-5 w-5"/> Leave a comment</h4>
                <Textarea 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts..."
                />
                <div className="flex justify-end">
                    <Button type="submit" disabled={!comment.trim()}>Submit Comment</Button>
                </div>
            </form>
        )}
    </DialogContent>
  );
}
