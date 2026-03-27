
'use client';

import { useState } from 'react';
import { UserList } from '@/components/social/user-list';
import { ChatBox } from '@/components/social/chat-box';
import { type User } from '@/hooks/use-admin';
import { FriendsProvider } from '@/hooks/use-friends';
import { Card } from '@/components/ui/card';
import { MessageSquare, ShieldCheck, Gem } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { AnimatePresence, motion } from 'framer-motion';
import { SignedOut } from '@clerk/nextjs';
import { LoginWall } from '@/components/ui/login-wall';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { VoiceCallProvider } from '@/hooks/use-voice-call';

export default function AllianceHubPage() {
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  const isMobile = useIsMobile();

  const handleSelectFriend = (friend: User) => {
    setSelectedFriend(friend);
  };
  
  const handleCloseChat = () => {
    setSelectedFriend(null);
  }

  return (
    <FriendsProvider>
      <VoiceCallProvider>
        <div className="h-[calc(100vh-8rem)] relative overflow-hidden">
            <SignedOut>
              <LoginWall 
                  title="Unlock the Alliance Hub!"
                  description="Sign up to connect with friends, form alliances, and chat with other scholars in our private network."
              />
            </SignedOut>
            <div className="grid h-full grid-cols-1 md:grid-cols-12 gap-0 md:gap-6 bg-card/30 rounded-3xl border shadow-xl overflow-hidden">
                <AnimatePresence mode="wait">
                  {isMobile ? (
                    <>
                      {!selectedFriend && (
                        <motion.div 
                            className="md:col-span-4 h-full bg-background"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                          >
                            <UserList onSelectFriend={handleSelectFriend} />
                        </motion.div>
                      )}
                      {selectedFriend && (
                        <motion.div 
                            className="md:col-span-8 h-full z-50 fixed inset-0"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                          >
                          <ChatBox friend={selectedFriend} onClose={handleCloseChat} />
                        </motion.div>
                      )}
                    </>
                  ) : (
                    <>
                        <div className="md:col-span-4 lg:col-span-3 h-full flex flex-col bg-muted/20 border-r">
                          <UserList onSelectFriend={handleSelectFriend} selectedFriendId={selectedFriend?.uid} />
                        </div>
                        <div className="md:col-span-8 lg:col-span-9 h-full">
                          {selectedFriend ? (
                            <ChatBox friend={selectedFriend} />
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-primary rounded-full blur-3xl opacity-10 animate-pulse"></div>
                                    <div className="p-8 rounded-full bg-primary/5 border-2 border-dashed border-primary/20">
                                        <MessageSquare className="h-20 w-20 text-primary opacity-20"/>
                                    </div>
                                </div>
                                <div className="max-w-md">
                                    <h2 className="text-3xl font-black tracking-tight">Alliance Messenger</h2>
                                    <p className="text-muted-foreground mt-2">Select a scholar from your inbox to start a secure mission briefing or discover new allies using the search icon.</p>
                                </div>
                                <div className="flex gap-4">
                                    <Button asChild variant="outline" className="rounded-full border-primary/20">
                                        <Link href="/dashboard/social/nuggets"><Gem className="mr-2 h-4 w-4 text-amber-500"/> Nugget Jar</Link>
                                    </Button>
                                    <Button asChild variant="outline" className="rounded-full border-primary/20">
                                        <Link href="/dashboard/groups"><ShieldCheck className="mr-2 h-4 w-4 text-emerald-500"/> View Groups</Link>
                                    </Button>
                                </div>
                            </div>
                          )}
                        </div>
                    </>
                  )}
                </AnimatePresence>
            </div>
        </div>
      </VoiceCallProvider>
    </FriendsProvider>
  );
}
