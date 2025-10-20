
'use client';
import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileImage, Download, Loader2, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import jsPDF from 'jspdf';
import { useUser, SignedOut } from '@clerk/nextjs';
import { LoginWall } from '@/components/ui/login-wall';

interface ImageFile {
  id: string;
  file: File;
  previewUrl: string;
}

export default function ImageToPdfPage() {
    const { isSignedIn } = useUser();
    const { toast } = useToast();
    const [images, setImages] = useState<ImageFile[]>([]);
    const [isConverting, setIsConverting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        const newImages: ImageFile[] = files.map(file => ({
            id: `${file.name}-${file.lastModified}`,
            file,
            previewUrl: URL.createObjectURL(file)
        }));
        setImages(prev => [...prev, ...newImages]);
    };

    const handleRemoveImage = (id: string) => {
        setImages(prev => prev.filter(image => image.id !== id));
    };
    
    const handleMoveImage = (index: number, direction: 'left' | 'right') => {
        if (direction === 'left' && index === 0) return;
        if (direction === 'right' && index === images.length - 1) return;

        const newImages = [...images];
        const targetIndex = direction === 'left' ? index - 1 : index + 1;
        const temp = newImages[index];
        newImages[index] = newImages[targetIndex];
        newImages[targetIndex] = temp;
        setImages(newImages);
    };

    const convertToPdf = async () => {
        if (images.length === 0) {
            toast({ variant: 'destructive', title: 'No images selected' });
            return;
        }

        setIsConverting(true);
        toast({ title: 'Conversion Started', description: 'Please wait while we generate your PDF.' });

        // Using a dynamic import for jspdf to support SSR/Next.js
        const { default: jsPDF } = await import('jspdf');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const a4Width = 210;
        const a4Height = 297;
        const margin = 10;
        const maxWidth = a4Width - margin * 2;
        const maxHeight = a4Height - margin * 2;

        for (let i = 0; i < images.length; i++) {
            const imageFile = images[i];
            const img = document.createElement('img');
            img.src = imageFile.previewUrl;

            await new Promise<void>(resolve => {
                img.onload = () => {
                    if (i > 0) pdf.addPage();
                    
                    const imgWidth = img.naturalWidth;
                    const imgHeight = img.naturalHeight;
                    const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
                    
                    const newWidth = imgWidth * ratio;
                    const newHeight = imgHeight * ratio;

                    const x = (a4Width - newWidth) / 2;
                    const y = (a4Height - newHeight) / 2;

                    pdf.addImage(img, 'JPEG', x, y, newWidth, newHeight);
                    resolve();
                };
            });
        }
        
        pdf.save('mindmate-document.pdf');
        setIsConverting(false);
        toast({ title: 'PDF Generated!', description: 'Your download should start shortly.' });
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Image to PDF Converter</h1>
                <p className="text-muted-foreground">Combine multiple images into a single, downloadable PDF document.</p>
            </div>
            <Card className="relative">
                 <SignedOut>
                    <LoginWall title="Sign In to Use Converter" description="Create a free account to convert your images to PDF." />
                </SignedOut>
                <CardHeader>
                    <CardTitle>Your Images ({images.length})</CardTitle>
                    <CardDescription>Upload, reorder, and convert your images to a PDF file.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div
                        className="border-2 border-dashed rounded-lg p-8 text-center min-h-[200px] flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                         <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/png, image/jpeg, image/webp"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <FileImage className="h-12 w-12 text-muted-foreground mb-4"/>
                        <p className="font-semibold">Click to browse or drag & drop images here</p>
                        <p className="text-sm text-muted-foreground">PNG, JPG, or WEBP supported</p>
                    </div>

                    <AnimatePresence>
                    {images.length > 0 && (
                        <motion.div initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: 'auto'}} className="mt-6 space-y-4">
                            <h3 className="font-semibold">Image Preview & Order</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {images.map((image, index) => (
                                    <motion.div
                                        key={image.id}
                                        layout
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.8, opacity: 0 }}
                                        className="relative group aspect-square border rounded-lg overflow-hidden"
                                    >
                                        <Image src={image.previewUrl} alt={`Preview ${index + 1}`} layout="fill" objectFit="cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                            <div className="flex items-center gap-1">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => handleMoveImage(index, 'left')} disabled={index === 0}><ArrowLeft/></Button>
                                                <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleRemoveImage(image.id)}><Trash2/></Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => handleMoveImage(index, 'right')} disabled={index === images.length - 1}><ArrowRight/></Button>
                                            </div>
                                            <p className="text-white font-bold text-lg">#{index + 1}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                    </AnimatePresence>
                </CardContent>
                <CardFooter>
                     <Button 
                        onClick={convertToPdf} 
                        disabled={images.length === 0 || isConverting}
                        className="w-full"
                        size="lg"
                    >
                        {isConverting ? (
                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating PDF...</>
                        ) : (
                            <><Download className="mr-2 h-5 w-5" /> Convert & Download PDF</>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
