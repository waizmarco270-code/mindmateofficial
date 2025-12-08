
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MoreVertical, ImagePlus, X, Paperclip } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { format, isSameDay } from 'date-fns';
import { useGroupChat, Group } from '@/hooks/use-groups';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const userColors = [
    'border-red-500/50', 'border-orange-500/50', 'border-amber-500/50',
    'border-yellow-500/50', 'border-lime-500/50', 'border-green-500/50',
    'border-emerald-500/50', 'border-teal-500/50', 'border-cyan-500/50',
    'border-sky-500/50', 'border-blue-500/50', 'border-indigo-500/50',
    'border-violet-500/50', 'border-purple-500/50', 'border-fuchsia-500/50',
    'border-pink-500/50', 'border-rose-500/50',
];

const getUserColor = (userId: string) => {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return userColors[Math.abs(hash) % userColors.length];
};

export function GroupChat({ group }: { group: Group }) {
    const { user: currentUser } = useUser();
    const { messages, sendMessage, loading } = useGroupChat(group.id);
    const [newMessage, setNewMessage] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);
    
     useEffect(() => {
        if (imageFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(imageFile);
        } else {
            setImagePreview(null);
        }
    }, [imageFile]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !imageFile) || !currentUser) return;
        
        let imageAsBase64: string | null = null;
        if (imageFile) {
             if (imageFile.size > 1024 * 1024 * 2) { // 2MB limit
                toast({ variant: "destructive", title: "Image too large", description: "Please select an image smaller than 2MB." });
                return;
            }
            imageAsBase64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = error => reject(error);
                reader.readAsDataURL(imageFile);
            });
        }

        await sendMessage(newMessage, imageAsBase64);
        setNewMessage('');
        setImageFile(null);
    };
    
    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="h-full flex flex-col bg-card">
            <header className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2 overflow-hidden">
                        {group.memberDetails?.slice(0, 3).map(member => (
                            <Avatar key={member.uid} className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                                <AvatarImage src={member.photoURL} />
                                <AvatarFallback>{member.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                        ))}
                    </div>
                    <div>
                        <h3 className="font-bold">{group.name}</h3>
                        <p className="text-xs text-muted-foreground">{group.members.length} members</p>
                    </div>
                </div>
            </header>

            <ScrollArea className="flex-1" viewportRef={scrollAreaRef}>
                <div className="p-4 space-y-6">
                    {loading ? (
                        <div className="flex justify-center items-center h-full"><Loader2 className="h-6 w-6 animate-spin"/></div>
                    ) : messages.map((msg, index) => {
                        const sender = group.memberDetails?.find(m => m.uid === msg.senderId);
                        const prevMessage = messages[index - 1];
                        const showHeader = !prevMessage || prevMessage.senderId !== msg.senderId || !isSameDay(new Date(msg.timestamp), new Date(prevMessage.timestamp));

                        return (
                            <div key={msg.id} className={cn("flex items-end gap-2", msg.senderId === currentUser?.id ? "justify-end" : "")}>
                                {!isSameDay(new Date(msg.timestamp), prevMessage ? new Date(prevMessage.timestamp) : 0) && (
                                    <div className="text-xs text-muted-foreground text-center col-span-full py-4">{format(new Date(msg.timestamp), 'MMMM d, yyyy')}</div>
                                )}

                                {! (msg.senderId === currentUser?.id) && (
                                    <Avatar className={cn("h-8 w-8", showHeader ? 'opacity-100' : 'opacity-0')}>
                                        <AvatarImage src={sender?.photoURL} />
                                        <AvatarFallback>{sender?.displayName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                )}
                                
                                <div className={cn("max-w-xs md:max-w-md", msg.senderId === currentUser?.id ? "text-right" : "")}>
                                    {showHeader && !(msg.senderId === currentUser?.id) && (
                                        <p className={cn("text-xs font-semibold mb-1", getUserColor(sender?.uid || ''))}>
                                            {sender?.displayName}
                                        </p>
                                    )}
                                    <div className={cn("p-3 rounded-2xl", msg.senderId === currentUser?.id ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none")}>
                                        {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                                        {msg.imageUrl && (
                                            <div className="mt-2">
                                                <Image src={msg.imageUrl} alt="Uploaded image" width={300} height={200} className="rounded-md object-cover" />
                                            </div>
                                        )}
                                        <p className="text-xs opacity-70 mt-1">{format(new Date(msg.timestamp), 'h:mm a')}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>

            <footer className="p-4 border-t">
                {imagePreview && (
                    <div className="relative w-24 h-24 mb-2 p-1 border rounded-md">
                        <Image src={imagePreview} alt="Image preview" layout="fill" objectFit="cover" className="rounded"/>
                         <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => setImageFile(null)}>
                            <X className="h-4 w-4"/>
                        </Button>
                    </div>
                )}
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                     <Button type="button" variant="ghost" size="icon" onClick={handleFileSelect}>
                        <Paperclip />
                    </Button>
                     <input type="file" ref={fileInputRef} onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} accept="image/*" className="hidden" />
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                        autoComplete="off"
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim() && !imageFile}>
                        <Send />
                    </Button>
                </form>
            </footer>
        </div>
    );
}
