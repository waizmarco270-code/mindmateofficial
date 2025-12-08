

'use client';

import { useState } from 'react';
import { UserList } from '@/components/social/user-list';
import { ChatBox } from '@/components/social/chat-box';
import { type User } from '@/hooks/use-admin';
import { FriendsProvider } from '@/hooks/use-friends';
import { Card } from '@/components/ui/card';
import { Users, Gem, MessageSquare } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { AnimatePresence, motion } from 'framer-motion';
import { SignedOut } from '@clerk/nextjs';
import { LoginWall } from '@/components/ui/login-wall';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SocialPage() {
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
      <div className="h-full relative">
           <SignedOut>
            <LoginWall 
                title="Join the Community!"
                description="Sign up to connect with friends, chat with other students, and join the MindMate social hub."
            />
          </SignedOut>
          <div className="grid h-full grid-cols-1 md:grid-cols-12 gap-6">
              <AnimatePresence>
                {isMobile ? (
                  <>
                    {!selectedFriend && (
                       <motion.div 
                          className="md:col-span-4 h-full"
                          initial={{ x: '-100%' }}
                          animate={{ x: 0 }}
                          exit={{ x: '-100%' }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                          <UserList onSelectFriend={handleSelectFriend} />
                       </motion.div>
                    )}
                     {selectedFriend && (
                       <motion.div 
                          className="md:col-span-8 h-full"
                          initial={{ x: '100%' }}
                          animate={{ x: 0 }}
                          exit={{ x: '100%' }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                         <ChatBox friend={selectedFriend} onClose={handleCloseChat} />
                       </motion.div>
                    )}
                  </>
                ) : (
                   <>
                      <div className="md:col-span-4 h-full flex flex-col gap-4">
                        <UserList onSelectFriend={handleSelectFriend} selectedFriendId={selectedFriend?.uid} />
                        <Button asChild variant="outline">
                            <Link href="/dashboard/social/nuggets"><Gem className="mr-2 h-4 w-4 text-amber-500" /> Wisdom Nugget Jar</Link>
                        </Button>
                         <Button asChild>
                            <Link href="/dashboard/groups"><Users className="mr-2 h-4 w-4"/> View Your Groups</Link>
                        </Button>
                      </div>
                      <div className="md:col-span-8 h-full">
                        {selectedFriend ? (
                          <ChatBox friend={selectedFriend} />
                        ) : (
                          <Card className="h-full flex items-center justify-center border-dashed">
                              <div className="text-center text-muted-foreground">
                                  <MessageSquare className="h-12 w-12 mx-auto mb-4"/>
                                  <h2 className="text-lg font-semibold">Select a friend to start chatting</h2>
                                  <p className="text-sm">Your conversations will appear here.</p>
                              </div>
                          </Card>
                        )}
                      </div>
                   </>
                )}
              </AnimatePresence>
          </div>
      </div>
    </FriendsProvider>
  );
}
