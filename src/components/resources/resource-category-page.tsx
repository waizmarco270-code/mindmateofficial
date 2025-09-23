
'use client';

import { useState, useMemo } from 'react';
import { useResources, useUsers } from '@/hooks/use-admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Lock, Sparkles, FileText, Download, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@clerk/nextjs';
import { Skeleton } from '../ui/skeleton';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';

interface ResourceCategoryPageProps {
  categoryId: string;
  title: string;
}

export default function ResourceCategoryPage({ categoryId, title }: ResourceCategoryPageProps) {
    const { user } = useUser();
    const { allSections, allResources, loading } = useResources();
    const { currentUserData, unlockResourceSection } = useUsers();
    const { toast } = useToast();

    const [sectionToUnlock, setSectionToUnlock] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    const { filteredSections, resourcesBySection } = useMemo(() => {
        const sectionsForCategory = allSections.filter(s => s.parentCategory === categoryId);
        
        const resourcesBySect = allResources.reduce((acc, resource) => {
            if (!acc[resource.sectionId]) {
                acc[resource.sectionId] = [];
            }
            acc[resource.sectionId].push(resource);
            return acc;
        }, {} as Record<string, any[]>);
        
        if (!searchTerm) {
            return { filteredSections: sectionsForCategory, resourcesBySection: resourcesBySect };
        }

        const lowercasedTerm = searchTerm.toLowerCase();
        const filteredSects = sectionsForCategory.filter(section => {
            // Include section if its name matches
            if (section.name.toLowerCase().includes(lowercasedTerm)) {
                return true;
            }
            // Include section if it has at least one resource that matches
            const resources = resourcesBySect[section.id] || [];
            return resources.some(res => res.title.toLowerCase().includes(lowercasedTerm));
        });
        
        // Now, filter the resources within the sections that are left
        const filteredResourcesBySection = { ...resourcesBySect };
        Object.keys(filteredResourcesBySection).forEach(sectionId => {
            const section = allSections.find(s => s.id === sectionId);
            // If the section name itself matches, don't filter its resources
            if (section && section.name.toLowerCase().includes(lowercasedTerm)) {
                return;
            }
            filteredResourcesBySection[sectionId] = filteredResourcesBySection[sectionId].filter(res => 
                res.title.toLowerCase().includes(lowercasedTerm)
            );
        });


        return { filteredSections: filteredSects, resourcesBySection: filteredResourcesBySection };

    }, [allSections, allResources, categoryId, searchTerm]);

    const handleUnlock = async () => {
        if (!sectionToUnlock || !user || !currentUserData) return;

        if (currentUserData.credits < sectionToUnlock.unlockCost) {
            toast({ variant: 'destructive', title: 'Insufficient Credits' });
            return;
        }
        
        try {
            await unlockResourceSection(user.id, sectionToUnlock.id, sectionToUnlock.unlockCost);
            toast({ title: 'Section Unlocked!', description: `You can now access all resources in "${sectionToUnlock.name}".`});
            setSectionToUnlock(null);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Unlock Failed', description: 'An error occurred. Please try again.' });
        }
    }
    
    const hasUnlocked = (sectionId: string) => {
        return currentUserData?.unlockedResourceSections?.includes(sectionId) ?? false;
    }
    
    if (loading) {
        return (
             <div className="space-y-8">
                <Skeleton className="h-10 w-2/5" />
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({length: 3}).map((_, i) => (
                        <Card key={i}><Skeleton className="h-48 w-full" /></Card>
                    ))}
                 </div>
             </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <Link href="/dashboard/resources" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block">&larr; Back to Resource Library</Link>
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                <p className="text-muted-foreground">Browse, search, and unlock exclusive content.</p>
            </div>
            
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search resources..."
                    className="pl-10 h-12"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {filteredSections.length === 0 ? (
                 <div className="text-center text-muted-foreground col-span-full py-16">
                     <p>{searchTerm ? "No resources or sections matched your search." : "No sections have been created for this category yet."}</p>
                </div>
            ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSections.map(section => {
                        const isUnlocked = hasUnlocked(section.id);
                        const resources = resourcesBySection[section.id] || [];
                        
                        return (
                            <Card key={section.id} className={cn("flex flex-col", isUnlocked && "border-primary/30")}>
                                <CardHeader>
                                    <CardTitle className="flex items-start justify-between">
                                        <span>{section.name}</span>
                                        {isUnlocked ? <Sparkles className="h-6 w-6 text-yellow-500" /> : <Lock className="h-6 w-6 text-muted-foreground"/>}
                                    </CardTitle>
                                    <CardDescription>{section.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    {isUnlocked ? (
                                        <div className="space-y-2">
                                            {resources.length > 0 ? resources.map(res => (
                                                <Link key={res.id} href={res.url} target="_blank" rel="noopener noreferrer" className="block">
                                                    <div className="p-3 rounded-md border bg-background hover:bg-muted flex items-center gap-3 transition-colors">
                                                        <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                                                        <div className="flex-1 truncate">
                                                            <p className="font-medium truncate">{res.title}</p>
                                                        </div>
                                                        <Download className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                </Link>
                                            )) : <p className="text-sm text-muted-foreground text-center py-4">No resources in this section yet.</p>}
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-4 rounded-lg bg-muted/50 border-dashed border-2">
                                            <p className="font-bold text-lg">Content Locked</p>
                                            <p className="text-sm text-muted-foreground">Unlock this section to view all materials.</p>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter>
                                    {!isUnlocked && (
                                        <Button className="w-full" onClick={() => setSectionToUnlock(section)}>
                                            <Lock className="mr-2 h-4 w-4"/> Unlock for {section.unlockCost} Credits
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        )
                    })}
                 </div>
            )}
            
            <Dialog open={!!sectionToUnlock} onOpenChange={(open) => !open && setSectionToUnlock(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Unlock "{sectionToUnlock?.name}"</DialogTitle>
                        <DialogDescription>Gain permanent access to all resources in this section.</DialogDescription>
                    </DialogHeader>
                    <div className="my-6 space-y-4">
                         <div className="flex items-center justify-around text-center p-4 bg-muted rounded-lg">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Your Balance</p>
                                <p className="text-2xl font-bold">{currentUserData?.credits ?? 0}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Unlock Cost</p>
                                <p className="text-2xl font-bold text-destructive">-{sectionToUnlock?.unlockCost}</p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button 
                          onClick={handleUnlock}
                          disabled={(currentUserData?.credits ?? 0) < (sectionToUnlock?.unlockCost ?? Infinity)}
                        >
                          Confirm & Unlock
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    )
}
