'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Info, ShieldAlert, Lock, Unlock, KeyRound, CreditCard, AlertTriangle } from 'lucide-react';
import { useResources, useUsers, type ResourceSection as TResourceSection } from '@/hooks/use-admin';
import { useAuth, SignInButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export default function ResourcesPage() {
    const { generalResources, dynamicSections, dynamicResources, loading } = useResources();
    const { isSignedIn } = useAuth();

    if (!isSignedIn && !loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 rounded-xl bg-muted/40 border-2 border-dashed">
                <div className="p-5 rounded-full bg-primary/10 mb-4">
                    <ShieldAlert className="h-12 w-12 text-primary" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">Access Restricted</h1>
                <p className="text-muted-foreground mt-2 max-w-lg">Please sign in or create an account to view and download study resources.</p>
                <SignInButton>
                    <Button size="lg" className="mt-6 text-lg py-7">
                        Sign In to Continue
                    </Button>
                </SignInButton>
            </div>
        );
    }

    if(loading) {
        return (
             <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
                    <p className="text-muted-foreground">Helpful documents and links to aid your studies.</p>
                </div>
                 <div className="h-48 bg-muted rounded-lg animate-pulse" />
                 <div className="h-48 bg-muted rounded-lg animate-pulse mt-4" />
                 <Separator/>
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                     {Array.from({length: 3}).map((_, i) => (
                        <Card key={i}><CardHeader><CardTitle className="h-6 bg-muted rounded-md animate-pulse"></CardTitle><CardDescription className="h-4 bg-muted rounded-md animate-pulse mt-2"></CardDescription></CardHeader><CardContent><div className="h-10 bg-muted rounded-md animate-pulse"></div></CardContent></Card>
                     ))}
                 </div>
             </div>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
                <p className="text-muted-foreground">Helpful documents and links to aid your studies.</p>
            </div>

            <div className="space-y-8">
                {dynamicSections.map(section => {
                    const resourcesForSection = dynamicResources.filter(r => r.sectionId === section.id);
                    return (
                        <ResourceSection 
                            key={section.id} 
                            section={section}
                            resources={resourcesForSection}
                        />
                    );
                })}
            </div>

            <Separator />
            
            <div>
                 <h2 className="text-2xl font-bold tracking-tight">General Resources</h2>
                <p className="text-muted-foreground">Free resources available for all students.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {generalResources.map(resource => (
                    <Card key={resource.id}>
                        <CardHeader>
                            <CardTitle>{resource.title}</CardTitle>
                            <CardDescription>{resource.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild className="w-full">
                                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download / View
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
                 {generalResources.length === 0 && (
                    <p className="text-muted-foreground col-span-full text-center">No general resources have been added yet.</p>
                )}
            </div>
        </div>
    );
}

interface ResourceSectionProps {
    section: TResourceSection;
    resources: ReturnType<typeof useResources>['dynamicResources'];
}

function ResourceSection({ section, resources }: ResourceSectionProps) {
    const { user } = useAuth();
    const { currentUserData, unlockResourceSection } = useUsers();
    const [isUnlockDialogOpen, setIsUnlockDialogOpen] = useState(false);
    const { toast } = useToast();

    const isUnlocked = currentUserData?.unlockedResourceSections?.includes(section.id) ?? false;
    const currentCredits = currentUserData?.credits ?? 0;
    
    const handleUnlockWithCredits = async () => {
        if (user && currentCredits >= section.unlockCost) {
            try {
                await unlockResourceSection(user.id, section.id, section.unlockCost);
                setIsUnlockDialogOpen(false);
                toast({ title: `Unlocked!`, description: `${section.unlockCost} credits have been used.` });
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            }
        } else {
            toast({ variant: 'destructive', title: 'Insufficient Credits', description: `You need at least ${section.unlockCost} credits to unlock.` });
        }
    };

    if (!isUnlocked) {
        return (
            <>
                <Card className="border-primary/20 bg-primary/5 cursor-pointer hover:border-primary/40 transition-all" onClick={() => setIsUnlockDialogOpen(true)}>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Lock className="h-8 w-8 text-primary" />
                        <div>
                            <CardTitle className="uppercase">{section.name}</CardTitle>
                            <CardDescription>This content is locked. Click to unlock with credits.</CardDescription>
                        </div>
                    </CardHeader>
                </Card>

                <Dialog open={isUnlockDialogOpen} onOpenChange={setIsUnlockDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2"><Unlock className="h-5 w-5" /> Unlock {section.name}</DialogTitle>
                            <DialogDescription>{section.description}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 rounded-lg border p-4">
                            <h3 className="font-semibold flex items-center gap-2"><CreditCard className="h-4 w-4"/> Unlock with Credits</h3>
                            <p className="text-sm text-muted-foreground">Use <span className="font-bold text-primary">{section.unlockCost} credits</span> for permanent access. You currently have <span className="font-bold text-primary">{currentCredits}</span> credits.</p>
                            <Button onClick={handleUnlockWithCredits} disabled={currentCredits < section.unlockCost} className="w-full">
                                Use {section.unlockCost} Credits
                            </Button>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </>
        );
    }
    
    // RENDER UNLOCKED STATE
    return (
        <div className="space-y-4">
             <div>
                 <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-primary"><Unlock /> {section.name}</h2>
                <p className="text-muted-foreground">{section.description}</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {resources.map(resource => (
                    <Card key={resource.id} className="border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle>{resource.title}</CardTitle>
                            <CardDescription>{resource.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild className="w-full">
                                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download PDF
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
                {resources.length === 0 && (
                    <p className="text-muted-foreground col-span-3 text-center">No resources have been added to this section yet.</p>
                )}
            </div>
        </div>
    );
}