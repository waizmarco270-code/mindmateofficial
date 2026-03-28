
'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAdmin, type VideoCategory, type VideoLecture } from '@/hooks/use-admin';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Film, Trash2, Book, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

export default function GuideManagementPage() {
    const {
        videoCategories, addVideoCategory, deleteVideoCategory,
        videoLectures, addVideoLecture, deleteVideoLecture
    } = useAdmin();
    const { toast } = useToast();

    const [newVideoCategory, setNewVideoCategory] = useState('');
    const [newVideoCategoryDesc, setNewVideoCategoryDesc] = useState('');
    const [isAddingCategory, setIsAddingCategory] = useState(false);

    const [newVideoTitle, setNewVideoTitle] = useState('');
    const [newVideoDesc, setNewVideoDesc] = useState('');
    const [newVideoUrl, setNewVideoUrl] = useState('');
    const [newVideoThumbnail, setNewVideoThumbnail] = useState('');
    const [newVideoCategoryId, setNewVideoCategoryId] = useState('');
    const [isAddingLecture, setIsAddingLecture] = useState(false);

    const handleAddVideoCategory = async () => {
        if (!newVideoCategory.trim()) return;
        setIsAddingCategory(true);
        try {
            await addVideoCategory({ name: newVideoCategory, description: newVideoCategoryDesc });
            setNewVideoCategory('');
            setNewVideoCategoryDesc('');
            toast({ title: 'Guide Section Created' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsAddingCategory(false);
        }
    };

    const handleAddVideoLecture = async () => {
        if (!newVideoTitle.trim() || !newVideoUrl.trim() || !newVideoCategoryId) {
            toast({ variant: 'destructive', title: 'Missing Fields', description: 'Title, URL, and category are required.' });
            return;
        }
        setIsAddingLecture(true);
        try {
            const youtubeId = newVideoUrl.split('v=')[1]?.split('&')[0] || newVideoUrl.split('/').pop();
            if (!youtubeId) throw new Error("Invalid YouTube URL");
            
            const thumbnailUrl = newVideoThumbnail || `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
            
            await addVideoLecture({
                title: newVideoTitle,
                description: newVideoDesc,
                youtubeUrl: newVideoUrl,
                thumbnailUrl,
                categoryId: newVideoCategoryId,
            });
            
            setNewVideoTitle('');
            setNewVideoDesc('');
            setNewVideoUrl('');
            setNewVideoThumbnail('');
            setNewVideoCategoryId('');
            toast({ title: 'Guide Briefing Published' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error Adding Guide', description: error.message });
        } finally {
            setIsAddingLecture(false);
        }
    };
    
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Guide Command Center</h1>
                    <p className="text-muted-foreground">Manage tutorial briefings and sections for the Sovereign Guide.</p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/dashboard/admin"><ArrowLeft className="mr-2 h-4 w-4"/> Back to Admin</Link>
                </Button>
            </div>
            
            <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle>Guide Sections</CardTitle><CardDescription>Group briefings by app feature (e.g. Focus Mastery, Wallet Assets).</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="cat-name">Section Name</Label>
                            <Input id="cat-name" value={newVideoCategory} onChange={e => setNewVideoCategory(e.target.value)} placeholder="e.g. Focus mastery" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cat-desc">Context Summary</Label>
                            <Textarea id="cat-desc" value={newVideoCategoryDesc} onChange={e => setNewVideoCategoryDesc(e.target.value)} placeholder="What will legends learn here?" />
                        </div>
                        <Button onClick={handleAddVideoCategory} disabled={isAddingCategory} className="w-full">{isAddingCategory ? 'Initializing...' : 'Create Section'}</Button>
                        <Table>
                            <TableHeader><TableRow><TableHead>Section Name</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {videoCategories && videoCategories.map(cat => (
                                    <TableRow key={cat.id}>
                                        <TableCell className="font-bold">{cat.name}</TableCell>
                                        <TableCell className="text-right">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="h-4 w-4"/></Button></AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader><AlertDialogTitle>Delete this section?</AlertDialogTitle><AlertDialogDescription>This will purge all briefings inside it. This protocol is irreversible.</AlertDialogDescription></AccordionItem>
                                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteVideoCategory(cat.id)}>Confirm Delete</AlertDialogAction></AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Add New Guide Briefing</CardTitle><CardDescription>Upload an operational tutorial for the community.</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="lec-title">Briefing Title</Label>
                            <Input id="lec-title" value={newVideoTitle} onChange={e => setNewVideoTitle(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lec-desc">Detailed Instructions</Label>
                            <Textarea id="lec-desc" value={newVideoDesc} onChange={e => setNewVideoDesc(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lec-url">YouTube Link</Label>
                            <Input id="lec-url" value={newVideoUrl} onChange={e => setNewVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..."/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lec-thumb">Custom Cover (Optional)</Label>
                            <Input id="lec-thumb" value={newVideoThumbnail} onChange={e => setNewVideoThumbnail(e.target.value)} placeholder="Auto-generated from YouTube if blank"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lec-cat">Target Section</Label>
                             <Select value={newVideoCategoryId} onValueChange={setNewVideoCategoryId}>
                                <SelectTrigger id="lec-cat"><SelectValue placeholder="Select section..." /></SelectTrigger>
                                <SelectContent>{videoCategories && videoCategories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                         <Button onClick={handleAddVideoLecture} disabled={isAddingLecture} className="w-full">{isAddingLecture ? 'Dispatching...' : 'Publish Briefing'}</Button>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader><CardTitle>Operational Guide Library</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Briefing Title</TableHead><TableHead>Target Section</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {videoLectures && videoLectures.map(lec => (
                                <TableRow key={lec.id}>
                                    <TableCell className="font-medium">{lec.title}</TableCell>
                                    <TableCell><Badge variant="secondary">{videoCategories?.find(c => c.id === lec.categoryId)?.name || 'N/A'}</Badge></TableCell>
                                    <TableCell className="text-right">
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="h-4 w-4"/></Button></AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader><AlertDialogTitle>Purge this briefing?</AlertDialogTitle></AlertDialogHeader>
                                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteVideoLecture(lec.id)}>Confirm Purge</AlertDialogAction></AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
