
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useUsers, User } from '@/hooks/use-admin';
import { useUser, SignInButton } from '@clerk/nextjs';
import { Users, MessageSquare, ArrowLeft, ShieldAlert, Globe, Wifi } from 'lucide-react';
import { UserCard } from '@/components/social/user-card';
import { ChatBox } from '@/components/social/chat-box';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePresence } from '@/hooks/use-presence';
import { Skeleton } from '@/components/ui/skeleton';


function SocialPageContent() {
    const { user } = useUser();
    const { users: allUsers, loading: userLoading } = useUsers();
    const { onlineUsers, loading: presenceLoading } = usePresence();
    
    const [selectedChatUser, setSelectedChatUser] = useState<User | null>(null);


    if (userLoading) {
        return (
             <div className="h-full grid grid-cols-1 md:grid-cols-[350px_1fr] lg:grid-cols-[400px_1fr] gap-4">
                <div className="h-full flex-col col-span-1 border rounded-lg p-2 space-y-2">
                     <Skeleton className="h-10 w-full" />
                     <Skeleton className="h-14 w-full" />
                     <Skeleton className="h-14 w-full" />
                     <Skeleton className="h-14 w-full" />
                     <Skeleton className="h-14 w-full" />
                </div>
                 <div className="h-full flex-col col-span-1 border rounded-lg hidden md:flex">
                     <Skeleton className="h-full w-full" />
                 </div>
            </div>
        );
    }

    if (!user) {
       return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 rounded-xl bg-muted/40 border-2 border-dashed">
                <div className="p-5 rounded-full bg-primary/10 mb-4">
                    <ShieldAlert className="h-12 w-12 text-primary" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">Connect & Collaborate</h1>
                <p className="text-muted-foreground mt-2 max-w-lg">Please sign in or create an account to unlock the Social Hub.</p>
                <SignInButton>
                    <Button size="lg" className="mt-6 text-lg py-7">
                        Sign In to Continue
                    </Button>
                </SignInButton>
            </div>
        );
    }
    
    const renderUserList = (userList: User[], emptyMessage: string) => (
        <ScrollArea className="flex-grow">
            <div className="flex flex-col gap-1 p-1">
                {userList.map(u => (
                    <UserCard 
                        key={u.uid}
                        user={u}
                        onSelectChat={() => setSelectedChatUser(u)}
                        isSelected={selectedChatUser?.uid === u.uid}
                    />
                ))}
                 {userList.length === 0 && (
                    <p className="text-center text-muted-foreground p-8">{emptyMessage}</p>
                 )}
            </div>
        </ScrollArea>
    );

    const renderOnlineUserList = () => (
         <ScrollArea className="flex-grow">
            <div className="flex flex-col gap-1 p-1">
                {presenceLoading && Array.from({length: 4}).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-2">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-5 w-32" />
                    </div>
                ))}
                {!presenceLoading && onlineUsers.map(u => (
                    <UserCard 
                        key={u.uid}
                        user={u}
                        onSelectChat={() => setSelectedChatUser(allUsers.find(au => au.uid === u.uid) || null)}
                        isSelected={selectedChatUser?.uid === u.uid}
                    />
                ))}
                 {!presenceLoading && onlineUsers.length === 0 && (
                    <p className="text-center text-muted-foreground p-8">No one else is online right now.</p>
                 )}
            </div>
        </ScrollArea>
    )

    const otherUsers = allUsers.filter(u => u.uid !== user.id);
    
    return (
       <div className={cn(
         "h-full grid grid-cols-1 md:grid-cols-[350px_1fr] lg:grid-cols-[400px_1fr] gap-4 md:pb-0",
         "transition-all duration-300 ease-in-out"
       )}>
            {/* User List Panel */}
            <div className={cn(
                "h-full flex-col col-span-1 border rounded-lg",
                "md:flex", // Always visible on desktop
                selectedChatUser ? "hidden" : "flex" // Hide on mobile when chat is open
            )}>
                 <Tabs defaultValue="global" className="h-full flex flex-col">
                    <TabsList className="grid w-full grid-cols-2 m-2">
                        <TabsTrigger value="global"><Globe className="h-4 w-4 mr-1"/> Global</TabsTrigger>
                        <TabsTrigger value="online"><Wifi className="h-4 w-4 mr-1"/> Online</TabsTrigger>
                    </TabsList>
                    <TabsContent value="global" className="flex-1 overflow-hidden">
                        {renderUserList(otherUsers, "No other users found.")}
                    </TabsContent>
                     <TabsContent value="online" className="flex-1 overflow-hidden">
                        {renderOnlineUserList()}
                    </TabsContent>
                </Tabs>
            </div>

             {/* Chat Box Panel */}
             <div className={cn(
                "h-full",
                "md:flex", // Always flex on desktop
                selectedChatUser ? "flex flex-col" : "hidden" // Show on mobile when chat is open
             )}>
                {selectedChatUser ? (
                    <ChatBox 
                        friend={selectedChatUser} 
                        onBack={() => setSelectedChatUser(null)}
                    />
                ) : (
                    <div className="hidden h-full flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/40 md:flex">
                         <div className="p-5 rounded-full bg-primary/10 mb-4">
                            <MessageSquare className="h-12 w-12 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold">Select a user to chat</h2>
                        <p className="text-muted-foreground">Your conversations will appear here.</p>
                    </div>
                )}
            </div>
       </div>
    );
}

export default function SocialPage() {
    return (
        <SocialPageContent />
    )
}
