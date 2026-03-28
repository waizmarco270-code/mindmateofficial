
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
 * Now returns the keyId used, ensuring the frontend and backend are always in sync.
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

    // Razorpay amount is in paise (smallest currency unit)
    // Using Math.round to ensure it's an integer
    const finalAmount = Math.round(amount * 100);

    const options = {
      amount: finalAmount,
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
      keyId: RAZORPAY_KEY_ID // Pass this to the frontend to ensure sync
    };
  } catch (error: any) {
    console.error('RAZORPAY_ORDER_ERROR:', error);
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
