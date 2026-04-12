
'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    Download, ArrowLeft, ShieldCheck, 
    Trophy, Clock, Gem, Flame, Target, 
    Award, CheckCircle, Loader2, Sparkles
} from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface SovereignCertificateProps {
    userData: any;
    stats: any;
    onBack: () => void;
}

export function SovereignCertificate({ userData, stats, onBack }: SovereignCertificateProps) {
    const certRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();

    const handleDownload = async () => {
        if (!certRef.current) return;
        setIsGenerating(true);
        toast({ title: "Sealing Record...", description: "Mainframe is authenticating your discipline." });

        try {
            const canvas = await html2canvas(certRef.current, {
                scale: 3, // High resolution
                backgroundColor: '#000000',
                logging: false,
                useCORS: true
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`mindmate-pow-${userData?.displayName?.toLowerCase().replace(/\s+/g, '-')}.pdf`);
            
            toast({ title: "Certificate Secured!", description: "Digital proof of work downloaded successfully." });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: "Auth Failure", description: "Failed to seal the record. Try again." });
        } finally {
            setIsGenerating(false);
        }
    };

    const sovereignHash = btoa(userData?.uid || 'GENESIS').slice(0, 32).toUpperCase();

    return (
        <div className="space-y-8 flex flex-col items-center">
            <div className="w-full flex justify-between items-center px-4">
                <Button variant="outline" onClick={onBack} className="rounded-full px-6 border-white/10">
                    <ArrowLeft className="mr-2 h-4 w-4"/> Back to Dossier
                </Button>
                <Button 
                    onClick={handleDownload} 
                    disabled={isGenerating}
                    className="rounded-full px-8 bg-primary hover:bg-primary/90 font-black uppercase tracking-widest shadow-2xl shadow-primary/20"
                >
                    {isGenerating ? <Loader2 className="animate-spin mr-2"/> : <Download className="mr-2"/>}
                    SEAL & DOWNLOAD PDF
                </Button>
            </div>

            {/* THE MASTERPIECE CERTIFICATE */}
            <div className="w-full max-w-[900px] aspect-[1.414/1] relative p-1 rounded-[2.5rem] bg-gradient-to-br from-yellow-400 via-primary to-purple-600 shadow-[0_0_100px_rgba(139,92,246,0.2)]">
                <div 
                    ref={certRef}
                    className="w-full h-full bg-black rounded-[2.4rem] p-12 sm:p-20 flex flex-col items-center text-center justify-between relative overflow-hidden select-none"
                >
                    {/* Background Texture */}
                    <div className="absolute inset-0 bg-grid-white/5 opacity-20 pointer-events-none" />
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.1)_0%,_transparent_70%)]" />
                    
                    {/* Corner Ornaments */}
                    <CornerDecoration position="top-left" />
                    <CornerDecoration position="top-right" />
                    <CornerDecoration position="bottom-left" />
                    <CornerDecoration position="bottom-right" />

                    <div className="relative z-10 space-y-12 w-full">
                        {/* Header */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-center gap-4 mb-6">
                                <div className="h-px w-12 sm:w-20 bg-primary/30" />
                                <Logo className="h-16 w-16 sm:h-20 sm:w-20" />
                                <div className="h-px w-12 sm:w-20 bg-primary/30" />
                            </div>
                            <h1 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase italic text-white leading-none">
                                Sovereign Proof of Work
                            </h1>
                            <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.5em] text-primary">
                                Mainframe Authorization Registry
                            </p>
                        </div>

                        {/* Recipient */}
                        <div className="space-y-4">
                            <p className="text-xs sm:text-sm font-bold uppercase text-muted-foreground tracking-widest italic">This document officially certifies that</p>
                            <h2 className="text-5xl sm:text-7xl font-black text-white tracking-tight uppercase italic drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                                {userData?.displayName || 'Active Legend'}
                            </h2>
                            <p className="text-lg sm:text-xl font-black uppercase text-yellow-400 tracking-tighter italic">
                                "{stats.rank}"
                            </p>
                        </div>

                        {/* Record Breakdown */}
                        <div className="grid grid-cols-3 gap-8 py-10 border-y border-white/5 max-w-2xl mx-auto">
                            <CertStat label="Focus Time" val={`${stats.hours} Hours`} />
                            <CertStat label="Operational Fidelity" val={`${stats.integrity}%`} />
                            <CertStat label="Mission Cycles" val={`${stats.sessions}`} />
                        </div>

                        {/* Statement */}
                        <div className="max-w-xl mx-auto">
                            <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-medium italic opacity-80">
                                "The bearer of this record has demonstrated elite cognitive discipline, logged verified deep focus sessions, and maintained absolute presence within the MindMate network."
                            </p>
                        </div>
                    </div>

                    {/* Footer / Auth */}
                    <div className="relative z-10 w-full flex items-end justify-between px-4 sm:px-10">
                        <div className="text-left space-y-2">
                            <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Issuance Date</p>
                            <p className="text-xs font-bold text-white uppercase">{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>

                        {/* Seal */}
                        <div className="relative">
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                className="absolute -inset-8 border border-dashed border-primary/20 rounded-full"
                            />
                            <div className="relative p-4 rounded-full bg-primary/10 border-2 border-primary/30 shadow-2xl">
                                <ShieldCheck className="h-12 w-12 text-primary" />
                            </div>
                        </div>

                        <div className="text-right space-y-2 max-w-[200px]">
                            <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Sovereign Hash</p>
                            <p className="text-[10px] font-mono font-bold text-white break-all leading-tight opacity-60 uppercase">{sovereignHash}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CertStat({ label, val }: any) {
    return (
        <div className="space-y-1">
            <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">{label}</p>
            <p className="text-xl sm:text-2xl font-black text-white italic">{val}</p>
        </div>
    );
}

function CornerDecoration({ position }: { position: string }) {
    return (
        <div className={cn(
            "absolute w-12 h-12 border-primary/20",
            position === 'top-left' && "top-8 left-8 border-t-2 border-l-2 rounded-tl-2xl",
            position === 'top-right' && "top-8 right-8 border-t-2 border-r-2 rounded-tr-2xl",
            position === 'bottom-left' && "bottom-8 left-8 border-b-2 border-l-2 rounded-bl-2xl",
            position === 'bottom-right' && "bottom-8 right-8 border-b-2 border-r-2 rounded-br-2xl"
        )} />
    );
}
