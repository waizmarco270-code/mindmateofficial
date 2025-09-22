
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { QrCode, ScanLine, Download, Palette, Link as LinkIcon, FileText, Copy, Check, AlertTriangle, VideoOff } from 'lucide-react';
import { QRCode as QrCodeCanvas } from 'qrcode.react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

declare global {
  interface Window {
    BarcodeDetector: any;
  }
}

export function QrCodeTool() {
    const [inputValue, setInputValue] = useState('https://mindmate.com');
    const [fgColor, setFgColor] = useState('#000000');
    const [bgColor, setBgColor] = useState('#ffffff');
    const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('L');
    const [qrSize, setQrSize] = useState(256);

    const [scannedData, setScannedData] = useState<string | null>(null);
    const [isScannerActive, setIsScannerActive] = useState(false);
    const [scannerError, setScannerError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const qrRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    
    const { toast } = useToast();

    const handleDownload = () => {
        if (!qrRef.current) return;
        const canvas = qrRef.current.querySelector('canvas');
        if (!canvas) return;

        const link = document.createElement('a');
        link.download = 'mindmate-qrcode.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const handleCopy = () => {
        if (!scannedData) return;
        navigator.clipboard.writeText(scannedData);
        setIsCopied(true);
        toast({ title: "Copied to clipboard!" });
        setTimeout(() => setIsCopied(false), 2000);
    }
    
    const isValidUrl = (str: string) => {
        try {
            new URL(str);
            return true;
        } catch (_) {
            return false;
        }
    }

    const startScanner = useCallback(async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setScannerError(null);
                
                // Start detection loop
                const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
                const intervalId = setInterval(async () => {
                    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                        try {
                            const barcodes = await barcodeDetector.detect(videoRef.current);
                            if (barcodes.length > 0) {
                                setScannedData(barcodes[0].rawValue);
                                stopScanner();
                                clearInterval(intervalId);
                            }
                        } catch (detectError) {
                             console.error("Barcode detection error:", detectError);
                        }
                    }
                }, 500); // Scan every 500ms

                return () => clearInterval(intervalId);

            } catch (err) {
                console.error("Camera access error:", err);
                if (err instanceof Error) {
                    if (err.name === "NotAllowedError") {
                        setScannerError("Camera permission was denied. Please enable it in your browser settings.");
                    } else {
                        setScannerError(`Error accessing camera: ${err.message}`);
                    }
                }
            }
        } else {
            setScannerError("Your browser does not support camera access.");
        }
    }, []);

    const stopScanner = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };
    
    useEffect(() => {
        if (isScannerActive && !scannedData) {
            startScanner();
        } else {
            stopScanner();
        }
        return () => stopScanner(); // Cleanup on unmount
    }, [isScannerActive, scannedData, startScanner]);


    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-3xl font-bold tracking-tight">QR Code Suite</CardTitle>
                <CardDescription>Generate and scan QR codes with advanced customization options.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="generate" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="generate" onClick={() => setIsScannerActive(false)}><QrCode className="mr-2"/> Generate</TabsTrigger>
                        <TabsTrigger value="scan" onClick={() => setIsScannerActive(true)}><ScanLine className="mr-2"/> Scan</TabsTrigger>
                    </TabsList>
                    <TabsContent value="generate" className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-1 space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="qr-input">Data (URL or Text)</Label>
                                    <Input id="qr-input" value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="https://example.com"/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fg-color">Code Color</Label>
                                    <Input id="fg-color" type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} className="h-12"/>
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="bg-color">Background Color</Label>
                                    <Input id="bg-color" type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="h-12"/>
                                </div>
                                 <div className="space-y-3">
                                    <Label>Error Correction ({errorLevel})</Label>
                                    <Slider defaultValue={[0]} max={3} step={1} onValueChange={([val]) => setErrorLevel(['L','M','Q','H'][val] as any)}/>
                                </div>
                                <div className="space-y-3">
                                    <Label>Size ({qrSize}px)</Label>
                                    <Slider defaultValue={[256]} min={128} max={512} step={16} onValueChange={([val]) => setQrSize(val)}/>
                                </div>
                            </div>
                            <div className="md:col-span-2 flex flex-col items-center justify-center gap-6 bg-muted p-6 rounded-lg">
                                <div ref={qrRef} className="p-4 bg-white rounded-lg shadow-md" style={{ backgroundColor: bgColor }}>
                                    <QrCodeCanvas
                                        value={inputValue}
                                        size={qrSize}
                                        fgColor={fgColor}
                                        bgColor={bgColor}
                                        level={errorLevel}
                                        imageSettings={{
                                            src: "/icon-192x192.png",
                                            height: qrSize / 5,
                                            width: qrSize / 5,
                                            excavate: true,
                                        }}
                                    />
                                </div>
                                <Button onClick={handleDownload} className="w-full max-w-xs">
                                    <Download className="mr-2"/> Download QR Code
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="scan" className="pt-6">
                         {scannedData ? (
                              <div className="space-y-6 text-center">
                                 <h3 className="text-2xl font-bold">Scan Result</h3>
                                 <Card className="p-4 break-words">
                                    {isValidUrl(scannedData) ? (
                                        <a href={scannedData} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold flex items-center justify-center gap-2">
                                            <LinkIcon className="h-4 w-4"/> {scannedData}
                                        </a>
                                    ) : (
                                        <p className="flex items-center justify-center gap-2"><FileText className="h-4 w-4"/> {scannedData}</p>
                                    )}
                                 </Card>
                                 <div className="flex gap-2 justify-center">
                                    <Button onClick={handleCopy}>
                                        {isCopied ? <Check className="mr-2"/> : <Copy className="mr-2"/>}
                                        Copy
                                    </Button>
                                    <Button variant="outline" onClick={() => { setScannedData(null); setIsScannerActive(true); }}>Scan Another</Button>
                                 </div>
                              </div>
                         ) : scannerError ? (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Scanner Error</AlertTitle>
                                <AlertDescription>
                                    {scannerError}
                                </AlertDescription>
                            </Alert>
                         ) : (
                            <div className="space-y-4">
                                <div className="w-full max-w-md mx-auto aspect-square bg-black rounded-lg overflow-hidden relative">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover"
                                    />
                                     <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-2/3 h-2/3 border-4 border-white/50 rounded-lg animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                         )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
