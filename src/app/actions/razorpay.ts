
'use server';

import Razorpay from 'razorpay';
import crypto from 'crypto';
import { db } from '@/lib/firebase';
import { doc, updateDoc, increment, arrayUnion } from 'firebase/firestore';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function createRazorpayOrder(amount: number, notes: { userId: string; packName: string; credits: number }) {
  try {
    const options = {
      amount: amount * 100, // Razorpay works in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: notes.userId,
        packName: notes.packName,
        credits: notes.credits,
      }
    };

    const order = await razorpay.orders.create(options);
    return {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw new Error('Could not create payment order.');
  }
}

export async function verifyRazorpayPayment(
  userId: string,
  userName: string,
  packName: string,
  credits: number,
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
) {
  try {
    // 1. Verify Signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      throw new Error('Invalid payment signature. Potential fraud detected.');
    }

    // 2. Award Credits in Firestore (Manual Fallback)
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      credits: increment(credits),
      transactions: arrayUnion({
        id: razorpay_payment_id,
        packName: packName,
        credits: credits,
        date: new Date().toISOString(),
        type: 'razorpay_manual'
      })
    });

    return { success: true };
  } catch (error: any) {
    console.error('Payment verification failed:', error);
    return { success: false, error: error.message };
  }
}
