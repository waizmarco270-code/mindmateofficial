
'use client';

import { useAdmin } from '@/hooks/use-admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    ShieldAlert, ShieldCheck, Clock, 
    XCircle, CheckCircle2, MessageSquare
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';

export default function IsolationAppealsPage() {
    const { isolationExitRequests, approveIsolationExit, declineIsolationExit } = useAdmin();

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {isolationExitRequests.map(req => (
                    <Card key={req.id} className="bg-background border-red-500/20 overflow-hidden relative group">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 group-hover:w-1.5 transition-all" />
                        <CardHeader className="p-4 pb-2 flex-row items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-red-500/20">
                                <AvatarImage src={req.userPhoto} />
                                <AvatarFallback>{req.userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="font-black text-sm truncate uppercase">{req.userName}</p>
                                <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest">Target: {req.durationId}</p>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10 italic text-xs text-slate-300 min-h-[80px]">
                                <MessageSquare className="h-3 w-3 mb-1 text-red-500 opacity-50"/>
                                "{req.message}"
                            </div>
                            <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground uppercase">
                                <Clock className="h-3 w-3"/> Submitted {format(req.createdAt.toDate(), 'PPP p')}
                            </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 grid grid-cols-2 gap-2">
                            <Button variant="ghost" size="sm" className="h-10 text-[10px] font-black uppercase text-red-500 hover:bg-red-500/10" onClick={() => declineIsolationExit(req.id)}>DENY</Button>
                            <Button size="sm" className="h-10 text-[10px] font-black uppercase bg-red-600 hover:bg-red-700" onClick={() => approveIsolationExit(req.id)}>APPROVE BREACH</Button>
                        </CardFooter>
                    </Card>
                ))}
                
                {isolationExitRequests.length === 0 && (
                    <div className="lg:col-span-3 py-24 text-center opacity-30 border-2 border-dashed rounded-[3rem]">
                        <ShieldCheck className="h-16 w-16 mx-auto mb-4" />
                        <p className="text-xl font-black uppercase tracking-[0.2em]">All protocol breaches settled</p>
                        <p className="text-xs font-bold mt-2 uppercase opacity-60 italic">"The monastery remains silent."</p>
                    </div>
                )}
            </div>
        </div>
    );
}
