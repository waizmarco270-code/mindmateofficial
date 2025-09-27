
'use client';
import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScanText, FileImage, Copy, Check, Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useUser, SignedOut } from '@clerk/nextjs';
import { LoginWall } from '@/components/ui/login-wall';
import { Textarea } from '@/components/ui/textarea';
import { extractTextFromImage } from '@/ai/flows/ocr-flow';

export default function HandwritingToTextPage() {
    const { isSignedIn } = useUser();
    const { toast } = useToast();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [extractedText, setExtractedText] = useState('');
    const [isConverting, setIsConverting] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleConvert = async () => {
        if (!imagePreview) {
            toast({ variant: 'destructive', title: 'No image selected' });
            return;
        }

        setIsConverting(true);
        setExtractedText('');
        toast({ title: 'Conversion Started', description: 'The AI is reading your notes...' });
        
        try {
            const result = await extractTextFromImage({ image: imagePreview });
            setExtractedText(result.text);
            toast({ title: 'Text Extracted!', description: 'Your handwritten notes are now digital.' });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Conversion Failed', description: 'Could not extract text from the image.' });
        } finally {
            setIsConverting(false);
        }
    };
    
    const handleCopy = () => {
        navigator.clipboard.writeText(extractedText);
        setIsCopied(true);
        toast({ title: "Text copied!" });
        setTimeout(() => setIsCopied(false), 2000);
    }

    return (
        <div className="space-y-8">
             <div>
                <h1 className="text-3xl font-bold tracking-tight">Handwriting to Text</h1>
                <p className="text-muted-foreground">Convert images of your handwritten notes into editable digital text using AI.</p>
            </div>
            <Card className="relative">
                 <SignedOut>
                    <LoginWall title="Unlock Text Extractor" description="Sign up for a free account to convert your handwritten notes into digital text." />
                </SignedOut>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
                    <div className="space-y-4">
                        <CardTitle>1. Upload Your Image</CardTitle>
                        <div
                            className="border-2 border-dashed rounded-lg p-8 text-center min-h-[250px] flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png, image/jpeg, image/webp"
                                className="hidden"
                                onChange={handleFileChange}
                                disabled={!isSignedIn || isConverting}
                            />
                            {imagePreview ? (
                                <Image src={imagePreview} alt="Uploaded note" width={400} height={300} className="max-h-64 w-auto object-contain rounded-md" />
                            ) : (
                                <>
                                    <FileImage className="h-12 w-12 text-muted-foreground mb-4"/>
                                    <p className="font-semibold">Click to browse or drag & drop</p>
                                    <p className="text-sm text-muted-foreground">A clear image works best</p>
                                </>
                            )}
                        </div>
                        <Button onClick={handleConvert} disabled={!imageFile || isConverting || !isSignedIn} className="w-full">
                            {isConverting ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Converting...</>
                            ) : (
                                <><Wand2 className="mr-2 h-4 w-4"/> Convert to Text</>
                            )}
                        </Button>
                    </div>
                     <div className="space-y-4">
                        <CardTitle>2. Get Digital Text</CardTitle>
                        <div className="relative">
                            <Textarea
                                value={extractedText}
                                readOnly
                                placeholder="Your converted text will appear here..."
                                className="h-80 resize-none text-base"
                            />
                             {isConverting && (
                                <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-md">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                                </div>
                            )}
                        </div>
                        <Button onClick={handleCopy} disabled={!extractedText || isConverting} className="w-full">
                            {isCopied ? <Check className="mr-2"/> : <Copy className="mr-2"/>}
                            {isCopied ? 'Copied!' : 'Copy Text'}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
