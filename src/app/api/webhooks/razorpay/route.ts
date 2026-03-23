
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/firebase';
import { doc, updateDoc, increment, arrayUnion } from 'firebase/firestore';

/**
 * Razorpay Webhook Handler
 * 
 * This endpoint is called by Razorpay automatically when a payment event occurs.
 * It ensures that users receive their credits even if the frontend fails to report the success.
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret || !signature) {
      console.error('Webhook Secret or Signature missing');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Verify the authenticity of the webhook
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('Invalid Webhook Signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(body);
    const event = payload.event;

    // 2. Handle specific events
    if (event === 'payment.captured') {
      const payment = payload.payload.payment.entity;
      const orderId = payment.order_id;
      
      // Extract data from the 'notes' field we sent during order creation
      const { userId, credits, packName } = payment.notes;

      if (userId && credits) {
        const userRef = doc(db, 'users', userId);
        
        // Award credits and log transaction
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

        console.log(`Webhook: Credits fulfilled for user ${userId} (Order: ${orderId})`);
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Webhook Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
