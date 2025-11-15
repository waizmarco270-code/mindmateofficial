
'use client';

import { useAdmin } from '@/hooks/use-admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { ArrowLeft, Gem } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function PurchaseHistoryPage() {
    const { transactions, loading } = useAdmin();

    return (
        <div className="space-y-8">
            <div>
                 <Button asChild variant="outline" className="mb-4">
                    <Link href="/dashboard/store"><ArrowLeft className="mr-2 h-4 w-4"/> Back to Store</Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Purchase History</h1>
                <p className="text-muted-foreground">A log of all your credit purchases.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Your Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Item</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && Array.from({length: 3}).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-32"/></TableCell>
                                    <TableCell><Skeleton className="h-5 w-40"/></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto"/></TableCell>
                                </TableRow>
                            ))}
                            {!loading && transactions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                        You haven't made any purchases yet.
                                    </TableCell>
                                </TableRow>
                            )}
                            {!loading && transactions.map(tx => (
                                <TableRow key={tx.id}>
                                    <TableCell className="font-medium">{format(tx.date, "PPP p")}</TableCell>
                                    <TableCell>{tx.packName}</TableCell>
                                    <TableCell className="text-right font-semibold text-green-500 flex items-center justify-end gap-1">
                                        <Gem className="h-4 w-4"/> +{tx.credits}
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

