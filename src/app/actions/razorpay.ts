
'use server';

import Razorpay from 'razorpay';
import crypto from 'crypto';
import { db } from '@/lib/firebase';
import { doc, updateDoc, increment, arrayUnion } from 'firebase/firestore';

// Environment variables should be set in Vercel/Hosting provider
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

/**
 * Creates a Razorpay Order
 */
export async function createRazorpayOrder(amount: number, notes: { userId: string; packName: string; credits: number }) {
  try {
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
        console.error("CRITICAL: Razorpay keys are missing in environment variables.");
        throw new Error("Payment system configuration is missing. Please contact admin.");
    }

    const razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(amount * 100), // Razorpay works in paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}_${notes.userId.slice(-5)}`,
      notes: {
        userId: notes.userId,
        packName: notes.packName,
        credits: String(notes.credits), 
      }
    };

    const order = await razorpay.orders.create(options);
    
    if (!order) throw new Error("Order creation failed on gateway.");
    
    return {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    };
  } catch (error: any) {
    console.error('RAZORPAY_ORDER_ERROR:', error);
    // Return a plain object to avoid serialization issues
    throw new Error(error.message || 'Failed to connect to payment gateway.');
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
    if (!RAZORPAY_KEY_SECRET) throw new Error("Verification failed: Secret missing.");

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
    console.error('VERIFICATION_ERROR:', error);
    return { success: false, error: error.message };
  }
}
