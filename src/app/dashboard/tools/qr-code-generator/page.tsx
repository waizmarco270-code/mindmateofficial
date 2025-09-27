
'use client';
import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { QrCode, Download, Brush, Palette } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useUser, SignedOut } from '@clerk/nextjs';
import { LoginWall } from '@/components/ui/login-wall';

export default function QrCodeGeneratorPage() {
    const { isSignedIn } = useUser();
    const [text, setText] = useState('https://mindmate.vercel.app');
    const [fgColor, setFgColor] = useState('#000000');
    const [bgColor, setBgColor] = useState('#FFFFFF');
    const [level, setLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
    const [size, setSize] = useState(256);
    
    const qrRef = useRef<HTMLDivElement>(null);

    const handleDownload = () => {
        const canvas = qrRef.current?.querySelector('canvas');
        if (canvas) {
            const link = document.createElement('a');
            link.download = 'mindmate-qrcode.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">QR Code Generator</h1>
                <p className="text-muted-foreground">Create and customize your own QR codes for links, text, and more.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 relative">
                    <SignedOut>
                        <LoginWall title="Unlock QR Generator" description="Sign up to create and customize your own QR codes for links, text, and more." />
                    </SignedOut>
                    <CardHeader>
                        <CardTitle>Your QR Code</CardTitle>
                        <CardDescription>Enter your data and see the QR code update in real-time.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row items-center justify-center gap-8">
                        <div ref={qrRef} className="p-4 bg-white rounded-lg border shadow-md w-fit">
                            <QRCodeCanvas
                                value={text}
                                size={size}
                                fgColor={fgColor}
                                bgColor={bgColor}
                                level={level}
                            />
                        </div>
                        <div className="w-full flex-1 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="qr-data">Data (Link or Text)</Label>
                                <Textarea 
                                    id="qr-data" 
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Enter URL or text here"
                                    rows={4}
                                    disabled={!isSignedIn}
                                />
                            </div>
                            <Button onClick={handleDownload} className="w-full" disabled={!isSignedIn}>
                                <Download className="mr-2"/> Download QR Code
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Brush /> Customization</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Colors</Label>
                            <div className="flex items-center gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="fg-color" className="text-xs">Code</Label>
                                    <Input id="fg-color" type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} disabled={!isSignedIn}/>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="bg-color" className="text-xs">Background</Label>
                                    <Input id="bg-color" type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} disabled={!isSignedIn}/>
                                </div>
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="qr-size">Size ({size}px)</Label>
                            <Input id="qr-size" type="range" min="64" max="1024" step="64" value={size} onChange={(e) => setSize(Number(e.target.value))} disabled={!isSignedIn}/>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="qr-level">Error Correction Level</Label>
                             <select 
                                id="qr-level"
                                value={level} 
                                onChange={(e) => setLevel(e.target.value as any)}
                                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                disabled={!isSignedIn}
                            >
                                <option value="L">Low (L)</option>
                                <option value="M">Medium (M)</option>
                                <option value="Q">Quartile (Q)</option>
                                <option value="H">High (H)</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
