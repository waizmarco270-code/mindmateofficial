
'use server';

import Razorpay from 'razorpay';
import crypto from 'crypto';
import { db } from '@/lib/firebase';
import { doc, updateDoc, increment, arrayUnion, getDoc } from 'firebase/firestore';

// ALWAYS USE TEST KEYS AS FALLBACK FOR STABILITY
const RAZORPAY_KEY_ID = 'rzp_test_SSLmjZYJquny3v';
const RAZORPAY_KEY_SECRET = 'bFXh8cQiKIWmFNsPNJ2YB9Ga';

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

/**
 * Creates a Razorpay Order
 * We include userId and credits in the 'notes' field.
 */
export async function createRazorpayOrder(amount: number, notes: { userId: string; packName: string; credits: number }) {
  try {
    const options = {
      amount: Math.round(amount * 100), // Razorpay works in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: notes.userId,
        packName: notes.packName,
        credits: String(notes.credits), 
      }
    };

    const order = await razorpay.orders.create(options);
    if (!order) throw new Error("Razorpay order creation returned empty response.");
    
    return {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    };
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    throw new Error(error.message || 'Could not create payment order.');
  }
}

/**
 * Manual verification (Frontend Fallback)
 */
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
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      throw new Error('Invalid payment signature.');
    }

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
