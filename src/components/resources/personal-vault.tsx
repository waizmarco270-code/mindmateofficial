
'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PlusCircle, Edit, Trash2, Palette, Link as LinkIcon, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface VaultResource {
  id: string;
  title: string;
  description: string;
  url: string;
}

interface VaultCategory {
  id: string;
  name: string;
  color: string;
  resources: VaultResource[];
}

const categoryColors = [
    '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#ec4899'
];

export function PersonalVault() {
  const [vault, setVault] = useLocalStorage<VaultCategory[]>('personalVault', []);
  const [dialogState, setDialogState] = useState<'idle' | 'category' | 'resource'>('idle');
  const [editingItem, setEditingItem] = useState<VaultCategory | VaultResource | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [color, setColor] = useState(categoryColors[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');

  const openDialog = (type: 'category' | 'resource', categoryId?: string, itemToEdit?: VaultCategory | VaultResource) => {
    setDialogState(type);
    if (categoryId) setActiveCategoryId(categoryId);
    
    if (itemToEdit) {
      setEditingItem(itemToEdit);
      if (type === 'category') {
        const cat = itemToEdit as VaultCategory;
        setName(cat.name);
        setColor(cat.color);
      } else {
        const res = itemToEdit as VaultResource;
        setTitle(res.title);
        setDescription(res.description);
        setUrl(res.url);
      }
    } else {
      // Reset form for new item
      setEditingItem(null);
      setName('');
      setColor(categoryColors[Math.floor(Math.random() * categoryColors.length)]);
      setTitle('');
      setDescription('');
      setUrl('');
    }
  };

  const closeDialog = () => {
    setDialogState('idle');
    setEditingItem(null);
  };

  const handleCategorySubmit = () => {
    if (!name.trim()) return;
    if (editingItem) {
      setVault(vault.map(cat => cat.id === (editingItem as VaultCategory).id ? { ...cat, name, color } : cat));
    } else {
      const newCategory: VaultCategory = { id: Date.now().toString(), name, color, resources: [] };
      setVault([...vault, newCategory]);
    }
    closeDialog();
  };

  const handleResourceSubmit = () => {
    if (!title.trim() || !url.trim() || !activeCategoryId) return;
    
    setVault(vault.map(cat => {
        if (cat.id !== activeCategoryId) return cat;

        if (editingItem) { // Editing a resource
            return {
                ...cat,
                resources: cat.resources.map(res => res.id === (editingItem as VaultResource).id ? { ...res, title, description, url } : res)
            };
        } else { // Adding a new resource
            const newResource: VaultResource = { id: Date.now().toString(), title, description, url };
            return { ...cat, resources: [...cat.resources, newResource] };
        }
    }));
    
    closeDialog();
  };
  
  const handleDelete = (type: 'category' | 'resource', itemId: string, categoryId?: string) => {
      if (type === 'category') {
          setVault(vault.filter(cat => cat.id !== itemId));
      } else if (type === 'resource' && categoryId) {
          setVault(vault.map(cat => cat.id === categoryId 
            ? { ...cat, resources: cat.resources.filter(res => res.id !== itemId) }
            : cat
          ));
      }
  }


  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personal Vault</h1>
          <p className="text-muted-foreground">Your private space for personal study materials.</p>
        </div>
        <Button onClick={() => openDialog('category')}><PlusCircle className="mr-2"/> Add Category</Button>
      </div>

      {vault.length === 0 ? (
        <Card className="text-center py-16 border-dashed">
            <CardContent>
                <p>Your vault is empty. Create a category to get started!</p>
            </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" className="space-y-4">
            {vault.map(category => (
                <AccordionItem key={category.id} value={category.id} className="border-b-0">
                    <Card className="overflow-hidden">
                        <AccordionTrigger className="p-4 hover:no-underline" style={{ borderLeft: `4px solid ${category.color}`}}>
                           <div className="flex-1 text-left">
                             <h3 className="font-bold text-lg">{category.name}</h3>
                           </div>
                           <div className="flex items-center gap-1">
                             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => {e.stopPropagation(); openDialog('category', undefined, category);}}><Edit/></Button>
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => {e.stopPropagation(); handleDelete('category', category.id);}}><Trash2/></Button>
                           </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-4 pt-0">
                            <div className="space-y-2">
                                {category.resources.length > 0 ? category.resources.map(resource => (
                                    <div key={resource.id} className="flex items-center gap-2 p-3 rounded-md border bg-muted/50">
                                        <LinkIcon className="h-5 w-5 text-primary flex-shrink-0"/>
                                        <div className="flex-1 truncate">
                                            <Link href={resource.url} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">{resource.title}</Link>
                                            <p className="text-xs text-muted-foreground truncate">{resource.description}</p>
                                        </div>
                                         <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDialog('resource', category.id, resource)}><Edit/></Button>
                                         <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete('resource', resource.id, category.id)}><Trash2/></Button>
                                    </div>
                                )) : <p className="text-sm text-center text-muted-foreground py-4">No resources in this category yet.</p>}
                                <Button variant="outline" className="w-full" onClick={() => openDialog('resource', category.id)}><PlusCircle className="mr-2"/> Add Resource</Button>
                            </div>
                        </AccordionContent>
                    </Card>
                </AccordionItem>
            ))}
        </Accordion>
      )}
      
       {/* Add/Edit Dialog */}
        <Dialog open={dialogState !== 'idle'} onOpenChange={closeDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {editingItem ? 'Edit' : 'Add'} {dialogState === 'category' ? 'Category' : 'Resource'}
                    </DialogTitle>
                </DialogHeader>
                {dialogState === 'category' && (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="cat-name">Category Name</Label>
                            <Input id="cat-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Physics Notes" />
                        </div>
                        <div className="space-y-2">
                            <Label>Color</Label>
                            <div className="grid grid-cols-6 gap-2">
                                {categoryColors.map(c => (
                                    <button key={c} style={{ backgroundColor: c }} onClick={() => setColor(c)} className={cn("h-10 w-10 rounded-full border-2", color === c ? 'border-foreground' : 'border-transparent')} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                 {dialogState === 'resource' && (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="res-title">Title</Label>
                            <Input id="res-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Electrostatics PDF" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="res-desc">Description (Optional)</Label>
                            <Textarea id="res-desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="A short summary..." />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="res-url">URL / Link</Label>
                            <Input id="res-url" type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/file.pdf" />
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={dialogState === 'category' ? handleCategorySubmit : handleResourceSubmit}>
                        {editingItem ? 'Save Changes' : 'Add'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
