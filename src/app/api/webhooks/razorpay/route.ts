
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/firebase';
import { doc, updateDoc, increment, arrayUnion, getDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

/**
 * Razorpay Webhook Handler
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret || !signature) {
      console.error('Webhook: Missing Secret or Signature');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify Authentication
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('Webhook: Invalid Signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(body);
    const event = payload.event;

    console.log(`Webhook Received: ${event}`);

    // Process 'payment.captured' event
    if (event === 'payment.captured') {
      const payment = payload.payload.payment.entity;
      const { userId, credits, packName } = payment.notes;

      if (userId && credits) {
        const userRef = doc(db, 'users', userId);
        
        // Idempotency check
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        const alreadyProcessed = userData?.transactions?.some((t: any) => t.id === payment.id);

        if (!alreadyProcessed) {
          await updateDoc(userRef, {
            credits: increment(Number(credits)),
            transactions: arrayUnion({
              id: payment.id,
              packName: packName || 'Credit Pack',
              credits: Number(credits),
              date: new Date().toISOString(),
              type: 'webhook_fulfillment'
            })
          });
          console.log(`Webhook: Successfully fulfilled ${credits} credits for user ${userId}`);
        } else {
          console.log(`Webhook: Transaction ${payment.id} already processed.`);
        }
      } else {
        console.warn('Webhook: Missing userId or credits in notes', payment.notes);
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Webhook Processing Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
