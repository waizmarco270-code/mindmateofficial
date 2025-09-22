

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
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { formatDistanceToNow } from 'date-fns';

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
    return null; // Don't render anything if there's no active poll
  }

  const hasVoted = !!userVote;

  return (
    <Card className="relative group overflow-hidden border-0 blue-nebula-bg">
        <div id="particle-container" className="[mask-image:linear-gradient(to_bottom,white_20%,transparent_75%)]">
            {[...Array(12)].map((_, i) => <div key={i} className="particle"></div>)}
        </div>
        <div className="relative z-10 p-6">
            <CardHeader className="p-0 mb-4 text-white">
                <CardTitle className="flex items-center gap-2 text-2xl"><Vote /> Community Poll</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
                <div className="bg-black/20 border border-white/10 rounded-lg p-4 text-center">
                    <p className="text-xl font-bold text-yellow-400">{activePoll.question}</p>
                </div>
                {activePoll.options.map((option, index) => {
                    const votesForOption = activePoll.results[option] || 0;
                    const percentage = totalVotes > 0 ? (votesForOption / totalVotes) * 100 : 0;
                    
                    if (hasVoted) {
                        const isUserChoice = userVote === option;
                        return (
                            <div key={index} className="space-y-2 group bg-black/20 p-3 rounded-lg border border-white/10">
                                <div className="flex justify-between items-center text-sm">
                                    <p className={cn("font-semibold text-slate-200", isUserChoice && "text-cyan-300")}>{option}</p>
                                    <p className="text-slate-400 font-medium">{percentage.toFixed(0)}% ({votesForOption})</p>
                                </div>
                                <Progress value={percentage} className="h-2" />
                            </div>
                        );
                    }
                    
                    return (
                        <Button
                            key={index}
                            variant="outline"
                            className="w-full justify-start h-12 text-base bg-white/5 border-white/20 text-white hover:bg-white/10"
                            onClick={() => handleVote(option)}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Voting...' : option}
                        </Button>
                    );
                })}
            </CardContent>
            <p className="text-xs text-slate-400 text-center mt-4">{totalVotes} total votes</p>
            
            {hasVoted && activePoll.commentsEnabled && (
                <div className="pt-4 mt-4 border-t border-white/10 space-y-4">
                    <form onSubmit={handleCommentSubmit} className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2 text-white"><MessageSquare className="h-5 w-5"/> Leave a comment</h4>
                        <Textarea 
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your thoughts..."
                            className="bg-black/20 border-white/10 text-white placeholder:text-slate-400"
                        />
                        <div className="flex justify-end">
                            <Button type="submit" disabled={!comment.trim()} variant="secondary">Submit Comment</Button>
                        </div>
                    </form>
                    
                    <div className="space-y-3">
                        <h4 className="font-semibold text-sm text-white">Comments</h4>
                        <ScrollArea className="h-48 rounded-md border border-white/10 bg-black/20 p-4">
                            {(activePoll.comments && activePoll.comments.length > 0) ? (
                                <div className="space-y-4">
                                    {activePoll.comments.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()).map((c, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between text-xs">
                                                    <p className="font-bold text-slate-200">{c.userName}</p>
                                                    <p className="text-slate-400">{formatDistanceToNow(c.createdAt.toDate(), { addSuffix: true })}</p>
                                                </div>
                                                <p className="text-sm mt-1 bg-black/20 p-2 rounded-md text-slate-300">{c.comment}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-sm text-slate-400 pt-10">No comments yet. Be the first!</p>
                            )}
                        </ScrollArea>
                    </div>
                </div>
            )}
        </div>
    </Card>
  );
}
