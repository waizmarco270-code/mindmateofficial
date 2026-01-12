

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
import { Film, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function StudyPanelPage() {
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
            toast({ title: 'Video Category Added' });
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
            toast({ title: 'Video Lecture Added' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error Adding Lecture', description: error.message });
        } finally {
            setIsAddingLecture(false);
        }
    };
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Study Panel</h1>
                <p className="text-muted-foreground">Manage video lectures and categories for the Learning Hub.</p>
            </div>
            
            <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle>Video Categories</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="cat-name">New Category Name</Label>
                            <Input id="cat-name" value={newVideoCategory} onChange={e => setNewVideoCategory(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cat-desc">Description</Label>
                            <Textarea id="cat-desc" value={newVideoCategoryDesc} onChange={e => setNewVideoCategoryDesc(e.target.value)} />
                        </div>
                        <Button onClick={handleAddVideoCategory} disabled={isAddingCategory}>{isAddingCategory ? 'Adding...' : 'Add Category'}</Button>
                        <Table>
                            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {videoCategories && videoCategories.map(cat => (
                                    <TableRow key={cat.id}>
                                        <TableCell>{cat.name}</TableCell>
                                        <TableCell className="text-right">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="h-4 w-4"/></Button></AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader><AlertDialogTitle>Delete this category?</AlertDialogTitle><AlertDialogDescription>This will also delete all lectures inside it. This action is permanent.</AlertDialogDescription></AlertDialogHeader>
                                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteVideoCategory(cat.id)}>Delete</AlertDialogAction></AlertDialogFooter>
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
                    <CardHeader><CardTitle>Add New Lecture</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="lec-title">Title</Label>
                            <Input id="lec-title" value={newVideoTitle} onChange={e => setNewVideoTitle(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lec-desc">Description</Label>
                            <Textarea id="lec-desc" value={newVideoDesc} onChange={e => setNewVideoDesc(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lec-url">YouTube URL</Label>
                            <Input id="lec-url" value={newVideoUrl} onChange={e => setNewVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..."/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lec-thumb">Thumbnail URL (Optional)</Label>
                            <Input id="lec-thumb" value={newVideoThumbnail} onChange={e => setNewVideoThumbnail(e.target.value)} placeholder="Auto-generated if left blank"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lec-cat">Category</Label>
                             <Select value={newVideoCategoryId} onValueChange={setNewVideoCategoryId}>
                                <SelectTrigger id="lec-cat"><SelectValue placeholder="Select a category..." /></SelectTrigger>
                                <SelectContent>{videoCategories && videoCategories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                         <Button onClick={handleAddVideoLecture} disabled={isAddingLecture}>{isAddingLecture ? 'Adding...' : 'Add Lecture'}</Button>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader><CardTitle>Existing Lectures</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {videoLectures && videoLectures.map(lec => (
                                <TableRow key={lec.id}>
                                    <TableCell>{lec.title}</TableCell>
                                    <TableCell>{videoCategories?.find(c => c.id === lec.categoryId)?.name || 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="h-4 w-4"/></Button></AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader><AlertDialogTitle>Delete this lecture?</AlertDialogTitle></AlertDialogHeader>
                                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteVideoLecture(lec.id)}>Delete</AlertDialogAction></AlertDialogFooter>
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

