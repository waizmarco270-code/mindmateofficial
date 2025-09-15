
'use client';

import { useState } from 'react';
import { UserList } from '@/components/social/user-list';
import { ChatBox } from '@/components/social/chat-box';
import { type User } from '@/hooks/use-admin';
import { FriendsProvider } from '@/hooks/use-friends.tsx';
import { Card } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { SignedOut } from '@clerk/nextjs';
import { LoginWall } from '@/components/ui/login-wall';

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
                title="Unlock the Social Hub"
                description="Sign up for a free account to add friends, join the community chat, and connect with other learners."
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
                      <div className="md:col-span-4 h-full">
                        <UserList onSelectFriend={handleSelectFriend} selectedFriendId={selectedFriend?.uid} />
                      </div>
                      <div className="md:col-span-8 h-full">
                        {selectedFriend ? (
                          <ChatBox friend={selectedFriend} />
                        ) : (
                          <Card className="h-full flex items-center justify-center border-dashed">
                              <div className="text-center text-muted-foreground">
                                  <Users className="h-12 w-12 mx-auto mb-4"/>
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
